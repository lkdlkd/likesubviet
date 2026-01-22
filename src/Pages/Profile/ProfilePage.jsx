import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import ChangePasswordForm from "./ChangePasswordForm";
import TwoFASettings from "./TwoFASettings";
import AffiliatePanel from "./AffiliatePanel";

export default function ProfilePage() {
    const { user, token, configWeb } = useOutletContext();
    const [activeTab, setActiveTab] = useState('profile');

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-3 text-muted">Đang tải thông tin...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Tab Navigation */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-bottom">
                    <ul className="nav nav-tabs card-header-tabs" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                                type="button"
                                role="tab"
                            >
                                <i className="fas fa-user me-2"></i>
                                Thông tin cá nhân
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                                onClick={() => setActiveTab('security')}
                                type="button"
                                role="tab"
                            >
                                <i className="fas fa-shield-alt me-2"></i>
                                Bảo mật
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'affiliate' ? 'active' : ''}`}
                                onClick={() => setActiveTab('affiliate')}
                                type="button"
                                role="tab"
                            >
                                <i className="fas fa-users me-2"></i>
                                Affiliate
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body">
                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Thông tin cá nhân Tab */}
                        {activeTab === 'profile' && (
                            <div className="tab-pane fade show active">
                                <div className="row ">
                                    <div className="col-lg-6">
                                        <ProfileInfo user={user} />
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="card h-100 shadow-sm border-0">
                                            <div className="card-header bg-gradient-success text-white">
                                                <h5 className="card-title mb-0 d-flex align-items-center">
                                                    <i className="fas fa-key me-2"></i>
                                                    Đổi mật khẩu
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <ChangePasswordForm token={token} user={user} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Login History Section */}
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-header bg-gradient-dark text-white">
                                                <h5 className="card-title mb-0 d-flex align-items-center">
                                                    <i className="fas fa-history me-2"></i>
                                                    LỊCH SỬ ĐĂNG NHẬP
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-hover align-middle">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">
                                                                    <i className="fas fa-clock me-2"></i>
                                                                    Thời gian
                                                                </th>
                                                                <th scope="col">
                                                                    <i className="fas fa-activity me-2"></i>
                                                                    Hoạt động
                                                                </th>
                                                                <th scope="col">
                                                                    <i className="fas fa-map-marker-alt me-2"></i>
                                                                    IP
                                                                </th>
                                                                <th scope="col">
                                                                    <i className="fas fa-desktop me-2"></i>
                                                                    User Agent
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {user.loginHistory && user.loginHistory.length > 0 ? (
                                                                user.loginHistory.map((activity, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <span className="fw-semibold">
                                                                                {new Date(activity.time).toLocaleString('vi-VN')}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge bg-success">
                                                                                <i className="fas fa-sign-in-alt me-1"></i>
                                                                                Đăng nhập
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <code className="text-primary">{activity.ip}</code>
                                                                        </td>
                                                                        <td>
                                                                            <small className="text-muted" title={activity.agent}>
                                                                                {activity.agent.length > 60
                                                                                    ? activity.agent.substring(0, 60) + '...'
                                                                                    : activity.agent
                                                                                }
                                                                            </small>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan="4" className="text-center py-5">
                                                                        <div className="text-muted">
                                                                            <i className="fas fa-inbox fs-1 mb-3 d-block opacity-25"></i>
                                                                            <div className="fw-semibold">Không có hoạt động nào</div>
                                                                            <small>Chưa có lịch sử đăng nhập được ghi nhận</small>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bảo mật Tab */}
                        {activeTab === 'security' && (
                            <div className="tab-pane fade show active">
                                <div className="row ">

                                    <div className="col-lg-6">
                                        <TwoFASettings
                                            user={user}
                                            isEnabled={!!user.twoFAEnabled}
                                            onStatusChange={(enabled) => {
                                                user.twoFAEnabled = enabled;
                                            }}
                                        />
                                    </div>
                                    <div className="col-lg-6 mt-4">
                                        <div className="card shadow-sm border-0">
                                            <div className="card-header bg-gradient-info text-white">
                                                <h5 className="card-title mb-0 d-flex align-items-center justify-content-between">
                                                    <span className="d-flex align-items-center">
                                                        <i className="fab fa-telegram-plane me-2"></i>
                                                        Liên kết Telegram Bot
                                                    </span>
                                                    {user.telegramChat ? (
                                                        <span className="badge bg-success">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Đã liên kết
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger">
                                                            <i className="fas fa-times-circle me-1"></i>
                                                            Chưa liên kết
                                                        </span>
                                                    )}
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <p className="text-muted mb-3">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    Nhấn để mở bot hỗ trợ trên Telegram:
                                                </p>
                                                <a
                                                    href={configWeb.linktele}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline-info d-flex align-items-center"
                                                >
                                                    <i className="fab fa-telegram-plane me-2"></i>
                                                    <span className="text-truncate">{configWeb.linktele}</span>
                                                    <i className="fas fa-external-link-alt ms-2"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Affiliate Tab */}
                        {activeTab === 'affiliate' && (
                            <div className="tab-pane fade show active">
                                <AffiliatePanel token={token} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


}