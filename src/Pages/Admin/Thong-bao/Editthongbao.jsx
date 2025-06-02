'use client';
import { useState } from "react";
import { editNotification } from "@/Utils/api";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function Editthongbao({ notification, token, onClose, onUpdate }) {
  const [editData, setEditData] = useState(notification);
  const [loading, setLoading] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedNotification = await editNotification(editData._id, editData, token);
      toast.success("Thông báo đã được cập nhật thành công!");
      onUpdate(updatedNotification); // Cập nhật thông báo trong danh sách
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi khi cập nhật thông báo:", error);
      toast.error("Lỗi khi cập nhật thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {true && (
        <motion.div
          className="modal-backdrop show"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 1040 }}
        />
      )}
      {true && (
        <motion.div
          className="modal fade show"
          style={{ display: "block", zIndex: 1050 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông báo</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      id="edit-title"
                      placeholder="Tiêu đề"
                      value={editData.title}
                      onChange={handleEditChange}
                      required
                    />
                    <label htmlFor="edit-title">Tiêu đề</label>
                  </div>
                  <div className="form-floating mb-3">
                    <select
                      name="color"
                      id="edit-color"
                      className="form-select"
                      value={editData.color}
                      onChange={handleEditChange}
                    >
                      <option value="primary">Tím</option>
                      <option value="secondary">Đen</option>
                      <option value="success">Xanh Lục</option>
                      <option value="danger">Đỏ</option>
                      <option value="warning">Vàng</option>
                      <option value="info">Xanh Dương</option>
                    </select>
                    <label htmlFor="edit-color">Màu sắc</label>
                  </div>
                  <div className="form-group mb-3">
                    <label>Nội dung</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={editData.content}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setEditData((prev) => ({ ...prev, content: data }));
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}