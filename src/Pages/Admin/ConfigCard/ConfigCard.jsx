import React, { useState, useEffect } from "react";
import { getConfigCard, updateConfigCard } from "@/Utils/api"; // Import từ api.js
import { toast } from "react-toastify";

const ConfigCard = () => {
  const [formData, setFormData] = useState({
    API_URLCARD: "",
    PARTNER_ID: "",
    PARTNER_KEY: "",
  });
  const [loading, setLoading] = useState(false);

  // Lấy cấu hình thẻ nạp từ API
  useEffect(() => {
    const fetchConfigCard = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = await getConfigCard(token);
        setFormData(config.data); // Gán dữ liệu từ API vào form
      } catch (error) {
        console.error("Lỗi khi lấy cấu hình thẻ nạp:", error.message);
        toast.error("Không thể tải cấu hình thẻ nạp!");
      }
    };

    fetchConfigCard();
  }, []);

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await updateConfigCard(formData, token);
      toast.success("Cập nhật cấu hình thẻ nạp thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật cấu hình thẻ nạp:", error.message);
      toast.error("Cập nhật cấu hình thẻ nạp thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className=" card">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 className="card-title">Cấu hình nạp thẻ</h2>
          </div>
          <div className="card-body">      <h2>Cấu hình thẻ nạp</h2>
            <form onSubmit={handleSubmit}>
              {/* API_URLCARD */}
              <div className="mb-3">
                <label className="form-label">Domain gạch thẻ</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.API_URLCARD}
                  onChange={(e) => setFormData({ ...formData, API_URLCARD: e.target.value })}
                  placeholder="Nhập URL API thẻ nạp"
                  required
                />
              </div>

              {/* PARTNER_ID */}
              <div className="mb-3">
                <label className="form-label">PARTNER ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.PARTNER_ID}
                  onChange={(e) => setFormData({ ...formData, PARTNER_ID: e.target.value })}
                  placeholder="Nhập ID đối tác"
                  required
                />
              </div>

              {/* PARTNER_KEY */}
              <div className="mb-3">
                <label className="form-label">PARTNER KEY</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.PARTNER_KEY}
                  onChange={(e) => setFormData({ ...formData, PARTNER_KEY: e.target.value })}
                  placeholder="Nhập khóa đối tác"
                  required
                />
              </div>

              {/* Nút lưu */}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigCard;