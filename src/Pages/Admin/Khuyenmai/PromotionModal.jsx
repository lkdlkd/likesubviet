import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function PromotionModal({ show, handleClose, handleSubmit, formData, setFormData, isEditing }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? "Sửa Chương Trình Khuyến Mãi" : "Thêm Chương Trình Khuyến Mãi"}</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">Tên chương trình:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Khuyến mãi (%):</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.percentBonus}
                            onChange={(e) => setFormData({ ...formData, percentBonus: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Số tiền tối thiểu để áp dụng khuyến mãi:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.minAmount}
                            onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ngày giờ bắt đầu:</label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ngày giờ kết thúc:</label>
                        <input
                            type="datetime-local"
                            className="form-control"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Lặp lại hàng tháng:</label>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="repeatMonthly"
                                checked={formData.repeatMonthly || false}
                                onChange={(e) => setFormData({ ...formData, repeatMonthly: e.target.checked })}
                            />
                            <label className="form-check-label" htmlFor="repeatMonthly">
                                Lặp lại hàng tháng
                            </label>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mô tả chương trình:</label>
                        <textarea
                            className="form-control"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                        ></textarea>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="primary">
                        {isEditing ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}