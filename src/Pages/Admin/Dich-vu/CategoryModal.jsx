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
    thutu: "",
  });

  useEffect(() => {
    if (category && typeof category === "object") {
      setFormData({
        platforms_id: typeof category.platforms_id === "object" && category.platforms_id?._id
          ? category.platforms_id._id
          : category.platforms_id || "",
        name: category.name || "",
        path: category.path || "",
        notes: category.notes || "",
        modal_show: category.modal_show || "",
        thutu: category.thutu || "",
      });
    } else {
      setFormData({
        platforms_id: "",
        name: "",
        path: "",
        notes: "",
        modal_show: "",
        thutu: 2,
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
    // Pass up and then reset to empty so when modal reopens it's blank
    onSave(formData);
    setFormData({
      platforms_id: "",
      name: "",
      path: "",
      notes: "",
      modal_show: "",
      thutu: "",
    });
  };

  return (
    <Modal show={true} onHide={onClose} centered size="xl" className="modern-modal">
      <Modal.Header closeButton className="bg-gradient-primary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <i className={`fas ${category ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
          {category ? "Sửa Danh mục" : "Thêm Danh mục"}
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
                      <i className="fas fa-sort-numeric-up me-1 text-primary"></i>
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2"
                      value={formData.thutu}
                      onChange={(e) => setFormData({ ...formData, thutu: e.target.value })}
                      placeholder="2"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-layer-group me-1 text-primary"></i>
                      Nền tảng <span className="text-danger">*</span>
                    </label>
                    {platforms.length > 0 ? (
                      <select
                        className="form-select form-select-lg border-2"
                        value={formData.platforms_id}
                        onChange={(e) => setFormData({ ...formData, platforms_id: e.target.value })}
                        required
                      >
                        <option value="">
                          <i className="fas fa-hand-pointer"></i> Chọn nền tảng
                        </option>
                        {platforms.map((platform) => (
                          <option key={platform._id} value={platform._id}>
                           {platform.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Không có nền tảng nào để chọn.
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-tag me-1 text-primary"></i>
                      Tên Danh mục <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="LIKE BÀI VIẾT, THEO DÕI FB, ..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-link me-1 text-primary"></i>
                      Đường dẫn <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={formData.path}
                      onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                      placeholder="facebook-like ,tiktok-view ,..."
                      required
                    />
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Sử dụng dấu gạch ngang (-) thay vì khoảng trắng
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải - Nội dung chi tiết */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-file-alt me-2"></i>
                    Nội dung chi tiết
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-window-maximize me-1 text-success"></i>
                      Hiển thị Modal
                    </label>
                    <div className="editor-wrapper border-2 border rounded">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.modal_show || ""}
                        onReady={(editor) => {
                          editor.ui.view.editable.element.style.height = "250px";
                          editor.ui.view.editable.element.style.borderRadius = "8px";
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({ ...prev, modal_show: data }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-sticky-note me-1 text-warning"></i>
                      Ghi chú
                    </label>
                    <div className="editor-wrapper border-2 border rounded">
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.notes || ""}
                        onReady={(editor) => {
                          editor.ui.view.editable.element.style.height = "250px";
                          editor.ui.view.editable.element.style.borderRadius = "8px";
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          setFormData((prev) => ({ ...prev, notes: data }));
                        }}
                      />
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
              variant={category ? "warning" : "success"}
              className="px-4 py-2 fw-bold shadow-sm"
              style={{ minWidth: '160px' }}
            >
              <i className={`fas ${category ? 'fa-save' : 'fa-plus'} me-2`}></i>
              {category ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
}