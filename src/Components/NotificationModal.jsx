import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function NotificationModal({ notifications = [] }) {
    const [noti, setNoti] = useState(notifications[0] || {});
    const [showModal, setShowModal] = useState(false);

    // Kiểm tra và hiển thị modal khi load trang
    useEffect(() => {
        if (notifications.length > 0) {
            setNoti(notifications[0]);

            // Kiểm tra thời gian lần cuối đóng modal
            const lastClosedTime = parseInt(localStorage.getItem("notiModalLastClosed"), 10);
            const now = Date.now();

            // 2 giờ = 2 * 60 * 60 * 1000 = 7200000 milliseconds
            const twoHoursInMs = 7200000;

            // Hiển thị modal nếu:
            // 1. Chưa từng đóng (không có lastClosedTime)
            // 2. Hoặc đã qua 2 giờ kể từ lần đóng cuối
            if (isNaN(lastClosedTime) || now - lastClosedTime > twoHoursInMs) {
                setShowModal(true);
            }
        }
    }, [notifications]);

    // Chỉ đóng modal mà KHÔNG cập nhật thời gian - khi click X
    const handleDismiss = () => {
        setShowModal(false);
    };

    // Đóng modal VÀ lưu thời gian - khi click "Tôi đã đọc"
    const handleRead = () => {
        // Lưu thời gian hiện tại vào localStorage
        localStorage.setItem("notiModalLastClosed", Date.now().toString());
        setShowModal(false);
    };

    // Mở modal với thông báo cụ thể
    const openModal = (notification) => {
        setNoti(notification);
        setShowModal(true);
    };

    return (
        <>
            {/* Enhanced Notification Modal Styles */}
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmerNotif {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes bellRing {
                    0%, 50%, 100% { transform: rotate(0deg); }
                    10%, 30% { transform: rotate(-10deg); }
                    20%, 40% { transform: rotate(10deg); }
                }
                
                .notification-card {
                    animation: fadeInScale 0.4s ease both;
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .notification-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .notification-card:hover::before {
                    opacity: 1;
                }
                .notification-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    border-color: rgba(0,123,255,0.2);
                }
                
                .notification-item {
                    animation: slideInUp 0.4s ease both;
                    transition: all 0.25s ease;
                    border-radius: 8px;
                    position: relative;
                    overflow: hidden;
                }
                .notification-item:nth-child(1) { animation-delay: 0s; }
                .notification-item:nth-child(2) { animation-delay: 0.1s; }
                .notification-item:nth-child(3) { animation-delay: 0.2s; }
                .notification-item:nth-child(4) { animation-delay: 0.3s; }
                .notification-item:nth-child(5) { animation-delay: 0.4s; }
                
                .notification-item:hover {
                    background: linear-gradient(135deg, rgba(0,123,255,0.02), rgba(40,167,69,0.02));
                    transform: translateX(4px);
                    border-left: 3px solid #007bff;
                }
                
                .notification-icon {
                    transition: all 0.3s ease;
                    position: relative;
                }
                .notification-item:hover .notification-icon {
                    animation: bellRing 0.6s ease;
                    transform: scale(1.1);
                }
                .notification-icon::after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: #dc3545;
                    border-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .notification-item:hover .notification-icon::after {
                    opacity: 1;
                }
                
                .notification-content {
                    transition: all 0.25s ease;
                }
                .notification-item:hover .notification-content {
                    color: #212529;
                }
                
                .notification-time {
                    transition: all 0.25s ease;
                    opacity: 0.7;
                }
                .notification-item:hover .notification-time {
                    opacity: 1;
                    color: #007bff;
                }
                
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,123,255,0.3) transparent;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,123,255,0.3);
                    border-radius: 3px;
                    transition: background 0.3s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,123,255,0.5);
                }
                
                .modal-enhanced .modal-content {
                    border: none;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    animation: fadeInScale 0.3s ease both;
                }
                .modal-enhanced .modal-header {
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                    border-radius: 16px 16px 0 0;
                }
                .modal-enhanced .modal-title {
                    color: #495057;
                    font-weight: 600;
                }
                .modal-enhanced .btn-close {
                    transition: all 0.2s ease;
                }
                .modal-enhanced .btn-close:hover {
                    transform: scale(1.1);
                    background-color: rgba(220,53,69,0.1);
                }
                .modal-enhanced .btn-primary {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    border: none;
                    border-radius: 8px;
                    transition: all 0.25s ease;
                    font-weight: 500;
                }
                .modal-enhanced .btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
                }
            `}</style>

            {/* Danh sách thông báo */}
            <div className="card mb-3 notification-card">
                <div className="card-header">
                    <h5 className="card-title mb-0">
                        <i className="ti ti-bell-ringing me-2 text-primary"></i>
                        Thông báo gần đây
                    </h5>
                </div>
                <div className="card-body">
                    <div className="custom-scrollbar" style={{ maxHeight: 350, overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map((notification, idx) => (
                                <div key={notification._id || idx} className="list-group list-group-flush">
                                    <div
                                        className="list-group-item list-group-item-action py-3 px-3 notification-item"
                                        style={{ cursor: "pointer", border: "none" }}
                                        onClick={() => openModal(notification)}
                                    >
                                        <div className="media align-items-center gap-3">
                                            <div className="chat-avtar">
                                                <div className="avtar avtar-s bg-light-info notification-icon">
                                                    <i className="ti ti-bell-ringing fs-4"></i>
                                                </div>
                                            </div>
                                            <div className="media-body mx-2 notification-content">
                                                <h6 className="card-title mb-1 fw-semibold">{notification.title}</h6>
                                                <span
                                                    className="f-15  mb-1 d-block"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: notification.content || "" }}
                                                />
                                                <p className="f-12 text-muted mb-0 notification-time">
                                                    <i className="ti ti-clock me-1"></i>
                                                    {new Date(notification.created_at).toLocaleString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <i className="ti ti-bell-off fs-1 text-muted mb-2 d-block"></i>
                                <span className="text-muted">Chưa có thông báo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* React Bootstrap Modal */}
            <Modal
                show={showModal}
                onHide={handleDismiss}
                backdrop="static"
                keyboard={false}
                className="modal-enhanced"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="ti ti-bell-ringing me-2 text-primary"></i>
                        Thông báo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div dangerouslySetInnerHTML={{ __html: noti.content || "" }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleRead}>
                        <i className="ti ti-check me-2"></i>
                        Tôi đã đọc
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}