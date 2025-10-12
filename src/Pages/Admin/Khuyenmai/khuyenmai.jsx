import React, { useState, useEffect } from "react";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/Utils/api";
import PromotionModal from "./PromotionModal";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";

export default function Khuyenmai() {
    const [promotions, setPromotions] = useState([]); // Danh sách chương trình khuyến mãi
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        percentBonus: "",
        minAmount: 0,
        startDate: "",
        endDate: "",
        repeatMonthly: false, // Mặc định không lặp lại
    }); // Dữ liệu form
    const token = localStorage.getItem("token") || "";

    // Lấy danh sách chương trình khuyến mãi
    const fetchPromotions = async () => {
        try {
            loadingg("Đang tải danh sách khuyến mãi...", true, 9999999);
            const data = await getPromotions(token);
            setPromotions(data);
        } catch (error) {
            // console.error("Lỗi khi lấy danh sách chương trình khuyến mãi:", error.message);
        } finally {
            loadingg("", false);
        }
    };

    // Xử lý khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        loadingg(isEditing ? "Đang cập nhật khuyến mãi..." : "Đang thêm khuyến mãi...", true, 9999999);
        try {
            const dataToSubmit = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };

            if (isEditing) {
                await updatePromotion(formData.id, dataToSubmit, token);
                Swal.fire("Thành công!", "Cập nhật chương trình khuyến mãi thành công!", "success");
            } else {
                await createPromotion(dataToSubmit, token);
                Swal.fire("Thành công!", "Thêm chương trình khuyến mãi thành công!", "success");
            }

            setFormData({
                id: "",
                name: "",
                description: "",
                percentBonus: "",
                minAmount: 0,
                startDate: "",
                endDate: "",
                repeatMonthly: false,
            });
            setIsEditing(false);
            setShowModal(false);
            fetchPromotions();
        } catch (error) {
            Swal.fire("Lỗi!", "Không thể xử lý chương trình khuyến mãi.", "error");
        } finally {
            loadingg("", false);
        }
    };

    const handleEdit = (promotion) => {
        setFormData({
            id: promotion._id,
            name: promotion.name,
            description: promotion.description,
            percentBonus: promotion.percentBonus,
            minAmount: promotion.minAmount || 0,
            startDate: toLocalDatetimeInputValue(promotion.startTime),
            endDate: toLocalDatetimeInputValue(promotion.endTime),
            repeatMonthly: promotion.repeatMonthly || false,
        });
        setIsEditing(true);
        setShowModal(true);
        // fetchPromotions();
    };

    function toLocalDatetimeInputValue(dateString) {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    }

    // Xử lý khi nhấn nút xóa
    const handleDelete = async (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Hành động này sẽ xóa chương trình khuyến mãi và không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    loadingg("Đang xóa khuyến mãi...", true, 9999999);
                    await deletePromotion(id, token);
                    Swal.fire("Đã xóa!", "Chương trình khuyến mãi đã được xóa.", "success");
                    fetchPromotions(); // Cập nhật danh sách
                } catch (error) {
                    Swal.fire("Lỗi!", "Không thể xóa chương trình khuyến mãi.", "error");
                } finally {
                    loadingg("", false);
                }
            }
        });
    };

    // Lấy danh sách chương trình khuyến mãi khi component được mount
    useEffect(() => {
        fetchPromotions();
    }, []);

    return (
        <>
            <style>
                {`
                    /* Modern Promotion Page Styles */
                    .promotion-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .promotion-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .promotion-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .promotion-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .promotion-header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        position: relative;
                        z-index: 1;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    
                    .promotion-title-section {
                        display: flex;
                        align-items: center;
                    }
                    
                    .promotion-icon-circle {
                        width: 50px;
                        height: 50px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .promotion-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .promotion-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .promotion-add-btn {
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        backdrop-filter: blur(10px);
                        text-decoration: none;
                    }
                    
                    .promotion-add-btn:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        color: white;
                    }
                    
                    .promotion-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                    }
                    
                    .promotion-content-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 1.5rem 2rem;
                        border-bottom: 1px solid #e8ecef;
                        margin: 0;
                    }
                    
                    .promotion-content-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #2c3e50;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .promotion-content-body {
                        padding: 1.5rem 2rem;
                    }
                    
                    .promotion-table-container {
                        border-radius: 8px;
                        overflow: hidden;
                        border: 1px solid #e8ecef;
                    }
                    
                    .promotion-action-dropdown .btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.4rem 0.8rem;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    
                    .promotion-action-dropdown .btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    }
                    
                    .promotion-action-dropdown .dropdown-menu {
                        border: none;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        padding: 0.5rem 0;
                    }
                    
                    .promotion-action-dropdown .dropdown-item {
                        padding: 0.5rem 1rem;
                        font-size: 13px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    
                    .promotion-action-dropdown .dropdown-item:hover {
                        background: #f8f9fa;
                        transform: translateX(5px);
                    }
                    
                    .promotion-status-badge {
                        padding: 0.3rem 0.8rem;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .promotion-status-active {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white;
                    }
                    
                    .promotion-status-inactive {
                        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                        color: white;
                    }
                    
                    .promotion-percentage {
                        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                        color: white;
                        padding: 0.3rem 0.8rem;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 12px;
                    }
                    
                    .promotion-amount {
                        color: #28a745;
                        font-weight: 600;
                    }
                    
                    @media (max-width: 768px) {
                        .promotion-container {
                            font-size: 13px;
                        }
                        
                        .promotion-main-title {
                            font-size: 20px;
                        }
                        
                        .promotion-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .promotion-header-content {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 1rem;
                        }
                        
                        .promotion-add-btn {
                            justify-content: center;
                        }
                        
                        .promotion-content-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .promotion-content-body {
                            padding: 1rem 1.5rem;
                        }
                    }
                `}
            </style>
            <div className="promotion-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="promotion-header-card card">
                            <div className="card-header">
                                <div className="promotion-header-content">
                                    <div className="promotion-title-section">
                                        <div className="promotion-icon-circle">
                                            <i className="fas fa-gift"></i>
                                        </div>
                                        <h2 className="promotion-main-title">Chương Trình Khuyến Mãi</h2>
                                    </div>
                                    <button 
                                        className="promotion-add-btn" 
                                        onClick={() => { 
                                            setShowModal(true); 
                                            setIsEditing(false); 
                                            setFormData({ 
                                                id: "", 
                                                name: "", 
                                                description: "", 
                                                percentBonus: "", 
                                                minAmount: 0, 
                                                startDate: "", 
                                                endDate: "",
                                                repeatMonthly: false
                                            }); 
                                        }}
                                    >
                                        <i className="fas fa-plus"></i>
                                        Thêm khuyến mãi
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <PromotionModal
                            show={showModal}
                            handleClose={() => setShowModal(false)}
                            handleSubmit={handleSubmit}
                            formData={formData}
                            setFormData={setFormData}
                            isEditing={isEditing}
                        />
                        
                        <div className="promotion-content-card">
                            <div className="promotion-content-header">
                                <h2 className="promotion-content-title">
                                    <i className="fas fa-list"></i>
                                    Danh Sách Chương Trình Khuyến Mãi
                                </h2>
                            </div>
                            <div className="promotion-content-body">
                                <div className="promotion-table-container">
                                    <Table bordered responsive hover>
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Thao tác</th>
                                    <th>Tên</th>
                                    <th>Khuyến mãi (%)</th>
                                    <th>Số tiền tối thiểu</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Ngày kết thúc</th>
                                    <th>Lặp lại hàng tháng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center">
                                            <div>
                                                <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                <p className="font-semibold" >Không có dữ liệu</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    promotions.map((promotion, index) => (
                                        <tr key={promotion._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="promotion-action-dropdown dropdown">
                                                    <button
                                                        className="btn dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        Thao tác <i className="las la-angle-down ms-1"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-primary"
                                                                onClick={() => handleEdit(promotion)}
                                                            >
                                                                <i className="fas fa-edit me-2"></i>Sửa
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() => handleDelete(promotion._id)}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>Xóa
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                            <td>{promotion.name}</td>
                                            <td>
                                                <span className="promotion-percentage">
                                                    {promotion.percentBonus}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="promotion-amount">
                                                    {promotion.minAmount.toLocaleString('en-US')} VNĐ
                                                </span>
                                            </td>
                                            <td> {new Date(promotion.startTime).toLocaleString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })}</td>
                                            <td> {new Date(promotion.endTime).toLocaleString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                            })}</td>
                                            <td>
                                                <span className={`promotion-status-badge ${promotion.repeatMonthly ? 'promotion-status-active' : 'promotion-status-inactive'}`}>
                                                    {promotion.repeatMonthly ? "Có" : "Không"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}