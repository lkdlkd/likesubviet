'use client';

import { useState, useEffect } from "react";
import { addCategory, updateCategory, deleteCategory, getCategories, getPlatforms } from "@/Utils/api";
import Swal from "sweetalert2";
import CategoryModal from "@/Pages/Admin/Dich-vu/CategoryModal";

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
                const response = await updateCategory(selectedCategory._id, categoryData,token);
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
                const response = await addCategory(categoryData,token);
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
                await deleteCategory(categoryId,token);
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
        <div className="container">
            <h1 className="my-4">Quản lý Danh mục</h1>
            <button className="btn btn-primary mb-3" onClick={() => setIsModalOpen(true)}>
                Thêm Danh mục
            </button>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Hành động</th>
                        <th>Nền tảng</th>
                        <th>Tên</th>
                        <th>Đường dẫn</th>
                        <th>Ghi chú</th>
                        <th>Hiển thị Modal</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <tr key={category._id}>
                                <td>
                                    <button
                                        className="btn btn-warning me-2"
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn-danger"
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
                                </td>
                                <td>{category.platforms_id?.name || "Không xác định"}</td>
                                <td>{category.name}</td>
                                <td>{category.path}</td>
                                <td>{category.notes || "Không có"}</td>
                                <td>{category.modal_show || "Không có"}</td>
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
            </table>

            {isModalOpen && (
                <CategoryModal
                    category={selectedCategory}
                    platforms={platforms}
                    onSave={handleSaveCategory}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
