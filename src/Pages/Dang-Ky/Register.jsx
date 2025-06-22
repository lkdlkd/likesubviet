import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "@/Utils/api"; // Gọi hàm register từ utils/api.js

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            setLoading(false);
            return;
        }

        try {
            const data = await register({ username, password });
            setError("",data.message || "Đăng ký thành công!"); // Hiển thị thông báo đăng ký thành công
            setTimeout(() => {
                navigate("/dang-nhap"); // Chuyển hướng về trang đăng nhập sau khi đăng ký thành công
            }, 1000); // Thời gian chờ 1 giây để hiển thị thông báo
        } catch (err) {
           // console.error("Lỗi đăng ký:", err);
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
                                            <label htmlFor="confirmPassword" className="form-label">
                                                Xác nhận mật khẩu <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                type="password"
                                                name="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Xác nhận mật khẩu"
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
                                                    {loading ? "Đang xử lý..." : "Đăng ký"}
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
                                                    href="/dang-nhap"
                                                >
                                                    Đã có tài khoản
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