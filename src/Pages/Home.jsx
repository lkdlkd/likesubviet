import React, { useState, useEffect, Suspense, lazy } from 'react';
import NotificationModal from '@/Components/NotificationModal';
import { useOutletContext } from "react-router-dom";
import { Link } from 'react-router-dom';

// Lazy load Ordernhanh để đợi load xong mới hiển thị
const Ordernhanh = lazy(() => import('./Order/Ordernhanh'));
const Home = () => {
    const { configWeb, user, notifications } = useOutletContext();
    const config = configWeb || {};

    // Local alert states
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [dismissedTelegram, setDismissedTelegram] = useState(false);

    const needsTelegramLink = !user?.telegramChat && !dismissedTelegram;

    // // Set default info message only once when user chưa liên kết telegram
    // useEffect(() => {
    //     if (needsTelegramLink && !info) {
    //         setInfo("Chưa liên kết Telegram. Liên kết để bảo mật hơn.");
    //     }
    // }, [needsTelegramLink, info]);

    const showAlert = error || info || needsTelegramLink;

    return (
        <div className="row">
            {/* Enhanced scoped styles for modern UI animations and effects */}
            <style>{`
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(12px); } 
                    to { opacity: 1; transform: none; } 
                }
                @keyframes fadeIn { 
                    from { opacity: 0; } 
                    to { opacity: 1; } 
                }
                @keyframes pulse { 
                    0%, 100% { transform: scale(1); } 
                    50% { transform: scale(1.02); } 
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                
                .fade-in-up { 
                    animation: fadeInUp .5s ease both; 
                }
                .fade-in-up:nth-child(1) { animation-delay: 0s; }
                .fade-in-up:nth-child(2) { animation-delay: .1s; }
                .fade-in-up:nth-child(3) { animation-delay: .2s; }
                .fade-in-up:nth-child(4) { animation-delay: .3s; }
                .fade-in-up:nth-child(5) { animation-delay: .4s; }
                .fade-in-up:nth-child(6) { animation-delay: .5s; }
                .fade-in-up:nth-child(7) { animation-delay: .6s; }
                
                .alert-animate { 
                    animation: fadeIn .3s ease both; 
                    border-left: 4px solid currentColor;
                    position: relative;
                    overflow: hidden;
                }
                .alert-animate::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -200px;
                    width: 200px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    animation: shimmer 2s infinite;
                }
                
                .card-animate { 
                    animation: fadeInUp .5s ease both; 
                    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,.06);
                    border-radius: 12px;
                    position: relative;
                    overflow: hidden;
                }
                .card-animate::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--bs-primary), var(--bs-success), var(--bs-warning), var(--bs-info));
                    opacity: 0;
                    transition: opacity .3s ease;
                }
                .card-animate:hover::before {
                    opacity: 1;
                }
                .card-animate:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 0.75rem 2rem rgba(0,0,0,.12);
                    border-color: rgba(0,0,0,.1);
                }
                
                .icon-bounce { 
                    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .card-animate:hover .icon-bounce { 
                    transform: scale(1.1) rotate(5deg);
                    filter: brightness(1.1);
                }
                
                .avtar {
                    position: relative;
                    overflow: hidden;
                }
                .avtar::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity .3s ease;
                    transform: scale(0);
                }
                .card-animate:hover .avtar::after {
                    opacity: 1;
                    transform: scale(1);
                }
                
                .balance-highlight {
                    position: relative;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 600;
                }
                
                .notification-section {
                    position: relative;
                }
                .notification-section::before {
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    background: linear-gradient(45deg, transparent, rgba(0,123,255,0.03), transparent);
                    border-radius: 16px;
                    z-index: -1;
                    opacity: 0;
                    transition: opacity .3s ease;
                }
                .notification-section:hover::before {
                    opacity: 1;
                }
                
                .header-title {
                    position: relative;
                    display: inline-block;
                }
                .header-title::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, var(--bs-primary), var(--bs-info));
                    transition: width .3s ease;
                }
                .card-animate:hover .header-title::after {
                    width: 100%;
                }
            `}</style>
            <div className="col-12 mb-1 fade-in-up">
                {showAlert && (
                    <div
                        className={`alert ${error ? 'alert-danger' : 'alert-warning'} alert-dismissible fade show alert-animate`}
                        role="alert"
                    >
                        <div className='mb-1'>
                            {error && (
                                <span className="text-danger fw-semibold">
                                    <i className="ti ti-alert-triangle me-1"></i>{error}
                                </span>
                            )}
                            {!error && needsTelegramLink && (
                                <span className="text-danger fw-normal">
                                    <i className="ti ti-alert-circle me-1"></i>
                                    Người dùng <strong>chưa liên kết Telegram</strong>. Vui lòng liên kết{' '}
                                    <Link to="/profile" title="Liên kết Telegram ở trang hồ sơ">tại đây</Link> để tài khoản bảo mật hơn.
                                </span>
                            )}
                            {/* {!error && !needsTelegramLink && info && (
                            <span className="text-muted">{info}</span>
                        )} */}
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => { setError(''); setInfo(''); setDismissedTelegram(true); }}
                        ></button>
                    </div>
                )}
            </div>

            {/* Card số dư hiện tại */}
            <div className="col-md-6 col-xxl-3 fade-in-up">
                <div className="card card-animate">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-primary me-1">
                                    <i className="ti ti-currency-dollar fs-2 icon-bounce"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0 balance-highlight">
                                    {Number(Math.round(user?.balance || 0)).toLocaleString("en-US")}đ
                                    {/* {Number(user?.balance || 0).toLocaleString("en-US")}đ */}
                                </h4>
                                <h6 className="mb-0 text-muted">Số dư hiện tại</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Các card khác */}
            <div className="col-md-6 col-xxl-3 fade-in-up">
                <div className="card card-animate">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-warning me-1">
                                    <i className="ti ti-calendar-minus fs-2 icon-bounce"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">
                                    {Number(user?.tongnapthang || 0).toLocaleString("en-US")}đ
                                </h4>
                                <h6 className="mb-0 text-muted">
                                    Tổng nạp tháng {new Date().getMonth() + 1}
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6 col-xxl-3 fade-in-up">
                <div className="card card-animate">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-success me-1">
                                    <i className="ti ti-layers-intersect fs-2 icon-bounce"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">
                                    {Number(user?.tongnap || 0).toLocaleString("en-US")}đ
                                </h4>
                                <h6 className="mb-0 text-muted">Tổng nạp</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6 col-xxl-3 fade-in-up">
                <div className="card card-animate">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-info me-1">
                                    <i className="ti ti-diamond fs-2 icon-bounce"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">{user?.capbac === "member" ? "Thành viên" : user?.capbac === "vip" ? "Đại lý" : user?.capbac === "distributor" ? "Nhà Phân Phối" : "Thành viên"}</h4>
                                <h6 className="mb-0 text-muted">Cấp bậc</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {configWeb && !configWeb.showordernhanh && (
                <>
                    {/* Thông báo GHIM */}
                    <div className="col-md-4 fade-in-up">
                        <div className="card card-animate notification-section">
                            <div className="card-body">
                                <h4 className="header-title mb-3">
                                    <i className="ti ti-pin me-2 text-warning"></i>
                                    Thông báo GHIM
                                </h4>
                                <div className="inbox-widget" data-simplebar="init">
                                    <div className="inbox-item">
                                        <div dangerouslySetInnerHTML={{ __html: config.tieude || " không có thông báo ghim" }} />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {configWeb && configWeb.showordernhanh && (
                <Suspense fallback={
                    <div className="col-12 fade-in-up">
                        <div className="card">
                            <div className="card-body text-center py-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                                <p className="text-muted mt-2 mb-0">Đang tải Order nhanh...</p>
                            </div>
                        </div>
                    </div>
                }>
                    <Ordernhanh />
                </Suspense>
            )}

            {/* Thông báo gần đây - dùng Client Component */}
            <div className="col-md-8 fade-in-up notification-section">
                <NotificationModal notifications={notifications} config={configWeb} />
            </div>
        </div>
    );
};

export default Home;