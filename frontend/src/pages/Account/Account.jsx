
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";

// =========================
// HÀM ĐỊNH DẠNG
// =========================

function formatMoney(amount) {
  return (
    new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0) + " ₫"
  );
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("vi-VN");
}

function getStatusLabel(status) {
  if (
    status === "ACTIVE" ||
    status === "active" ||
    status === "Đang hoạt động"
  ) {
    return "Đang hoạt động";
  }

  if (
    status === "LOCKED" ||
    status === "INACTIVE" ||
    status === "locked"
  ) {
    return "Đang khóa";
  }

  return status || "Chưa xác định";
}

// =========================
// COMPONENT
// =========================

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // LẤY THÔNG TIN TỪ BACKEND
  // =========================

  useEffect(() => {
    let cancelled = false;

    async function getAccountInfo() {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
          navigate("/login");
          return;
        }

        const currentUser = JSON.parse(savedUser);

        if (!currentUser?.users_id) {
          setError(
            "Không tìm thấy mã người dùng. Vui lòng đăng nhập lại."
          );
          return;
        }

        if (cancelled) return;
        setUser(currentUser);

        const response = await fetch(
          `http://localhost:5000/api/account/${encodeURIComponent(
            currentUser.users_id
          )}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Không thể lấy thông tin tài khoản."
          );
        }

        if (!cancelled) {
          setAccount(data.account);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Lỗi lấy thông tin tài khoản:", err);
          setError(
            err.message || "Không thể kết nối đến máy chủ."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getAccountInfo();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // =========================
  // DỮ LIỆU HIỂN THỊ
  // =========================

  const fullName =
    user?.full_name || user?.username || "Chưa cập nhật";

  const roleName =
    String(user?.role_id) === "1" ? "Quản trị viên" : "Khách hàng";

  const accountStatus = getStatusLabel(account?.status);
  const userStatus = getStatusLabel(user?.status);

  // =========================
  // GIAO DIỆN
  // =========================

  return (
    <div className="account-page">
      {/* SIDEBAR */}
      <aside className="account-sidebar">
        <div className="account-logo">
          <div className="account-logo-icon">N</div>

          <div>
            <strong>Ngân Hàng Số</strong>
            <span>Digital Banking</span>
          </div>
        </div>

        <nav className="account-menu">
          <button onClick={() => navigate("/dashboard")}>
            <span>⌂</span>
            Tổng quan
          </button>

          <button onClick={() => navigate("/transfer")}>
            <span>↗</span>
            Chuyển tiền
          </button>

          <button onClick={() => navigate("/transactions")}>
            <span>↔</span>
            Lịch sử giao dịch
          </button>

          <button className="active">
            <span>◎</span>
            Thông tin tài khoản
          </button>
        </nav>

        <button
          className="account-logout"
          onClick={() => {
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          <span>↪</span>
          Đăng xuất
        </button>
      </aside>

      {/* MAIN */}
      <main className="account-main">
        {/* HEADER */}
        <header className="account-header">
          <div>
            <h1>Thông tin tài khoản</h1>
            <p>
              Quản lý thông tin cá nhân và tài khoản ngân hàng
            </p>
          </div>

          <div className="account-user">
            <div className="account-avatar">
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{fullName}</strong>
              <span>{roleName}</span>
            </div>
          </div>
        </header>

        {/* LOADING */}
        {loading && (
          <section className="account-card">
            <p>Đang tải thông tin tài khoản...</p>
          </section>
        )}

        {/* ERROR */}
        {!loading && error && (
          <section className="account-card">
            <h2>Không thể tải dữ liệu</h2>
            <p>{error}</p>

            <button
              className="back-dashboard-button"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </section>
        )}

        {/* CONTENT */}
        {!loading && !error && user && account && (
          <>
            {/* PROFILE CARD */}
            <section className="profile-card">
              <div className="profile-avatar">
                {fullName
                  .split(" ")
                  .filter(Boolean)
                  .slice(-2)
                  .map((word) => word.charAt(0).toUpperCase())
                  .join("")}
              </div>

              <div className="profile-info">
                <h2>{fullName}</h2>

                <p>
                  <span className="profile-role">
                    {roleName}
                  </span>

                  <span className="profile-dot">•</span>

                  {userStatus}
                </p>
              </div>
            </section>

            {/* PERSONAL INFORMATION */}
            <section className="account-card">
              <div className="account-card-header">
                <div>
                  <h2>Thông tin cá nhân</h2>
                  <p>Thông tin định danh của khách hàng</p>
                </div>
              </div>

              <div className="account-information-grid">
                <div className="information-item">
                  <span>Họ và tên</span>
                  <strong>{fullName}</strong>
                </div>

                <div className="information-item">
                  <span>CCCD</span>
                  <strong>{user.cccd || "Chưa cập nhật"}</strong>
                </div>

                <div className="information-item">
                  <span>Ngày sinh</span>
                  <strong>
                    {formatDate(user.date_of_birth)}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Số điện thoại</span>
                  <strong>{user.phone || "Chưa cập nhật"}</strong>
                </div>

                <div className="information-item">
                  <span>Email</span>
                  <strong>{user.email || "Chưa cập nhật"}</strong>
                </div>

                <div className="information-item full-width">
                  <span>Địa chỉ</span>
                  <strong>{user.address || "Chưa cập nhật"}</strong>
                </div>
              </div>
            </section>

            {/* BANK ACCOUNT INFORMATION */}
            <section className="account-card">
              <div className="account-card-header">
                <div>
                  <h2>Thông tin tài khoản ngân hàng</h2>
                  <p>Thông tin tài khoản thanh toán</p>
                </div>

                <span className="account-status">
                  {accountStatus}
                </span>
              </div>

              <div className="bank-account-highlight">
                <div>
                  <span>Số tài khoản</span>
                  <strong>{account.account_no}</strong>
                </div>

                <div className="balance-section">
                  <span>Số dư hiện tại</span>
                  <strong>
                    {formatMoney(account.balance)}
                  </strong>
                </div>
              </div>

              <div className="account-information-grid">
                <div className="information-item">
                  <span>Loại tài khoản</span>
                  <strong>Tài khoản thanh toán</strong>
                </div>

                <div className="information-item">
                  <span>Trạng thái</span>
                  <strong className="active-text">
                    {accountStatus}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Ngày mở tài khoản</span>
                  <strong>
                    {formatDate(account.created_at)}
                  </strong>
                </div>

                <div className="information-item">
                  <span>Chủ tài khoản</span>
                  <strong>{fullName}</strong>
                </div>
              </div>
            </section>

            {/* BACK BUTTON */}
            <button
              className="back-dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Quay lại Dashboard
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default Account;