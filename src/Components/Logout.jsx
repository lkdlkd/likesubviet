"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/Utils/api";

export default function Logout() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);

        // Gọi API logout để xóa refresh token trên server
        await logout();

        // Chuyển hướng về trang đăng nhập
        setTimeout(() => {
            navigate("/dang-nhap");
            window.location.reload();
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