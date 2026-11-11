import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  const [showBalance, setShowBalance] = useState(false);

  // Thông tin người dùng
  const [user, setUser] = useState(null);

  // Thông tin tài khoản
  const [account, setAccount] = useState(null);

  const [error, setError] = useState("");


  // =========================
  // LẤY DỮ LIỆU USER + ACCOUNT
  // =========================

  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    // Chưa đăng nhập
    if (!savedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(savedUser);

    setUser(userData);


    // Gọi API lấy tài khoản
    fetch(
      `http://localhost:5000/api/account/${userData.users_id}`
    )
      .then((response) => response.json())
      .then((data) => {

        if (data.success) {

          setAccount(data.account);

        } else {

          setError(data.message);

        }

      })
      .catch((error) => {

        console.log("Lỗi:", error);

        setError(
          "Không thể kết nối đến máy chủ."
        );

      });

  }, [navigate]);


  // =========================
  // ĐĂNG XUẤT
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/login");

  };


  // =========================
  // FORMAT TIỀN
  // =========================

  const formatMoney = (money) => {

    if (money === null || money === undefined) {
      return "0 ₫";
    }

    return Number(money).toLocaleString("vi-VN") + " ₫";

  };


// =========================
// GIAO DỊCH
// =========================

const [transactions, setTransactions] = useState([]);

useEffect(() => {

  const getTransactions = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user) {
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/transactions/${user.users_id}`
      );

      const data = await response.json();

      if (data.success) {

        // Chỉ lấy 3 giao dịch mới nhất
        setTransactions(
          data.transactions.slice(0, 3)
        );

      }

    } catch (error) {

      console.log(
        "Lỗi lấy giao dịch:",
        error
      );

    }

  };

  getTransactions();

}, []);


  return (

    <div className="dashboard-page">


      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            $
          </div>

          <div>

            <h2>
              NGÂN HÀNG SỐ
            </h2>

            <span>
              Digital Banking
            </span>

          </div>

        </div>


        <nav className="sidebar-menu">

          <button className="menu-item active">

            <span>
              ⌂
            </span>

            Tổng quan

          </button>


          <button
            className="menu-item"
            onClick={() => navigate("/transfer")}
          >

            <span>
              ↗
            </span>

            Chuyển tiền

          </button>


          <button
            className="menu-item"
            onClick={() => navigate("/transactions")}
          >

            <span>
              ▤
            </span>

            Lịch sử giao dịch

          </button>


          <button
            className="menu-item"
            onClick={() => navigate("/account")}
          >

            <span>
              ◎
            </span>

            Tài khoản

          </button>

        </nav>


        <div className="sidebar-bottom">

          <button className="menu-item">

            <span>
              ⚙
            </span>

            Cài đặt

          </button>


          <button
            className="menu-item logout"
            onClick={handleLogout}
          >

            <span>
              ⇥
            </span>

            Đăng xuất

          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="dashboard-main">


        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <h1>
              Tổng quan
            </h1>

            <p>
              Chào mừng bạn quay trở lại!
            </p>

          </div>


          <div className="header-user">

            <div className="notification">
              ♢
            </div>


            <div className="user-avatar">

              {user
                ? user.full_name.charAt(0)
                : "N"}

            </div>


            <div className="user-info">

              <strong>

                {user
                  ? user.full_name
                  : "Đang tải..."}

              </strong>

              <span>
                Khách hàng
              </span>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <section className="dashboard-content">


          {/* ACCOUNT CARD */}

          <div className="account-card">


            <div className="account-card-top">

              <span>
                Số dư khả dụng
              </span>


              {/* NÚT MẮT */}

              <button
                className="balance-toggle"
                onClick={() =>
                  setShowBalance(!showBalance)
                }
                aria-label={
                  showBalance
                    ? "Ẩn số dư"
                    : "Hiện số dư"
                }
                title={
                  showBalance
                    ? "Ẩn số dư"
                    : "Hiện số dư"
                }
              >

                <span
                  className={`eye-icon ${
                    showBalance
                      ? ""
                      : "eye-off"
                  }`}
                >

                  <span className="eye-pupil"></span>

                </span>

              </button>

            </div>


            {/* SỐ DƯ */}

            <div className="balance">

              {showBalance

                ? formatMoney(account?.balance)

                : "•••••••••• ₫"}

            </div>


            {/* SỐ TÀI KHOẢN */}

            <div className="account-number">

              <span>
                Số tài khoản
              </span>

              <strong>

                {account
                  ? account.account_no
                  : "Đang tải..."}

              </strong>

            </div>


            {/* TRẠNG THÁI */}

            <div className="account-card-bottom">

              <span>
                Tài khoản thanh toán
              </span>

              <span>

                {account
                  ? account.status
                  : "Đang tải..."}

              </span>

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <section className="section">

            <div className="section-header">

              <h2>
                Thao tác nhanh
              </h2>

            </div>


            <div className="quick-actions">


              <button
                className="quick-action"
                onClick={() =>
                  navigate("/transfer")
                }
              >

                <div className="action-icon transfer-icon">
                  ↗
                </div>

                <span>
                  Chuyển tiền
                </span>

              </button>


              <button
                className="quick-action"
                onClick={() =>
                  navigate("/transactions")
                }
              >

                <div className="action-icon history-icon">
                  ▤
                </div>

                <span>
                  Lịch sử giao dịch
                </span>

              </button>


              <button
                className="quick-action"
                onClick={() =>
                  navigate("/account")
                }
              >

                <div className="action-icon account-icon">
                  ◎
                </div>

                <span>
                  Thông tin tài khoản
                </span>

              </button>

            </div>

          </section>


          {/* RECENT TRANSACTIONS */}

          <section className="section">

            <div className="section-header">

              <div>

                <h2>
                  Giao dịch gần đây
                </h2>

                <p>
                  Các giao dịch mới nhất của bạn
                </p>

              </div>


              <button
                className="view-all"
                onClick={() =>
                  navigate("/transactions")
                }
              >

                Xem tất cả →

              </button>

            </div>


            <div className="transaction-list">

              {transactions.map(
                (transaction) => (

                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >


                    <div
                      className={`transaction-icon ${transaction.type}`}
                    >

                      {transaction.type === "income"
                        ? "↓"
                        : "↑"}

                    </div>


                    <div className="transaction-description">

                      <strong>
                        {transaction.title}
                      </strong>

                      <span>
                        {transaction.description}
                      </span>

                    </div>


                    <div className="transaction-time">

                      {transaction.time}

                    </div>


                    <div
                      className={`transaction-amount ${transaction.type}`}
                    >

                      {transaction.amount}

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* THÔNG BÁO LỖI */}

          {error && (

            <div className="login-error">

              {error}

            </div>

          )}

        </section>

      </main>

    </div>

  );
}

export default Dashboard;