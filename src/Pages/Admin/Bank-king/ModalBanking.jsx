import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, {useState } from "react";
import { getBankList } from "../../../Utils/api";
export default function ModalBanking({
  editing,
  formData,
  handleChange,
  handleSubmit,
  show,
  onHide,
}) {

  const defaultFormData = {
    code : "",
    bank_name: "",
    account_name: "",
    account_number: "",
    url_api: "",
    bank_account: "",
    bank_password: "",
    min_recharge: "",
    token: "",
    status: false,
  };

  const mergedFormData = { ...defaultFormData, ...formData };

  // Bank list state
  const [bankList, setBankList] = React.useState([]);
  const [bankLoading, setBankLoading] = React.useState(true);
  const [bankError, setBankError] = React.useState(false);

  React.useEffect(() => {
    setBankLoading(true);
    setBankError(false);
    getBankList()
      .then((data) => {
        if (data && data.data) {
          setBankList(data.data);
        } else {
          setBankError(true);
        }
        setBankLoading(false);
      })
      .catch(() => {
        setBankError(true);
        setBankLoading(false);
      });
  }, []);

  return (
    <>
      <style>
        {`
          .modal-banking .modal-content {
            border: none;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }
          
          .modal-banking .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom: none;
            border-radius: 12px 12px 0 0;
            padding: 1.5rem;
          }
          
          .modal-banking .modal-title {
            font-weight: 600;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .modal-banking .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: white;
            opacity: 0.8;
            filter: brightness(0) invert(1);
          }
          
          .modal-banking .btn-close:hover {
            opacity: 1;
          }
          
          .modal-banking .modal-body {
            padding: 1.5rem;
          }
          
          .modal-banking .form-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.5rem;
            font-size: 14px;
          }
          
          .modal-banking .form-control,
          .modal-banking .form-select {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .modal-banking .form-control:focus,
          .modal-banking .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .modal-banking .btn-modern {
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .modal-banking .btn-secondary-modern {
            background: #6c757d;
            color: white;
          }
          
          .modal-banking .btn-secondary-modern:hover {
            background: #5a6268;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .modal-banking .btn-primary-modern {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .modal-banking .btn-primary-modern:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
        `}
      </style>
      
      <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} className="modal-banking">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-university"></i>
            {editing ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng"}
          </Modal.Title>
        </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Ngân Hàng</label>
              {bankLoading ? (
                <div className="form-text">Đang tải danh sách ngân hàng...</div>
              ) : bankError ? (
                <>
                  <input
                    type="text"
                    name="bank_name"
                    className="form-control"
                    onChange={handleChange}
                    value={mergedFormData.bank_name}
                    placeholder="ACB, Vietcombank, MBBANK, ..."
                    required
                  />
                  <div className="form-text text-danger">Không tải được danh sách ngân hàng, hãy nhập tay.</div>
                </>
              ) : (
                <select
                  name="bank_code_select"
                  className="form-select"
                  onChange={e => {
                    const selectedCode = e.target.value;
                    const selectedBank = bankList.find(b => b.code === selectedCode);
                    if (selectedBank) {
                      handleChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: selectedBank.shortName,
                          name: 'bank_name',
                        }
                      });
                      handleChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: selectedBank.code,
                          name: 'code',
                        }
                      });
                    } else {
                      handleChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: '',
                          name: 'bank_name',
                        }
                      });
                      handleChange({
                        ...e,
                        target: {
                          ...e.target,
                          value: '',
                          name: 'code',
                        }
                      });
                    }
                  }}
                  value={mergedFormData.code}
                  required
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {bankList.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                       {bank.shortName} - {bank.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">Tên chủ tài khoản</label>
              <input
                type="text"
                name="account_name"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.account_name}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số tài khoản</label>
              <input
                type="text"
                name="account_number"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.account_number}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">URL API</label>
              <select
                name="url_api"
                className="form-select mb-2"
                onChange={handleChange}
                value={mergedFormData.url_api}
              >
                <option value="">-- Chọn hoặc tự điền --</option>
                <option value="https://api.web2m.com">https://api.web2m.com</option>
                <option value="https://api.sieuthicode.net">https://api.sieuthicode.net</option>
              </select>
              <input
                type="text"
                name="url_api"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.url_api}
                placeholder="Hoặc tự điền url api khác"
                style={{ marginTop: '4px' }}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tài khoản ngân hàng</label>
              <input
                type="text"
                name="bank_account"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.bank_account}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mật khẩu ngân hàng</label>
              <input
                type="password"
                name="bank_password"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.bank_password}
                
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Token auto</label>
              <input
                type="text"
                name="token"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.token}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số tiền nạp tối thiểu</label>
              <input
                type="number"
                name="min_recharge"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.min_recharge}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Trạng thái</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  name="status"
                  className="form-check-input"
                  checked={mergedFormData.status}
                  onChange={(e) =>
                    handleChange({
                      ...e,
                      target: {
                        ...e.target,
                        value: e.target.checked.toString(),
                      },
                    })
                  }
                />
                <label className="form-check-label">Hoạt động</label>
              </div>
            </div>
          </div>
          <div className="mt-4 text-end">
            <Button 
              variant="secondary" 
              onClick={onHide} 
              className="me-2 btn-modern btn-secondary-modern"
            >
              <i className="fas fa-times"></i>
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              className="btn-modern btn-primary-modern mt-1"
            >
              <i className={`fas ${editing ? 'fa-save' : 'fa-plus'}`}></i>
              {editing ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
    </>
  );
}
