import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Transactions.css";


// =========================
// FORMAT TIỀN
// =========================

function formatMoney(amount) {
  return (
    new Intl.NumberFormat("vi-VN").format(
      Math.abs(Number(amount))
    ) + " ₫"
  );
}


// =========================
// COMPONENT
// =========================

function Transactions() {

  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);

  const [filter, setFilter] = useState("all");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =========================
  // LẤY LỊCH SỬ GIAO DỊCH
  // =========================

  useEffect(() => {

    const getTransactions = async () => {

      try {

        const user = JSON.parse(
          localStorage.getItem("user")
        );


        // =========================
        // KIỂM TRA USER
        // =========================

        if (!user) {

          navigate("/login");

          return;

        }


        console.log(
          "USER ĐANG ĐĂNG NHẬP:",
          user
        );


        // =========================
        // GỌI API
        // =========================

        const response = await fetch(
          `http://localhost:5000/api/transactions/${user.users_id}`
        );


        const data = await response.json();


        console.log(
          "DỮ LIỆU LỊCH SỬ TỪ API:",
          data
        );


        // =========================
        // KIỂM TRA API
        // =========================

        if (!data.success) {

          setError(
            data.message ||
            "Không thể lấy lịch sử giao dịch"
          );

          return;

        }


        // =========================
        // LƯU GIAO DỊCH
        // =========================

        setTransactions(
          data.transactions || []
        );


      } catch (error) {

        console.log(
          "Lỗi lấy lịch sử giao dịch:",
          error
        );


        setError(
          "Không thể kết nối đến máy chủ"
        );


      } finally {

        setLoading(false);

      }

    };


    getTransactions();

  }, [navigate]);


  // =========================
  // LỌC GIAO DỊCH
  // =========================

  const filteredTransactions =
    transactions.filter((transaction) => {

      if (filter === "all") {
        return true;
      }


      if (filter === "transfer") {
        return transaction.type === "transfer";
      }


      if (filter === "receive") {
        return transaction.type === "receive";
      }


      return true;

    });


  // =========================
  // HIỂN THỊ
  // =========================

  return (

    <div className="transactions-page">


      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="transactions-sidebar">

        <div className="transactions-logo">

          <div className="logo-icon">
            $
          </div>

          <div>

            <strong>
              NGÂN HÀNG SỐ
            </strong>

            <span>
              Digital Banking
            </span>

          </div>

        </div>


        <nav className="transactions-menu">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >

            <span>
              ⌂
            </span>

            Tổng quan

          </button>


          <button
            onClick={() =>
              navigate("/transfer")
            }
          >

            <span>
              ⇄
            </span>

            Chuyển tiền

          </button>


          <button className="active">

            <span>
              ↔
            </span>

            Lịch sử giao dịch

          </button>

        </nav>


        <button
          className="transactions-logout"
          onClick={() =>
            navigate("/login")
          }
        >

          <span>
            ↪
          </span>

          Đăng xuất

        </button>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="transactions-main">


        {/* =========================
            HEADER
        ========================= */}

        <header className="transactions-header">

          <div>

            <h1>
              Lịch sử giao dịch
            </h1>

            <p>
              Quản lý và theo dõi các giao dịch của bạn
            </p>

          </div>


          <div className="transactions-user">

            <div className="user-avatar">
              N
            </div>

            <div>

              <strong>
                {JSON.parse(
                  localStorage.getItem("user")
                )?.full_name || "Khách hàng"}
              </strong>

              <span>
                Khách hàng
              </span>

            </div>

          </div>

        </header>


        {/* =========================
            FILTER
        ========================= */}

        <section className="transaction-filter">

          <button
            className={
              filter === "all"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            Tất cả
          </button>


          <button
            className={
              filter === "transfer"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("transfer")
            }
          >
            Chuyển tiền
          </button>


          <button
            className={
              filter === "receive"
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter("receive")
            }
          >
            Nhận tiền
          </button>

        </section>


        {/* =========================
            TRANSACTION CARD
        ========================= */}

        <section className="transaction-card">


          {/* HEADER */}

          <div className="transaction-card-header">

            <div>

              <h2>
                Danh sách giao dịch
              </h2>

              <p>

                {loading

                  ? "Đang tải giao dịch..."

                  : `${filteredTransactions.length} giao dịch được tìm thấy`

                }

              </p>

            </div>


            <select>

              <option>
                30 ngày gần đây
              </option>

              <option>
                90 ngày gần đây
              </option>

              <option>
                6 tháng gần đây
              </option>

            </select>

          </div>


          {/* =========================
              DANH SÁCH
          ========================= */}

          <div className="transaction-list">


            {/* LOADING */}

            {loading && (

              <div className="transaction-empty">

                Đang tải lịch sử giao dịch...

              </div>

            )}


            {/* ERROR */}

            {!loading && error && (

              <div className="transaction-empty">

                ⚠ {error}

              </div>

            )}


            {/* KHÔNG CÓ GIAO DỊCH */}

            {!loading &&
              !error &&
              filteredTransactions.length === 0 && (

                <div className="transaction-empty">

                  Chưa có giao dịch nào.

                </div>

              )
            }


            {/* =========================
                DANH SÁCH GIAO DỊCH
            ========================= */}

            {!loading &&
              !error &&
              filteredTransactions.map(
                (transaction) => {

                  const isReceive =
                    transaction.type === "receive";


                  return (

                    <div
                      className="transaction-item"
                      key={transaction.id}
                      onClick={() =>
                        setSelectedTransaction(
                          transaction
                        )
                      }
                    >


                      {/* ICON */}

                      <div
                        className={`transaction-icon ${
                          isReceive
                            ? "receive"
                            : "transfer"
                        }`}
                      >

                        {isReceive
                          ? "↓"
                          : "↑"
                        }

                      </div>


                      {/* THÔNG TIN */}

                      <div className="transaction-info">

                        <strong>
                          {transaction.title}
                        </strong>


                        <span>

                          {transaction.name}

                          {" · "}

                          {transaction.account}

                        </span>


                        <small>

                          {transaction.date}

                          {" · "}

                          {transaction.time}

                        </small>

                      </div>


                      {/* =========================
                          SỐ TIỀN
                      ========================= */}

                      <div className="transaction-right">

                        <strong
                          className={
                            isReceive
                              ? "money receive-money"
                              : "money transfer-money"
                          }
                        >

                          {isReceive
                            ? "+"
                            : "-"
                          }

                          {formatMoney(
                            transaction.amount
                          )}

                        </strong>


                        <span className="transaction-status">

                          {transaction.status}

                        </span>

                      </div>


                    </div>

                  );

                }
              )
            }

          </div>

        </section>


        {/* =========================
            DETAIL MODAL
        ========================= */}

        {selectedTransaction && (

          <div
            className="transaction-modal-overlay"
            onClick={() =>
              setSelectedTransaction(null)
            }
          >

            <div
              className="transaction-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >


              {/* CLOSE */}

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedTransaction(null)
                }
              >
                ×
              </button>


              <h2>
                Chi tiết giao dịch
              </h2>


              {/* =========================
                  SỐ TIỀN
              ========================= */}

              <div className="modal-amount">

                <span>

                  {selectedTransaction.type === "receive"

                    ? "Số tiền nhận"

                    : "Số tiền chuyển"

                  }

                </span>


                <strong
                  className={
                    selectedTransaction.type === "receive"

                      ? "receive-money"

                      : "transfer-money"
                  }
                >

                  {selectedTransaction.type === "receive"
                    ? "+"
                    : "-"
                  }

                  {formatMoney(
                    selectedTransaction.amount
                  )}

                </strong>

              </div>


              {/* MÃ GIAO DỊCH */}

              <div className="detail-row">

                <span>
                  Mã giao dịch
                </span>

                <strong>
                  {selectedTransaction.id}
                </strong>

              </div>


              {/* NGƯỜI GỬI / NHẬN */}

              <div className="detail-row">

                <span>

                  {selectedTransaction.type === "receive"

                    ? "Người gửi"

                    : "Người nhận"

                  }

                </span>


                <strong>

                  {selectedTransaction.name}

                </strong>

              </div>


              {/* SỐ TÀI KHOẢN */}

              <div className="detail-row">

                <span>
                  Số tài khoản
                </span>

                <strong>

                  {selectedTransaction.account}

                </strong>

              </div>


              {/* THỜI GIAN */}

              <div className="detail-row">

                <span>
                  Thời gian
                </span>

                <strong>

                  {selectedTransaction.date}

                  {" "}

                  {selectedTransaction.time}

                </strong>

              </div>


              {/* NỘI DUNG */}

              <div className="detail-row">

                <span>
                  Nội dung
                </span>

                <strong>

                  {selectedTransaction.content ||
                    "Không có nội dung"
                  }

                </strong>

              </div>


              {/* TRẠNG THÁI */}

              <div className="detail-row">

                <span>
                  Trạng thái
                </span>

                <strong className="status-success">

                  {selectedTransaction.status}

                </strong>

              </div>


            </div>

          </div>

        )}

      </main>

    </div>

  );

}


export default Transactions;