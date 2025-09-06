import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getConfigTele, updateConfigTele } from "../../../Utils/api"; // Đường dẫn tới file chứa các hàm API
import { loadingg } from "../../../JS/Loading"; // Giả sử bạn có hàm loadingg để hiển thị loading
const token = localStorage.getItem("token");

export default function ConfigTelePage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      loadingg("Đang tải cấu hình...", true, 9999999);
      try {
        const data = await getConfigTele(token);
        setConfig(data.data);
      } catch (err) {
        Swal.fire("Lỗi", err.message || "Không lấy được cấu hình Telegram", "error");
      } finally {
        setLoading(false);
        loadingg("Đang tải cấu hình...", false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    loadingg("Đang lưu cấu hình...", true, 9999999);

    try {
      await updateConfigTele(config, token);
      Swal.fire("Thành công", "Đã cập nhật cấu hình Telegram", "success");
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Cập nhật thất bại", "error");
    } finally {
      setSaving(false);
      loadingg("Đang lưu cấu hình...", false);
    }
  };

  if (loading) return <div>Đang tải cấu hình Telegram...</div>;

  return (
    <div className="container mt-4">
      <h2>Cấu hình Telegram</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Bot Token</label>
          <input
            type="text"
            className="form-control"
            name="botToken"
            value={config.botToken || ""}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Chat ID</label>
          <input
            type="text"
            className="form-control"
            name="chatId"
            value={config.chatId || ""}
            onChange={handleChange}
          />
        </div>
        {/* Thêm các trường khác nếu cần */}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </form>
    </div>
  );
}
