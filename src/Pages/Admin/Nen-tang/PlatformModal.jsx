import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const platformLogos = {
  Facebook: "https://media4.giphy.com/media/pejyg6fy1JpoQuLQQp/giphy.gif?cid=6c09b952jc5fjcbbzw5nsgw5fhpel13egpoh3jza1ala341a&ep=v1_stickers_search&rid=giphy.gif&ct=s",
  TikTok: "https://i.pinimg.com/originals/77/97/19/7797190f0f3efd9d5b0b96963d97ed5a.gif",
  Instagram: "https://media2.giphy.com/media/QZOxRp5tZTemNQzpgc/giphy.gif?cid=6c09b952ja1qrjvvisx2jgbvrdj5ayheqlguw0cdayhndzo5&ep=v1_gifs_search&rid=giphy.gif&ct=g",
  YouTube: "https://media0.giphy.com/media/SVTPWzQWPCUKfji4fp/giphy.gif?cid=6c09b9523af8s3o9dzscarda6feloua8n139hfndl2m3gbm3&ep=v1_stickers_search&rid=giphy.gif&ct=s",
  Twitter: "https://cliply.co/wp-content/uploads/2021/09/CLIPLY_372109260_TWITTER_LOGO_400.gif",
  Telegram: "https://moein.video/wp-content/uploads/2022/12/Telegram-Logo-GIF-Telegram-Icon-GIF-Royalty-Free-Animated-Icon-GIF-1080px-after-effects-project.gif",
  Shopee :"https://media4.giphy.com/media/4bjIfp3L4iCnare4iU/200w.gif",
  Thread : "https://media.baamboozle.com/uploads/images/1465982/582bed70-c7c4-457f-95c9-c39811ac085f.gif",
};

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.name || !formData.logo) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    onSave(formData); // Gửi dữ liệu lên component cha
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
            <select
              className="form-select"
              onChange={(e) => setFormData({ ...formData, logo: platformLogos[e.target.value] })}
              value={Object.keys(platformLogos).find((key) => platformLogos[key] === formData.logo) || ""}
            >
              <option value="">-- Chọn nền tảng --</option>
              {Object.keys(platformLogos).map((platform, index) => (
                <option key={index} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
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