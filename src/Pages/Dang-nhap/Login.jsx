import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/Utils/api"; // Đảm bảo alias @ đã được cấu hình

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login({ username, password });
      localStorage.setItem("token", data.token);
      setError("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/"); // Chuyển hướng về trang home sau khi đăng nhập thành công
      }, 1000); // Thời gian chờ 1 giây để hiển thị thông báo
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="login-wrap d-flex flex-wrap justify-content-center align-items-md-center align-items-start min-vh-100 overflow-auto">
        <div className="container">
          <div className="row g-0">
            {/* Bên hình */}
            <div className="col-12 col-md-6">
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="col-12 py-3">
                  <img
                    className="img-fluid rounded mb-4"
                    style={{ maxWidth: "90%" }}
                    src="/login-page-img.png"
                    alt="banner"
                  />
                </div>
              </div>
            </div>
            {/* Bên form */}
            <div className="col-12 col-md-6">
              <div className="card p-3 p-md-4 p-xl-5">
                <div className="row">
                  <div className="col-12">
                    <div className="mb-5">
                      <h2 className="text-center text-primary">Đăng nhập</h2>
                    </div>
                    {error && (
                      <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                      >
                        {error}
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                          onClick={() => setError("")}
                        ></button>
                      </div>
                    )}
                  </div>
                </div>
                <form onSubmit={handleLogin}>
                  <div className="row gy-3 gy-md-4">
                    <div className="col-12">
                      <label htmlFor="username" className="form-label">
                        Tên tài khoản <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Tài khoản"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="password" className="form-label">
                        Mật khẩu <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mật khẩu"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button
                          className="btn bsb-btn-xl btn-primary"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                      </div>
                    </div>
                    <div className="font-16 weight-600 pt-10 pb-10 text-center">
                      HOẶC
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <a
                          className="btn btn-outline-primary btn-block"
                          href="/dang-ky"
                        >
                          Chưa có tài khoản
                        </a>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}