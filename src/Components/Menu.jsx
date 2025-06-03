import React, { useState } from "react";
import { Link } from "react-router-dom";

function MenuUser({ user, categories, configWeb }) {
    const [activeMenu, setActiveMenu] = useState(null);
    const userRole = user?.role || "user";
    const config = configWeb || {};
    const toggleMenu = (menuName) => {
        setActiveMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
    };

    const validCategories = categories?.filter(
        (category) => category?.platforms_id?._id
    ) || [];

    const groupedCategories = Array.isArray(validCategories)
        ? validCategories.reduce((acc, category) => {
            const platformId = category.platforms_id?._id; // Sử dụng optional chaining
            if (!platformId) {
                console.error("Danh mục không có `platforms_id` hoặc `_id`:", category);
                return acc;
            }
            if (!acc[platformId]) {
                acc[platformId] = {
                    platform: category.platforms_id,
                    services: [],
                };
            }
            acc[platformId].services.push(category);
            return acc;
        }, {})
        : {};
    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };
    return (
        <nav className="pc-sidebar">
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link to="/" className="b-brand text-primary">
                        <div className="m-header">
                            <Link to="/" className="b-brand text-primary">
                                {isValidUrl(config.logo) ? (
                                    <img
                                        src={config.logo}
                                        className="img-fluid logo-lg"
                                        alt="logo"
                                        style={{ maxWidth: "230px", maxHeight: "110px", objectFit: "contain" }}
                                        onError={(e) => (e.target.style.display = "none")} // Ẩn ảnh nếu không tải được
                                    />
                                ) : (
                                    <span className="text-dark" style={{ fontSize: "30px", fontWeight: "bold" }}>
                                        {config.logo || "Logo"}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </Link>
                </div>
                <div className="navbar-content mb-3">
                    <ul className="pc-navbar">
                        {userRole === "admin" && (
                            <>
                                <li className="pc-item pc-caption">
                                    <label>Bảng Điều Khiển</label>
                                </li>
                                <li className="pc-item pc-hasmenu">
                                    <a
                                        onClick={() => toggleMenu("Menu")}
                                        className="pc-link"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="pc-micon">
                                            <img src="/dashboard.png" className="wid-35" alt="" />
                                        </span>
                                        <span className="pc-mtext">QUẢN LÝ HỆ THỐNG</span>
                                        <span className="pc-arrow">
                                            <i data-feather="chevron-right"></i>
                                        </span>
                                    </a>
                                    {activeMenu === "Menu" && (
                                        <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                            <li className="pc-item">
                                                <Link to="/admin/setting" className="pc-link">
                                                    <span className="pc-mtext">Cài đặt trang</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/setting-thecao" className="pc-link">
                                                    <span className="pc-mtext">Cấu hình nạp thẻ</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/tai-khoan" className="pc-link">
                                                    <span className="pc-mtext">Khách hàng</span>
                                                </Link>
                                            </li>

                                            <li className="pc-item">
                                                <Link to="/admin/thongke" className="pc-link">
                                                    <span className="pc-mtext">Thống kê</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/bank-king" className="pc-link">
                                                    <span className="pc-mtext">Nạp tiền</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/taothongbao" className="pc-link">
                                                    <span className="pc-mtext">Thông báo</span>
                                                </Link>
                                            </li>

                                        </ul>
                                    )}
                                </li>
                                <li className="pc-item pc-hasmenu">
                                    <a
                                        onClick={() => toggleMenu("dichvu")}
                                        className="pc-link"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="pc-micon">
                                            <img src="/dashboard.png" className="wid-35" alt="" width={35} height={35} />
                                        </span>
                                        <span className="pc-mtext">MENU DỊCH VỤ</span>
                                        <span className="pc-arrow">
                                            <i data-feather="chevron-right"></i>
                                        </span>
                                    </a>
                                    {activeMenu === "dichvu" && (
                                        <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                            <li className="pc-item">
                                                <Link to="/admin/doitac" className="pc-link">
                                                    <span className="pc-mtext">Thêm đối tác</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/nen-tang" className="pc-link">
                                                    <span className="pc-mtext">Thêm nền tảng</span>
                                                </Link>
                                            </li>
                                            <li className="pc-item">
                                                <Link to="/admin/dich-vu" className="pc-link">
                                                    <span className="pc-mtext">Thêm dịch vụ</span>
                                                </Link>
                                            </li>

                                            <li className="pc-item">
                                                <Link to="/admin/server" className="pc-link">
                                                    <span className="pc-mtext">Thêm server</span>
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </>
                        )}
                        <li className="pc-item pc-caption">
                            <label>Bảng Điều Khiển</label>
                        </li>
                        {/* Menu dành cho tất cả người dùng */}
                        <li className="pc-item">
                            <Link to="/profile" className="pc-link">
                                <span className="pc-micon">
                                    <img src="/home.png" className="wid-35" alt="" width={35} height={35} />
                                </span>
                                <span className="pc-mtext">Thông Tin Cá Nhân</span>
                            </Link>
                        </li>
                        <li className="pc-item">
                            <Link to="/nap-tien" className="pc-link">
                                <span className="pc-micon">
                                    <img src="/payment-method.png" className="wid-35" alt="" width={35} height={35} />
                                </span>
                                <span className="pc-mtext">Nạp Tiền</span>
                            </Link>
                        </li>
                        <li className="pc-item">
                            <Link to="/lich-su-hoat-dong" className="pc-link">
                                <span className="pc-micon">
                                    <img src="/transactions.png" className="wid-35" alt="" width={35} height={35} />
                                </span>
                                <span className="pc-mtext">Lịch Sử Hoạt Động</span>
                            </Link>
                        </li>
                        <li className="pc-item pc-caption">
                            <label>Danh Sách Dịch Vụ</label>
                        </li>
                        <li className="pc-item pc-hasmenu">
                            <Link to="/order" className="pc-link">
                                <span className="pc-micon">
                                    <img src="https://i.imgur.com/LtJfhAt.gif" className="wid-35" alt="" width={35} height={35} />
                                </span>
                                <span className="pc-mtext">Mua dịch vụ</span>
                            </Link>
                        </li>
                        <li className="pc-item">
                            <Link to="/danh-sach-don" className="pc-link">
                                <span className="pc-micon">
                                    <img src="/transactions.png" className="wid-35" alt="Service Platform 1" />
                                </span>
                                <span className="pc-mtext">Danh sách đơn</span>
                            </Link>
                        </li>
                        <li className="pc-item pc-caption">
                            <label>Danh Sách Dịch Vụ</label>
                        </li>
                        {Object.values(groupedCategories).map((group) =>
                            group.platform && group.platform._id ? (
                                <li key={group.platform._id} className="pc-item pc-hasmenu">
                                    <a
                                        onClick={() => toggleMenu(group.platform._id)}
                                        className="pc-link"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="pc-micon">
                                            <img
                                                src={group.platform.logo}
                                                className="wid-35"
                                                alt={group.platform.name}
                                            />
                                        </span>
                                        <span className="pc-mtext">{group.platform.name}</span>
                                        <span className="pc-arrow">
                                            <i data-feather="chevron-right"></i>
                                        </span>
                                    </a>
                                    {activeMenu === group.platform._id && (
                                        <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                            {group.services.map((service) =>
                                                service._id ? (
                                                    <li key={service._id} className="pc-item">
                                                        <Link
                                                            to={`/${group.platform.name.toLowerCase()}/${service.path}`}
                                                            className="pc-link"
                                                        >
                                                            <span className="pc-mtext">{service.name}</span>
                                                        </Link>
                                                    </li>
                                                ) : null
                                            )}
                                        </ul>
                                    )}
                                </li>
                            ) : null
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default MenuUser;