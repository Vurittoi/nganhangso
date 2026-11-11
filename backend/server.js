const express = require("express");
const cors = require("cors");
const sql = require("mssql/msnodesqlv8");

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// KẾT NỐI SQL SERVER
// =========================

const config = {
    connectionString: process.env.SQL_CONNECTION_STRING ||
        "Driver={ODBC Driver 18 for SQL Server};" +
        `Server={${process.env.SQL_SERVER || "localhost\\SQLEXPRESS"}};` +
        `Database={${process.env.SQL_DATABASE || "DigitalBanking"}};` +
        "Trusted_Connection=Yes;" +
        "TrustServerCertificate=Yes;"
};

sql.connect(config)
    .then(() => {
        console.log("Đã kết nối SQL Server!");
        console.log("Database: DigitalBanking");
    })
    .catch((err) => {
        console.log("Lỗi kết nối SQL Server:");
        console.log(err.message);
    });


// =========================
// KIỂM TRA BACKEND
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Backend Digital Banking đang chạy!"
    });
});


// =========================
// API ĐĂNG NHẬP
// =========================

app.post("/api/login", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu"
        });
    }

    try {

        const result = await sql.query`
            SELECT
                users_id,
                username,
                full_name,
                cccd,
                date_of_birth,
                phone,
                email,
                address,
                role_id,
                status
            FROM Users
            WHERE username = ${username}
            AND password = ${password}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Sai tài khoản hoặc mật khẩu"
            });
        }

        res.json({
            success: true,
            message: "Đăng nhập thành công",
            user: result.recordset[0]
        });

    } catch (error) {

        console.log("Lỗi API login:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
});


// =========================
// API THÔNG TIN TÀI KHOẢN
// =========================

app.get("/api/account/:userId", async (req, res) => {

    const { userId } = req.params;

    try {

        const result = await sql.query`
            SELECT
                account_id,
                user_id,
                account_no,
                balance,
                status,
                created_at
            FROM BANK_ACCOUNTS
            WHERE user_id = ${userId}
            AND status = 'ACTIVE'
        `;

        if (result.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản"
            });

        }

        res.json({
            success: true,
            account: result.recordset[0]
        });

    } catch (error) {

        console.log("Lỗi lấy thông tin tài khoản:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });

    }

});


// =========================
// API KIỂM TRA TÀI KHOẢN NHẬN
// =========================

app.get("/api/account-number/:accountNo", async (req, res) => {

    const { accountNo } = req.params;

    try {

        const result = await sql.query`
            SELECT
                account_id,
                account_no,
                user_id
            FROM BANK_ACCOUNTS
            WHERE account_no = ${accountNo}
            AND status = 'ACTIVE'
        `;

        if (result.recordset.length === 0) {

            return res.json({
                success: false,
                message: "Không tìm thấy tài khoản"
            });

        }

        const account = result.recordset[0];

        const userResult = await sql.query`
            SELECT full_name
            FROM Users
            WHERE users_id = ${account.user_id}
        `;

        res.json({
            success: true,
            account: {
                account_id: account.account_id,
                account_no: account.account_no,
                user_id: account.user_id,
                full_name: userResult.recordset[0]?.full_name
            }
        });

    } catch (error) {

        console.log("Lỗi kiểm tra tài khoản nhận:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });

    }

});


// =========================
// API CHUYỂN TIỀN
// =========================

app.post("/api/transfer", async (req, res) => {

    const {
        userId,
        receiverAccountNo,
        amount,
        content
    } = req.body;

    try {

        // =========================
        // 1. KIỂM TRA DỮ LIỆU
        // =========================

        if (!userId || !receiverAccountNo || !amount) {

            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin"
            });

        }

        const transferAmount = Number(amount);

        if (transferAmount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Số tiền chuyển phải lớn hơn 0"
            });

        }


        // =========================
        // 2. LẤY TÀI KHOẢN NGƯỜI GỬI
        // =========================

        const senderResult = await sql.query`
            SELECT
                account_id,
                account_no,
                balance
            FROM BANK_ACCOUNTS
            WHERE user_id = ${userId}
            AND status = 'ACTIVE'
        `;

        if (senderResult.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản người gửi"
            });

        }

        const sender = senderResult.recordset[0];


        // =========================
        // 3. KIỂM TRA SỐ DƯ
        // =========================

        if (Number(sender.balance) < transferAmount) {

            return res.status(400).json({
                success: false,
                message: "Số dư không đủ để thực hiện giao dịch"
            });

        }


        // =========================
        // 4. LẤY TÀI KHOẢN NGƯỜI NHẬN
        // =========================

        const receiverResult = await sql.query`
            SELECT
                account_id,
                account_no,
                user_id
            FROM BANK_ACCOUNTS
            WHERE account_no = ${receiverAccountNo}
            AND status = 'ACTIVE'
        `;

        if (receiverResult.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản người nhận"
            });

        }

        const receiver = receiverResult.recordset[0];


        // =========================
        // KHÔNG CHO CHUYỂN CHO CHÍNH MÌNH
        // =========================

        if (sender.account_id === receiver.account_id) {

            return res.status(400).json({
                success: false,
                message: "Không thể chuyển tiền cho chính tài khoản của mình"
            });

        }


        // =========================
        // 5. TRỪ TIỀN NGƯỜI GỬI
        // =========================

        await sql.query`
            UPDATE BANK_ACCOUNTS
            SET balance = balance - ${transferAmount}
            WHERE account_id = ${sender.account_id}
        `;


        // =========================
        // 6. CỘNG TIỀN NGƯỜI NHẬN
        // =========================

        await sql.query`
            UPDATE BANK_ACCOUNTS
            SET balance = balance + ${transferAmount}
            WHERE account_id = ${receiver.account_id}
        `;


        // =========================
        // 7. LƯU LỊCH SỬ GIAO DỊCH
        // =========================

        await sql.query`
            INSERT INTO TRANSACTIONS
            (
                sender_account,
                receiver_account,
                amount,
                content,
                transaction_time,
                status
            )
            VALUES
            (
                ${sender.account_id},
                ${receiver.account_id},
                ${transferAmount},
                ${content || ""},
                GETDATE(),
                'Thành công'
            )
        `;


        // =========================
        // 8. TRẢ KẾT QUẢ
        // =========================

        res.json({
            success: true,
            message: "Chuyển tiền thành công",

            transaction: {
                senderAccount: sender.account_no,
                receiverAccount: receiver.account_no,
                amount: transferAmount,
                content: content || "",
                time: new Date()
            }
        });

    } catch (error) {

        console.log("Lỗi chuyển tiền:", error);

        res.status(500).json({
            success: false,
            message: "Lỗi server khi chuyển tiền"
        });

    }

});


// =========================
// API LỊCH SỬ GIAO DỊCH
// =========================

app.get("/api/transactions/:userId", async (req, res) => {

    const { userId } = req.params;

    try {

        // =========================
        // 1. LẤY TÀI KHOẢN CỦA USER
        // =========================

        const accountResult = await sql.query`
            SELECT
                account_id,
                account_no,
                user_id,
                balance
            FROM BANK_ACCOUNTS
            WHERE user_id = ${userId}
            AND status = 'ACTIVE'
        `;

        if (accountResult.recordset.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản"
            });

        }

        const account = accountResult.recordset[0];

        console.log("=================================");
        console.log("USER ID:", userId);
        console.log("ACCOUNT ID:", account.account_id);
        console.log("ACCOUNT NO:", account.account_no);
        console.log("BALANCE:", account.balance);
        console.log("=================================");


        // =========================
        // 2. LẤY GIAO DỊCH
        // =========================

        const result = await sql.query`
            SELECT
                t.transaction_id,
                t.sender_account,
                t.receiver_account,
                t.amount,
                t.content,
                t.transaction_time,
                t.status,

                sender.account_no AS sender_account_no,
                receiver.account_no AS receiver_account_no,

                senderUser.full_name AS sender_name,
                receiverUser.full_name AS receiver_name

            FROM TRANSACTIONS t

            LEFT JOIN BANK_ACCOUNTS sender
                ON t.sender_account = sender.account_id

            LEFT JOIN BANK_ACCOUNTS receiver
                ON t.receiver_account = receiver.account_id

            LEFT JOIN Users senderUser
                ON sender.user_id = senderUser.users_id

            LEFT JOIN Users receiverUser
                ON receiver.user_id = receiverUser.users_id

            WHERE
                t.sender_account = ${account.account_id}
                OR
                t.receiver_account = ${account.account_id}

            ORDER BY t.transaction_time DESC
        `;


        console.log("SỐ GIAO DỊCH:", result.recordset.length);


        // =========================
        // 3. CHUYỂN DỮ LIỆU CHO REACT
        // =========================

        const transactions = result.recordset.map(transaction => {

            // Tài khoản hiện tại là người nhận
            const isReceive =
                Number(transaction.receiver_account) ===
                Number(account.account_id);


            console.log({
                transaction_id: transaction.transaction_id,
                sender: transaction.sender_account,
                receiver: transaction.receiver_account,
                currentAccount: account.account_id,
                isReceive: isReceive
            });


            return {

                id: transaction.transaction_id,

                type: isReceive
                    ? "receive"
                    : "transfer",

                title: isReceive
                    ? "Nhận tiền"
                    : "Chuyển tiền",

                name: isReceive
                    ? transaction.sender_name
                    : transaction.receiver_name,

                account: isReceive
                    ? transaction.sender_account_no
                    : transaction.receiver_account_no,

                amount: isReceive
                    ? Math.abs(Number(transaction.amount))
                    : -Math.abs(Number(transaction.amount)),

                content: transaction.content || "",

                date: new Date(
                    transaction.transaction_time
                ).toLocaleDateString("vi-VN"),

                time: new Date(
                    transaction.transaction_time
                ).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit"
                }),

                status: transaction.status

            };

        });


        // =========================
        // 4. TRẢ KẾT QUẢ
        // =========================

        res.json({

            success: true,

            account: {
                account_id: account.account_id,
                account_no: account.account_no,
                balance: account.balance
            },

            transactions: transactions

        });


    } catch (error) {

        console.log(
            "Lỗi lấy lịch sử giao dịch:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Lỗi server khi lấy lịch sử giao dịch"

        });

    }

});


/* =========================================
   API ADMIN: DANH SÁCH TÀI KHOẢN KHÁCH HÀNG
========================================= */

app.get("/api/admin/users", async (req, res) => {
    try {
        const result = await sql.query`
            SELECT
                u.users_id,
                u.username,
                u.full_name,
                u.cccd,
                u.date_of_birth,
                u.phone,
                u.email,
                u.address,
                u.role_id,
                u.status AS user_status,

                a.account_id,
                a.account_no,
                a.balance,
                a.status AS account_status,
                a.created_at

            FROM Users u

            LEFT JOIN BANK_ACCOUNTS a
                ON u.users_id = a.user_id

            WHERE u.role_id <> 1

            ORDER BY u.users_id
        `;

        const users = result.recordset.map((row) => ({
            userId: row.users_id,
            username: row.username,
            name: row.full_name,
            cccd: row.cccd,
            dateOfBirth: row.date_of_birth,
            phone: row.phone,
            email: row.email,
            address: row.address,

            role: "Khách hàng",

            account: row.account_no || "Chưa có tài khoản",
            balance: Number(row.balance) || 0,
            status: row.account_status || row.user_status,
            createdAt: row.created_at
        }));

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error("Lỗi API admin users:", error);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách tài khoản"
        });
    }
});


/* =========================================
   API ADMIN: KHÓA / MỞ KHÓA TÀI KHOẢN
========================================= */

app.patch("/api/admin/users/:userId/status", async (req, res) => {
    const userId = Number(req.params.userId);
    const { status } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Mã người dùng không hợp lệ"
        });
    }

    if (!["ACTIVE", "LOCKED"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Trạng thái không hợp lệ"
        });
    }

    try {
        const userResult = await sql.query`
            SELECT users_id
            FROM Users
            WHERE users_id = ${userId}
        `;

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Cập nhật trạng thái người dùng
        await sql.query`
            UPDATE Users
            SET status = ${status}
            WHERE users_id = ${userId}
        `;

        // Cập nhật trạng thái các tài khoản ngân hàng của người dùng
        await sql.query`
            UPDATE BANK_ACCOUNTS
            SET status = ${status}
            WHERE user_id = ${userId}
        `;

        res.json({
            success: true,
            message:
                status === "LOCKED"
                    ? "Đã khóa tài khoản thành công"
                    : "Đã mở khóa tài khoản thành công"
        });

    } catch (error) {
        console.error("Lỗi cập nhật trạng thái tài khoản:", error);

        res.status(500).json({
            success: false,
            message: "Không thể cập nhật trạng thái tài khoản"
        });
    }
});


// =========================
// CHẠY SERVER
// =========================

app.listen(5000, () => {

    console.log(
        "Server chạy tại http://localhost:5000"
    );

});