import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { deductBalance } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

function DeductBalanceForm({ user, token, onClose, fetchUsers, onUserUpdated }) {
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
      fetchUsers();
      toast.success("Trừ số dư thành công!");
      onClose(); // Đóng modal
    } catch (error) {
      // console.error("Lỗi khi trừ số dư:", error);
      toast.error("Trừ số dư thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      loadingg("Đang tải...", false);
    }
  };

  return (
    <>
      <style>
        {`
          /* Deduct Balance Modal Styles */
          .deduct-balance-modal .modal-dialog {
            max-width: 550px;
          }
          
          .deduct-balance-modal .modal-content {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
          }
          
          .deduct-balance-modal .modal-header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .deduct-balance-modal .modal-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .deduct-balance-modal .modal-title {
            color: white;
            font-weight: 600;
            font-size: 18px;
            margin: 0;
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .deduct-balance-modal .modal-title::before {
            content: '\\f068';
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
          
          .deduct-balance-modal .btn-close {
            filter: invert(1);
            opacity: 0.8;
            position: relative;
            z-index: 1;
          }
          
          .deduct-balance-modal .modal-body {
            padding: 2rem;
            background: #f8f9fa;
          }
          
          .deduct-info-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #e9ecef;
          }
          
          .deduct-section-title {
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
          }
          
          .deduct-section-title i {
            margin-right: 8px;
            color: #dc3545;
            width: 20px;
            text-align: center;
          }
          
          .deduct-form-group {
            margin-bottom: 1.25rem;
          }
          
          .deduct-form-label {
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
          }
          
          .deduct-form-label i {
            margin-right: 6px;
            color: #6c757d;
            width: 14px;
            text-align: center;
          }
          
          .deduct-form-control {
            border-radius: 8px;
            border: 1px solid #d1d3e2;
            padding: 0.6rem 0.8rem;
            font-size: 14px;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .deduct-form-control:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.15);
            outline: none;
          }
          
          .deduct-form-control:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
            border-color: #e9ecef;
          }
          
          .deduct-amount-display {
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border: 1px solid #f1aeb5;
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 14px;
            font-weight: 600;
            color: #721c24;
            text-align: center;
            margin-bottom: 0.5rem;
          }
          
          .warning-card {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
          }
          
          .warning-title {
            font-size: 14px;
            font-weight: 600;
            color: #856404;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
          }
          
          .warning-title i {
            margin-right: 6px;
          }
          
          .warning-text {
            font-size: 13px;
            color: #856404;
            margin: 0;
            line-height: 1.5;
          }
          
          .current-balance {
            color: #dc3545;
            font-weight: 600;
          }
          
          .deduct-balance-modal .modal-footer {
            background: white;
            border-top: 1px solid #e9ecef;
            padding: 1.25rem 2rem;
            gap: 10px;
          }
          
          .deduct-btn-cancel {
            background: #6c757d;
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.6rem 1.25rem;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .deduct-btn-cancel:hover:not(:disabled) {
            background: #545b62;
            transform: translateY(-1px);
            color: white;
          }
          
          .deduct-btn-submit {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
          
          .deduct-btn-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            color: white;
          }
          
          .deduct-btn-submit:disabled {
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
        className="deduct-balance-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Trừ số dư tài khoản</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Cảnh báo */}
          {/* <div className="warning-card">
            <h6 className="warning-title">
              <i className="fas fa-exclamation-triangle"></i>
              Cảnh báo quan trọng
            </h6>
            <p className="warning-text">
              Việc trừ số dư sẽ giảm tiền trong tài khoản người dùng. 
              Vui lòng kiểm tra kỹ thông tin trước khi thực hiện.
            </p>
          </div> */}

          {/* Thông tin người dùng */}
          <div className="deduct-info-card">
            <h6 className="deduct-section-title">
              <i className="fas fa-user"></i>
              Thông tin tài khoản
            </h6>
            <div className="row">
              <div className="col-md-6">
                <div className="deduct-form-group">
                  <label className="deduct-form-label">
                    <i className="fas fa-user-circle"></i>
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    className="deduct-form-control"
                    value={user.username}
                    disabled
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="deduct-form-group">
                  <label className="deduct-form-label">
                    <i className="fas fa-wallet"></i>
                    Số dư hiện tại
                  </label>
                  <input
                    type="text"
                    className="deduct-form-control"
                    value={Math.floor(Number(user.balance) || 0).toLocaleString("en-US") + " VNĐ"}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trừ số dư */}
          <div className="deduct-info-card">
            <h6 className="deduct-section-title">
              <i className="fas fa-minus-circle"></i>
              Trừ số dư
            </h6>
            <div className="deduct-form-group">
              <label className="deduct-form-label">
                <i className="fas fa-money-bill"></i>
                Số tiền muốn trừ
              </label>
              <div className="input-icon-wrapper">
                <i className="fas fa-dollar-sign input-icon"></i>
                <input
                  type="number"
                  className="deduct-form-control input-with-icon"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(Number(e.target.value))}
                  placeholder="Nhập số tiền muốn trừ"
                  max={user.balance}
                />
              </div>
            </div>
            {deductionAmount && (
              <div className="deduct-amount-display">
                <i className="fas fa-hand-holding-usd me-2"></i>
                Số tiền sẽ trừ: {Number(deductionAmount).toLocaleString("en-US")} VNĐ
              </div>
            )}
            {deductionAmount && deductionAmount <= user.balance && (
              <div className="text-center mt-3 p-3" style={{background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef'}}>
                <small className="text-muted">Số dư sau khi trừ:</small>
                <div className="current-balance" style={{fontSize: '16px', fontWeight: '600'}}>
                  {(Math.floor(Number(user.balance) || 0) - Number(deductionAmount || 0)).toLocaleString("en-US")} VNĐ
                </div>
              </div>
            )}
            {deductionAmount > user.balance && (
              <div className="alert alert-danger mt-2 mb-0" style={{fontSize: '13px', padding: '0.5rem 0.75rem'}}>
                <i className="fas fa-exclamation-circle me-1"></i>
                Số tiền trừ không được lớn hơn số dư hiện tại!
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            className="deduct-btn-cancel" 
            onClick={onClose} 
            disabled={loading}
          >
            <i className="fas fa-times me-1"></i>
            Hủy bỏ
          </Button>
          <Button 
            className="deduct-btn-submit" 
            onClick={handleDeductBalance} 
            disabled={loading || !deductionAmount || deductionAmount <= 0 || deductionAmount > user.balance}
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
                <i className="fas fa-minus me-1"></i>
                Trừ số dư
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeductBalanceForm;