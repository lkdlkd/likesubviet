'use client';
import { useState, useEffect } from "react";
import Adddichvu from "./Adddichvu";
import Table from "react-bootstrap/Table";
import { deleteServer, getCategories, getServer, updateServer } from "@/Utils/api";
import Swal from "sweetalert2";
import EditModal from "./EditModal";
import { toast } from "react-toastify";

export default function Dichvupage() {
  const [servers, setServers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedServers, setSelectedServers] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // Trạng thái hiển thị modal chỉnh sửa
  const [selectedService, setSelectedService] = useState(null); // Dịch vụ được chọn để chỉnh sửa

  const token = localStorage.getItem("token") || "";

  const fetchServers = async () => {
    try {
      const response = await getServer(token, currentPage, limit, debouncedSearch);
      setServers(response.data || []);
      setPagination(response.pagination || {
        totalItems: 0,
        currentPage: 1,
        totalPages: 1,
        pageSize: limit,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách server:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lấy danh sách server.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await getCategories(token);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lấy danh sách danh mục.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    }
  };

  useEffect(() => {
    fetchServers();
    fetchCategories();
  }, [currentPage, limit, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Đặt lại về trang đầu tiên khi tìm kiếm
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1); // Đặt lại về trang đầu tiên
  };

  const handleEdit = (server) => {
    setSelectedService(server); // Lưu dịch vụ được chọn
    setShowEditModal(true); // Hiển thị modal
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedServer(null);
  };

  const handleDelete = async (serverId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteServer(serverId, token);
        Swal.fire("Đã xóa!", "Server đã được xóa thành công.", "success");
        fetchServers(); // Tải lại danh sách server sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa server:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa server.", "error");
      }
    }
  };



  return (
    <div className="main-content">
      <div className="col-md-12">
        <div className="card">
          <div className="card-body">
            <h2 className="smmdv-title">Danh Sách Server</h2>
            <Adddichvu
              categories={categories}
              token={token}
              editMode={editMode}
              initialData={selectedServer || {}}
              onClose={handleCancelEdit}
              onSuccess={() => {
                setEditMode(false);
                setSelectedServer(null);
                fetchServers();
              }}
            />
            <div className="col-md-6 mb-3">
              <input
                className="form-control"
                type="text"
                placeholder="Tìm kiếm theo Mã gói hoặc Service ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Hiển thị:</label>
              <select className="form-select" value={limit} onChange={handleLimitChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              {/* <span>mục</span> */}
            </div>
            <div className=" justify-content-end mb-3">
              <button
                className="btn btn-danger"
                onClick={async () => {
                  if (selectedServers.length === 0) {
                    Swal.fire("Thông báo", "Vui lòng chọn ít nhất một server để xóa.", "info");
                    return;
                  }

                  const result = await Swal.fire({
                    title: "Bạn có chắc chắn muốn xóa?",
                    text: "Hành động này không thể hoàn tác!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Xóa",
                    cancelButtonText: "Hủy",
                  });

                  if (result.isConfirmed) {
                    try {
                      await Promise.all(
                        selectedServers.map((serverId) => deleteServer(serverId, token))
                      );
                      Swal.fire("Đã xóa!", "Các server đã được xóa thành công.", "success");
                      setSelectedServers([]); // Xóa danh sách đã chọn
                      fetchServers(); // Tải lại danh sách server
                    } catch (error) {
                      console.error("Lỗi khi xóa server:", error);
                      Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa server.", "error");
                    }
                  }
                }}
              >
                Xóa server đã chọn
              </button>
            </div>
            <div className="rsp-table">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServers(servers.map((server) => server._id)); // Chọn tất cả
                          } else {
                            setSelectedServers([]); // Bỏ chọn tất cả
                          }
                        }}
                        checked={
                          selectedServers.length === servers.length && servers.length > 0
                        }
                      />
                    </th>
                    <th>#</th>
                    <th>THAO TÁC</th>
                    <th>TÊN</th>
                    <th>GIÁ</th>
                    <th>NGUỒN</th>
                    <th>Thời gian thêm</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.length > 0 ? (
                    servers.map((serverItem, index) => (
                      <tr key={serverItem.id || serverItem.serviceId}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedServers.includes(serverItem._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServers((prev) => [...prev, serverItem._id]); // Thêm vào danh sách đã chọn
                              } else {
                                setSelectedServers((prev) =>
                                  prev.filter((id) => id !== serverItem._id) // Loại bỏ khỏi danh sách đã chọn
                                );
                              }
                            }}
                          />
                        </td>
                        <td>{(pagination.currentPage - 1) * limit + index + 1}</td>

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
                                  className="dropdown-item text-warning"
                                  onClick={() => handleEdit(serverItem)}
                                >
                                  Sửa
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => handleDelete(serverItem._id || "")}
                                >
                                  Xóa
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                        <td style={{
                          maxWidth: "350px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}>
                          <ul>
                            <li>
                              <b>Mã gói</b> : {serverItem.Magoi}
                            </li>
                            <li>
                              <b>Tên</b> : {serverItem.maychu} {serverItem.name}
                            </li>

                            <li>
                              <b>Nền tảng</b> : {serverItem.type}
                            </li>
                            <li>
                              <b>Dịch vụ</b> : {serverItem.category}
                            </li>

                            <li>
                              <b>Min-Max</b> : {serverItem.min} - {serverItem.max}
                            </li>
                            <li>
                              <b>Trạng thái</b> :{" "}
                              {serverItem.isActive ? (
                                <span className="badge bg-success">Hoạt động</span>
                              ) : (
                                <span className="badge bg-danger">Đóng</span>
                              )}
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul>
                            <li>
                              <b>Giá gốc</b> : {serverItem.originalRate}
                            </li>
                            <li>
                              <b>Giá</b> : {serverItem.rate}
                            </li>
                          </ul>
                        </td>
                        <td>
                          <ul>
                            <li>
                              <b>Nguồn</b>: {serverItem.DomainSmm}
                            </li>
                            <li>
                              <b>Máy chủ</b>: {serverItem.serviceId}
                            </li>
                            <li>
                              <b>Trạng thái</b>:{" "}
                              <span className="badge bg-success">Hoạt động</span>
                            </li>
                          </ul>
                        </td>
                        <td>{new Date(serverItem.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14} style={{ textAlign: "center" }}>
                        Không có server nào được tìm thấy.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            {pagination.totalItems > 0 && pagination.totalPages > 1 && (
              <div className="pagination d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <EditModal
        show={showEditModal} // Hiển thị modal khi true
        onClose={() => setShowEditModal(false)} // Đóng modal
        initialData={selectedService} // Dữ liệu ban đầu của dịch vụ
        token={token} // Token để gọi API
      />
    </div>
  );
}