import React, { useState, useEffect } from 'react';
import NotificationModal from '@/Components/NotificationModal';
import { useOutletContext } from "react-router-dom";
import { Link } from 'react-router-dom';
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
           <div className="col-12 mb-1">
             {showAlert && (
                <div
                    className={`alert ${error ? 'alert-danger' : 'alert-warning'} alert-dismissible fade show`}
                    role="alert"
                >
                    <div className='mb-1'>
                        {error && <span className="text-danger fw-semibold">{error}</span>}
                        {!error && needsTelegramLink && (
                            <span className="text-danger fw-normal">
                                Người dùng <strong>chưa liên kết Telegram</strong>. Vui lòng liên kết
                                {' '}<Link to="/profile">tại đây</Link> để tài khoản bảo mật hơn.
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
            <div className="col-md-6 col-xxl-3">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-primary me-1">
                                    <i className="ti ti-currency-dollar fs-2"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">
                                    {Number(Math.round(user?.balance || 0)).toLocaleString("en-US")}đ
                                    {/* {Number(user?.balance || 0).toLocaleString("en-US")}đ */}
                                </h4>
                                <h6 className="mb-0">Số dư hiện tại</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Các card khác */}
            <div className="col-md-6 col-xxl-3">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-warning me-1">
                                    <i className="ti ti-calendar-minus fs-2"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">
                                    {Number(user?.tongnapthang || 0).toLocaleString("en-US")}đ
                                </h4>
                                <h6 className="mb-0">
                                    Tổng nạp tháng {new Date().getMonth() + 1}
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6 col-xxl-3">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-success me-1">
                                    <i className="ti ti-layers-intersect fs-2"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">
                                    {Number(user?.tongnap || 0).toLocaleString("en-US")}đ
                                </h4>
                                <h6 className="mb-0">Tổng nạp</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6 col-xxl-3">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex align-items-center">
                            <div className="flex-shrink-0">
                                <div className="avtar bg-light-info me-1">
                                    <i className="ti ti-diamond fs-2"></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h4 className="mb-0">{user?.capbac || "Chưa có"}</h4>
                                <h6 className="mb-0">Cấp bậc</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông báo GHIM */}
            <div className="col-md-4">
                <div className="card">
                    <div className="card-body">
                        <h4 className="header-title mb-3">Thông báo GHIM</h4>
                        <div className="inbox-widget" data-simplebar="init">
                            <div className="inbox-item">
                                <div dangerouslySetInnerHTML={{ __html: config.tieude || " không có thông báo ghim" }} />

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông báo gần đây - dùng Client Component */}
            <div className="col-md-8">
                <NotificationModal notifications={notifications} />
            </div>
        </div>
    );
};

export default Home;