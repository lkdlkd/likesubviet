import { useState, useEffect } from "react";
import { deleteNotification } from "@/Utils/api";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Editthongbao from "./Editthongbao";
import Addthongbao from "./Addthongbao";
import Table from "react-bootstrap/Table";
import { useOutletContext } from "react-router-dom";
import { loadingg } from "@/JS/Loading";

export default function Taothongbaopage() {
  const token = localStorage.getItem("token") || null;

  const { notifications: initialNotifications } = useOutletContext();
  const [notification, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false); // Trạng thái hiển thị modal thêm thông báo

  useEffect(() => {
    if (Array.isArray(initialNotifications)) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  // Hàm xử lý xóa thông báo
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Hành động này sẽ xóa thông báo vĩnh viễn!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        setLoading(true);
        loadingg("Đang xóa thông báo...", 9999999);
        await deleteNotification(id, token);
        setNotifications((prev) => prev.filter((notification) => notification._id !== id));
        toast.success("Thông báo đã bị xóa thành công!");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("Đang tải...", false);
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (notification) => {
    setEditingNotification(notification);
  };

  // Đóng modal chỉnh sửa
  const closeEditModal = () => {
    setEditingNotification(null);
  };

  // Cập nhật thông báo sau khi chỉnh sửa
  const handleUpdate = (updatedNotification) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === updatedNotification._id ? updatedNotification : notification
      )
    );
  };

  // Thêm thông báo mới
  const handleAdd = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setNewlyAddedId(newNotification._id);
    setTimeout(() => setNewlyAddedId(null), 3000); // Xóa highlight sau 3 giây
  };

  return (
    <>
      <style>
        {`
          /* Modern Notification Page Styles */
          .notification-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .notification-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .notification-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .notification-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .notification-header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 1;
          }
          
          .notification-icon-circle {
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
          
          .notification-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .notification-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .notification-add-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.7rem 1.5rem;
            border-radius: 25px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .notification-add-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
            color: white;
          }
          
          .notification-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
          }
          
          .notification-content-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 1px solid #e8ecef;
            padding: 1rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .notification-content-title {
            font-size: 18px;
            font-weight: 600;
            color: #495057;
            margin: 0;
          }
          
          .notification-table-container {
            padding: 1.5rem;
          }
          
          .notification-loading {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
            font-size: 16px;
          }
          
          .notification-dropdown-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.3s ease;
          }
          
          .notification-dropdown-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            color: white;
          }
          
          .notification-row-highlight {
            background: linear-gradient(135deg, #e6ffe6 0%, #f0fff0 100%) !important;
            animation: highlightFade 3s ease-in-out;
          }
          
          @keyframes highlightFade {
            0% { background: linear-gradient(135deg, #e6ffe6 0%, #f0fff0 100%); }
            100% { background: transparent; }
          }
          
          .notification-empty-state {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
          }
          
          .notification-empty-state svg {
            margin-bottom: 1rem;
            opacity: 0.7;
          }
          
          .notification-empty-state p {
            font-size: 16px;
            font-weight: 500;
            margin: 0;
          }
          
          .notification-action-edit {
            color: #667eea !important;
            font-weight: 500;
          }
          
          .notification-action-edit:hover {
            color: #5a6fd8 !important;
            background: #f8f9ff;
          }
          
          .notification-action-delete {
            color: #dc3545 !important;
            font-weight: 500;
          }
          
          .notification-action-delete:hover {
            color: #c82333 !important;
            background: #fff5f5;
          }
          
          @media (max-width: 768px) {
            .notification-container {
              font-size: 13px;
            }
            
            .notification-main-title {
              font-size: 20px;
            }
            
            .notification-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .notification-header-content {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }
            
            .notification-table-container {
              padding: 1rem;
            }
          }
        `}
      </style>

      <div className="notification-container">
        <div className="notification-header-card">
          <div className="card-header">
            <div className="notification-header-content">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="notification-icon-circle">
                  <i className="fas fa-bell"></i>
                </div>
                <h2 className="notification-main-title">Quản lý thông báo</h2>
              </div>
              <button
                className="btn notification-add-btn"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus"></i>
                Tạo thông báo
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="col-md-12">
              <div className="card notification-content-card">
                <div className="notification-content-header">
                  <i className="fas fa-list"></i>
                  <h5 className="notification-content-title">Danh sách thông báo</h5>
                </div>
                <div className="notification-table-container">
                  {loading ? (
                    <div className="notification-loading">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Đang tải dữ liệu...
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-primary">
                          <tr>
                            <th>#</th>
                            <th>Thao tác</th>
                            <th>Tiêu đề</th>
                            <th>Nội dung</th>
                            <th>Ngày tạo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(notification) && notification.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center">
                                <div className="notification-empty-state">
                                  <svg
                                    width="184"
                                    height="152"
                                    viewBox="0 0 184 152"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g fill="none" fillRule="evenodd">
                                      <g transform="translate(24 31.67)">
                                        <ellipse
                                          fillOpacity=".8"
                                          fill="#F5F5F7"
                                          cx="67.797"
                                          cy="106.89"
                                          rx="67.797"
                                          ry="12.668"
                                        ></ellipse>
                                        <path
                                          d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                                          fill="#AEB8C2"
                                        ></path>
                                        <path
                                          d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z"
                                          fill="url(#linearGradient-1)"
                                          transform="translate(13.56)"
                                        ></path>
                                        <path
                                          d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                                          fill="#F5F5F7"
                                        ></path>
                                        <path
                                          d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                                          fill="#DCE0E6"
                                        ></path>
                                      </g>
                                      <path
                                        d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0c12.48 0 22.599 8.102 22.599 18.097 0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                                        fill="#DCE0E6"
                                      ></path>
                                      <g
                                        transform="translate(149.65 15.383)"
                                        fill="#FFF"
                                      >
                                        <ellipse
                                          cx="20.654"
                                          cy="3.167"
                                          rx="2.849"
                                          ry="2.815"
                                        ></ellipse>
                                        <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path>
                                      </g>
                                    </g>
                                  </svg>
                                  <p>Không có dữ liệu</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            notification.map((notification, idx) => (
                              <tr
                                key={notification._id || `notification-${idx}`}
                                className={notification._id === newlyAddedId ? "notification-row-highlight" : ""}
                              >
                                <td>{idx + 1}</td>
                                <td>
                                  <div className="dropdown">
                                    <button
                                      className="btn notification-dropdown-btn dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      Thao tác <i className="las la-angle-right ms-1"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                      <li>
                                        <button
                                          onClick={() => openEditModal(notification)}
                                          className="dropdown-item notification-action-edit"
                                        >
                                          <i className="fas fa-edit me-2"></i>
                                          Sửa
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          onClick={() => handleDelete(notification._id)}
                                          className="dropdown-item notification-action-delete"
                                        >
                                          <i className="fas fa-trash me-2"></i>
                                          Xóa
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </td>
                                <td>{notification.title}</td>
                                <td
                                  style={{
                                    maxWidth: "250px",
                                    whiteSpace: "normal",
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                  dangerouslySetInnerHTML={{ __html: notification.content }}
                                />
                                <td>
                                  {new Date(notification.created_at).toLocaleString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal thêm thông báo */}
          {showAddModal && (
            <Addthongbao
              token={token}
              onAdd={handleAdd}
              show={showAddModal}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {/* Modal chỉnh sửa thông báo */}
          {editingNotification && (
            <Editthongbao
              notification={editingNotification}
              token={token}
              onClose={closeEditModal}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </>
  );
}