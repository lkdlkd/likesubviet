import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { updateUser, changePassword } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

function UserEdit({ user, token, onClose, onUserUpdated }) {
  const [username, setUsername] = useState(user?.username || "");
  const [balance, setBalance] = useState(user?.balance || "");
  const [capbac, setCapbac] = useState(user?.capbac || "");
  const [tongnap, setTongnap] = useState(user?.tongnap || "");
  const [tongnapthang, setTongnapthang] = useState(user?.tongnapthang || "");
  const [newPassword, setNewPassword] = useState(""); // Thêm state cho mật khẩu mới
  const [saving, setSaving] = useState(false); // Trạng thái lưu dữ liệu

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
        },
        token
      );

      // Gửi dữ liệu đã cập nhật về component cha
      onUserUpdated(updatedUser);

      toast.success("Cập nhật thông tin thành công!");
      onClose(); // Đóng modal
    } catch (error) {
     // console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
      loadingg(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    setSaving(true);
    loadingg(true, 9999999);
    try {
      // Gọi API để đổi mật khẩu
      await changePassword(user._id, { newPassword }, token);
      toast.success("Mật khẩu đã được đặt lại thành công!");
      setNewPassword(""); // Xóa mật khẩu sau khi đổi thành công
    } catch (error) {
     // console.error("Lỗi khi đổi mật khẩu:", error);
      toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
      loadingg(false);
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
              type="text"
              className="form-control"
              value={balance === "" ? "" : Math.floor(Number(balance) || 0).toLocaleString("en-US")}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, "");
                setBalance(val === "" ? "" : Number(val));
              }}
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
              type="text"
              className="form-control"
              value={tongnap === "" ? "" : Math.floor(Number(tongnap) || 0).toLocaleString("en-US")}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, "");
                setTongnap(val === "" ? "" : Number(val));
              }}
              placeholder="Nhập tổng nạp"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tổng nạp tháng</label>
            <input
              type="text"
              className="form-control"
              value={tongnapthang === "" ? "" : Math.floor(Number(tongnapthang) || 0).toLocaleString("en-US")}
              onChange={(e) => {
                const val = e.target.value.replace(/,/g, "");
                setTongnapthang(val === "" ? "" : Number(val));
              }}
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