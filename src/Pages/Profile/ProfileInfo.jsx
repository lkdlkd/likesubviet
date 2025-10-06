"use client";

import React from "react";
import Swal from "sweetalert2";

export default function ProfileInfo({ user }) {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      Swal.fire({
        title: "Thành công",
        text: `Copy thành công`,
        icon: "success",
        confirmButtonText: "Xác nhận",
      })
    );
  };

  // Hiển thị token dạng ẩn: lấy trước 12 ký tự, sau đó thêm ********
  const maskedToken = React.useMemo(() => {
    if (!user?.token) return "Bạn chưa tạo Api Token!";
    const t = String(user.token);
    const prefixLen = Math.min(12, t.length);
    return t.slice(0, prefixLen) + "********";
  }, [user?.token]);

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-header bg-gradient-primary text-white">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <i className="fas fa-user-circle me-2"></i>
          Thông tin cá nhân
        </h5>
      </div>
        <div className="card-body">
          <form>
            <div className="row">
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="username" className="form-label fw-semibold">
                  <i className="fas fa-user text-primary me-2"></i>
                  Tài khoản:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  disabled
                  value={user?.username || ""}
                />
              </div>
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="balance" className="form-label fw-semibold">
                  <i className="fas fa-wallet text-success me-2"></i>
                  Số dư:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="balance"
                  disabled
                  value={Number(Math.round(user?.balance || 0)).toLocaleString("en-US")}
                />
              </div>
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="capbac" className="form-label fw-semibold">
                  <i className="fas fa-medal text-warning me-2"></i>
                  Cấp bậc:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="capbac"
                  disabled
                  value={user?.capbac || ""}
                />
              </div>
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="tongnapthang" className="form-label fw-semibold">
                  <i className="fas fa-calendar-alt text-info me-2"></i>
                  Tổng nạp tháng:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tongnapthang"
                  disabled
                  value={Number(user?.tongnapthang || 0).toLocaleString("en-US")}
                />
              </div>
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="tongnap" className="form-label fw-semibold">
                  <i className="fas fa-chart-line text-secondary me-2"></i>
                  Tổng nạp:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tongnap"
                  disabled
                  value={Number(user?.tongnap || 0).toLocaleString("en-US")}
                />
              </div>
              <div className="col-md-6 form-group mb-3">
                <label htmlFor="created_at" className="form-label fw-semibold">
                  <i className="fas fa-clock text-dark me-2"></i>
                  Thời gian đăng ký:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="created_at"
                  disabled
                  value={new Date(user?.createdAt || "").toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                />
              </div>
              <div className="col-md-12 form-group mb-3">
                <label htmlFor="api_token" className="form-label fw-semibold">
                  <i className="fas fa-key text-danger me-2"></i>
                  Api Key: 
                  <span className="badge bg-danger ms-2">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    Nếu bị lộ hãy đổi mật khẩu
                  </span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    id="api_token"
                    readOnly
                    onClick={() =>
                      handleCopy(
                        user?.token ? user.token : "Bạn chưa tạo Api Token!"
                      )
                    }
                    value={maskedToken}
                    placeholder="Bạn cần ấn thay đổi Token"
                    style={{cursor: 'pointer'}}
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        user?.token ? user.token : "Bạn chưa tạo Api Token!"
                      )
                    }
                    className="btn btn-outline-primary"
                    type="button"
                    id="btn-reload-token"
                  >
                    <i className="fas fa-copy me-1"></i>
                    COPY
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
    }