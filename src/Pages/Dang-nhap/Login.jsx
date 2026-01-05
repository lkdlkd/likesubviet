import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, setStoredToken, setSessionKey } from "@/Utils/api"; // API login gộp luôn 2FA (gửi thêm field token nếu là bước OTP)
import { AuthContext } from "@/Context/AuthContext";
import { loadingg } from "@/JS/Loading";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [step, setStep] = useState("credentials"); // credentials | otp
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { updateAuth } = useContext(AuthContext); // Lấy updateAuth từ AuthContext

  /*
    Quy trình backend (đã cung cấp):
    - POST /login với { username, password }
        + Nếu user có twoFactorEnabled: trả về 200 { twoFactorRequired: true, message: 'Yêu cầu mã 2FA' }
        + Nếu user không bật 2FA: trả về { token, role, username, twoFactorEnabled, expiresIn }
    - Gửi lại POST /login lần 2 thêm field token (mã OTP 6 số) cùng username & password
        + Nếu OTP đúng: trả về { token, role, username, twoFactorEnabled, expiresIn }
        + Nếu sai: 401 { error: 'Mã 2FA không chính xác' }
    Frontend: Giữ username/password, chỉ thêm otp vào field token ở lần gọi thứ 2.
    Refresh token được lưu trong httpOnly cookie bởi server.
  */

  const performLogin = async ({ includeOtp = false } = {}) => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const payload = { username, password };
      if (includeOtp) payload.token = otp; // server expects field 'token' for OTP (otpToken in code)
      const data = await login(payload);

      if (data.twoFactorRequired && !includeOtp) {
        setStep("otp");
        setInfo("Nhập mã 2FA để tiếp tục.");
        return;
      }

      if (data.token) {
        setStoredToken(data.token); // Lưu access token
        if (data.sessionKey) setSessionKey(data.sessionKey); // 🔥 Lưu sessionKey cho cross-origin
        updateAuth({ token: data.token, role: data.role });
        setInfo("Đăng nhập thành công!");
        navigate("/home");
      } else {
        setError("Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (step !== "credentials") return;
    performLogin();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (step !== "otp") return;
    if (!otp) return setError("Vui lòng nhập mã OTP");
    performLogin({ includeOtp: true });
  };

  const backToCredentials = () => {
    if (loading) return;
    setStep("credentials");
    setOtp("");
    setError("");
    setInfo("");
  };

  return (
    <>
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
                    src="/img/login-page-img.png"
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
                    {(error || info) && (
                      <div
                        className={`alert ${error ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}
                        role="alert"
                      >
                        {error || info}
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                          onClick={() => { setError(''); setInfo(''); }}
                        ></button>
                      </div>
                    )}
                  </div>
                </div>
                {step === 'credentials' && (
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
                          autoComplete="username"
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
                          autoComplete="current-password"
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
                          <Link
                            className="btn btn-outline-primary btn-block"
                            to="/dang-ky"
                          >
                            Chưa có tài khoản
                          </Link>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="row gy-3 gy-md-4">
                      <div className="col-12">
                        <label className="form-label">Nhập mã xác minh ( Mã 6 số )<span className="text-danger">*</span></label>
                        <input
                          className="form-control"
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Nhập mã 6 số trong ứng dụng"
                          required
                          autoFocus
                        />
                        <small className="text-muted d-block mt-1">Mã đổi mỗi 30 giây.</small>
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button
                          className="btn btn-primary flex-grow-1"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? 'Đang xác minh...' : 'Xác minh & đăng nhập'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={backToCredentials}
                          disabled={loading}
                        >
                          Quay lại
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}