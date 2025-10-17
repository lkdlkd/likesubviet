import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout";

// ================= Theme Handling (ported & adapted from themes.js) =================


export default function Header({ user }) {
    const [showSearch, setShowSearch] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const searchRef = useRef(null);
    const userMenuRef = useRef(null);

    const handleActiveMenu = (e) => {
        e.stopPropagation();

        // Lấy sidebar element
        const sidebar = document.querySelector(".pc-sidebar");

        // Toggle class cho sidebar và body
        if (sidebar) {
            sidebar.classList.toggle("open");
            document.body.classList.toggle("pc-sidebar-collapse");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Xử lý đóng user menu
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)
            ) {
                setShowUserMenu(false);
            }

            // Xử lý đóng search dropdown
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowSearch(false);
            }

            // Tự động đóng sidebar trên mobile khi click bên ngoài
            if (window.innerWidth <= 1024) {
                const sidebar = document.querySelector(".pc-sidebar");
                if (
                    sidebar &&
                    sidebar.classList.contains("open") &&
                    !sidebar.contains(event.target)
                ) {
                    sidebar.classList.remove("open");
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);



    return (
        <header className="pc-header">
            <div className="header-wrapper">
                {/* [Mobile Media Block] */}
                <div className="me-auto pc-mob-drp">
                    <ul className="list-unstyled">
                        <li
                            onClick={handleActiveMenu}
                            className="pc-h-item pc-sidebar-collapse"
                        >
                            <span className="pc-head-link ms-0" id="sidebar-hide">
                                <i className="ti ti-menu-2"></i>
                            </span>
                        </li>
                        <li
                            onClick={handleActiveMenu}
                            className="pc-h-item pc-sidebar-popup"
                        >
                            <span className="pc-head-link ms-0" id="mobile-collapse">
                                <i className="ti ti-menu-2"></i>
                            </span>
                        </li>

                        <li className="dropdown pc-h-item" ref={searchRef}>
                            <span
                                className="pc-head-link arrow-none m-0 trig-drp-search"
                                onClick={() => setShowSearch(!showSearch)}
                            >
                                <i className="ph-duotone ph-magnifying-glass icon-search"></i>
                            </span>
                            {showSearch && (
                                <div className="dropdown-menu drp-search show">
                                    <form className="px-3 py-2">
                                        <input
                                            type="search"
                                            className="form-control border-0 shadow-none"
                                            placeholder="Search here. . ."
                                        />
                                    </form>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>

                {/* [User Block] */}
                <div className="ms-auto">
                    <ul>
                        <li className="dropdown pc-h-item d-none d-md-inline-flex" ref={userMenuRef}>
                        
                            <button
                                type="button"
                                className="pc-head-link dropdown-toggle arrow-none me-0 btn btn-link p-0 border-0"
                                data-bs-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <i className="ph-duotone ph-sun-dim"></i>
                            </button>
                            <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                <button className="dropdown-item" type="button" > <i className="ph-duotone ph-moon"></i> <span>Dark</span></button>
                                <button className="dropdown-item" type="button" > <i className="ph-duotone ph-sun-dim"></i> <span>Light</span></button>
                                <button className="dropdown-item" type="button" > <i className="ph-duotone ph-cpu"></i> <span>Default</span></button>
                            </div>
                        </li>
                        <li
                            className="dropdown pc-h-item header-user-profile"
                            ref={userMenuRef}
                        >
                            <span className="pc-mtext">
                                <label>Số dư :</label>{" "}
                                {user
                                    ? Math.floor(Number(user.balance)).toLocaleString("en-US")
                                    : "Đang tải..."}{" "}
                                đ
                            </span>
                            <span
                                className="pc-head-link dropdown-toggle arrow-none me-0"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?background=random&name=${user?.username || "User"
                                        }`}
                                    alt="user-avatar"
                                    className="user-avtar"
                                    width={40}
                                    height={40}
                                />
                            </span>

                            {showUserMenu && (
                                <div
                                    className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown show"
                                    data-popper-placement="bottom-end"
                                    style={{
                                        position: "absolute",
                                        inset: "0px 0px auto auto",
                                        margin: 0,
                                        transform: "translate(0px, 61px)",
                                    }}
                                >
                                    <div className="dropdown-header d-flex align-items-center justify-content-between">
                                        <h5 className="m-0">Thông tin</h5>
                                    </div>
                                    <div className="dropdown-body">
                                        <div
                                            className="profile-notification-scroll position-relative"
                                            style={{ maxHeight: "calc(100vh - 225px)" }}
                                        >
                                            <div className="d-flex mb-1">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?background=random&name=${user?.username || "User"
                                                            }`}
                                                        alt="user-avatar"
                                                        className="user-avtar wid-35"
                                                        width={35}
                                                        height={35}
                                                    />
                                                </div>

                                                <div className="flex-grow-1 ms-3">
                                                    <h6 className="mb-1">
                                                        {user?.username || "Người dùng"}
                                                    </h6>
                                                    <h6 className="text-primary">
                                                        <span className="pc-mtext">
                                                            <label>Số dư :</label>{" "}
                                                            {user
                                                                ? Math.floor(Number(user.balance)).toLocaleString("en-US")
                                                                // Number(user.balance).toLocaleString("en-US")
                                                                : "Đang tải..."}{" "}
                                                            đ
                                                        </span>
                                                    </h6>
                                                    <span className={`badge ${
                                                        user?.capbac === "member" ? "bg-secondary" : 
                                                        user?.capbac === "vip" ? "bg-warning" : 
                                                        user?.capbac === "distributor" ? "bg-danger" : "bg-secondary"
                                                    }`}>
                                                        {user?.capbac === "member" ? "Thành viên" : user?.capbac === "vip" ? "Đại lý" : user?.capbac === "distributor" ? "Nhà Phân Phối" : "Thành viên"}
                                                    </span>
                                                </div>
                                            </div>
                                            <hr className="border-secondary border-opacity-50" />
                                            <p className="text-span">Quản lý</p>
                                            <Link to="/profile" className="dropdown-item">
                                                <i className="ti ti-user me-2 text-muted"></i> Thông
                                                tin tài khoản
                                            </Link>
                                            <Link to="/nap-tien" className="dropdown-item">
                                                <i className="ti ti-credit-card me-2 text-muted"></i>{" "}
                                                Nạp tiền tài khoản
                                            </Link>
                                            <Link to="/lich-su-hoat-dong" className="dropdown-item">
                                                <i className="ti ti-history me-2 text-muted"></i> Lịch
                                                sử giao dịch
                                            </Link>
                                            <hr className="border-secondary border-opacity-50" />

                                            <Logout />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}