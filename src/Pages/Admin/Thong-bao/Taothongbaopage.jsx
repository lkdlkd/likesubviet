import { useState, useEffect } from "react";
import { deleteNotification } from "@/Utils/api";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import Editthongbao from "./Editthongbao";
import Addthongbao from "./Addthongbao";
import Table from "react-bootstrap/Table";
import { useOutletContext } from "react-router-dom";

export default function Taothongbaopage() {
  const token = localStorage.getItem("token") || null;

  const { notifications: initialNotifications } = useOutletContext();
  const [notification, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);

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
        await deleteNotification(id, token);
        setNotifications((prev) => prev.filter((notification) => notification._id !== id));
        toast.success("Thông báo đã bị xóa thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
      toast.error("Lỗi khi xóa thông báo. Vui lòng thử lại!");
    } finally {
      setLoading(false);
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
      {/* Form thêm thông báo */}
      <Addthongbao token={token} onAdd={handleAdd} />
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
                  <motion.tbody layout>
                    <AnimatePresence>
                      {Array.isArray(notification) &&
                        notification.map((notification, idx) => (
                          <motion.tr
                            key={notification._id || `notification-${idx}`}
                            layout
                            initial={
                              notification._id === newlyAddedId
                                ? { scale: 0.8, opacity: 0 }
                                : { opacity: 0, y: -10 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.4 }}
                            style={{
                              backgroundColor: notification._id === newlyAddedId ? "#e6ffe6" : "transparent",
                            }}
                          >
                            <td>{idx + 1}</td>
                            <td>
                              <button
                                onClick={() => openEditModal(notification)}
                                className="btn btn-warning btn-sm me-1"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(notification._id)}
                                className="btn btn-danger btn-sm"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
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
                          </motion.tr>
                        ))}
                    </AnimatePresence>
                  </motion.tbody>
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