import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Transfer.css";

function Transfer() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);

  const [receiver, setReceiver] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  const [content, setContent] = useState("");

  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LẤY USER + TÀI KHOẢN
  // =========================

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(savedUser);

    setUser(userData);

    // Lấy tài khoản của user
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
        console.log(error);
        setError("Không thể kết nối đến máy chủ.");
      });

  }, [navigate]);


  // =========================
  // FORMAT TIỀN
  // =========================

  const formatMoney = (value) => {
    if (!value) return "";

    return Number(value).toLocaleString("vi-VN");
  };


  // =========================
  // KIỂM TRA TÀI KHOẢN NGƯỜI NHẬN
  // =========================

  const handleReceiverChange = async (e) => {

    const value = e.target.value;

    setReceiver(value);
    setReceiverName("");
    setError("");

    if (!value) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/account-number/${value}`
      );

      const data = await response.json();

      if (data.success) {

        setReceiverName(data.account.full_name);

      } else {

        setReceiverName("");

      }

    } catch (error) {

      console.log("Lỗi kiểm tra tài khoản:", error);

    }
  };


  // =========================
  // KIỂM TRA GIAO DỊCH
  // =========================

  const handleCheckTransfer = (e) => {

    e.preventDefault();

    setError("");

    const transferAmount = Number(amount);

    if (!receiver) {
      setError("Vui lòng nhập số tài khoản người nhận.");
      return;
    }

    if (!receiverName) {
      setError("Không tìm thấy tài khoản người nhận.");
      return;
    }

    if (!amount || transferAmount <= 0) {
      setError("Số tiền chuyển phải lớn hơn 0.");
      return;
    }

    if (!account) {
      setError("Không tìm thấy tài khoản nguồn.");
      return;
    }

    if (transferAmount > Number(account.balance)) {
      setError("Số dư tài khoản không đủ.");
      return;
    }

    setStep("confirm");
  };


  // =========================
  // XÁC NHẬN CHUYỂN TIỀN
  // =========================

  const handleConfirm = async () => {

    if (!user || !account) {
      setError("Không tìm thấy thông tin tài khoản.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "http://localhost:5000/api/transfer",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            userId: user.users_id,

            receiverAccountNo: receiver,

            amount: Number(amount),

            content: content

          })
        }
      );

      const data = await response.json();

      if (data.success) {

        // Chuyển sang màn hình thành công
        setStep("success");

      } else {

        setError(data.message);

        setStep("confirm");

      }

    } catch (error) {

      console.log("Lỗi chuyển tiền:", error);

      setError("Không thể kết nối đến máy chủ.");

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // GIAO DỊCH MỚI
  // =========================

  const handleNewTransfer = () => {

    setReceiver("");
    setReceiverName("");
    setAmount("");
    setContent("");
    setError("");
    setStep("form");

  };


  return (
    <div className="transfer-page">

      {/* HEADER */}

      <header className="transfer-header">

        <div className="transfer-brand">

          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            ←
          </button>

          <div>

            <h1>Chuyển tiền</h1>

            <span>
              Thực hiện giao dịch chuyển tiền
            </span>

          </div>

        </div>


        <div className="transfer-user">

          <div className="transfer-avatar">

            {user
              ? user.full_name.charAt(0)
              : "N"}

          </div>

          <div>

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

      <main className="transfer-content">


        {/* STEP */}

        <div className="transfer-steps">

          <div
            className={`step ${
              step !== "form"
                ? "done"
                : "active"
            }`}
          >

            <span>1</span>

            <p>
              Thông tin giao dịch
            </p>

          </div>


          <div className="step-line"></div>


          <div
            className={`step ${
              step === "success"
                ? "done"
                : step === "confirm"
                ? "active"
                : ""
            }`}
          >

            <span>2</span>

            <p>
              Xác nhận
            </p>

          </div>


          <div className="step-line"></div>


          <div
            className={`step ${
              step === "success"
                ? "active"
                : ""
            }`}
          >

            <span>3</span>

            <p>
              Hoàn tất
            </p>

          </div>

        </div>


        {/* =========================
            FORM
        ========================= */}

        {step === "form" && (

          <div className="transfer-layout">

            <section className="transfer-card">

              <div className="card-title">

                <h2>
                  Thông tin chuyển tiền
                </h2>

                <p>
                  Nhập đầy đủ thông tin giao dịch
                </p>

              </div>


              <form onSubmit={handleCheckTransfer}>


                {/* TÀI KHOẢN NGUỒN */}

                <div className="form-group">

                  <label>
                    Tài khoản nguồn
                  </label>

                  <div className="source-account">

                    <div className="source-icon">
                      $
                    </div>

                    <div>

                      <strong>
                        {account
                          ? account.account_no
                          : "Đang tải..."}
                      </strong>

                      <span>
                        Số dư:{" "}
                        {account
                          ? formatMoney(account.balance) + " ₫"
                          : "Đang tải..."}
                      </span>

                    </div>

                  </div>

                </div>


                {/* NGƯỜI NHẬN */}

                <div className="form-group">

                  <label>

                    Số tài khoản người nhận

                    <span className="required">
                      *
                    </span>

                  </label>


                  <input
                    type="text"
                    value={receiver}
                    onChange={handleReceiverChange}
                    placeholder="Nhập số tài khoản người nhận"
                    maxLength={20}
                  />


                  {receiverName && (

                    <div className="receiver-found">

                      ✓ {receiverName}

                    </div>

                  )}

                </div>


                {/* SỐ TIỀN */}

                <div className="form-group">

                  <label>

                    Số tiền chuyển

                    <span className="required">
                      *
                    </span>

                  </label>


                  <div className="amount-input">

                    <input
                      type="number"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="0"
                      min="1"
                    />

                    <span>
                      VND
                    </span>

                  </div>


                  {amount && (

                    <small>
                      {formatMoney(amount)} ₫
                    </small>

                  )}

                </div>


                {/* NỘI DUNG */}

                <div className="form-group">

                  <label>
                    Nội dung chuyển khoản
                  </label>

                  <textarea
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    placeholder="Nhập nội dung chuyển khoản"
                    maxLength={200}
                    rows={4}
                  />

                  <div className="character-count">

                    {content.length}/200

                  </div>

                </div>


                {error && (

                  <div className="transfer-error">

                    ⚠ {error}

                  </div>

                )}


                <button
                  type="submit"
                  className="primary-button"
                >

                  Kiểm tra giao dịch →

                </button>


              </form>

            </section>


            {/* SIDE INFO */}

            <aside className="transfer-info">

              <h3>
                Thông tin giao dịch
              </h3>


              <div className="info-row">

                <span>
                  Số dư hiện tại
                </span>

                <strong>

                  {account
                    ? formatMoney(account.balance) + " ₫"
                    : "Đang tải..."}

                </strong>

              </div>


              <div className="info-row">

                <span>
                  Tài khoản nguồn
                </span>

                <strong>

                  {account
                    ? account.account_no
                    : "Đang tải..."}

                </strong>

              </div>


              <div className="info-divider"></div>


              <div className="security-box">

                <div className="security-icon">
                  ✓
                </div>

                <div>

                  <strong>
                    Giao dịch an toàn
                  </strong>

                  <p>
                    Hệ thống sẽ kiểm tra thông tin
                    người nhận, số tiền và số dư
                    trước khi thực hiện giao dịch.
                  </p>

                </div>

              </div>

            </aside>

          </div>

        )}


        {/* =========================
            CONFIRM
        ========================= */}

        {step === "confirm" && (

          <section className="confirm-card">

            <div className="confirm-icon">
              ?
            </div>

            <h2>
              Xác nhận giao dịch
            </h2>

            <p className="confirm-description">

              Vui lòng kiểm tra lại thông tin trước
              khi xác nhận chuyển tiền.

            </p>


            <div className="confirm-details">

              <div>

                <span>
                  Tài khoản nguồn
                </span>

                <strong>
                  {account?.account_no}
                </strong>

              </div>


              <div>

                <span>
                  Người nhận
                </span>

                <strong>
                  {receiverName}
                </strong>

              </div>


              <div>

                <span>
                  Số tài khoản nhận
                </span>

                <strong>
                  {receiver}
                </strong>

              </div>


              <div>

                <span>
                  Số tiền
                </span>

                <strong className="confirm-amount">

                  {formatMoney(amount)} ₫

                </strong>

              </div>


              <div>

                <span>
                  Nội dung
                </span>

                <strong>

                  {content || "Không có nội dung"}

                </strong>

              </div>

            </div>


            {error && (

              <div className="transfer-error">

                ⚠ {error}

              </div>

            )}


            <div className="confirm-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setStep("form")
                }
              >

                Quay lại

              </button>


              <button
                className="primary-button"
                onClick={handleConfirm}
                disabled={loading}
              >

                {loading
                  ? "Đang xử lý..."
                  : "Xác nhận chuyển tiền"}

              </button>

            </div>

          </section>

        )}


        {/* =========================
            SUCCESS
        ========================= */}

        {step === "success" && (

          <section className="success-card">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Giao dịch thành công
            </h2>

            <p>
              Giao dịch chuyển tiền đã được thực hiện
              thành công.
            </p>


            <div className="success-details">

              <div>

                <span>
                  Người nhận
                </span>

                <strong>
                  {receiverName}
                </strong>

              </div>


              <div>

                <span>
                  Số tiền
                </span>

                <strong>
                  {formatMoney(amount)} ₫
                </strong>

              </div>


              <div>

                <span>
                  Nội dung
                </span>

                <strong>
                  {content || "Không có nội dung"}
                </strong>

              </div>


              <div>

                <span>
                  Trạng thái
                </span>

                <strong className="success-status">
                  Thành công
                </strong>

              </div>

            </div>


            <div className="success-actions">

              <button
                className="secondary-button"
                onClick={handleNewTransfer}
              >

                Giao dịch mới

              </button>


              <button
                className="primary-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >

                Về trang tổng quan

              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Transfer;