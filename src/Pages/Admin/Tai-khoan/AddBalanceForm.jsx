import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { addBalance } from "@/Utils/api";
import { toast } from "react-toastify";

function AddBalanceForm({ user, token, onClose, onUserUpdated }) {
    const [additionAmount, setAdditionAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleAddBalance = async () => {
        if (additionAmount <= 0 || isNaN(additionAmount)) {
            toast.error("Số tiền thêm phải là số hợp lệ và lớn hơn 0!");
            return;
        }

        try {
            setLoading(true);

            // Tính toán số dư mới

            // Gọi API để cập nhật số dư
            const updatedUser = await addBalance(user._id, { amount: additionAmount }, token);

            // Gửi dữ liệu đã cập nhật về component cha
            onUserUpdated(updatedUser);

            toast.success("Thêm số dư thành công!");
            onClose(); // Đóng modal
        } catch (error) {
            console.error("Lỗi khi thêm số dư:", error);
            toast.error("Thêm số dư thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={true} onHide={onClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Thêm số dư</Modal.Title>
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
                        <label className="form-label">Số tiền muốn thêm</label>
                        <input
                            type="number"
                            className="form-control"
                            value={additionAmount}
                            onChange={(e) => setAdditionAmount(Number(e.target.value))}
                            placeholder="Nhập số tiền muốn thêm"
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>
                <Button variant="primary" onClick={handleAddBalance} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Thêm số dư"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddBalanceForm;