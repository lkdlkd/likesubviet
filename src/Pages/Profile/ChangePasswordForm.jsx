import React, { useState } from "react";
import { changePassword } from "@/Utils/api";
import Swal from "sweetalert2";

export default function ChangePasswordForm({ token, user }) {
    const userId = user?.userId ; // Kiểm tra user trước khi truy cập thuộc tính


    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

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
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-12 form-group">
                    <label htmlFor="current_password" className="form-label">
                        Mật khẩu hiện tại:
                    </label>
                    <input
                        id="current_password"
                        className="form-control"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu hiện tại"
                        disabled={loading}
                    />
                </div>
                <div className="col-md-12 form-group">
                    <label htmlFor="new_password" className="form-label">
                        Mật khẩu mới:
                    </label>
                    <input
                        id="new_password"
                        placeholder="Nhập mật khẩu mới ít nhất 6 ký tự"
                        className="form-control"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="col-md-12 form-group">
                    <label htmlFor="confirm_password" className="form-label">
                        Xác nhận mật khẩu:
                    </label>
                    <input
                        placeholder="Nhập mật khẩu mới ít nhất 6 ký tự"
                        id="confirm_password"
                        className="form-control"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="col-md-12 form-group">
                    <button
                        type="submit"
                        className="btn btn-primary col-12"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="ti ti-reload"></i> Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="ti ti-lock"></i> Thay đổi mật khẩu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

