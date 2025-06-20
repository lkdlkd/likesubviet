import React, { useState, useEffect } from "react";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/Utils/api";

export default function PromotionForm() {
  const [promotions, setPromotions] = useState([]); // Danh sách chương trình khuyến mãi
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
  }); // Dữ liệu form
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const token = "your-auth-token"; // Thay bằng token thực tế

  // Lấy danh sách chương trình khuyến mãi
  const fetchPromotions = async () => {
    try {
      const data = await getPromotions(token);
      setPromotions(data);
    } catch (error) {
    //  console.error("Lỗi khi lấy danh sách chương trình khuyến mãi:", error.message);
    }
  };

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Cập nhật chương trình khuyến mãi
        await updatePromotion(formData.id, formData, token);
        alert("Cập nhật chương trình khuyến mãi thành công!");
      } else {
        // Tạo mới chương trình khuyến mãi
        await createPromotion(formData, token);
        alert("Tạo chương trình khuyến mãi thành công!");
      }
      setFormData({ id: "", name: "", discount: "", startDate: "", endDate: "" });
      setIsEditing(false);
      fetchPromotions(); // Cập nhật danh sách
    } catch (error) {
    //  console.error("Lỗi khi xử lý chương trình khuyến mãi:", error.message);
    }
  };

  // Xử lý khi nhấn nút sửa
  const handleEdit = (promotion) => {
    setFormData({
      id: promotion.id,
      name: promotion.name,
      discount: promotion.discount,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
    });
    setIsEditing(true);
  };

  // Xử lý khi nhấn nút xóa
  const handleDelete = async (id) => {
    try {
      await deletePromotion(id, token);
      alert("Xóa chương trình khuyến mãi thành công!");
      fetchPromotions(); // Cập nhật danh sách
    } catch (error) {
      console.error("Lỗi khi xóa chương trình khuyến mãi:", error.message);
    }
  };

  // Lấy danh sách chương trình khuyến mãi khi component được mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div>
      <h2>{isEditing ? "Sửa Chương Trình Khuyến Mãi" : "Thêm Chương Trình Khuyến Mãi"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên chương trình:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Giảm giá (%):</label>
          <input
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Ngày bắt đầu:</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Ngày kết thúc:</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
        <button type="submit">{isEditing ? "Cập nhật" : "Thêm mới"}</button>
      </form>

      <h2>Danh Sách Chương Trình Khuyến Mãi</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giảm giá</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion.id}>
              <td>{promotion.name}</td>
              <td>{promotion.discount}%</td>
              <td>{promotion.startDate}</td>
              <td>{promotion.endDate}</td>
              <td>
                <button onClick={() => handleEdit(promotion)}>Sửa</button>
                <button onClick={() => handleDelete(promotion.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}