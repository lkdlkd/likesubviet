'use client';

import { useState, useEffect } from "react";
import { addCategory, updateCategory, deleteCategory, getCategories, getPlatforms } from "@/Utils/api";
import Swal from "sweetalert2";
import CategoryModal from "@/Pages/Admin/Dich-vu/CategoryModal";
import Table from "react-bootstrap/Table"; // Import Table từ react-bootstrap
import { loadingg } from "@/JS/Loading";
import React from "react";
export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedPlatform, setExpandedPlatform] = useState(null);
    const token = localStorage.getItem("token") || "";
    const fetchCategories = async () => {
        try {
            loadingg("Đang tải danh sách danh mục...", true, 9999999);
            const response = await getCategories(token);
            setPlatforms(response.platforms || []);

            // Nếu response trả về platforms dạng mảng, gộp tất cả categories lại
            let allCategories = [];
            if (Array.isArray(response.platforms)) {
                allCategories = response.platforms.flatMap(p => p.categories || []);
            } else if (Array.isArray(response.data)) {
                allCategories = response.data;
            }
            setCategories(allCategories);
        } catch (error) {
            // console.error("Lỗi khi lấy danh sách danh mục:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể lấy danh sách danh mục.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        } finally {
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSaveCategory = async (categoryData) => {
        try {
            loadingg("Đang lưu danh mục...", true, 9999999);
            if (selectedCategory && selectedCategory._id) {
                const response = await updateCategory(selectedCategory._id, categoryData, token);
                setCategories((prev) =>
                    prev.map((cat) => (cat._id === selectedCategory._id ? response.data : cat))
                );
                Swal.fire({
                    title: "Thành công",
                    text: "Danh mục đã được cập nhật thành công!",
                    icon: "success",
                    confirmButtonText: "Xác nhận",
                });
            } else {
                const response = await addCategory(categoryData, token);
                setCategories((prev) => [...prev, response.data]);
                Swal.fire({
                    title: "Thành công",
                    text: "Danh mục đã được thêm thành công!",
                    icon: "success",
                    confirmButtonText: "Xác nhận",
                });
            }
            fetchCategories(); // Tải lại danh sách danh mục sau khi lưu
            setIsModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            //console.error("Lỗi khi lưu danh mục:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể lưu danh mục.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        } finally {
            loadingg("", false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!categoryId) {
            // console.error("Không thể xóa danh mục: `_id` không tồn tại.");
            return;
        }

        const result = await Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                loadingg("Đang xóa danh mục...");
                await deleteCategory(categoryId, token);
                setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
                Swal.fire("Đã xóa!", "Danh mục đã được xóa.", "success");
                fetchCategories(); // Tải lại danh sách danh mục sau khi xóa
            } catch (error) {
                //  console.error("Lỗi khi xóa danh mục:", error);
                Swal.fire({
                    title: "Lỗi",
                    text: `${error.message || "Không thể xóa danh mục."}`,
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
            } finally {
                loadingg("", false);
            }
        }
    };

    // Group categories by platform
    const categoriesByPlatform = (() => {
        const map = {};
        categories.forEach(cat => {
            const platformName = cat.platforms_id?.name || "Không xác định";
            if (!map[platformName]) map[platformName] = [];
            map[platformName].push(cat);
        });
        return map;
    })();

    return (
        <>
            <style>
                {`
                    /* Modern Categories Page Styles */
                    .categories-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .categories-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .categories-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .categories-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .categories-header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .categories-title-group {
                        display: flex;
                        align-items: center;
                    }
                    
                    .categories-icon-circle {
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
                    
                    .categories-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .categories-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .categories-add-btn {
                        background: rgba(255, 255, 255, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(10px);
                    }
                    
                    .categories-add-btn:hover {
                        background: rgba(255, 255, 255, 0.3);
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                        color: white;
                    }
                    
                    .categories-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                    }
                    
                    .categories-accordion {
                        border: none;
                    }
                    
                    .categories-accordion-item {
                        border: none;
                        border-bottom: 1px solid #e8ecef;
                        background: white;
                    }
                    
                    .categories-accordion-item:last-child {
                        border-bottom: none;
                    }
                    
                    .categories-accordion-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: none;
                        padding: 0;
                    }
                    
                    .categories-accordion-button {
                        background: transparent;
                        border: none;
                        color: #495057;
                        font-weight: 600;
                        font-size: 16px;
                        padding: 1.25rem 1.5rem;
                        border-radius: 0;
                        position: relative;
                        transition: all 0.3s ease;
                    }
                    
                    .categories-accordion-button:not(.collapsed) {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        box-shadow: none;
                    }
                    
                    .categories-accordion-button:focus {
                        box-shadow: none;
                        border-color: transparent;
                    }
                    
                    .categories-accordion-button::after {
                        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23495057'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
                        transition: transform 0.3s ease;
                    }
                    
                    .categories-accordion-button:not(.collapsed)::after {
                        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
                        transform: rotate(180deg);
                    }
                    
                    .categories-accordion-body {
                        padding: 0;
                        background: white;
                    }
                    
                    .categories-empty-state {
                        text-align: center;
                        padding: 3rem 2rem;
                        color: #6c757d;
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        margin: 2rem;
                    }
                    
                    .categories-empty-icon {
                        font-size: 48px;
                        color: #dee2e6;
                        margin-bottom: 1rem;
                    }
                    
                    @media (max-width: 768px) {
                        .categories-container {
                            font-size: 13px;
                        }
                        
                        .categories-main-title {
                            font-size: 20px;
                        }
                        
                        .categories-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .categories-header-content {
                            flex-direction: column;
                            gap: 1rem;
                            align-items: stretch;
                        }
                        
                        .categories-add-btn {
                            align-self: center;
                        }
                    }
                `}
            </style>

            <div className="categories-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="categories-header-card">
                            <div className="card-header">
                                <div className="categories-header-content">
                                    <div className="categories-title-group">
                                        <div className="categories-icon-circle">
                                            <i className="fas fa-layer-group"></i>
                                        </div>
                                        <h2 className="categories-main-title">Quản lý dịch vụ</h2>
                                    </div>
                                    <button
                                        className="btn categories-add-btn"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Thêm Danh mục
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="categories-content-card">
                            <div className="card-body p-0">
                                <div className="card-body p-0">
                                    <div className="accordion accordion-flush categories-accordion" id="platformAccordion">
                                        {Object.keys(categoriesByPlatform).length > 0 ? (
                                            Object.entries(categoriesByPlatform).map(([platformName, cats], idx) => (
                                                <div className="accordion-item categories-accordion-item" key={platformName}>
                                                    <h2 className="accordion-header categories-accordion-header" id={`flush-heading-${idx}`}>
                                                        <button
                                                            className={`accordion-button categories-accordion-button${expandedPlatform === platformName ? '' : ' collapsed'}`}
                                                            type="button"
                                                            onClick={() => setExpandedPlatform(expandedPlatform === platformName ? null : platformName)}
                                                            aria-expanded={expandedPlatform === platformName ? 'true' : 'false'}
                                                            aria-controls={`flush-collapse-${idx}`}
                                                        >
                                                            <i className="fas fa-server me-2"></i>
                                                            {platformName}
                                                        </button>
                                                    </h2>
                                                    <div
                                                        id={`flush-collapse-${idx}`}
                                                        className={`accordion-collapse collapse${expandedPlatform === platformName ? ' show' : ''}`}
                                                        aria-labelledby={`flush-heading-${idx}`}
                                                        data-bs-parent="#platformAccordion"
                                                    >
                                                        <div className="accordion-body categories-accordion-body p-3">
                                                            <Table striped bordered hover responsive className="mb-0">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>Thứ tự</th>
                                                                        <th>Thao tác</th>
                                                                        <th>Tên</th>
                                                                        <th>Đường dẫn</th>
                                                                        <th>Ghi chú</th>
                                                                        <th>Hiển thị Modal</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {cats.map((category) => (
                                                                        <tr key={category._id}>
                                                                            <td>{category.thutu}</td>
                                                                            <td>
                                                                                <div className="dropdown">
                                                                                    <button
                                                                                        className="btn btn-primary dropdown-toggle"
                                                                                        type="button"
                                                                                        data-bs-toggle="dropdown"
                                                                                        aria-expanded="false"
                                                                                    >
                                                                                        Thao tác <i className="las la-angle-right ms-1"></i>
                                                                                    </button>
                                                                                    <ul className="dropdown-menu">
                                                                                        <li>
                                                                                            <button
                                                                                                className="dropdown-item text-danger"
                                                                                                onClick={() => {
                                                                                                    setSelectedCategory(category);
                                                                                                    setIsModalOpen(true);
                                                                                                }}
                                                                                            >
                                                                                                Sửa
                                                                                            </button>
                                                                                        </li>
                                                                                        <li>
                                                                                            <button
                                                                                                className="dropdown-item text-danger"
                                                                                                onClick={() => {
                                                                                                    if (category._id) {
                                                                                                        handleDeleteCategory(category._id);
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                Xóa
                                                                                            </button>
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </td>
                                                                            <td>{category.name}</td>
                                                                            <td>{category.path}</td>
                                                                            <td
                                                                                style={{
                                                                                    maxWidth: "250px",
                                                                                    whiteSpace: "nowrap",
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                }}
                                                                                title={category.notes || "Không có"}
                                                                            >
                                                                                {category.notes || "Không có"}
                                                                            </td>
                                                                            <td
                                                                                style={{
                                                                                    maxWidth: "250px",
                                                                                    whiteSpace: "nowrap",
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                }}
                                                                                title={category.modal_show || "Không có"}
                                                                            >
                                                                                {category.modal_show || "Không có"}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="categories-empty-state">
                                                <div className="categories-empty-icon">
                                                    <i className="fas fa-inbox"></i>
                                                </div>
                                                <h5 className="mb-2">Không có nền tảng nào</h5>
                                                <p className="mb-0">Hãy thêm nền tảng mới để bắt đầu quản lý dịch vụ</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isModalOpen && (
                                    <CategoryModal
                                        key={selectedCategory?._id || 'new'}
                                        category={selectedCategory || null}
                                        platforms={platforms}
                                        onSave={async (data) => {
                                            await handleSaveCategory(data);
                                            // Reset form to empty and close modal after save
                                            setSelectedCategory(null);
                                            setIsModalOpen(false);
                                        }}
                                        onClose={() => {
                                            // Ensure clearing state when closing without saving
                                            setIsModalOpen(false);
                                            setSelectedCategory(null);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
