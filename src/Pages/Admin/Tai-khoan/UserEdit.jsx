import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { updateUser, changePassword } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

function UserEdit({ user, token, onClose, fetchUsers, onUserUpdated }) {
  const [username, setUsername] = useState(user?.username || "");
  const [balance, setBalance] = useState(user?.balance || "");
  const [capbac, setCapbac] = useState(user?.capbac || "");
  const [tongnap, setTongnap] = useState(user?.tongnap || "");
  const [tongnapthang, setTongnapthang] = useState(user?.tongnapthang || "");
  const [newPassword, setNewPassword] = useState(""); // Thêm state cho mật khẩu mới
  const [saving, setSaving] = useState(false); // Trạng thái lưu dữ liệu
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.twoFactorEnabled === true
  );

  // Đồng bộ khi prop user thay đổi (tránh giữ state cũ khi mở user khác)
  useEffect(() => {
    setTwoFactorEnabled(user?.twoFactorEnabled === true);
  }, [user?.twoFactorEnabled]);
  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Tên người dùng không được để trống!");
      return;
    }

    if (balance < 0 || tongnap < 0 || tongnapthang < 0) {
      toast.error("Số dư, tổng nạp và tổng nạp tháng không được âm!");
      return;
    }

    setSaving(true);
    loadingg("Đang cập nhật thông tin...", true, 9999999);
    try {
      const updatedUser = await updateUser(
        user._id,
        {
          username,
          balance: Number(balance) || 0,
          capbac,
          tongnap: Number(tongnap) || 0,
          tongnapthang: Number(tongnapthang) || 0,
          twoFactorEnabled
        },
        token
      );

      // Gửi dữ liệu đã cập nhật về component cha
      onUserUpdated(updatedUser);
      fetchUsers(); // Tải lại danh sách người dùng
      toast.success("Cập nhật thông tin thành công!");
      onClose(); // Đóng modal
    } catch (error) {
      // console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
      loadingg("Đang tải...", false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    setSaving(true);
    loadingg("Đang tải...", true, 9999999);
    try {
      // Gọi API để đổi mật khẩu
      await changePassword(user._id, { newPassword }, token);
      fetchUsers(); // Tải lại danh sách người dùng
      toast.success("Mật khẩu đã được đặt lại thành công!");
      setNewPassword(""); // Xóa mật khẩu sau khi đổi thành công
    } catch (error) {
      // console.error("Lỗi khi đổi mật khẩu:", error);
      toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
      loadingg("Đang tải...", false);
    }
  };

  return (
    <>
      <style>
        {`
          /* User Edit Modal Styles */
          .user-edit-modal .modal-dialog {
            max-width: 700px;
          }
          
          .user-edit-modal .modal-content {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          
          .user-edit-modal .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .user-edit-modal .modal-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .user-edit-modal .modal-title {
            color: white;
            font-weight: 600;
            font-size: 18px;
            margin: 0;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .user-edit-modal .modal-title::before {
            content: '\\f044';
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            margin-right: 10px;
            width: 35px;
            height: 35px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }
          
          .user-edit-modal .btn-close {
            filter: invert(1);
            opacity: 0.8;
            position: relative;
            z-index: 1;
          }
          
          .user-edit-modal .modal-body {
            padding: 2rem;
            background: #f8f9fa;
            max-height: 70vh;
            overflow-y: auto;
          }
          
          .user-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #e9ecef;
          }
          
          .user-section-title {
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e9ecef;
          }
          
          .user-section-title i {
            margin-right: 8px;
            color: #667eea;
            width: 20px;
            text-align: center;
          }
          
          .user-form-group {
            margin-bottom: 1.25rem;
          }
          
          .user-form-label {
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
          }
          
          .user-form-label i {
            margin-right: 6px;
            color: #6c757d;
            width: 14px;
            text-align: center;
          }
          
          .user-form-control {
            border-radius: 8px;
            border: 1px solid #d1d3e2;
            padding: 0.6rem 0.8rem;
            font-size: 14px;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .user-form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
            outline: none;
          }
          
          .user-form-control:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
            border-color: #e9ecef;
          }
          
          .input-icon-wrapper {
            position: relative;
          }
          
          .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            z-index: 1;
          }
          
          .input-with-icon {
            padding-left: 35px;
          }
          
          .custom-switch-container {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
          }
          
          .custom-switch {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          
          .switch-toggle {
            position: relative;
            width: 50px;
            height: 25px;
            background: #ccc;
            border-radius: 25px;
            margin-right: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .switch-toggle.active {
            background: #28a745;
          }
          
          .switch-toggle::before {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 21px;
            height: 21px;
            background: white;
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          .switch-toggle.active::before {
            transform: translateX(25px);
          }
          
          .switch-label {
            font-size: 14px;
            font-weight: 500;
            color: #2c3e50;
            margin: 0;
          }
          
          .switch-help {
            font-size: 12px;
            color: #6c757d;
            margin: 0;
            line-height: 1.4;
          }
          
          .user-edit-modal .modal-footer {
            background: white;
            border-top: 1px solid #e9ecef;
            padding: 1.25rem 2rem;
            gap: 10px;
          }
          
          .user-btn-cancel {
            background: #6c757d;
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.6rem 1.25rem;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .user-btn-cancel:hover:not(:disabled) {
            background: #545b62;
            transform: translateY(-1px);
            color: white;
          }
          
          .user-btn-password {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.6rem 1.25rem;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .user-btn-password:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            color: white;
          }
          
          .user-btn-submit {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.6rem 1.25rem;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .user-btn-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            color: white;
          }
          
          .user-btn-submit:disabled,
          .user-btn-password:disabled,
          .user-btn-cancel:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
        `}
      </style>
      <Modal 
        show={true} 
        onHide={onClose} 
        backdrop="static" 
        keyboard={false}
        className="user-edit-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Thông tin cơ bản */}
          <div className="user-section">
            <h6 className="user-section-title">
              <i className="fas fa-user"></i>
              Thông tin cơ bản
            </h6>
            <div className="row">
              <div className="col-md-6">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-user-circle"></i>
                    Tên người dùng
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input
                      type="text"
                      className="user-form-control input-with-icon"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên người dùng"
                      disabled
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-star"></i>
                    Cấp bậc
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-medal input-icon"></i>
                    <select
                      value={capbac}
                      onChange={(e) => setCapbac(e.target.value)}
                      className="user-form-control input-with-icon"
                    >
                      <option value="member">Thành Viên</option>
                      <option value="vip">Đại lý</option>
                      <option value="distributor">Nhà phân phối</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin tài chính */}
          <div className="user-section">
            <h6 className="user-section-title">
              <i className="fas fa-wallet"></i>
              Thông tin tài chính
            </h6>
            <div className="row">
              <div className="col-md-4">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-money-bill"></i>
                    Số dư hiện tại
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-dollar-sign input-icon"></i>
                    <input
                      type="text"
                      className="user-form-control input-with-icon"
                      value={balance === "" ? "" : Math.floor(Number(balance) || 0).toLocaleString("en-US")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        setBalance(val === "" ? "" : Number(val));
                      }}
                      placeholder="Nhập số dư"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-chart-line"></i>
                    Tổng nạp
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-plus-circle input-icon"></i>
                    <input
                      type="text"
                      className="user-form-control input-with-icon"
                      value={tongnap === "" ? "" : Math.floor(Number(tongnap) || 0).toLocaleString("en-US")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        setTongnap(val === "" ? "" : Number(val));
                      }}
                      placeholder="Nhập tổng nạp"
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-calendar-month"></i>
                    Tổng nạp tháng
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-calendar input-icon"></i>
                    <input
                      type="text"
                      className="user-form-control input-with-icon"
                      value={tongnapthang === "" ? "" : Math.floor(Number(tongnapthang) || 0).toLocaleString("en-US")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/,/g, "");
                        setTongnapthang(val === "" ? "" : Number(val));
                      }}
                      placeholder="Nhập tổng nạp tháng"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bảo mật */}
          <div className="user-section">
            <h6 className="user-section-title">
              <i className="fas fa-shield-alt"></i>
              Cài đặt bảo mật
            </h6>
            <div className="row">
              <div className="col-md-12">
                <div className="user-form-group">
                  <label className="user-form-label">
                    <i className="fas fa-key"></i>
                    Mật khẩu mới
                  </label>
                  <div className="input-icon-wrapper">
                    <i className="fas fa-lock input-icon"></i>
                    <input
                      type="password"
                      className="user-form-control input-with-icon"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới (để trống nếu không đổi)"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="custom-switch-container">
              <div className="custom-switch">
                <div 
                  className={`switch-toggle ${twoFactorEnabled ? 'active' : ''}`}
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                ></div>
                <div>
                  <div className="switch-label">
                    Xác thực 2FA (TOTP)
                  </div>
                  <div className="switch-help">
                    {twoFactorEnabled
                      ? "Đang bật: Người dùng cần mã OTP khi đăng nhập"
                      : "Đang tắt: Đăng nhập không cần mã OTP"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="user-btn-cancel" 
            onClick={onClose} 
            disabled={saving}
          >
            <i className="fas fa-times me-1"></i>
            Hủy bỏ
          </Button>
          <Button
            className="user-btn-password"
            onClick={handleChangePassword}
            disabled={saving || !newPassword.trim()}
          >
            <i className="fas fa-key me-1"></i>
            Đổi mật khẩu
          </Button>
          <Button 
            className="user-btn-submit" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner-border spinner-border-sm me-1" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Lưu thay đổi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserEdit;