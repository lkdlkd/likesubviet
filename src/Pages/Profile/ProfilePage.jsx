import { useOutletContext } from "react-router-dom";
import ProfileInfo from "./ProfileInfo";
import ChangePasswordForm from "./ChangePasswordForm";
import TwoFASettings from "./TwoFASettings";

export default function ProfilePage() {
    const { user, token, configWeb } = useOutletContext();

    if (!user) {
        return <div>Loading...</div>; // Hiển thị trạng thái loading nếu user chưa có giá trị
    }

    return (
        <>
            <div className="row">
                {/* Phần thông tin cá nhân */}
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="col-md-12">
                                <div className="tab-content" id="pills-tabContent">
                                    <div
                                        className="tab-pane fade show active"
                                        id="pills-home"
                                        role="tabpanel"
                                        aria-labelledby="pills-home-tab"
                                    >
                                        <div className="row">
                                            <ProfileInfo user={user} />
                                            <div className="col-md-6">
                                                <div className="card mb-3">
                                                    <div className="card-header">
                                                        <h5 className="card-title">Đổi mật khẩu</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <ChangePasswordForm token={token} user={user} />
                                                    </div>
                                                </div>
                                                <TwoFASettings
                                                    user={user}
                                                    isEnabled={!!user.twoFAEnabled}
                                                    onStatusChange={(enabled) => {
                                                        // Optionally trigger a refetch here if parent provides a method
                                                        // For now we just mutate the object for immediate UI feedback
                                                        user.twoFAEnabled = enabled;
                                                    }}
                                                />
                                                <div className="card mt-3">
                                                    <div className="card-header ">
                                                        <h5 className="mb-3">Liên kết Telegram Bot</h5>
                                                        {user.telegramChat ? (<span className="badge bg-success">Đã liên kết</span>) : (
                                                            <span className="badge bg-danger">Chưa liên kết</span>
                                                        )}
                                                    </div>
                                                    <div className="card-body">
                                                        <div>
                                                            <p className="mb-2 small text-muted">
                                                                Nhấn để mở bot hỗ trợ trên Telegram:
                                                            </p>
                                                            <a
                                                                href={configWeb.linktele}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="fw-semibold"
                                                            >
                                                                {configWeb.linktele}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="ribbon ribbon-primary ribbon-clip">LỊCH SỬ ĐĂNG NHẬP</div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered nowrap dataTable" >
                                    <thead>
                                        <tr>
                                            <th>Thời gian</th>
                                            <th>Hoạt động</th>
                                            <th>IP</th>
                                            <th>User Agent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {user.loginHistory && user.loginHistory.length > 0 ? (
                                            user.loginHistory.map((activity, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(activity.time).toLocaleString()}</td>
                                                    <td>Đăng nhập</td>
                                                    <td>{activity.ip}</td>
                                                    <td>{activity.agent}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">Không có hoạt động nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}