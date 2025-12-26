import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register, getRecaptchaSiteKey } from "@/Utils/api";
import ReCAPTCHA from "react-google-recaptcha";
import { Link } from "react-router-dom";
export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const [siteKey, setSiteKey] = useState("");
    const [siteKeyLoading, setSiteKeyLoading] = useState(true);
    const [recaptchaReady, setRecaptchaReady] = useState(false);
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();

    // Lấy site key từ backend
    useEffect(() => {
        const fetchSiteKey = async () => {
            try {
                setSiteKeyLoading(true);
                const data = await getRecaptchaSiteKey();
                setSiteKey(data.siteKey);
            } catch (err) {
                // console.error("Lỗi lấy reCAPTCHA site key:", err);
            } finally {
                setSiteKeyLoading(false);
            }
        };
        fetchSiteKey();
    }, []);

    // Xử lý khi reCAPTCHA thay đổi
    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token || "");
    };

    // Reset reCAPTCHA
    const resetRecaptcha = () => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        setRecaptchaToken("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        // Kiểm tra độ dài username
        if (username.length > 100) {
            setError("Tên tài khoản không được dài hơn 100 ký tự.");
            setLoading(false);
            return;
        }
        // if (password !== confirmPassword) {
        //     setError("Mật khẩu xác nhận không khớp.");
        //     setLoading(false);
        //     return;
        // }
        // Kiểm tra reCAPTCHA
        if (!recaptchaToken) {
            setError("Vui lòng xác nhận bạn không phải là người máy.");
            setLoading(false);
            return;
        }

        try {
            const data = await register({ username, password, recaptchaToken });
            setSuccess(data.message || "Đăng ký thành công!"); // Hiển thị thông báo đăng ký thành công
            setTimeout(() => {
                navigate("/dang-nhap"); // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
            }, 2000); // Thời gian chờ 2 giây để hiển thị thông báo
        } catch (err) {
            // console.error("Lỗi đăng ký:", err);
            setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
            // Reset reCAPTCHA khi có lỗi
            resetRecaptcha();
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
            <div className="register-wrap d-flex flex-wrap justify-content-center align-items-md-center align-items-start min-vh-100 overflow-auto">
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
                                            <h2 className="text-center text-primary">Đăng ký</h2>
                                        </div>
                                        {success && (
                                            <div
                                                className="alert alert-success alert-dismissible fade show"
                                                role="alert"
                                            >
                                                {success}
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    aria-label="Close"
                                                    onClick={() => setSuccess("")}
                                                ></button>
                                            </div>
                                        )}
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
                                <form onSubmit={handleRegister}>
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
                                            {siteKeyLoading ? (
                                                <div className="d-flex justify-content-center">
                                                    <div className="d-flex flex-column align-items-center py-3">
                                                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        <small className="text-muted">Đang tải reCAPTCHA...</small>
                                                    </div>
                                                </div>
                                            ) : siteKey ? (
                                                <div className="d-flex justify-content-center position-relative" style={{ minHeight: '78px' }}>
                                                    {!recaptchaReady && (
                                                        <div
                                                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                                            style={{ zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                                                        >
                                                            <div className="d-flex flex-column align-items-center">
                                                                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <small className="text-muted">Đang hiển thị reCAPTCHA...</small>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        // opacity: recaptchaReady ? 1 : 0, 
                                                        // transition: 'opacity 0.4s ease-in-out',
                                                        // visibility: recaptchaReady ? 'visible' : 'hidden'
                                                    }}>
                                                        <ReCAPTCHA
                                                            ref={recaptchaRef}
                                                            sitekey={siteKey}
                                                            onChange={handleRecaptchaChange}
                                                            onExpired={() => setRecaptchaToken("")}
                                                            asyncScriptOnLoad={() => {
                                                                setRecaptchaReady(true);
                                                            }}
                                                            hl="vi"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="col-12">
                                            <div className="d-grid">
                                                <button
                                                    className="btn bsb-btn-xl btn-primary"
                                                    type="submit"
                                                    disabled={loading}
                                                >
                                                    {loading ? "Đang xử lý..." : "Đăng ký"}
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
                                                    to="/dang-nhap"
                                                >
                                                    Đã có tài khoản
                                                </Link>
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