import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { deductBalance } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

function DeductBalanceForm({ user, token, onClose, onUserUpdated }) {
  const [deductionAmount, setDeductionAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDeductBalance = async () => {
    if (deductionAmount <= 0 || isNaN(deductionAmount)) {
      toast.error("Số tiền trừ phải là số hợp lệ và lớn hơn 0!");
      return;
    }

    if (deductionAmount > user.balance) {
      toast.error("Số tiền trừ không được lớn hơn số dư hiện tại!");
      return;
    }

    try {
      setLoading(true);
      loadingg("Đang xử lý...", true, 9999999);
      // Gọi API để cập nhật số dư
      const updatedUser = await deductBalance(user._id, { amount: deductionAmount }, token);
      onUserUpdated(updatedUser);
      toast.success("Trừ số dư thành công!");
      onClose(); // Đóng modal
    } catch (error) {
     // console.error("Lỗi khi trừ số dư:", error);
      toast.error("Trừ số dư thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      loadingg(false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Trừ số dư</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="mb-3">
            <label className="form-label">Tên người dùng</label>
            <input
              type="text"
              className="form-control"
              value={user.username}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Số dư hiện tại</label>
            <input
              type="number"
              className="form-control"
              value={user.balance}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Số tiền muốn trừ : {Number(deductionAmount).toLocaleString()} VNĐ</label>
            <input
              type="number"
              className="form-control"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(Number(e.target.value))}
              placeholder="Nhập số tiền muốn trừ"
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleDeductBalance} disabled={loading}>
          {loading ? "Đang xử lý..." : "Trừ số dư"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeductBalanceForm;