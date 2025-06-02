import { useOutletContext } from "react-router-dom";
import ProfileInfo from "./ProfileInfo";
import ChangePasswordForm from "./ChangePasswordForm";

export default function ProfilePage() {
    const { user, token } = useOutletContext();

    if (!user) {
        return <div>Loading...</div>; // Hiển thị trạng thái loading nếu user chưa có giá trị
    }

    return (
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
                                            <div className="card">
                                                <div className="card-header">
                                                    <h5 className="card-title">Đổi mật khẩu</h5>
                                                </div>
                                                <div className="card-body">
                                                    <ChangePasswordForm token={token} user={user} />
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
    );
}