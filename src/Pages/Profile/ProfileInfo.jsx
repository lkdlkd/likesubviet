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
    <div className="col-md-6">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Thông tin cá nhân</h5>
        </div>
        <div className="card-body">
          <form>
            <div className="row">
              <div className="col-md-6 form-group">
                <label htmlFor="username" className="form-label">
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
              <div className="col-md-6 form-group">
                <label htmlFor="balance" className="form-label">
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
              <div className="col-md-6 form-group">
                <label htmlFor="capbac" className="form-label">
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
              <div className="col-md-6 form-group">
                <label htmlFor="tongnapthang" className="form-label">
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
              <div className="col-md-6 form-group">
                <label htmlFor="tongnap" className="form-label">
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
              <div className="col-md-6 form-group">
                <label htmlFor="created_at" className="form-label">
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
              <div className="col-md-12 form-group">
                <label htmlFor="api_token" className="form-label">
                  Api Key: <span className="text-danger">Nếu bị lộ hãy đổi mật khẩu</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="api_token"
                    readOnly
                    onClick={() =>
                      handleCopy(
                        user?.token ? user.token : "Bạn chưa tạo Api Token!"
                      )
                    }
                    value={maskedToken}
                    placeholder="Bạn cần ấn thay đổi Token"
                  />
                  <button
                    onClick={() =>
                      handleCopy(
                        user?.token ? user.token : "Bạn chưa tạo Api Token!"
                      )
                    }
                    className="btn btn-primary"
                    type="button"
                    id="btn-reload-token"
                  >
                    <i className="ti ti-copy"></i>
                    COPY
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}