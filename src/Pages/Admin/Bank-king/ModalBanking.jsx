import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { useState, useEffect } from "react";
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
    code: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    url_api: "",
    bank_account: "",
    bank_password: "",
    min_recharge: "",
    token: "",
    status: true,
  };

  const mergedFormData = { ...defaultFormData, ...formData };

  // State Bank
  const [bankList, setBankList] = useState([]);
  const [bankLoading, setBankLoading] = useState(true);
  const [bankError, setBankError] = useState(false);

  useEffect(() => {
    setBankLoading(true);

    getBankList()
      .then((res) => {
        if (res?.data) {
          setBankList(res.data);
        } else {
          setBankError(true);
        }
      })
      .catch(() => setBankError(true))
      .finally(() => setBankLoading(false));
  }, []);

  // --------------------
  // Hàm chọn bank
  // --------------------
  const handleChangeBank = (code) => {
    const bank = bankList.find((b) => b.code === code);

    if (bank) {
      handleChange({ target: { name: "code", value: bank.code } });
      handleChange({ target: { name: "bank_name", value: bank.shortName } });
    } else {
      handleChange({ target: { name: "code", value: "" } });
      handleChange({ target: { name: "bank_name", value: "" } });
    }
  };

  return (
    <>
      {/* CSS đẹp */}
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
        .modal-banking .form-label {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
          margin-bottom: 6px;
        }
        .modal-banking .form-control,
        .modal-banking .form-select {
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-size: 14px;
        }
      `}
      </style>

      <Modal show={show} onHide={onHide} backdrop="static" className="modal-banking">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-university"></i>
            {editing ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Ngân hàng */}
              <div className="col-md-6">
                <label className="form-label">Ngân Hàng</label>

                {bankLoading ? (
                  <div className="form-text">Đang tải danh sách...</div>
                ) : bankError ? (
                  <>
                    <input
                      className="form-control"
                      name="bank_name"
                      value={mergedFormData.bank_name}
                      onChange={handleChange}
                      placeholder="ACB, MB, Vietcombank..."
                      required
                    />
                    <div className="form-text text-danger">
                      Không tải được danh sách, nhập tay.
                    </div>
                  </>
                ) : (
                  <select
                    className="form-select"
                    value={mergedFormData.code}
                    onChange={(e) => handleChangeBank(e.target.value)}
                    required
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {bankList.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.shortName} – {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tên chủ tài khoản */}
              <div className="col-md-6">
                <label className="form-label">Tên chủ tài khoản</label>
                <input
                  type="text"
                  name="account_name"
                  className="form-control"
                  value={mergedFormData.account_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Số tài khoản */}
              <div className="col-md-6">
                <label className="form-label">Số tài khoản</label>
                <input
                  type="text"
                  name="account_number"
                  className="form-control"
                  value={mergedFormData.account_number}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* URL API */}
              <div className="col-md-6">
                <label className="form-label">URL API</label>

                <select
                  name="url_api"
                  className="form-select"
                  value={mergedFormData.url_api}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn hoặc tự điền --</option>
                  <option value="https://api.web2m.com">https://api.web2m.com</option>
                  <option value="https://api.sieuthicode.net">https://api.sieuthicode.net</option>
                </select>

                <input
                  type="text"
                  placeholder="Tự nhập URL API"
                  className="form-control mt-2"
                  onChange={(e) =>
                    handleChange({
                      target: { name: "url_api", value: e.target.value },
                    })
                  }
                  value={mergedFormData.url_api}
                />
              </div>

              {/* Bank Account */}
              <div className="col-md-6">
                <label className="form-label">Tài khoản ngân hàng</label>
                <input
                  name="bank_account"
                  className="form-control"
                  value={mergedFormData.bank_account}
                  onChange={handleChange}
                />
              </div>

              {/* Bank Password */}
              <div className="col-md-6">
                <label className="form-label">Mật khẩu ngân hàng</label>
                <input
                  name="bank_password"
                  type="password"
                  className="form-control"
                  value={mergedFormData.bank_password}
                  onChange={handleChange}
                />
              </div>

              {/* Token */}
              <div className="col-md-6">
                <label className="form-label">Token auto</label>
                <input
                  name="token"
                  className="form-control"
                  value={mergedFormData.token}
                  onChange={handleChange}
                />
              </div>

              {/* Min Recharge */}
              <div className="col-md-6">
                <label className="form-label">Số tiền nạp tối thiểu</label>
                <input
                  type="number"
                  name="min_recharge"
                  className="form-control"
                  value={mergedFormData.min_recharge}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="form-label">Trạng thái</label>
                <select
                  name="status"
                  className="form-select"
                  value={mergedFormData.status === true || mergedFormData.status === "true" ? "true" : "false"}
                  onChange={(e) => handleChange({
                    target: {
                      name: "status",
                      value: e.target.value === "true"
                    }
                  })}
                >
                  <option value="true">Bật</option>
                  <option value="false">Tắt</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 text-end">
              <Button
                className="btn-modern btn-secondary-modern me-2"
                onClick={onHide}
              >
                <i className="fas fa-times"></i> Hủy
              </Button>

              <Button
                type="submit"
                className="btn-modern btn-primary-modern"
              >
                <i className={`fas ${editing ? "fa-save" : "fa-plus"}`}></i>
                {editing ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
