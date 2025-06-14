'use client';

import { useState, useEffect } from "react";
import { addCategory, updateCategory, deleteCategory, getCategories, getPlatforms } from "@/Utils/api";
import Swal from "sweetalert2";
import CategoryModal from "@/Pages/Admin/Dich-vu/CategoryModal";
import Table from "react-bootstrap/Table"; // Import Table từ react-bootstrap

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [platforms, setPlatforms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const token = localStorage.getItem("token") || "";
    const fetchCategories = async () => {
        try {
            const response = await getCategories(token);
            setCategories(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể lấy danh sách danh mục.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        }
    };

    const fetchPlatforms = async () => {
        try {
            const response = await getPlatforms(token);
            setPlatforms(response.platforms || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nền tảng:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể lấy danh sách nền tảng.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchPlatforms();
    }, []);

    const handleSaveCategory = async (categoryData) => {
        try {
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
            setIsModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error("Lỗi khi lưu danh mục:", error);
            Swal.fire({
                title: "Lỗi",
                text: "Không thể lưu danh mục.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!categoryId) {
            console.error("Không thể xóa danh mục: `_id` không tồn tại.");
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
                await deleteCategory(categoryId, token);
                setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
                Swal.fire("Đã xóa!", "Danh mục đã được xóa.", "success");
            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                Swal.fire({
                    title: "Lỗi",
                    text: "Không thể xóa danh mục.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
            }
        }
    };

    return (

        <div className="row">
            <div className="col-md-12">
                <div className=" card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">Quản lý dịch vụ</h2>
                        <button className="btn btn-info mb-3" onClick={() => setIsModalOpen(true)}>
                            Thêm Danh mục
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <Table striped bordered hover responsive>
                                <thead className="table-primary">
                                    <tr>
                                        <th>#</th>
                                        <th>Thao tác</th>
                                        <th>Nền tảng</th>
                                        <th>Tên</th>
                                        <th>Đường dẫn</th>
                                        <th>Ghi chú</th>
                                        <th>Hiển thị Modal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length > 0 ? (
                                        categories.map((category, index) => (
                                            <tr key={category._id}>
                                                <td>{index + 1}</td>
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
                                                                        } else {
                                                                            console.error("Không thể xóa danh mục: `_id` không tồn tại.");
                                                                        }
                                                                    }}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </td>
                                                <td>{category.platforms_id?.name || "Không xác định"}</td>
                                                <td>{category.name}</td>
                                                <td>{category.path}</td>
                                                <td
                                                    style={{
                                                        maxWidth: "250px",
                                                        whiteSpace: "nowrap", // Không cho phép xuống dòng
                                                        overflow: "hidden", // Ẩn nội dung tràn
                                                        textOverflow: "ellipsis", // Hiển thị dấu "..."
                                                    }}
                                                    title={category.notes || "Không có"} // Hiển thị nội dung đầy đủ khi hover
                                                >
                                                    {category.notes || "Không có"}
                                                </td>
                                                <td
                                                    style={{
                                                        maxWidth: "250px",
                                                        whiteSpace: "nowrap", // Không cho phép xuống dòng
                                                        overflow: "hidden", // Ẩn nội dung tràn
                                                        textOverflow: "ellipsis", // Hiển thị dấu "..."
                                                    }}
                                                    title={category.modal_show || "Không có"} // Hiển thị nội dung đầy đủ khi hover
                                                >
                                                    {category.modal_show || "Không có"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center">
                                                Không có danh mục nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {isModalOpen && (
                            <CategoryModal
                                category={selectedCategory}
                                platforms={platforms}
                                onSave={handleSaveCategory}
                                onClose={() => setIsModalOpen(false)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
