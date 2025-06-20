import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { toast } from "react-toastify";
import { updateServer } from "@/Utils/api";

export default function EditModal({ show, onClose, initialData, token }) {
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    maychu: "",
    serviceId: "",
    min: "",
    max: "",
    rate: "",
    getid: "off",
    comment: "off",
    reaction: "off",
    matlive: "off",
    isActive: true,
  });

  const [form, setForm] = useState({
    type: "",
    category: "",
    originalRate: "",
    DomainSmm: "",
    serviceName: "",
    serviceId: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "min" || name === "max" || name === "rate"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra giá trị hợp lệ
    if (formData.min < 0 || formData.max < 0 || formData.rate < 0) {
      toast.error("Giá trị Min, Max và Giá không được âm!");
      return;
    }

    if (formData.min > formData.max) {
      toast.error("Giá trị Min không được lớn hơn Max!");
      return;
    }

    const updatedData = {
      name: formData.name,
      description: formData.description,
      maychu: formData.maychu,
      serviceId: formData.serviceId,
      min: formData.min || 0,
      max: formData.max || 0,
      rate: formData.rate || 0,
      getid: formData.getid,
      comment: formData.comment,
      reaction: formData.reaction,
      matlive: formData.matlive,
      isActive: formData.isActive,
    };

    try {
      await updateServer(formData._id, updatedData, token);
      toast.success("Dịch vụ đã được cập nhật thành công!");
      onClose();
    } catch (error) {
      //console.error("Lỗi khi cập nhật dịch vụ:", error);
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
          <h4>Nền tảng và dịch vụ</h4>
          <div className="mb-3">
            <label className="form-label">Nền tảng:</label>
            <input
              type="text"
              value={form.type}
              className="form-control"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Dịch vụ:</label>
            <input
              type="text"
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
              value={form.DomainSmm}
              className="form-control"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Id nguồn:</label>
            <input
              type="text"
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
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Máy chủ:</label>
            <input
              type="text"
              name="maychu"
              value={formData.maychu}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Service ID:</label>
            <input
              type="text"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giá:</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Giá gốc:</label>
            <input
              type="number"
              value={form.originalRate}
              className="form-control"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Trạng thái:</label>
            <select
              name="isActive"
              value={formData.isActive ? "true" : "false"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="form-select"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Đóng</option>
            </select>
          </div>
          <h4>Các chức năng</h4>
          {["getid", "comment", "reaction", "matlive"].map((field) => (
            <div className="mb-3" key={field}>
              <label className="form-label">Chức năng {field.toUpperCase()}:</label>
              <select
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="form-select"
              >
                <option value="on">Bật</option>
                <option value="off">Tắt</option>
              </select>
            </div>
          ))}
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