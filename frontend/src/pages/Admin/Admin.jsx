
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const API_URL = "http://localhost:5000/api";

function formatMoney(amount) {
  return (
    new Intl.NumberFormat("vi-VN").format(Number(amount) || 0) +
    " ₫"
  );
}

function normalizeStatus(status) {
  const value = String(status ?? "").toUpperCase();

  if (["ACTIVE", "HOẠT ĐỘNG", "1"].includes(value)) {
    return "Hoạt động";
  }

  if (["LOCKED", "INACTIVE", "KHÓA", "0"].includes(value)) {
    return "Khóa";
  }

  return status || "Chưa xác định";
}

function getInitials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [notice, setNotice] = useState("");

  // =====================================
  // LẤY DANH SÁCH TÀI KHOẢN TỪ DATABASE
  // =====================================

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        navigate("/login");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      if (String(currentUser.role_id) !== "1") {
        setError("Tài khoản hiện tại không có quyền quản trị.");
        return;
      }

      const response = await fetch(`${API_URL}/admin/users`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể tải danh sách tài khoản."
        );
      }

      const list = (data.users || [])
        // Không hiển thị tài khoản quản trị viên
        .filter((item) => {
          const roleId = String(item.role_id ?? item.roleId ?? "");
          const roleName = String(item.role ?? "").trim().toLowerCase();

          return roleId !== "1" &&
            roleName !== "admin" &&
            roleName !== "administrator" &&
            roleName !== "quản trị viên";
        })
        .map((item) => ({
          ...item,
          id: item.userId ?? item.users_id,
          name: item.name || item.full_name || "Chưa cập nhật",
          username: item.username || "",
          account: item.account || item.account_no || "Chưa có tài khoản",
          role: item.role || "Khách hàng",
          status: normalizeStatus(item.status),
          balance: Number(item.balance) || 0,
        }));

      setUsers(list);

      setSelectedUser((previous) => {
        if (!previous) return null;

        return list.find((item) => item.id === previous.id) || null;
      });
    } catch (err) {
      console.error("Lỗi tải danh sách tài khoản:", err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // =====================================
  // KHÓA / MỞ KHÓA TÀI KHOẢN
  // =====================================

  const toggleStatus = async (user) => {
    if (!user?.id || actionLoading !== null) return;

    const nextStatus =
      user.status === "Hoạt động" ? "LOCKED" : "ACTIVE";

    const confirmed = window.confirm(
      nextStatus === "LOCKED"
        ? `Bạn có chắc muốn khóa tài khoản của ${user.name}?`
        : `Bạn có chắc muốn mở khóa tài khoản của ${user.name}?`
    );

    if (!confirmed) return;

    setActionLoading(user.id);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${encodeURIComponent(user.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể cập nhật trạng thái tài khoản."
        );
      }

      setNotice(data.message || "Cập nhật trạng thái thành công.");

      // Lấy lại dữ liệu thực tế từ database
      await loadUsers();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      setError(err.message || "Không thể cập nhật trạng thái.");
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================
  // TÌM KIẾM VÀ LỌC
  // =====================================

  const filteredUsers = users.filter((user) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch = [
      user.name,
      user.username,
      user.account,
      user.email,
      user.phone,
    ].some((value) =>
      String(value || "").toLowerCase().includes(keyword)
    );

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = users.filter(
    (user) => user.status === "Hoạt động"
  ).length;

  const lockedCount = users.filter(
    (user) => user.status === "Khóa"
  ).length;

  const customerCount = users.filter(
    (user) => user.role === "Khách hàng"
  ).length;

  // =====================================
  // GIAO DIỆN
  // =====================================

  return (
    <div className="admin-page">
      {/* SIDEBAR: CHỈ CÒN QUẢN LÝ TÀI KHOẢN */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">N</div>

          <div>
            <strong>Ngân Hàng Số</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-menu">
          <button className="active">
            <span>♙</span>
            Quản lý tài khoản
          </button>
        </nav>

        <button
          className="admin-logout"
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
      <main className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div>
            <h1>Quản lý tài khoản</h1>
            <p>
              Quản lý người dùng, số dư và trạng thái tài khoản ngân hàng
            </p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">AD</div>

            <div>
              <strong>Administrator</strong>
              <span>Quản trị viên</span>
            </div>
          </div>
        </header>

        {/* THÔNG BÁO */}
        {error && (
          <div className="admin-notice admin-error">
            {error}
          </div>
        )}

        {notice && (
          <div className="admin-notice admin-success">
            {notice}
          </div>
        )}

        {/* THỐNG KÊ */}
        <section className="admin-statistics">
          <div className="admin-stat-card">
            <span>Tổng tài khoản</span>
            <strong>{loading ? "..." : users.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Đang hoạt động</span>
            <strong>{loading ? "..." : activeCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Đang khóa</span>
            <strong>{loading ? "..." : lockedCount}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Khách hàng</span>
            <strong>{loading ? "..." : customerCount}</strong>
          </div>
        </section>

        {/* DANH SÁCH */}
        <section className="admin-table-card">
          <div className="admin-table-header">
            <div>
              <h2>Danh sách tài khoản</h2>
              <p>
                {loading
                  ? "Đang tải dữ liệu..."
                  : `${filteredUsers.length} tài khoản được tìm thấy`}
              </p>
            </div>

            <button
              type="button"
              className="add-user-button"
              onClick={loadUsers}
              disabled={loading}
            >
              ↻ Làm mới dữ liệu
            </button>
          </div>

          {/* TÌM KIẾM VÀ LỌC */}
          <div className="admin-filters">
            <div className="admin-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Tìm tên, username hoặc số tài khoản..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Khóa">Khóa</option>
            </select>
          </div>

          {/* BẢNG */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Số tài khoản</th>
                  <th>Số dư</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      Không tìm thấy tài khoản phù hợp.
                    </td>
                  </tr>
                )}

                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="table-avatar">
                          {getInitials(user.name)}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.username}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="account-number">
                        {user.account}
                      </span>
                    </td>

                    <td>
                      <strong>{formatMoney(user.balance)}</strong>
                    </td>

                    <td>
                      <span className="role-badge">{user.role}</span>
                    </td>

                    <td>
                      <span
                        className={
                          user.status === "Hoạt động"
                            ? "status-badge active-status"
                            : "status-badge locked-status"
                        }
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="view-button"
                          onClick={() => setSelectedUser(user)}
                        >
                          Xem
                        </button>

                        <button
                          type="button"
                          className="lock-button"
                          disabled={actionLoading !== null}
                          onClick={() => toggleStatus(user)}
                        >
                          {actionLoading === user.id
                            ? "Đang xử lý..."
                            : user.status === "Hoạt động"
                              ? "Khóa"
                              : "Mở khóa"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      Đang tải dữ liệu từ SQL Server...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CHI TIẾT NGƯỜI DÙNG */}
        {selectedUser && (
          <div
            className="admin-modal-overlay"
            onClick={() => setSelectedUser(null)}
          >
            <div
              className="admin-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>

              <h2>Thông tin tài khoản</h2>

              <div className="admin-detail-avatar">
                {getInitials(selectedUser.name)}
              </div>

              <h3>{selectedUser.name}</h3>

              <p className="modal-username">
                @{selectedUser.username}
              </p>

              <div className="admin-detail-list">
                <div>
                  <span>Mã người dùng</span>
                  <strong>{selectedUser.id}</strong>
                </div>

                <div>
                  <span>CCCD</span>
                  <strong>{selectedUser.cccd || "Chưa cập nhật"}</strong>
                </div>

                <div>
                  <span>Ngày sinh</span>
                  <strong>
                    {selectedUser.dateOfBirth || "Chưa cập nhật"}
                  </strong>
                </div>

                <div>
                  <span>Số điện thoại</span>
                  <strong>{selectedUser.phone || "Chưa cập nhật"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{selectedUser.email || "Chưa cập nhật"}</strong>
                </div>

                <div>
                  <span>Địa chỉ</span>
                  <strong>{selectedUser.address || "Chưa cập nhật"}</strong>
                </div>

                <div>
                  <span>Số tài khoản</span>
                  <strong>{selectedUser.account}</strong>
                </div>

                <div>
                  <span>Số dư hiện tại</span>
                  <strong>{formatMoney(selectedUser.balance)}</strong>
                </div>

                <div>
                  <span>Vai trò</span>
                  <strong>{selectedUser.role}</strong>
                </div>

                <div>
                  <span>Trạng thái</span>
                  <strong>{selectedUser.status}</strong>
                </div>
              </div>

              <button
                type="button"
                className="modal-status-button"
                disabled={actionLoading !== null}
                onClick={() => toggleStatus(selectedUser)}
              >
                {actionLoading === selectedUser.id
                  ? "Đang xử lý..."
                  : selectedUser.status === "Hoạt động"
                    ? "Khóa tài khoản"
                    : "Mở khóa tài khoản"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;