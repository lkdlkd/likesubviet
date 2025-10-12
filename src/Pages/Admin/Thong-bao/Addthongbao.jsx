import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { addNotification } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { loadingg } from "@/JS/Loading";

export default function Addthongbao({ token, onAdd, show, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "primary",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    loadingg("Đang thêm thông báo...", 9999999);
    try {
      const newNotification = await addNotification(formData, token);
      toast.success("Thông báo mới đã được thêm thành công!");
      onAdd(newNotification); // Cập nhật danh sách thông báo
      setFormData({ title: "", content: "", color: "primary" }); // Reset form
      onClose(); // Đóng modal
    } catch (error) {
      toast.error("Lỗi khi thêm thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("Đang tải...",false);
    }
  };

  return (
    <>
      <style>
        {`
          // .modal-modern-notification {
          //   z-index: 1055;
          // }

          .modal-modern-notification .modal-dialog {
            margin: 1.75rem auto;
            max-width: 600px;
          }

          .modal-modern-notification .modal-content {
            border: none;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }

          .modal-modern-notification .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom: none;
            border-radius: 12px 12px 0 0;
            padding: 1.5rem;
          }

          .modal-modern-notification .modal-title {
            font-weight: 600;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .modal-modern-notification .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: white;
            opacity: 0.8;
          }

          .modal-modern-notification .btn-close:hover {
            opacity: 1;
          }

          .modal-modern-notification .modal-body {
            padding: 2rem;
            background: #fafbfc;
          }

          .modal-modern-notification .form-floating {
            margin-bottom: 1.5rem;
          }

          .modal-modern-notification .form-floating > .form-control {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 1rem 0.75rem 0.25rem;
            background: white;
            transition: all 0.3s ease;
          }

          .modal-modern-notification .form-floating > .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }

          .modal-modern-notification .form-floating > label {
            color: #6c757d;
            font-weight: 500;
          }

          .modal-modern-notification .form-group label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.75rem;
            font-size: 14px;
          }

          .modal-modern-notification .ck-editor__editable {
            border-radius: 8px;
            border: 1px solid #e1e5e9;
            min-height: 250px;
          }

          .modal-modern-notification .ck-editor__editable:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }

          .modal-modern-notification .modal-footer {
            border-top: 1px solid #e9ecef;
            padding: 1.5rem 2rem;
            background: white;
            border-radius: 0 0 12px 12px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .modal-modern-notification .btn-modern {
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

          .modal-modern-notification .btn-modern-secondary {
            background: #6c757d;
            color: white;
          }

          .modal-modern-notification .btn-modern-secondary:hover {
            background: #5a6268;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .modal-modern-notification .btn-modern-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .modal-modern-notification .btn-modern-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .modal-modern-notification .btn-modern-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          @media (max-width: 768px) {
            .modal-modern-notification .modal-dialog {
              margin: 0.5rem;
              max-width: none;
            }

            .modal-modern-notification .modal-header,
            .modal-modern-notification .modal-body,
            .modal-modern-notification .modal-footer {
              padding: 1.5rem;
            }
          }
        `}
      </style>

      <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} className="modal-modern-notification" >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus-circle"></i>
            Thêm thông báo mới
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
          {/* Tiêu đề */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              name="title"
              id="title"
              placeholder="Tiêu đề"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <label htmlFor="title">Tiêu đề</label>
          </div>
          {/* Màu sắc */}
          <div className="form-floating mb-3">
            <select
              name="color"
              id="color"
              className="form-select"
              value={formData.color}
              onChange={handleChange}
            >
              <option value="primary">Tím</option>
              <option value="secondary">Đen</option>
              <option value="success">Xanh Lục</option>
              <option value="danger">Đỏ</option>
              <option value="warning">Vàng</option>
              <option value="info">Xanh Dương</option>
            </select>
            <label htmlFor="color">Màu sắc</label>
          </div>
          {/* Nội dung: CKEditor */}
          <div className="form-group mb-3">
            <label>Nội dung</label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.content}
              onReady={(editor) => {
                editor.ui.view.editable.element.style.height = "300px";
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                setFormData((prev) => ({ ...prev, content: data }));
              }}
            />
          </div>
          </Modal.Body>
          <Modal.Footer>
            <button 
              type="button"
              className="btn btn-modern btn-modern-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-modern btn-modern-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang thêm...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Thêm thông báo
                </>
              )}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}