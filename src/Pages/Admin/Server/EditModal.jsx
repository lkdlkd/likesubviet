import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { updateServer } from "@/Utils/api"; // Đường dẫn tới file chứa hàm gọi API

export default function EditModal({ show, onClose, initialData, token }) {
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    maychu: "",
    serviceId: "",
    min: 0,
    max: 0,
    rate: 0,
    getid: "off",
    comment: "off",
    reaction: "off",
    matlive: "off",
  });

  const [form, setform] = useState({
    type: "",
    category: "",
    originalRate: "",
    DomainSmm: "",
    serviceName: "",
    serviceId: "",
  });

  useEffect(() => {
    if (initialData) {
      setform(initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lọc các trường cần thiết
    const updatedData = {
      name: formData.name,
      description: formData.description,
      maychu: formData.maychu,
      serviceId: formData.serviceId,
      min: formData.min,
      max: formData.max,
      rate: formData.rate,
      getid: formData.getid,
      comment: formData.comment,
      reaction: formData.reaction,
      matlive: formData.matlive,
    };

    try {
      await updateServer(formData._id, updatedData, token); // Gọi API với các trường cần thiết
      toast.success("Dịch vụ đã được cập nhật thành công!");
      onClose(); // Đóng modal sau khi cập nhật thành công
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      toast.error("Lỗi khi cập nhật dịch vụ. Vui lòng thử lại!");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa dịch vụ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {/* Các trường chỉnh sửa */}
          <h4>Nền tảng và dịch vụ</h4>
          <div className="mb-3">
            <label className="form-label">Nền tảng:</label>
            <input
              type="text"
              name="name"
              value={form.type}
              className="form-control"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Dịch vụ:</label>
            <input
              type="text"
              name="name"
              value={form.category}
              className="form-control"
              disabled
            />
          </div>
          <h4>Nguồn</h4>
          <div className="mb-3">
            <label className="form-label">Nguồn:</label>
            <input
              type="text"
              name="name"
              value={form.DomainSmm}
              className="form-control"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Id nguồn:</label>
            <input
              type="text"
              name="name"
              value={form.serviceId}
              className="form-control"
              disabled
            />
          </div>
          <h4>Thông tin dịch vụ</h4>
          <div className="mb-3">
            <label className="form-label">Tên dịch vụ:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Máy chủ:</label>
            <input
              type="text"
              name="maychu"
              value={formData.maychu}
              onChange={(e) =>
                setFormData({ ...formData, maychu: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Service ID:</label>
            <input
              type="text"
              name="serviceId"
              value={formData.serviceId}
              onChange={(e) =>
                setFormData({ ...formData, serviceId: e.target.value })
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giới hạn Min:</label>
            <input
              type="number"
              name="min"
              value={formData.min}
              onChange={(e) =>
                setFormData({ ...formData, min: Number(e.target.value) })
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giới hạn Max:</label>
            <input
              type="number"
              name="max"
              value={formData.max}
              onChange={(e) =>
                setFormData({ ...formData, max: Number(e.target.value) })
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giá :</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: Number(e.target.value) })
              }
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giá gốc :</label>
            <input
              type="number"
              name="originalRate"
              value={form.originalRate}
              className="form-control"
              disabled
            />
          </div>
          {/* Các chức năng */}
          <div className="mb-3">
            <label className="form-label">Chức năng Get ID:</label>
            <select
              name="getid"
              value={formData.getid}
              onChange={(e) =>
                setFormData({ ...formData, getid: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Chức năng Comment:</label>
            <select
              name="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Chức năng Reaction:</label>
            <select
              name="reaction"
              value={formData.reaction}
              onChange={(e) =>
                setFormData({ ...formData, reaction: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Chức năng Matlive:</label>
            <select
              name="matlive"
              value={formData.matlive}
              onChange={(e) =>
                setFormData({ ...formData, matlive: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
}