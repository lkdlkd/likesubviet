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
      loadingg(false);
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
    <div className="row">
      {/* Nút tạo thông báo */}
      <div className="col-md-12 mb-3">
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Tạo thông báo
        </button>
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

      {/* Danh sách thông báo */}
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Danh sách thông báo</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Đang tải dữ liệu...</p>
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
                          <div>
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
                            <p className="font-semibold">Không có dữ liệu</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      notification.map((notification, idx) => (
                        <tr
                          key={notification._id || `notification-${idx}`}
                          style={{
                            backgroundColor: notification._id === newlyAddedId ? "#e6ffe6" : "transparent",
                          }}
                        >
                          <td>{idx + 1}</td>
                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-primary dropdown-toggle"
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
                                    className="dropdown-item text-primary"
                                  >
                                    Sửa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleDelete(notification._id)}
                                    className="dropdown-item text-danger"
                                  >
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
  );
}