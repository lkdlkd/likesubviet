"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = () => {
        setIsLoading(true);

        // Xóa token từ cookie
        localStorage.removeItem("token"); // Xóa token khỏi localStorage
        localStorage.removeItem("notiModalLastClosed"); // Xóa token khỏi localStorage nếu có
        // Các cookie khác nếu cần
        // Cookies.remove("user");

        // Chuyển hướng về trang đăng nhập
        setTimeout(() => {
            navigate("/dang-nhap"); // Sử dụng useNavigate để chuyển hướng
            window.location.reload(); // Refresh để cập nhật trạng thái đăng nhập
        }, 500);
    };

    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                handleLogout();
            }}
            className="dropdown-item"
            style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
        >
            <i className="ti ti-logout me-2 text-danger"></i>
            {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
        </a>
    );
}