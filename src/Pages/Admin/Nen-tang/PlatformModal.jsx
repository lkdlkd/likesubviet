import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadingg } from "@/JS/Loading";

// const platformLogos = {
//     Facebook: "/img/facebook.gif",
//     TikTok: "/img/tiktok.gif",
//     Instagram: "/img/instagram.gif",
//     YouTube: "/img/youtube.png",
//     Twitter: "/img/twitter.gif",
//     Telegram: "/img/telegram.gif",
//     Shopee: "/img/shoppe.gif",
//     Lazada: "/img/lazada.png",
//     Discord: "/img/discord.gif",
//     Thread: "/img/thread.gif",
//     traffic : "/img/traffic.gif",
// };
// Thay thế platformLogos bằng đoạn này:
const images = require.context('@/assets/img', false, /\.(png|jpe?g|gif)$/);
const platformLogos = {};
images.keys().forEach((key) => {
  // Lấy tên file không có đuôi mở rộng, viết hoa chữ cái đầu
  const name = key.replace('./', '').replace(/\.[^/.]+$/, '');
  platformLogos[name.charAt(0).toUpperCase() + name.slice(1)] = images(key);
});
const PlatformModal = ({ platform, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
  });

  // Đồng bộ hóa `formData` với `platform` khi `platform` thay đổi
  useEffect(() => {
    if (platform) {
      setFormData({
        name: platform.name || "",
        logo: platform.logo || "",
      });
    } else {
      setFormData({
        name: "",
        logo: "",
      });
    }
  }, [platform]);

  useEffect(() => {
    if (formData.name && platformLogos[formData.name]) {
      setFormData((prev) => ({ ...prev, logo: platformLogos[formData.name] }));
    }
  }, [formData.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    loadingg(platform ? "Đang cập nhật nền tảng..." : "Đang thêm nền tảng...");
    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!formData.name || !formData.logo) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      await onSave(formData); // Gửi dữ liệu lên component cha (có thể là async)
    } finally {
      loadingg("", false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{platform ? "Sửa Nền tảng" : "Thêm Nền tảng"}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Tên Nền tảng</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên nền tảng"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Logo (URL)</label>
            <input
              type="text"
              className="form-control"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="Nhập URL logo"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Chọn logo nền tảng</label>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 6, padding: 8 }}>
              <div className="row g-2">
                {Object.entries(platformLogos).map(([platform, url], idx) => (
                  <div className="col-4 col-md-3" key={idx}>
                    <div
                      onClick={() => setFormData({ ...formData, logo: url })}
                      style={{
                        border: formData.logo === url ? '2px solid #007bff' : '1px solid #ccc',
                        borderRadius: 8,
                        padding: 6,
                        cursor: 'pointer',
                        textAlign: 'center',
                        background: formData.logo === url ? '#eaf4ff' : '#fff',
                        boxShadow: formData.logo === url ? '0 0 4px #007bff55' : 'none',
                      }}
                    >
                      <img src={url} alt={platform} style={{ maxWidth: 40, maxHeight: 40, objectFit: 'contain', marginBottom: 4 }} />
                      <div style={{ fontSize: 13 }}>{platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Xem trước logo</label>
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo Preview"
                style={{ maxWidth: "100px", height: "auto" }}
              />
            ) : (
              <p>Chưa có logo được chọn</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            {platform ? "Cập Nhật" : "Thêm"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PlatformModal;