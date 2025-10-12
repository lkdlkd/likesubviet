import React, { useState, useEffect } from "react";
import { getConfigCard, updateConfigCard } from "@/Utils/api"; // Import từ api.js
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

const ConfigCard = () => {
  const [formData, setFormData] = useState({
    API_URLCARD: "",
    PARTNER_ID: "",
    PARTNER_KEY: "",
  });
  const [loading, setLoading] = useState(false);
  const fetchConfigCard = async () => {
    try {
      loadingg("Đang tải cấu hình thẻ nạp...", true, 9999999);
      const token = localStorage.getItem("token");
      const config = await getConfigCard(token);
      setFormData(config.data); // Gán dữ liệu từ API vào form
    } catch (error) {
      toast.error("Không thể tải cấu hình thẻ nạp!");
    } finally {
      loadingg("", false);
    }
  };
  // Lấy cấu hình thẻ nạp từ API
  useEffect(() => {
    fetchConfigCard();
  }, []);

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    loadingg("Đang lưu cấu hình thẻ nạp...", true, 9999999);
    try {
      const token = localStorage.getItem("token");
      await updateConfigCard(formData, token);
      fetchConfigCard(); // Tải lại cấu hình sau khi cập nhật
      toast.success("Cập nhật cấu hình thẻ nạp thành công!");
    } catch (error) {
      toast.error("Cập nhật cấu hình thẻ nạp thất bại!");
    } finally {
      setLoading(false);
      loadingg("", false);
    }
  };

  return (
    <div className="banking-content-card">
      <div className="banking-content-header">
        <h2 className="banking-content-title">
          <i className="fas fa-credit-card"></i>
          Cấu hình nạp thẻ
        </h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 p-3">
            {/* API_URLCARD */}
            <div className="col-md-12">
              <label className="form-label fw-semibold">
                <i className="fas fa-globe me-2 text-primary"></i>
                Domain gạch thẻ
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.API_URLCARD}
                onChange={(e) =>
                  setFormData({ ...formData, API_URLCARD: e.target.value })
                }
                placeholder="https://tenmien.com"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  padding: '0.6rem 1rem',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* PARTNER_ID */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="fas fa-id-card me-2 text-success"></i>
                PARTNER ID
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.PARTNER_ID}
                onChange={(e) =>
                  setFormData({ ...formData, PARTNER_ID: e.target.value })
                }
                placeholder="Nhập ID đối tác"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  padding: '0.6rem 1rem',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* PARTNER_KEY */}
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                <i className="fas fa-key me-2 text-warning"></i>
                PARTNER KEY
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.PARTNER_KEY}
                onChange={(e) =>
                  setFormData({ ...formData, PARTNER_KEY: e.target.value })
                }
                placeholder="Nhập khóa đối tác"
                style={{
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  padding: '0.6rem 1rem',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Nút lưu */}
          <div className="mt-4 p-3">
            <button
              type="submit"
              className="btn "
              disabled={loading}
              style={{
                background: loading ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white',
                padding: '0.7rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Lưu cấu hình
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigCard;