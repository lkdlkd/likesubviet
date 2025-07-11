'use client';
import { useState, useEffect } from "react";
import { createSmmPartner, updateSmmPartner } from "@/Utils/api";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadingg } from "@/JS/Loading";

export default function Adddoitac({
  token,
  onAdd,
  editingPartner,
  onUpdate,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    url_api: "",
    api_token: "",
    price_update: "",
    tigia: "",
    phihoan: 1000, // Mặc định là 1000
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
        phihoan: editingPartner.phihoan || 1000, // Mặc định là 1000 nếu không có
        autohoan: editingPartner.autohoan || "on",
      });
    } else {
      setFormData({
        name: "",
        url_api: "",
        api_token: "",
        price_update: "",
        tigia: "",
        phihoan: 1000, // Mặc định là 1000
        autohoan: "on",
        status: "on",
        update_price: "on",
      });
    }
  }, [editingPartner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    loadingg(editingPartner ? "Đang cập nhật đối tác..." : "Đang thêm đối tác...");
    try {
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
      onClose(); // Đóng modal
    } catch (error) {
      toast.error("Lỗi khi thêm/cập nhật đối tác. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("", false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingPartner ? "Cập Nhật Đối Tác" : "Thêm Đối Tác"}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Tên Đối Tác:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="doitac1, doitac2, ..."
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">URL API:</label>
            <input
              type="text"
              name="url_api"
              value={formData.url_api}
              onChange={handleChange}
              placeholder="https://tenmien.com/api/v2"
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">API Token:</label>
            <input
              type="text"
              name="api_token"
              value={formData.api_token}
              onChange={handleChange}
              placeholder="token hoặc api key"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Cập Nhật Giá:</label>
            <input
              type="text"
              name="price_update"
              value={formData.price_update}
              onChange={handleChange}
              placeholder="10"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tỉ Giá:</label>
            <input
              type="text"
              name="tigia"
              value={formData.tigia}
              onChange={handleChange}
              placeholder="VD: 25"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phí hoàn:</label>
            <input
              type="text"
              name="phihoan"
              value={formData.phihoan}
              onChange={handleChange}
              placeholder="VD: 1000 nếu bỏ trống mặc định là 1000"
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tự động hoàn:</label>
            <select
              name="autohoan"
              value={formData.autohoan}
              onChange={handleChange}
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Trạng Thái:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Cập Nhật Giá Tự Động:</label>
            <select
              name="update_price"
              value={formData.update_price}
              onChange={handleChange}
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? "Đang xử lý..." : editingPartner ? "Cập Nhật Đối Tác" : "Thêm Đối Tác"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}