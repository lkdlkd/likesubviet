import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadingg } from "@/JS/Loading";

const images = require.context('@/assets/img/', false, /\.(png|jpe?g|gif)$/); // false: không lấy thư mục con
const platformLogos = {};
images.keys().forEach((key) => {
  const name = key.replace('./', '').replace(/\.[^/.]+$/, '');
  if (!name.includes('/')) {
    platformLogos[name.charAt(0).toUpperCase() + name.slice(1)] = images(key);
  }
});
const PlatformModal = ({ platform, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    thutu: "",
  });
  // Đồng bộ hóa `formData` với `platform` khi `platform` thay đổi
  useEffect(() => {
    if (platform) {
      setFormData({
        name: platform.name || "",
        logo: platform.logo || "",
        thutu: platform.thutu || "",
      });
    } else {
      setFormData({
        name: "",
        logo: "",
        thutu: "",
      });
    }
  }, [platform]);

  useEffect(() => {
    if (
      formData.name &&
      platformLogos[formData.name] &&
      (!formData.logo || formData.logo === "")
    ) {
      setFormData((prev) => ({ ...prev, logo: platformLogos[formData.name] }));
    }
    // eslint-disable-next-line
  }, [formData.name]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    loadingg(platform ? "Đang cập nhật nền tảng..." : "Đang thêm nền tảng...", true, 9999999);
    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!formData.name || !formData.logo) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      await onSave(formData); // Gửi dữ liệu lên component cha (có thể là async)
      // Reset form data về rỗng sau khi lưu thành công
      setFormData({ name: "", logo: "", thutu: "" });
    } finally {
      loadingg("", false);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered size="lg" className="modern-modal">
      <Modal.Header closeButton className="bg-gradient-primary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <i className={`fas ${platform ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
          {platform ? "Sửa Nền tảng" : "Thêm Nền tảng"}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body className="p-4 bg-light">
          <div className="row">
            {/* Cột trái - Thông tin cơ bản */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Thông tin nền tảng
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-sort-numeric-up me-1 text-primary"></i>
                      Thứ tự hiển thị <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2"
                      value={formData.thutu}
                      onChange={e => setFormData({ ...formData, thutu: Number(e.target.value) })}
                      placeholder="1"
                      min={0}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-layer-group me-1 text-primary"></i>
                      Tên Nền tảng <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Facebook, TikTok, Instagram, ..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-image me-1 text-primary"></i>
                      URL Logo <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg border-2"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="Nhập URL logo hoặc chọn từ thư viện"
                      required
                    />
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Có thể nhập URL trực tiếp hoặc chọn từ thư viện bên phải
                    </small>
                  </div>

                  {/* Preview Logo */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark">
                      <i className="fas fa-eye me-1 text-success"></i>
                      Xem trước logo
                    </label>
                    <div className="logo-preview-container border rounded p-3 text-center bg-white">
                      {formData.logo ? (
                        <div className="logo-preview">
                          <img
                            src={formData.logo}
                            alt="Logo Preview"
                            className="img-fluid rounded shadow-sm"
                            style={{ maxWidth: "120px", maxHeight: "80px", objectFit: "contain" }}
                          />
                          <div className="mt-2">
                            <span className="badge bg-success">
                              <i className="fas fa-check me-1"></i>
                              Logo đã chọn
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="no-logo text-muted">
                          <i className="fas fa-image fa-3x mb-2 opacity-50"></i>
                          <p className="mb-0">Chưa có logo được chọn</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải - Thư viện logo */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-images me-2"></i>
                    Thư viện logo
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted fw-bold">
                      <i className="fas fa-mouse-pointer me-1"></i>
                      Click vào logo để chọn
                    </small>
                  </div>
                  <div className="logo-gallery" style={{ 
                    height: '400px', 
                    overflowY: 'auto',
                    overflowX: 'auto',
                    border: '2px solid #e9ecef',
                    borderRadius: '12px',
                    padding: '15px',
                    background: 'white'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      minWidth: '240px' // Minimum width to ensure 3 columns
                    }}>
                      {Object.entries(platformLogos).map(([platform, url], idx) => (
                        <div key={idx}>
                          <div
                            onClick={() => setFormData({ ...formData, logo: url })}
                            className={`logo-item ${formData.logo === url ? 'selected' : ''}`}
                            style={{
                              border: formData.logo === url ? '3px solid #007bff' : '2px solid #e9ecef',
                              borderRadius: '12px',
                              padding: '8px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              background: formData.logo === url ? '#e7f3ff' : '#fff',
                              boxShadow: formData.logo === url ? '0 4px 12px rgba(0, 123, 255, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              transform: formData.logo === url ? 'translateY(-2px)' : 'none',
                              height: '80px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.logo !== url) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.logo !== url) {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }
                            }}
                          >
                            <img 
                              src={url} 
                              alt={platform} 
                              style={{ 
                                maxWidth: '35px', 
                                maxHeight: '35px', 
                                objectFit: 'contain',
                                marginBottom: '4px'
                              }} 
                            />
                            {/* <div style={{ 
                              fontSize: '9px', 
                              fontWeight: '600',
                              color: formData.logo === url ? '#007bff' : '#6c757d',
                              textAlign: 'center',
                              lineHeight: '1.1',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%'
                            }}>
                              {platform.length > 8 ? platform.slice(0, 8) + '...' : platform}
                            </div> */}
                            {formData.logo === url && (
                              <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                                <i className="fas fa-check-circle text-primary" style={{ fontSize: '12px' }}></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer className="bg-white border-0 px-4 py-3">
          <div className="d-flex justify-content-between w-100">
            <Button 
              variant="outline-secondary" 
              onClick={onClose}
              className="px-4 py-2 fw-bold"
              style={{ minWidth: '120px' }}
            >
              <i className="fas fa-times me-2"></i>
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant={platform ? "warning" : "success"}
              className="px-4 py-2 fw-bold shadow-sm"
              style={{ minWidth: '160px' }}
            >
              <i className={`fas ${platform ? 'fa-save' : 'fa-plus'} me-2`}></i>
              {platform ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PlatformModal;