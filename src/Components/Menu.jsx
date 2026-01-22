import { useState } from "react";
import { SlArrowDown, SlArrowRight } from "react-icons/sl";
import { Link, useNavigate } from "react-router-dom";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
function MenuUser({ user, categories, configWeb }) {
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const [activeMenu, setActiveMenu] = useState(null);
    const userRole = user?.role || "user";
    const config = configWeb || {};
    const toggleMenu = (menuName) => {
        setActiveMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
    };
    const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

    const validCategories = categories?.filter(
        (category) => category?.platforms_id?._id
    ) || [];

    const groupedCategories = Array.isArray(validCategories)
        ? validCategories.reduce((acc, category) => {
            const platformId = category.platforms_id?._id; // Sử dụng optional chaining
            if (!platformId) {
                //  console.error("Danh mục không có `platforms_id` hoặc `_id`:", category);
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

    const handleNavigation = () => {
        // loadingg("Vui lòng chờ...");
        // setTimeout(() => {
        //     navigate(path); // Chuyển trang
        //     // Đóng sidebar nếu đang mở (giống Header)
        const sidebar = document.querySelector(".pc-sidebar");
        if (sidebar && sidebar.classList.contains("open")) {
            sidebar.classList.remove("open");
            document.body.classList.remove("pc-sidebar-collapse");
        }
        //     Swal.close(); // Đóng thông báo tải
        // }, 1000);
    };
    return (
        <>
            {/* Enhanced Menu Styles */}
            <style>{`
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.8; }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-1px); }
                }
                
                .pc-sidebar {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    box-shadow: 2px 0 20px rgba(0,0,0,0.08);
                    border-right: 1px solid rgba(0,0,0,0.06);
                }
                
                .pc-navbar .pc-item {
                    animation: slideInLeft 0.4s ease both;
                    // margin-bottom: 2px;
                }
                .pc-navbar .pc-item:nth-child(1) { animation-delay: 0s; }
                .pc-navbar .pc-item:nth-child(2) { animation-delay: 0.1s; }
                .pc-navbar .pc-item:nth-child(3) { animation-delay: 0.2s; }
                .pc-navbar .pc-item:nth-child(4) { animation-delay: 0.3s; }
                .pc-navbar .pc-item:nth-child(5) { animation-delay: 0.4s; }
                .pc-navbar .pc-item:nth-child(6) { animation-delay: 0.5s; }
                .pc-navbar .pc-item:nth-child(7) { animation-delay: 0.6s; }
                .pc-navbar .pc-item:nth-child(8) { animation-delay: 0.7s; }
                
                // .pc-caption label {
                //     background: linear-gradient(135deg, #007bff, #0056b3);
                //     background-clip: text;
                //     -webkit-background-clip: text;
                //     -webkit-text-fill-color: transparent;
                //     font-weight: 600;
                //     font-size: 0.75rem;
                //     text-transform: uppercase;
                //     letter-spacing: 0.5px;
                //     position: relative;
                // }
                // .pc-caption label::after {
                //     content: '';
                //     position: absolute;
                //     bottom: -2px;
                //     left: 0;
                //     width: 30px;
                //     height: 2px;
                //     background: linear-gradient(90deg, #007bff, #28a745);
                //     border-radius: 1px;
                // }
                
                .pc-link {
                    border-radius: 8px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    margin: 2px 8px;
                }
                // .pc-link::before {
                //     content: '';
                //     position: absolute;
                //     top: 0;
                //     left: -100%;
                //     width: 100%;
                //     height: 100%;
                //     background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                //     transition: left 0.5s ease;
                // }
                // .pc-link:hover::before {
                //     left: 100%;
                // }
                // .pc-link:hover {
                //     background: linear-gradient(135deg, rgba(0,123,255,0.1), rgba(40,167,69,0.05));
                //     transform: translateX(2px);
                //     box-shadow: 0 2px 8px rgba(0,123,255,0.12);
                //     border-left: 3px solid #007bff;
                // }
                
                .pc-micon img {
                    transition: all 0.3s ease;
                    border-radius: 6px;
                    filter: brightness(1.1);
                }
                .pc-link:hover .pc-micon img {
                    transform: scale(1.05);
                    filter: brightness(1.15) saturate(1.05);
                }
                
                .pc-mtext {
                    transition: all 0.25s ease;
                    font-weight: 500;
                }
                .pc-link:hover .pc-mtext {
                    color: #007bff;
                    font-weight: 600;
                }
                
                .pc-arrow {
                    transition: all 0.3s ease;
                    color: #6c757d;
                }
                .pc-link:hover .pc-arrow {
                    color: #007bff;
                    transform: scale(1.1);
                }
                
                // .pc-submenu {
                //     animation: fadeInDown 0.3s ease both;
                //     background: rgba(255,255,255,0.7);
                //     border-radius: 8px;
                //     margin: 4px 0;
                //     padding: 4px 0;
                //     box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
                // }
                // .pc-submenu .pc-item {
                //     animation: slideInLeft 0.3s ease both;
                // }
                // .pc-submenu .pc-item:nth-child(1) { animation-delay: 0s; }
                // .pc-submenu .pc-item:nth-child(2) { animation-delay: 0.05s; }
                // .pc-submenu .pc-item:nth-child(3) { animation-delay: 0.1s; }
                // .pc-submenu .pc-item:nth-child(4) { animation-delay: 0.15s; }
                // .pc-submenu .pc-item:nth-child(5) { animation-delay: 0.2s; }
                
                // .pc-submenu .pc-link {
                //     margin: 1px 12px;
                //     padding: 8px 12px;
                //     font-size: 0.875rem;
                // }
                // .pc-submenu .pc-link:hover {
                //     background: linear-gradient(135deg, rgba(0,123,255,0.08), rgba(40,167,69,0.03));
                //     transform: translateX(3px);
                //     border-left: 2px solid #28a745;
                // }
                
                // .b-brand {
                //     transition: all 0.3s ease;
                //     padding: 15px;
                //     border-radius: 12px;
                //     position: relative;
                //     overflow: hidden;
                // }
                // .b-brand::before {
                //     content: '';
                //     position: absolute;
                //     top: 0;
                //     left: 0;
                //     right: 0;
                //     bottom: 0;
                //     background: linear-gradient(135deg, rgba(0,123,255,0.03), rgba(40,167,69,0.02));
                //     opacity: 0;
                //     transition: opacity 0.3s ease;
                //     border-radius: 12px;
                // }
                // .b-brand:hover::before {
                //     opacity: 1;
                // }
                // .b-brand:hover {
                //     transform: scale(1.01);
                // }
                
                // .logo-lg {
                //     transition: all 0.3s ease;
                //     filter: brightness(1.1);
                // }
                // .b-brand:hover .logo-lg {
                //     filter: brightness(1.1) saturate(1.05);
                //     transform: scale(1.02);
                // }
                
                .navbar-content {
                    position: relative;
                }
                .navbar-content::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 1px;
                    height: 100%;
                    background: linear-gradient(180deg, transparent, rgba(0,123,255,0.2), transparent);
                    opacity: 0.5;
                }
                
                /* Custom scrollbar for SimpleBar */
                .simplebar-scrollbar:before {
                    background: linear-gradient(180deg, #007bff, #28a745);
                    border-radius: 3px;
                    opacity: 0.7;
                }
                .simplebar-track {
                    background: rgba(0,0,0,0.03);
                }
                
                /* Special effects for service items */
                .service-item {
                    position: relative;
                }
                .service-item::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    right: 10px;
                    width: 4px;
                    height: 4px;
                    background: #28a745;
                    border-radius: 50%;
                    transform: translateY(-50%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .service-item:hover::after {
                    opacity: 1;
                }
                
                /* Pulse effect for special items */
                // .pulse-item {
                //     position: relative;
                // }
                // .pulse-item::before {
                //     content: '';
                //     position: absolute;
                //     top: 50%;
                //     left: 8px;
                //     width: 6px;
                //     height: 6px;
                //     background: #dc3545;
                //     border-radius: 50%;
                //     transform: translateY(-50%);
                //     animation: pulse 2s infinite;
                // }
            `}</style>

            <nav className="pc-sidebar">
                <div className="navbar-wrapper">
                    <div className="m-header">
                        <Link to="/home" className="b-brand text-primary">
                            {isValidUrl(config.logo) ? (
                                <img
                                    src={config.logo}
                                    className="img-fluid logo-lg"
                                    alt="logo"
                                    style={{ maxHeight: "110px", objectFit: "contain" }}
                                    onError={(e) => (e.target.style.display = "none")} // Ẩn ảnh nếu không tải được
                                />
                            ) : (
                                <span className="text-dark " style={{ marginLeft: "80px", fontSize: "30px", fontWeight: "bold" }}>
                                    {config.logo || "Logo"}
                                </span>
                            )}
                        </Link>
                    </div>
                    <SimpleBar style={{ maxHeight: '90dvh', minHeight: 0 }} className="navbar-content mb-3">
                        <ul className="pc-navbar">
                            {userRole === "admin" && (
                                <>
                                    <li className="pc-item pc-caption">
                                        <label>Bảng Điều Khiển</label>
                                    </li>
                                    <li className="pc-item pc-hasmenu">
                                        <a
                                            onClick={() => toggleMenu("Menu")}
                                            className="pc-link d-flex align-items-center justify-content-between"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span>
                                                <span className="pc-micon">
                                                    <img src="/img/dashboard.png" className="wid-35" alt="" />
                                                </span>
                                                <span className="pc-mtext">QUẢN LÝ HỆ THỐNG</span>
                                            </span>
                                            <span className="pc-arrow ms-2">
                                                {activeMenu === "Menu" ? <SlArrowDown /> : <SlArrowRight />}
                                            </span>
                                        </a>
                                        {activeMenu === "Menu" && (
                                            <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                                <li className="pc-item">
                                                    <Link to="/admin/setting" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Cài đặt trang</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/chat" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Chat hỗ trợ</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/khuyen-mai" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Cài đặt khuyễn mãi</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/affiliate" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Cấu hình Affiliate</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/affiliate-commissions" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Duyệt hoa hồng</span>
                                                    </Link>
                                                </li>
                                                {/* <li className="pc-item">
                                                <Link to="/admin/setting-thecao" className="pc-link">
                                                    <span className="pc-mtext">Cấu hình nạp thẻ</span>
                                                </Link>
                                            </li> */}
                                                <li className="pc-item">
                                                    <Link to="/admin/config-tele" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Cấu hình Telegram</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/tai-khoan" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Khách hàng</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/orders" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Đơn hàng</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/refund" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Hoàn tiền</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/thongke" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Thống kê</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/bank-king" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Nạp tiền</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/nap-tien-tu-dong" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Quản lý nạp tiền tự động</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/taothongbao" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Thông báo</span>
                                                    </Link>
                                                </li>

                                            </ul>
                                        )}
                                    </li>
                                    <li className="pc-item pc-hasmenu">
                                        <a
                                            onClick={() => toggleMenu("dichvu")}
                                            className="pc-link d-flex align-items-center justify-content-between"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span>
                                                <span className="pc-micon">
                                                    <img src="/img/dashboard.png" className="wid-35" alt="" width={35} height={35} />
                                                </span>
                                                <span className="pc-mtext">MENU DỊCH VỤ</span>
                                            </span>
                                            <span className="pc-arrow ms-2">
                                                {activeMenu === "dichvu" ? <SlArrowDown /> : <SlArrowRight />}
                                            </span>
                                        </a>
                                        {activeMenu === "dichvu" && (
                                            <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                                <li className="pc-item">
                                                    <Link to="/admin/doitac" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Thêm đối tác</span>
                                                    </Link>
                                                </li>
                                                <li className="pc-item">
                                                    <Link to="/admin/nen-tang" onClick={() => handleNavigation()} className="pc-link">
                                                        <span className="pc-mtext">Thêm nền tảng</span>
                                                    </Link>
                                                </li>
                                                {!isAllowedApiUrl && (
                                                    <li className="pc-item">
                                                        <Link to="/admin/dich-vu" onClick={() => handleNavigation()} className="pc-link">
                                                            <span className="pc-mtext">Thêm dịch vụ</span>
                                                        </Link>
                                                    </li>
                                                )}
                                                <li className="pc-item">
                                                    <Link to="/admin/server" onClick={() => handleNavigation()} className="pc-link">
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
                            <li className="pc-item pc-hasmenu">
                                <a
                                    onClick={() => toggleMenu("Menuhethonghethong")}
                                    className="pc-link"
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="pc-micon">
                                        <img src="/img/dashboard.png" className="wid-35" alt="" />
                                    </span>
                                    <span className="pc-mtext">MENU HỆ THỐNG</span>
                                    <span className="pc-arrow ms-2">
                                        {activeMenu === "Menuhethonghethong" ? <SlArrowDown /> : <SlArrowRight />}
                                    </span>
                                </a>
                                {activeMenu === "Menuhethonghethong" && (

                                    <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                        <li className="pc-item">
                                            <Link to="/profile"
                                                onClick={() => handleNavigation()}
                                                className="pc-link"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {/* <span className="pc-micon">
                                                <i className="ti ti-user-circle fs-4 text-primary"></i>
                                            </span> */}
                                                <span className="pc-mtext">Thông Tin Cá Nhân</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/nap-tien"
                                                onClick={() => handleNavigation()}
                                                className="pc-link"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {/* <span className="pc-micon">
                                                <i className="ti ti-credit-card fs-4 text-success"></i>
                                            </span> */}
                                                <span className="pc-mtext">Nạp Tiền</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/lich-su-hoat-dong"
                                                onClick={() => handleNavigation()}
                                                className="pc-link"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {/* <span className="pc-micon">
                                                <i className="ti ti-history fs-4 text-info"></i>
                                            </span> */}
                                                <span className="pc-mtext">Lịch Sử Hoạt Động</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/tai-lieu-api"
                                                onClick={() => handleNavigation()}
                                                className="pc-link"
                                                style={{ cursor: "pointer" }}
                                            >
                                                {/* <span className="pc-micon">
                                                <i className="ti ti-api fs-4 text-warning"></i>
                                            </span> */}
                                                <span className="pc-mtext">Tài liệu API V2</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/tao-web-rieng" className="pc-link"
                                                onClick={() => handleNavigation()}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <span className="pc-mtext">Tạo Web Riêng</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/affiliate" className="pc-link"
                                                onClick={() => handleNavigation()}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <span className="pc-mtext">Giới thiệu nhận tiền</span>
                                            </Link>
                                        </li>
                                        <li className="pc-item">
                                            <Link to="/bang-gia" className="pc-link"
                                                onClick={() => handleNavigation()}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {/* <span className="pc-micon">
                                                <i className="ti ti-currency-dollar fs-4 text-secondary"></i>
                                            </span> */}
                                                <span className="pc-mtext">Bảng giá và cấp bậc</span>
                                            </Link>
                                        </li>

                                    </ul>
                                )}
                            </li>
                            <li className="pc-item pc-caption">
                                <label>Danh Sách Dịch Vụ</label>
                            </li>
                            <li className="pc-item pc-hasmenu">
                                <Link to="/order" className="pc-link pulse-item"
                                    onClick={() => handleNavigation()}
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="pc-micon">
                                        <img src="https://i.imgur.com/LtJfhAt.gif" className="wid-35" alt="" width={35} height={35} />
                                    </span>
                                    <span className="pc-mtext">Mua dịch vụ</span>
                                </Link>
                                {/* <a
                                style={{ cursor: "pointer" }}
                                onClick={() => handleNavigation("/order")}
                                className="pc-link">
                                <span className="pc-micon">
                                    <img src="https://i.imgur.com/LtJfhAt.gif" className="wid-35" alt="" width={35} height={35} />
                                </span>
                                <span className="pc-mtext">Mua dịch vụ</span>
                            </a> */}
                            </li>
                            <li className="pc-item">
                                <Link
                                    onClick={() => handleNavigation()}
                                    to="/danh-sach-don"
                                    style={{ cursor: "pointer" }}
                                    className="pc-link">
                                    <span className="pc-micon">
                                        <img src="/img/transactions.png" className="wid-35" alt="Service Platform 1" />
                                    </span>
                                    <span className="pc-mtext">Danh sách đơn</span>
                                </Link>
                            </li>
                            <li className="pc-item">
                                <Link
                                    onClick={() => handleNavigation()}
                                    to="/scheduled"
                                    style={{ cursor: "pointer" }}
                                    className="pc-link">
                                    <span className="pc-micon">
                                        <img src="/img/Schedule-Time.png" className="wid-35" alt="Service Platform 1" />
                                    </span>
                                    <span className="pc-mtext">Lịch chạy đơn</span>
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
                                            className="pc-link d-flex align-items-center justify-content-between"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <span>
                                                <span className="pc-micon">
                                                    <img
                                                        src={group.platform.logo}
                                                        className="wid-35"
                                                        alt={group.platform.name}
                                                    />
                                                </span>
                                                <span className="pc-mtext">{group.platform.name}</span>
                                            </span>
                                            <span className="pc-arrow ms-2">
                                                {activeMenu === group.platform._id ? <SlArrowDown /> : <SlArrowRight />}
                                            </span>
                                        </a>
                                        {activeMenu === group.platform._id && (
                                            <ul className="pc-submenu" style={{ listStyleType: "none" }}>
                                                {group.services.map((service) =>
                                                    service._id ? (
                                                        <li key={service._id} className="pc-item">
                                                            <Link to={`/order/${service.path.toLowerCase()}`}
                                                                onClick={() => handleNavigation()}
                                                                className="pc-link service-item">
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
                    </SimpleBar>
                </div>
            </nav>
        </>
    );
}

export default MenuUser;