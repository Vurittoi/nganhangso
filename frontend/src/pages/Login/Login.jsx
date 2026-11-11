import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    // Kiểm tra bỏ trống
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {

      // Gọi API Backend
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: username,
            password: password
          })
        }
      );

      const data = await response.json();

      // Đăng nhập thành công
      if (data.success) {

        // Lưu thông tin người dùng
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        console.log("Đăng nhập thành công:", data.user);

        // Admin
        if (data.user.role_id === 1) {
          navigate("/admin");
        }

        // Khách hàng
        else {
          navigate("/dashboard");
        }

      }

      // Đăng nhập thất bại
      else {

        setError(
          data.message || "Tên đăng nhập hoặc mật khẩu không đúng."
        );

      }

    }

    catch (error) {

      console.log("Lỗi kết nối:", error);

      setError(
        "Không thể kết nối đến máy chủ."
      );

    }

  };


  return (

    <div className="login-page">

      <div className="login-container">


        {/* =========================
            PHẦN GIỚI THIỆU
        ========================= */}

        <div className="login-intro">

          <div className="bank-logo">
            $
          </div>

          <h1>
            NGÂN HÀNG SỐ
          </h1>

          <p>
            Hệ thống mô phỏng giao dịch ngân hàng
          </p>

          <div className="intro-line"></div>

          <span>
            Giao dịch nhanh chóng – An toàn – Chính xác
          </span>

        </div>


        {/* =========================
            FORM ĐĂNG NHẬP
        ========================= */}

        <div className="login-box">

          <div className="login-title">

            <h2>
              Đăng nhập
            </h2>

            <p>
              Đăng nhập để sử dụng dịch vụ ngân hàng
            </p>

          </div>


          <form onSubmit={handleLogin}>


            {/* TÊN ĐĂNG NHẬP */}

            <div className="form-group">

              <label>
                Tên đăng nhập
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
              />

            </div>


            {/* MẬT KHẨU */}

            <div className="form-group">

              <label>
                Mật khẩu
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>

              </div>

            </div>


            {/* GHI NHỚ + QUÊN MẬT KHẨU */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                <span>
                  Ghi nhớ đăng nhập
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
              >
                Quên mật khẩu?
              </button>

            </div>


            {/* THÔNG BÁO LỖI */}

            {error && (

              <div className="login-error">
                {error}
              </div>

            )}


            {/* NÚT ĐĂNG NHẬP */}

            <button
              type="submit"
              className="login-button"
            >
              ĐĂNG NHẬP
            </button>

          </form>


          {/* THÔNG BÁO */}

          <div className="demo-account">

            <p>
              Đăng nhập bằng tài khoản trong cơ sở dữ liệu
            </p>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <div className="login-footer">

        © 2026 Hệ thống mô phỏng giao dịch ngân hàng

      </div>

    </div>

  );

}

export default Login;