import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState } from "react";
import { addNotification } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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

    try {
      const newNotification = await addNotification(formData, token);
      toast.success("Thông báo mới đã được thêm thành công!");
      onAdd(newNotification); // Cập nhật danh sách thông báo
      setFormData({ title: "", content: "", color: "primary" }); // Reset form
      onClose(); // Đóng modal
    } catch (error) {
     // console.error("Lỗi khi thêm thông báo:", error);
      toast.error("Lỗi khi thêm thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm thông báo mới</Modal.Title>
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
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Đang thêm..." : "Thêm thông báo"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}