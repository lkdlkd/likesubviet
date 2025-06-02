import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { updateUser, changePassword } from "@/Utils/api";
import { toast } from "react-toastify";

function UserEdit({ user, token, onClose, onUserUpdated }) {
  const [username, setUsername] = useState(user?.username || "");
  const [balance, setBalance] = useState(user?.balance || 0);
  const [capbac, setCapbac] = useState(user?.capbac || "");
  const [tongnap, setTongnap] = useState(user?.tongnap || 0);
  const [tongnapthang, setTongnapthang] = useState(user?.tongnapthang || 0);
  const [newPassword, setNewPassword] = useState(""); // Thêm state cho mật khẩu mới
  const [saving, setSaving] = useState(false); // Trạng thái lưu dữ liệu

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Tên người dùng không được để trống!");
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUser(
        user._id,
        { username, balance, capbac, tongnap, tongnapthang },
        token
      );

      // Gửi dữ liệu đã cập nhật về component cha
      onUserUpdated(updatedUser);

      toast.success("Cập nhật thông tin thành công!");
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    setSaving(true);
    try {
      // Gọi API để đổi mật khẩu
      await changePassword(user._id, { newPassword }, token);
      toast.success("Mật khẩu đã được đặt lại thành công!");
      setNewPassword(""); // Xóa mật khẩu sau khi đổi thành công
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Sửa thông tin người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="mb-3">
            <label className="form-label">Tên người dùng</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên người dùng"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Số dư</label>
            <input
              type="number"
              className="form-control"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              placeholder="Nhập số dư"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Cấp bậc</label>
            <input
              type="text"
              className="form-control"
              value={capbac}
              onChange={(e) => setCapbac(e.target.value)}
              placeholder="Nhập cấp bậc"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tổng nạp</label>
            <input
              type="number"
              className="form-control"
              value={tongnap}
              onChange={(e) => setTongnap(Number(e.target.value))}
              placeholder="Nhập tổng nạp"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tổng nạp tháng</label>
            <input
              type="number"
              className="form-control"
              value={tongnapthang}
              onChange={(e) => setTongnapthang(Number(e.target.value))}
              placeholder="Nhập tổng nạp tháng"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Hủy
        </Button>
        <Button
          variant="danger"
          onClick={handleChangePassword}
          disabled={saving || !newPassword.trim()}
        >
          Đổi mật khẩu
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserEdit;