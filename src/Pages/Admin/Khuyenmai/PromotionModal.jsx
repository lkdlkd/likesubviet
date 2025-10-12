import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function PromotionModal({ show, handleClose, handleSubmit, formData, setFormData, isEditing }) {
    return (
        <>
            <style>
                {`
                    /* Modern Promotion Modal Styles */
                    .promotion-modal .modal-dialog {
                        max-width: 900px;
                        margin: 1.75rem auto;
                    }
                    
                    .promotion-modal .modal-content {
                        border-radius: 15px;
                        border: none;
                        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                        overflow: hidden;
                        width: 100%;
                    }
                    
                    .promotion-modal .modal-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .promotion-modal .modal-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .promotion-modal .modal-title {
                        font-size: 20px;
                        font-weight: 600;
                        margin: 0;
                        position: relative;
                        z-index: 1;
                        display: flex;
                        align-items: center;
                    }
                    
                    .promotion-modal .modal-title i {
                        background: rgba(255,255,255,0.2);
                        padding: 8px;
                        border-radius: 50%;
                        margin-right: 12px;
                        font-size: 16px;
                    }
                    
                    .promotion-modal .btn-close {
                        filter: invert(1);
                        position: relative;
                        z-index: 2;
                    }
                    
                    .promotion-modal .modal-body {
                        padding: 2rem;
                        background: #f8f9fa;
                    }
                    
                    .promotion-section {
                        background: white;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        border: 1px solid #e9ecef;
                    }
                    
                    .promotion-section-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 1.25rem;
                        padding-bottom: 0.75rem;
                        border-bottom: 2px solid #e9ecef;
                    }
                    
                    .promotion-section-icon {
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;
                        color: white;
                        font-size: 16px;
                    }
                    
                    .promotion-section-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin: 0;
                    }
                    
                    .promotion-form-group {
                        margin-bottom: 1.25rem;
                    }
                    
                    .promotion-form-label {
                        display: flex;
                        align-items: center;
                        font-size: 13px;
                        font-weight: 500;
                        color: #495057;
                        margin-bottom: 0.5rem;
                    }
                    
                    .promotion-form-label i {
                        margin-right: 6px;
                        color: #6c757d;
                        width: 14px;
                        text-align: center;
                    }
                    
                    .promotion-form-control {
                        border-radius: 8px;
                        border: 1px solid #d1d3e2;
                        padding: 0.6rem 0.8rem;
                        font-size: 14px;
                        transition: all 0.2s ease;
                        width: 100%;
                    }
                    
                    .promotion-form-control:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
                        outline: none;
                    }
                    
                    .promotion-form-control::placeholder {
                        color: #adb5bd;
                        font-style: italic;
                    }
                    
                    .promotion-textarea {
                        min-height: 80px;
                        resize: vertical;
                    }
                    
                    .promotion-switch-container {
                        display: flex;
                        align-items: center;
                        padding: 1rem;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #e9ecef;
                        margin-top: 0.5rem;
                    }
                    
                    .promotion-switch {
                        position: relative;
                        display: inline-block;
                        width: 50px;
                        height: 24px;
                        margin-right: 1rem;
                    }
                    
                    .promotion-switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }
                    
                    .promotion-switch-slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #ccc;
                        transition: .4s;
                        border-radius: 24px;
                    }
                    
                    .promotion-switch-slider:before {
                        position: absolute;
                        content: "";
                        height: 18px;
                        width: 18px;
                        left: 3px;
                        bottom: 3px;
                        background-color: white;
                        transition: .4s;
                        border-radius: 50%;
                    }
                    
                    .promotion-switch input:checked + .promotion-switch-slider {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    
                    .promotion-switch input:checked + .promotion-switch-slider:before {
                        transform: translateX(26px);
                    }
                    
                    .promotion-switch-label {
                        font-size: 14px;
                        font-weight: 500;
                        color: #495057;
                        display: flex;
                        align-items: center;
                    }
                    
                    .promotion-switch-label i {
                        margin-right: 6px;
                        color: #667eea;
                    }
                    
                    .promotion-modal .modal-footer {
                        background: white;
                        border: none;
                        padding: 1.5rem 2rem;
                        display: flex;
                        justify-content: flex-end;
                        gap: 12px;
                    }
                    
                    .promotion-btn {
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
                    
                    .promotion-btn-secondary {
                        background: #6c757d;
                        color: white;
                    }
                    
                    .promotion-btn-secondary:hover {
                        background: #5a6268;
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                        color: white;
                    }
                    
                    .promotion-btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    
                    .promotion-btn-primary:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                        color: white;
                    }
                    
                    .input-icon-wrapper {
                        position: relative;
                    }
                    
                    .input-icon {
                        position: absolute;
                        left: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #6c757d;
                        z-index: 1;
                    }
                    
                    .input-with-icon {
                        padding-left: 35px;
                    }
                    
                    @media (max-width: 992px) {
                        .promotion-modal .modal-dialog {
                            max-width: 95%;
                            margin: 1rem auto;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .promotion-modal .modal-dialog {
                            max-width: 98%;
                            margin: 0.5rem auto;
                        }
                        
                        .promotion-modal .modal-body {
                            padding: 1rem;
                        }
                        
                        .promotion-section {
                            padding: 1rem;
                        }
                        
                        .promotion-modal .modal-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .promotion-modal .modal-footer {
                            padding: 1rem 1.5rem;
                        }
                    }
                `}
            </style>
            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} dialogClassName="promotion-modal" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={isEditing ? "fas fa-edit" : "fas fa-plus-circle"}></i>
                        {isEditing ? "Sửa Chương Trình Khuyến Mãi" : "Thêm Chương Trình Khuyến Mãi"}
                    </Modal.Title>
                </Modal.Header>
                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {/* Section 1: Thông tin cơ bản */}
                        <div className="promotion-section">
                            <div className="promotion-section-header">
                                <div className="promotion-section-icon">
                                    <i className="fas fa-info-circle"></i>
                                </div>
                                <h6 className="promotion-section-title">Thông tin chương trình</h6>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-tag"></i>
                                            Tên chương trình khuyến mãi
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="fas fa-gift input-icon"></i>
                                            <input
                                                type="text"
                                                className="promotion-form-control input-with-icon"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ví dụ: Khuyến mãi đầu tháng, Flash Sale..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-align-left"></i>
                                            Mô tả chương trình
                                        </label>
                                        <textarea
                                            className="promotion-form-control promotion-textarea"
                                            value={formData.description || ""}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="3"
                                            placeholder="Mô tả chi tiết về chương trình khuyến mãi (có thể để trống)"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Thông tin khuyến mãi */}
                        <div className="promotion-section">
                            <div className="promotion-section-header">
                                <div className="promotion-section-icon">
                                    <i className="fas fa-percentage"></i>
                                </div>
                                <h6 className="promotion-section-title">Thông tin khuyến mãi</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-percent"></i>
                                            Phần trăm khuyến mãi
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="fas fa-percentage input-icon"></i>
                                            <input
                                                type="number"
                                                className="promotion-form-control input-with-icon"
                                                value={formData.percentBonus}
                                                onChange={(e) => setFormData({ ...formData, percentBonus: e.target.value })}
                                                required
                                                placeholder="10"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-money-bill-wave"></i>
                                            Số tiền tối thiểu (VNĐ)
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="fas fa-dollar-sign input-icon"></i>
                                            <input
                                                type="number"
                                                className="promotion-form-control input-with-icon"
                                                value={formData.minAmount}
                                                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                                                required
                                                placeholder="100000"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Thời gian áp dụng */}
                        <div className="promotion-section">
                            <div className="promotion-section-header">
                                <div className="promotion-section-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <h6 className="promotion-section-title">Thời gian áp dụng</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-calendar-plus"></i>
                                            Ngày giờ bắt đầu
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="promotion-form-control"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-calendar-times"></i>
                                            Ngày giờ kết thúc
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="promotion-form-control"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="promotion-form-group">
                                        <label className="promotion-form-label">
                                            <i className="fas fa-redo"></i>
                                            Tùy chọn lặp lại
                                        </label>
                                        <div className="promotion-switch-container">
                                            <label className="promotion-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.repeatMonthly || false}
                                                    onChange={(e) => setFormData({ ...formData, repeatMonthly: e.target.checked })}
                                                />
                                                <span className="promotion-switch-slider"></span>
                                            </label>
                                            <span className="promotion-switch-label">
                                                <i className="fas fa-sync-alt"></i>
                                                {formData.repeatMonthly ? 'Đang bật lặp lại hàng tháng' : 'Không lặp lại hàng tháng'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button 
                            type="button"
                            className="promotion-btn promotion-btn-secondary" 
                            onClick={handleClose}
                        >
                            <i className="fas fa-times"></i>
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            className="promotion-btn promotion-btn-primary"
                        >
                            <i className={isEditing ? "fas fa-save" : "fas fa-plus"}></i>
                            {isEditing ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
}