import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function ModalBanking({
  editing,
  formData,
  handleChange,
  handleSubmit,
  show,
  onHide,
}) {
  const defaultFormData = {
    bank_name: "",
    account_name: "",
    account_number: "",
    logo: "",
    bank_account: "",
    bank_password: "",
    min_recharge: "",
    token: "",
    status: false,
  };

  const mergedFormData = { ...defaultFormData, ...formData };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? "Chỉnh sửa ngân hàng" : "Thêm ngân hàng"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Ngân Hàng</label>
              <input
                type="text"
                name="bank_name"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.bank_name}
                placeholder="ACB, Vietcombank, MBBANK, ..."
                required
              />
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
              <label className="form-label">Logo</label>
              <input
                type="text"
                name="logo"
                className="form-control"
                onChange={handleChange}
                value={mergedFormData.logo}
                placeholder="có thể ghi bừa"
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
            <Button variant="secondary" onClick={onHide} className="me-2">
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              {editing ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
