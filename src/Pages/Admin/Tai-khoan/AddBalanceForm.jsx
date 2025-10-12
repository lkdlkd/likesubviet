import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { addBalance } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

function AddBalanceForm({ user, token, fetchUsers, onClose, onUserUpdated }) {
    const [additionAmount, setAdditionAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddBalance = async () => {
        if (additionAmount <= 0 || isNaN(additionAmount)) {
            toast.error("Số tiền thêm phải là số hợp lệ và lớn hơn 0!");
            return;
        }

        try {
            setLoading(true);
            loadingg("Đang xử lý...", true, 9999999);
            // Gọi API để cập nhật số dư
            const updatedUser = await addBalance(user._id, { amount: additionAmount }, token);

            // Gửi dữ liệu đã cập nhật về component cha
            onUserUpdated(updatedUser);
            fetchUsers();

            toast.success("Thêm số dư thành công!");
            onClose(); // Đóng modal
        } catch (error) {
            //  console.error("Lỗi khi thêm số dư:", error);
            toast.error("Thêm số dư thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
            loadingg("Đang tải...", false);
        }
    };

    return (
        <>
            <style>
                {`
                    /* Add Balance Modal Styles */
                    .add-balance-modal .modal-dialog {
                        max-width: 550px;
                    }
                    
                    .add-balance-modal .modal-content {
                        border: none;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                        overflow: hidden;
                    }
                    
                    .add-balance-modal .modal-header {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .add-balance-modal .modal-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .add-balance-modal .modal-title {
                        color: white;
                        font-weight: 600;
                        font-size: 18px;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .add-balance-modal .modal-title::before {
                        content: '\\f067';
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
                    
                    .add-balance-modal .btn-close {
                        filter: invert(1);
                        opacity: 0.8;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .add-balance-modal .modal-body {
                        padding: 2rem;
                        background: #f8f9fa;
                    }
                    
                    .balance-info-card {
                        background: white;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        border: 1px solid #e9ecef;
                    }
                    
                    .balance-section-title {
                        font-size: 15px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin-bottom: 1rem;
                        display: flex;
                        align-items: center;
                    }
                    
                    .balance-section-title i {
                        margin-right: 8px;
                        color: #28a745;
                        width: 20px;
                        text-align: center;
                    }
                    
                    .balance-form-group {
                        margin-bottom: 1.25rem;
                    }
                    
                    .balance-form-label {
                        display: flex;
                        align-items: center;
                        font-size: 13px;
                        font-weight: 500;
                        color: #495057;
                        margin-bottom: 0.5rem;
                    }
                    
                    .balance-form-label i {
                        margin-right: 6px;
                        color: #6c757d;
                        width: 14px;
                        text-align: center;
                    }
                    
                    .balance-form-control {
                        border-radius: 8px;
                        border: 1px solid #d1d3e2;
                        padding: 0.6rem 0.8rem;
                        font-size: 14px;
                        transition: all 0.2s ease;
                        width: 100%;
                    }
                    
                    .balance-form-control:focus {
                        border-color: #28a745;
                        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.15);
                        outline: none;
                    }
                    
                    .balance-form-control:disabled {
                        background-color: #f8f9fa;
                        color: #6c757d;
                        border-color: #e9ecef;
                    }
                    
                    .balance-amount-display {
                        background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
                        border: 1px solid #c3e6cb;
                        border-radius: 8px;
                        padding: 0.75rem;
                        font-size: 14px;
                        font-weight: 600;
                        color: #155724;
                        text-align: center;
                        margin-bottom: 0.5rem;
                    }
                    
                    .current-balance {
                        color: #20c997;
                        font-weight: 600;
                    }
                    
                    .add-balance-modal .modal-footer {
                        background: white;
                        border-top: 1px solid #e9ecef;
                        padding: 1.25rem 2rem;
                        gap: 10px;
                    }
                    
                    .balance-btn-cancel {
                        background: #6c757d;
                        border: none;
                        border-radius: 8px;
                        color: white;
                        padding: 0.6rem 1.25rem;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .balance-btn-cancel:hover:not(:disabled) {
                        background: #545b62;
                        transform: translateY(-1px);
                        color: white;
                    }
                    
                    .balance-btn-submit {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
                    
                    .balance-btn-submit:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        color: white;
                    }
                    
                    .balance-btn-submit:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
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
                `}
            </style>
            <Modal 
                show={true} 
                onHide={onClose} 
                backdrop="static" 
                keyboard={false}
                className="add-balance-modal"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Thêm số dư tài khoản</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Thông tin người dùng */}
                    <div className="balance-info-card">
                        <h6 className="balance-section-title">
                            <i className="fas fa-user"></i>
                            Thông tin tài khoản
                        </h6>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="balance-form-group">
                                    <label className="balance-form-label">
                                        <i className="fas fa-user-circle"></i>
                                        Tên người dùng
                                    </label>
                                    <input
                                        type="text"
                                        className="balance-form-control"
                                        value={user.username}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="balance-form-group">
                                    <label className="balance-form-label">
                                        <i className="fas fa-wallet"></i>
                                        Số dư hiện tại
                                    </label>
                                    <input
                                        type="text"
                                        className="balance-form-control"
                                        value={Math.floor(Number(user.balance) || 0).toLocaleString("en-US") + " VNĐ"}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thêm số dư */}
                    <div className="balance-info-card">
                        <h6 className="balance-section-title">
                            <i className="fas fa-plus-circle"></i>
                            Cộng tiền
                        </h6>
                        <div className="balance-form-group">
                            <label className="balance-form-label">
                                <i className="fas fa-money-bill"></i>
                                Số tiền muốn cộng
                            </label>
                            <div className="input-icon-wrapper">
                                <i className="fas fa-dollar-sign input-icon"></i>
                                <input
                                    type="number"
                                    className="balance-form-control input-with-icon"
                                    value={additionAmount}
                                    onChange={(e) => setAdditionAmount(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="Nhập số tiền muốn cộng"
                                />
                            </div>
                        </div>
                        {additionAmount && (
                            <div className="balance-amount-display">
                                <i className="fas fa-hand-holding-usd me-2"></i>
                                Số tiền sẽ cộng: {Number(additionAmount).toLocaleString("en-US")} VNĐ
                            </div>
                        )}
                        {additionAmount && (
                            <div className="text-center mt-3 p-3" style={{background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
                                <small className="text-muted">Số dư sau khi cộng:</small>
                                <div className="current-balance" style={{fontSize: '16px', fontWeight: '600'}}>
                                    {(Math.floor(Number(user.balance) || 0) + Number(additionAmount || 0)).toLocaleString("en-US")} VNĐ
                                </div>
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        className="balance-btn-cancel" 
                        onClick={onClose} 
                        disabled={loading}
                    >
                        <i className="fas fa-times me-1"></i>
                        Hủy bỏ
                    </Button>
                    <Button 
                        className="balance-btn-submit" 
                        onClick={handleAddBalance} 
                        disabled={loading || !additionAmount || additionAmount <= 0}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-1" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-plus me-1"></i>
                                Thêm số dư
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddBalanceForm;