'use client';
import { useState, useEffect } from "react";
import { createSmmPartner, updateSmmPartner } from "@/Utils/api";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadingg } from "@/JS/Loading";
import { min } from "moment";

export default function Adddoitac({
  token,
  fetchSmmPartners,
  onAdd,
  editingPartner,
  onUpdate,
  onClose,
}) {
  // Lấy URL API cố định từ biến môi trường (ưu tiên REACT_APP_, fallback NEXT_PUBLIC_)
  const ENV_ALLOWED = (process.env.REACT_APP_ALLOWED_API_URL || process.env.NEXT_PUBLIC_ALLOWED_API_URL || "").trim();
  const ALLOWED_API_URL = ENV_ALLOWED || null; // nếu không thiết lập biến môi trường thì bỏ giới hạn
  const [formData, setFormData] = useState({
    name: "",
    url_api: ALLOWED_API_URL || "",
    api_token: "",
    price_update: "",
    price_updateVip: "",
    price_updateDistributor: "",
    tigia: "",
    phihoan: 1000, // Mặc định là 1000
    minbalance: 100000,
    autohoan: "on",
    status: "on",
    update_price: "on",
  });
  const [loading, setLoading] = useState(false);

  // Đồng bộ hóa formData với editingPartner khi editingPartner thay đổi
  useEffect(() => {
    if (editingPartner) {
      setFormData({
        ...editingPartner,
        // Nếu có ALLOWED_API_URL thì luôn ép URL về giá trị được phép để tránh bị chặn khi submit
        url_api: ALLOWED_API_URL || editingPartner.url_api,
        phihoan: editingPartner.phihoan || 1000, // Mặc định là 1000 nếu không có
        autohoan: editingPartner.autohoan || "on",
        minbalance: editingPartner.minbalance || 100000,
      });
    } else {
      setFormData({
        name: "",
        url_api: ALLOWED_API_URL || "",
        api_token: "",
        price_update: "",
        price_updateVip: "",
        price_updateDistributor: "",
        tigia: "",
        phihoan: 1000, // Mặc định là 1000
        autohoan: "on",
        status: "on",
        update_price: "on",
        minbalance: 100000,
      });
    }
  }, [editingPartner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Khi đã cấu hình ALLOWED_API_URL thì không cho phép thay đổi url_api
    if (ALLOWED_API_URL && name === "url_api") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    loadingg(editingPartner ? "Đang cập nhật đối tác..." : "Đang thêm đối tác...", true, 9999999);
    try {
      // Nếu cấu hình biến môi trường, chỉ cho phép 1 URL API cụ thể
      const normalize = (u) => (u || "").trim().replace(/\/+$/, "");
      if (ALLOWED_API_URL && normalize(formData.url_api) !== normalize(ALLOWED_API_URL)) {
        toast.error(`Chỉ được phép sử dụng URL API: ${ALLOWED_API_URL}`);
        return;
      }
      if (editingPartner) {
        // Cập nhật đối tác
        const updatedPartner = await updateSmmPartner(editingPartner._id, formData, token);
        toast.success("Đối tác đã được cập nhật thành công!");
        onUpdate(updatedPartner); // Cập nhật danh sách đối tác
      } else {
        // Thêm đối tác mới
        const newPartner = await createSmmPartner(formData, token);
        toast.success("Đối tác mới đã được thêm thành công!");
        onAdd(newPartner); // Cập nhật danh sách đối tác
      }
      fetchSmmPartners(); // Tải lại danh sách đối tác sau khi thêm/cập nhật
      onClose(); // Đóng modal
    } catch (error) {
      toast.error("Lỗi khi thêm/cập nhật đối tác. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("", false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered size="lg" className="modern-modal">
      <Modal.Header closeButton className="bg-gradient-primary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <i className={`fas ${editingPartner ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
          {editingPartner ? "Cập Nhật Đối Tác" : "Thêm Đối Tác"}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="p-4 bg-light">
          <div className="row">
            {/* Cột trái - Thông tin cơ bản */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Thông tin cơ bản
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-tag me-1 text-primary"></i>
                      Tên Đối Tác:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control form-control-lg border-2"
                      placeholder="doitac1, doitac2, ..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-link me-1 text-primary"></i>
                      URL API:
                    </label>
                    <input
                      type="text"
                      name="url_api"
                      value={formData.url_api}
                      onChange={handleChange}
                      placeholder={ALLOWED_API_URL || "https://tenmien.com/api/v2"}
                      className="form-control form-control-lg border-2"
                      readOnly={Boolean(ALLOWED_API_URL)}
                      required
                    />
                    {ALLOWED_API_URL && (
                      <div className="alert alert-info mt-2 py-2">
                        <i className="fas fa-info-circle me-1"></i>
                        <small>Chỉ hỗ trợ URL: {ALLOWED_API_URL}</small>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-key me-1 text-primary"></i>
                      API Token:
                    </label>
                    <input
                      type="text"
                      name="api_token"
                      value={formData.api_token}
                      onChange={handleChange}
                      placeholder="token hoặc api key"
                      className="form-control form-control-lg border-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải - Cấu hình nâng cao */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-cogs me-2"></i>
                    Cấu hình nâng cao
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-dollar-sign me-1 text-success"></i>
                        Cập Nhật Giá Thành Viên (%):
                      </label>
                      <input
                        type="text"
                        name="price_update"
                        value={formData.price_update}
                        onChange={handleChange}
                        placeholder="10"
                        className="form-control border-2"
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-dollar-sign me-1 text-success"></i>
                        Cập Nhật Giá Đại Lý (%):
                      </label>
                      <input
                        type="text"
                        name="price_updateVip"
                        value={formData.price_updateVip}
                        onChange={handleChange}
                        placeholder="10"
                        className="form-control border-2"
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-dollar-sign me-1 text-success"></i>
                        Cập Nhật Giá Nhà Phân Phối (%):
                      </label>
                      <input
                        type="text"
                        name="price_updateDistributor"
                        value={formData.price_updateDistributor}
                        onChange={handleChange}
                        placeholder="10"
                        className="form-control border-2"
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-exchange-alt me-1 text-warning"></i>
                        Tỉ Giá:
                      </label>
                      <input
                        type="text"
                        name="tigia"
                        value={formData.tigia}
                        onChange={handleChange}
                        placeholder="VD: 25 , 25.5"
                        className="form-control border-2"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-coins me-1 text-info"></i>
                        Phí hoàn:
                      </label>
                      <input
                        type="text"
                        name="phihoan"
                        value={formData.phihoan}
                        onChange={handleChange}
                        placeholder="VD: 1000"
                        className="form-control border-2"
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-wallet me-1 text-danger"></i>
                        Số dư tối thiểu để cảnh báo:
                      </label>
                      <input
                        type="text"
                        name="minbalance"
                        value={formData.minbalance}
                        onChange={handleChange}
                        placeholder="10"
                        className="form-control border-2"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-4 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-sync-alt me-1 text-primary"></i>
                        Tự động hoàn:
                      </label>
                      <select
                        name="autohoan"
                        value={formData.autohoan}
                        onChange={handleChange}
                        className="form-select border-2"
                      >
                        <option value="on">✅ Bật</option>
                        <option value="off">❌ Tắt</option>
                      </select>
                    </div>
                    <div className="col-4 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-power-off me-1 text-success"></i>
                        Trạng Thái:
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select border-2"
                      >
                        <option value="on">✅ Bật</option>
                        <option value="off">❌ Tắt</option>
                      </select>
                    </div>
                    <div className="col-4 mb-3">
                      <label className="form-label fw-bold text-dark">
                        <i className="fas fa-chart-line me-1 text-warning"></i>
                        Cập nhật giá:
                      </label>
                      <select
                        name="update_price"
                        value={formData.update_price}
                        onChange={handleChange}
                        className="form-select border-2"
                      >
                        <option value="on">✅ Bật</option>
                        <option value="off">❌ Tắt</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer className="bg-white border-0 px-4 py-3">
          <div className="d-flex justify-content-between w-100">
            <Button
              variant="outline-secondary"
              onClick={onClose}
              className="px-4 py-2 fw-bold"
              style={{ minWidth: '120px' }}
            >
              <i className="fas fa-times me-2"></i>
              Hủy
            </Button>
            <Button
              type="submit"
              variant={editingPartner ? "warning" : "success"}
              disabled={loading}
              className="px-4 py-2 fw-bold shadow-sm"
              style={{ minWidth: '180px' }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className={`fas ${editingPartner ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {editingPartner ? "Cập Nhật Đối Tác" : "Thêm Đối Tác"}
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}