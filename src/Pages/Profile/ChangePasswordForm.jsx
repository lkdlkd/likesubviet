import React, { useState } from "react";
import { changePassword } from "@/Utils/api";
import Swal from "sweetalert2";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này
export default function ChangePasswordForm({ token, user }) {
    const userId = user?.userId; // Kiểm tra user trước khi truy cập thuộc tính


    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        if (strength <= 2) return { strength, label: 'Yếu', color: 'danger' };
        if (strength <= 4) return { strength, label: 'Trung bình', color: 'warning' };
        return { strength, label: 'Mạnh', color: 'success' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: "Lỗi",
                text: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
            return;
        }

        try {
            setLoading(true);
            setLoading(true);
            loadingg("Vui lòng chờ..."); // Hiển thị thông báo đang tìm kiếm
            setTimeout(() => {
                loadingg("", false); // Ẩn thông báo sau khi tìm kiếm
            }, 1000);
            if (!token || !userId) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Bạn chưa đăng nhập!",
                    icon: "error",
                    confirmButtonText: "Đăng nhập",
                });
                return;
            }

            // Gọi API để thay đổi mật khẩu
            await changePassword(userId, { oldPassword, newPassword }, token);

            Swal.fire({
                title: "Thành công",
                text: "Mật khẩu đã được thay đổi thành công!",
                icon: "success",
                confirmButtonText: "Xác nhận",
            });

            // Reset form
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Có lỗi xảy ra. Vui lòng thử lại!";
            Swal.fire({
                title: "Lỗi",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Enhanced ChangePasswordForm Styles */}
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .password-form-enhanced {
                    animation: slideInUp 0.5s ease both;
                }
                
                .form-group-enhanced {
                    margin-bottom: 20px;
                    animation: slideInUp 0.4s ease both;
                    position: relative;
                }
                .form-group-enhanced:nth-child(1) { animation-delay: 0s; }
                .form-group-enhanced:nth-child(2) { animation-delay: 0.1s; }
                .form-group-enhanced:nth-child(3) { animation-delay: 0.2s; }
                .form-group-enhanced:nth-child(4) { animation-delay: 0.3s; }
                
                .form-label-enhanced {
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .password-input-container {
                    position: relative;
                }
                
                .form-control-enhanced {
                    border-radius: 12px;
                    border: 2px solid rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    padding: 12px 50px 12px 16px;
                    font-size: 0.95rem;
                    background: rgba(255,255,255,0.8);
                }
                .form-control-enhanced:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
                    transform: translateY(-1px);
                    background: white;
                }
                .form-control-enhanced:hover {
                    border-color: rgba(0,123,255,0.3);
                }
                .form-control-enhanced.is-invalid {
                    border-color: #dc3545;
                    animation: shake 0.5s ease;
                }
                .form-control-enhanced.is-valid {
                    border-color: #28a745;
                }
                
                .password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    font-size: 1.1rem;
                    transition: all 0.2s ease;
                    z-index: 10;
                }
                .password-toggle:hover {
                    color: #007bff;
                    transform: translateY(-50%) scale(1.1);
                }
                
                .password-strength {
                    margin-top: 8px;
                    font-size: 0.8rem;
                }
                .strength-bar {
                    height: 4px;
                    border-radius: 2px;
                    background: #e9ecef;
                    overflow: hidden;
                    margin-top: 4px;
                }
                .strength-progress {
                    height: 100%;
                    transition: width 0.3s ease, background-color 0.3s ease;
                    border-radius: 2px;
                }
                
                .btn-enhanced {
                    border-radius: 12px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    padding: 14px 24px;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .btn-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s ease;
                }
                .btn-enhanced:hover::before {
                    left: 100%;
                }
                .btn-enhanced:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,123,255,0.3);
                }
                .btn-enhanced:active {
                    transform: translateY(0);
                }
                .btn-enhanced:disabled {
                    opacity: 0.7;
                    transform: none;
                    cursor: not-allowed;
                }
                
                .btn-primary-enhanced {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    border: none;
                    color: white;
                }
                .btn-primary-enhanced:hover:not(:disabled) {
                    background: linear-gradient(135deg, #0056b3, #003d82);
                    color: white;
                }
                
                .loading-icon {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .password-requirements {
                    background: rgba(0,123,255,0.05);
                    border: 1px solid rgba(0,123,255,0.2);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    font-size: 0.85rem;
                }
                .requirement-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 4px;
                }
                .requirement-item:last-child {
                    margin-bottom: 0;
                }
                .requirement-check {
                    color: #28a745;
                }
                .requirement-cross {
                    color: #dc3545;
                }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .form-control-enhanced {
                        padding: 10px 45px 10px 14px;
                        font-size: 0.9rem;
                    }
                    .btn-enhanced {
                        padding: 12px 20px;
                        font-size: 0.95rem;
                    }
                    .password-toggle {
                        right: 10px;
                        font-size: 1rem;
                    }
                }
            `}</style>
            
            <form onSubmit={handleSubmit} className="password-form-enhanced">
                <div className="row">
                    <div className="col-md-12 form-group-enhanced">
                        <label htmlFor="current_password" className="form-label form-label-enhanced">
                            <i className="fas fa-lock text-warning"></i>
                            Mật khẩu hiện tại:
                        </label>
                        <div className="password-input-container">
                            <input
                                id="current_password"
                                className="form-control form-control-enhanced"
                                type={showPasswords.old ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('old')}
                                disabled={loading}
                            >
                                <i className={`fas ${showPasswords.old ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="col-md-12 form-group-enhanced">
                        <label htmlFor="new_password" className="form-label form-label-enhanced">
                            <i className="fas fa-key text-success"></i>
                            Mật khẩu mới:
                        </label>
                        <div className="password-input-container">
                            <input
                                id="new_password"
                                placeholder="Nhập mật khẩu mới ít nhất 6 ký tự"
                                className={`form-control form-control-enhanced ${
                                    newPassword && passwordStrength.strength <= 2 ? 'is-invalid' : 
                                    newPassword && passwordStrength.strength >= 5 ? 'is-valid' : ''
                                }`}
                                type={showPasswords.new ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={loading}
                            >
                                <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {newPassword && (
                            <div className="password-strength">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <small>Mức độ bảo mật:</small>
                                    <small className={`text-${passwordStrength.color} fw-semibold`}>
                                        {passwordStrength.label}
                                    </small>
                                </div>
                                <div className="strength-bar">
                                    <div 
                                        className={`strength-progress bg-${passwordStrength.color}`}
                                        style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {newPassword && (
                            <div className="password-requirements">
                                <div className="requirement-item">
                                    <i className={`fas ${newPassword.length >= 6 ? 'fa-check requirement-check' : 'fa-times requirement-cross'}`}></i>
                                    <span>Ít nhất 6 ký tự</span>
                                </div>
                                <div className="requirement-item">
                                    <i className={`fas ${/[A-Z]/.test(newPassword) ? 'fa-check requirement-check' : 'fa-times requirement-cross'}`}></i>
                                    <span>Có chữ in hoa</span>
                                </div>
                                <div className="requirement-item">
                                    <i className={`fas ${/[0-9]/.test(newPassword) ? 'fa-check requirement-check' : 'fa-times requirement-cross'}`}></i>
                                    <span>Có số</span>
                                </div>
                                <div className="requirement-item">
                                    <i className={`fas ${/[^A-Za-z0-9]/.test(newPassword) ? 'fa-check requirement-check' : 'fa-times requirement-cross'}`}></i>
                                    <span>Có ký tự đặc biệt</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="col-md-12 form-group-enhanced">
                        <label htmlFor="confirm_password" className="form-label form-label-enhanced">
                            <i className="fas fa-check-circle text-info"></i>
                            Xác nhận mật khẩu:
                        </label>
                        <div className="password-input-container">
                            <input
                                placeholder="Nhập lại mật khẩu mới"
                                id="confirm_password"
                                className={`form-control form-control-enhanced ${
                                    confirmPassword && newPassword !== confirmPassword ? 'is-invalid' :
                                    confirmPassword && newPassword === confirmPassword ? 'is-valid' : ''
                                }`}
                                type={showPasswords.confirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={loading}
                            >
                                <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <small className="text-danger mt-1 d-block">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Mật khẩu không khớp!
                            </small>
                        )}
                        {confirmPassword && newPassword === confirmPassword && (
                            <small className="text-success mt-1 d-block">
                                <i className="fas fa-check me-1"></i>
                                Mật khẩu khớp!
                            </small>
                        )}
                    </div>
                    
                    <div className="col-md-12 form-group-enhanced">
                        <button
                            type="submit"
                            className="btn btn-enhanced btn-primary-enhanced col-12"
                            disabled={loading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner loading-icon"></i>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-shield-alt"></i>
                                    Thay đổi mật khẩu
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}

