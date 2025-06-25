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
            loadingg("Đang tải danh sách khuyến mãi...");
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
        loadingg(isEditing ? "Đang cập nhật khuyến mãi..." : "Đang thêm khuyến mãi...");
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
        fetchPromotions();
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
                    loadingg("Đang xóa khuyến mãi...");
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
        <div className="row">
            <div className="col-md-12">
                <div className=" card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">{isEditing ? "Sửa Chương Trình Khuyến Mãi" : "Thêm Chương Trình Khuyến Mãi"}</h2>
                        <button className="btn btn-info mb-3" onClick={() => { setShowModal(true); setIsEditing(false); setFormData({ id: "", name: "", description: "", percentBonus: "", minAmount: 0, startDate: "", endDate: "" }); }}>
                            Thêm mới chương trình khuyến mãi
                        </button>
                    </div>
                    <PromotionModal
                        show={showModal}
                        handleClose={() => setShowModal(false)}
                        handleSubmit={handleSubmit}
                        formData={formData}
                        setFormData={setFormData}
                        isEditing={isEditing}
                    />
                    <div className="card-body">
                        <h2 className="mb-4">Danh Sách Chương Trình Khuyến Mãi</h2>
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
                                {promotions.map((promotion, index) => (
                                    <tr key={promotion._id}>
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
                                                            className="dropdown-item text-primary"
                                                            onClick={() => handleEdit(promotion)}
                                                        >
                                                            Sửa
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            className="dropdown-item text-danger"
                                                            onClick={() => handleDelete(promotion._id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                        <td>{promotion.name}</td>
                                        <td>{promotion.percentBonus}%</td>
                                        <td>{promotion.minAmount}</td>
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
                                        {/* <td>{formatDateTimeUTC(promotion.startTime)}</td>
                                        <td>{formatDateTimeUTC(promotion.endTime)}</td> */}
                                        <td>{promotion.repeatMonthly ? "Có" : "Không"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}