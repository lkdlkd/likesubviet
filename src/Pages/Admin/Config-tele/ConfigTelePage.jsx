import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getConfigTele, updateConfigTele } from "../../../Utils/api"; // Đường dẫn tới file chứa các hàm API
import { loadingg } from "../../../JS/Loading"; // Giả sử bạn có hàm loadingg để hiển thị loading

export default function ConfigTelePage() {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

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
  useEffect(() => {
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
      fetchConfig(); // Tải lại cấu hình sau khi cập nhật
      Swal.fire("Thành công", "Đã cập nhật cấu hình Telegram", "success");
    } catch (err) {
      Swal.fire("Lỗi", err.message || "Cập nhật thất bại", "error");
    } finally {
      setSaving(false);
      loadingg("Đang lưu cấu hình...", false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Đang tải cấu hình Telegram...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          /* Modern Telegram Config Styles */
          .telegram-config-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .telegram-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .telegram-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .telegram-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .telegram-header-content {
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .telegram-icon-circle {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            backdrop-filter: blur(10px);
          }
          
          .telegram-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .telegram-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .telegram-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
          }
          
          .telegram-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #e9ecef;
          }
          
          .telegram-section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e9ecef;
          }
          
          .telegram-section-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: white;
            font-size: 16px;
          }
          
          .telegram-section-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
          }
          
          .telegram-form-group {
            margin-bottom: 1.25rem;
          }
          
          .telegram-form-label {
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
          }
          
          .telegram-form-label i {
            margin-right: 6px;
            color: #6c757d;
            width: 14px;
            text-align: center;
          }
          
          .telegram-form-control {
            border-radius: 8px;
            border: 1px solid #d1d3e2;
            padding: 0.6rem 0.8rem;
            font-size: 14px;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .telegram-form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
            outline: none;
          }
          
          .telegram-form-control::placeholder {
            color: #adb5bd;
            font-style: italic;
          }
          
          .telegram-help-text {
            font-size: 12px;
            color: #6c757d;
            margin-top: 0.25rem;
            line-height: 1.4;
          }
          
          .telegram-help-text i {
            margin-right: 4px;
            color: #17a2b8;
          }
          
          .telegram-submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 0.7rem 1.5rem;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 1.5rem;
          }
          
          .telegram-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            color: white;
          }
          
          .telegram-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .input-icon-wrapper {
            position: relative;
          }
          
          .input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #6c757d;
            z-index: 1;
          }
          
          .input-with-icon {
            padding-left: 35px;
          }
          
          .telegram-info-card {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border: 1px solid #e1bee7;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .telegram-info-title {
            font-size: 14px;
            font-weight: 600;
            color: #4a148c;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
          }
          
          .telegram-info-title i {
            margin-right: 6px;
          }
          
          .telegram-info-text {
            font-size: 13px;
            color: #6a1b9a;
            margin: 0;
            line-height: 1.5;
          }
          
          @media (max-width: 768px) {
            .telegram-config-container {
              font-size: 13px;
            }
            
            .telegram-main-title {
              font-size: 20px;
            }
            
            .telegram-section {
              padding: 1rem;
            }
            
            .telegram-header-card .card-header {
              padding: 1rem 1.5rem;
            }
          }
        `}
      </style>
      <div className="telegram-config-container">
        <div className="row">
          <div className="col-md-12">
            <div className="telegram-header-card card">
              <div className="card-header">
                <div className="telegram-header-content">
                  <div className="telegram-icon-circle">
                    <i className="fab fa-telegram-plane"></i>
                  </div>
                  <h2 className="telegram-main-title">Cấu hình Telegram Bot</h2>
                </div>
              </div>
            </div>
            
            <div className="telegram-content-card">
              <div className="p-4">
                <div className="telegram-info-card">
                  <h6 className="telegram-info-title">
                    <i className="fas fa-info-circle"></i>
                    Hướng dẫn cấu hình Telegram Bot
                  </h6>
                  <p className="telegram-info-text">
                    Để cấu hình Telegram Bot, bạn cần tạo bot thông qua @BotFather trên Telegram và lấy Bot Token. 
                    Chat ID có thể lấy bằng cách gửi tin nhắn cho bot và truy cập 
                    <p>https://api.telegram.org/bot[BOT_TOKEN]/getUpdates</p>
                  </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Section 1: Bot chính */}
                  <div className="telegram-section">
                    <div className="telegram-section-header">
                      <div className="telegram-section-icon">
                        <i className="fas fa-robot"></i>
                      </div>
                      <h6 className="telegram-section-title">Cấu hình Bot chính</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="telegram-form-group">
                          <label className="telegram-form-label">
                            <i className="fas fa-key"></i>
                            Bot Token
                          </label>
                          <div className="input-icon-wrapper">
                            <i className="fas fa-robot input-icon"></i>
                            <input
                              type="text"
                              className="telegram-form-control input-with-icon"
                              name="botToken"
                              value={config.botToken || ""}
                              onChange={handleChange}
                              placeholder="Nhập Bot Token từ @BotFather"
                            />
                          </div>
                          <div className="telegram-help-text">
                            <i className="fas fa-lightbulb"></i>
                            Token được cung cấp bởi @BotFather khi tạo bot
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="telegram-form-group">
                          <label className="telegram-form-label">
                            <i className="fas fa-comments"></i>
                            Chat ID
                          </label>
                          <div className="input-icon-wrapper">
                            <i className="fas fa-hashtag input-icon"></i>
                            <input
                              type="text"
                              className="telegram-form-control input-with-icon"
                              name="chatId"
                              value={config.chatId || ""}
                              onChange={handleChange}
                              placeholder="Nhập Chat ID nhận thông báo"
                            />
                          </div>
                          <div className="telegram-help-text">
                            <i className="fas fa-lightbulb"></i>
                            ID của chat/group nhận thông báo từ bot
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Bot thông báo */}
                  <div className="telegram-section">
                    <div className="telegram-section-header">
                      <div className="telegram-section-icon">
                        <i className="fas fa-bell"></i>
                      </div>
                      <h6 className="telegram-section-title">Bot thông báo người dùng</h6>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <div className="telegram-form-group">
                          <label className="telegram-form-label">
                            <i className="fas fa-paper-plane"></i>
                            Bot Token thông báo
                          </label>
                          <div className="input-icon-wrapper">
                            <i className="fas fa-bell input-icon"></i>
                            <input
                              type="text"
                              className="telegram-form-control input-with-icon"
                              name="bot_notify"
                              value={config.bot_notify || ""}
                              onChange={handleChange}
                              placeholder="Nhập Bot Token cho thông báo người dùng"
                            />
                          </div>
                          <div className="telegram-help-text">
                            <i className="fas fa-lightbulb"></i>
                            Token của bot riêng dùng để gửi thông báo trực tiếp cho người dùng
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="telegram-submit-btn" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          Lưu cấu hình
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
