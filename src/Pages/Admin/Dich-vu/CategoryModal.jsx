import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CategoryModal({ category, platforms, onClose, onSave }) {
  const [formData, setFormData] = useState({
    platforms_id: "",
    name: "",
    path: "",
    notes: "",
    modal_show: "",
  });

  useEffect(() => {
    if (category && typeof category === "object") {
      setFormData({
        platforms_id: category.platforms_id || "",
        name: category.name || "",
        path: category.path || "",
        notes: category.notes || "",
        modal_show: category.modal_show || "",
      });
    } else {
      setFormData({
        platforms_id: "",
        name: "",
        path: "",
        notes: "",
        modal_show: "",
      });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.platforms_id || !formData.name || !formData.path) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{category ? "Sửa Danh mục" : "Thêm Danh mục"}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Nền tảng</label>
            {platforms.length > 0 ? (
              <select
                className="form-select"
                value={formData.platforms_id}
                onChange={(e) => setFormData({ ...formData, platforms_id: e.target.value })}
                required
              >
                <option value="">Chọn nền tảng</option>
                {platforms.map((platform) => (
                  <option key={platform._id} value={platform._id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-danger">Không có nền tảng nào để chọn.</p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Tên Danh mục</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Đường dẫn</label>
            <input
              type="text"
              className="form-control"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Hiển thị Modal</label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.modal_show || ""}
              onReady={(editor) => {
                editor.ui.view.editable.element.style.height = "300px";
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData((prev) => ({ ...prev, modal_show: data }));
              }}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ghi chú</label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.notes || ""}
              onReady={(editor) => {
                editor.ui.view.editable.element.style.height = "300px";
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData((prev) => ({ ...prev, notes: data }));
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            Lưu
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}