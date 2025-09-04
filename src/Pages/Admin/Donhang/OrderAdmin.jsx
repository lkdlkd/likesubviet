import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { getOrders, updateOrderStatus } from "@/Utils/api";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useOutletContext } from "react-router-dom";

const statusOptions = [
  { value: "Completed", label: "Hoàn thành" },
  { value: "In progress", label: "Đang chạy" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Partial", label: "Hoàn một phần" },
  { value: "Canceled", label: "Đã hủy" },
];

const OrderAdmin = () => {
  const { token, categories } = useOutletContext();

  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  // Lấy danh sách nền tảng (type) duy nhất từ categories
  const uniqueTypes = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return Array.from(new Set(categories.map((cat) => cat.platforms_id?.name)));
  }, [categories]);

  const typeOptions = uniqueTypes.map((type) => ({ value: type, label: type }));

  const categoryOptions = useMemo(() => {
    if (!selectedType || !Array.isArray(categories)) return [];
    const filtered = categories.filter((cat) => cat.platforms_id?.name === selectedType.value);
    return filtered.map((cat) => ({ value: cat.name, label: cat.name }));
  }, [categories, selectedType]);

  const handleTypeChange = (option) => {
    setSelectedType(option);
    setSelectedCategory(null);
  };
  const handleCategoryChange = (option) => {
    setSelectedCategory(option);
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await getOrders(
        token,
        currentPage,
        limit,
        selectedCategory ? selectedCategory.value : "",
        searchTerm.trim(),
        selectedStatus
      );
      setOrders(response.orders || []);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setOrders([]);
      // toast.error("Không có đơn hàng nào!");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, currentPage, limit, selectedStatus, selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setForm({
      start: order.start ?? "",
      dachay: order.dachay ?? "",
      status: order.status ?? "",
      iscancel: order.iscancel ?? false,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.Madon, form, token);
      toast.success("Cập nhật trạng thái thành công!");
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(`Lỗi khi cập nhật trạng thái! ${err.message}`);
    }
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h2 className="card-title">Lịch sử tạo đơn (Admin)</h2>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 col-lg-3">
                <div className="form-group">
                  <label>Chọn Nền Tảng:</label>
                  <Select
                    value={selectedType}
                    onChange={handleTypeChange}
                    options={typeOptions}
                    placeholder="Chọn"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="form-group">
                  <label>Phân Loại:</label>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                    placeholder="Chọn"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="form">
                  <label htmlFor="order_code" className="form-label">
                    Mã đơn hàng hoặc link
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm dữ liệu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center"
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="form-group">
                  <label>Số đơn hàng/trang:</label>
                  <select
                    className="form-select"
                    value={limit}
                    onChange={handleLimitChange}
                  >
                    <option value={10}>10 nhật ký</option>
                    <option value={25}>25 nhật ký</option>
                    <option value={50}>50 nhật ký</option>
                    <option value={100}>100 nhật ký</option>
                    <option value={500}>500 nhật ký</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="form-group">
                <label>Trạng thái:</label>
                <Select
                  value={statusOptions.find((option) => option.value === selectedStatus)}
                  onChange={(option) => setSelectedStatus(option ? option.value : "")}
                  options={statusOptions}
                  placeholder="Chọn trạng thái"
                  isClearable
                />
              </div>
            </div>
            <div className="table-responsive table-bordered">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Thao tác</th>
                    <th>Username</th>
                    <th>Link</th>
                    <th>Server</th>
                    <th>Thông tin</th>
                    <th>Trạng thái</th>
                    <th>Bình luận</th>
                    <th>Ngày tạo</th>
                    <th>Thời gian cập nhật</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={11} className="text-center py-5">
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span className="mt-2">Đang tải dữ liệu...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center">
                        <div>
                          <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                          <p className="font-semibold" >Không có dữ liệu</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, index) => (
                      <tr key={index}>
                        <td>{order.Madon}</td>
                        <td>
                          <Button
                            className="btn btn-sm btn-info"
                            onClick={() => handleOpenModal(order)}
                          >
                            Xem/Cập nhật
                          </Button>
                        </td>
                        <td>{order.username}</td>
                        <td style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>
                          <p>
                            <a
                              href={order.ObjectLink && order.ObjectLink.startsWith('http') ? order.ObjectLink : `https://${order.ObjectLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {order.link}
                            </a>
                          </p>
                        </td>
                        <td style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>
                          {order.maychu}
                          {order.namesv}
                        </td>
                        <td>
                          <ul>
                            <li><b>Bắt đầu</b> : {order.start}</li>
                            <li><b>Đã chạy</b> : {order.dachay}</li>
                            <li><b>Số lượng mua</b> : {order.quantity}</li>
                            <li><b>Giá</b> : {Number(order.rate).toLocaleString("en-US")}</li>
                            <li><b>Tổng tiền</b> : {Math.floor(Number(order.totalCost)).toLocaleString("en-US")}</li>
                            <li><b>Lãi</b> : {Math.floor(Number(order.lai || 0)).toLocaleString("en-US")} - {order.DomainSmm || ""} - {order.orderId}</li>
                          </ul>
                        </td>
                        <td>
                          {order.iscancel === true ? (
                            <span className="badge bg-warning text-dark">Chờ hoàn</span>
                          ) : order.status === "Completed" ? (
                            <span className="badge bg-success">Hoàn thành</span>
                          ) : order.status === "In progress" ? (
                            <span className="badge bg-primary">Đang chạy</span>
                          ) : order.status === "Processing" ? (
                            <span className="badge bg-purple" style={{ backgroundColor: '#6610f2', color: '#fff' }}>Đang xử lý</span>
                          ) : order.status === "Pending" ? (
                            <span className="badge" style={{ backgroundColor: '#ec8237ff', color: '#fff' }}>Chờ xử lý</span>
                          ) : order.status === "Partial" ? (
                            <span className="badge bg-warning text-dark">Đã hoàn 1 phần</span>
                          ) : order.status === "Canceled" ? (
                            <span className="badge bg-danger">Đã hủy</span>
                          ) : (
                            <span>{order.status}</span>
                          )}
                        </td>
                        <td>
                          <textarea
                            readOnly
                            rows={2}
                            style={{ maxWidth: "100px" }}
                          >
                            {order.comments || ""}
                          </textarea>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td>
                          {new Date(order.updatedAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td style={{ maxWidth: "250px", whiteSpace: "normal", wordWrap: "break-word", overflowWrap: "break-word" }}>{order.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
            {orders.length > 0 && (
              <div className="pagination d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal chi tiết và cập nhật */}
      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxWidth: '100%' }}>
          {selectedOrder && (
            <form>
              <div className="container-fluid">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label>Mã đơn</label>
                    <input className="form-control input-editable" name="Madon" value={selectedOrder.Madon} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Mã đơn nguồn</label>
                    <input className="form-control input-editable" name="orderId" value={selectedOrder.orderId} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Nguồn</label>
                    <input className="form-control input-editable" name="DomainSmm" value={selectedOrder.DomainSmm} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Username</label>
                    <input className="form-control input-editable" name="username" value={selectedOrder.username} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Dịch vụ</label>
                    <input className="form-control input-editable" name="category" value={selectedOrder.category} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Máy chủ</label>
                    <input className="form-control input-editable" name="namesv" value={selectedOrder.namesv} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Link</label>
                    <input className="form-control input-editable" name="link" value={selectedOrder.link} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Số lượng</label>
                    <input className="form-control input-editable" name="quantity" value={selectedOrder.quantity} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Giá</label>
                    <input className="form-control input-editable" name="rate" value={selectedOrder.rate} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Tổng tiền</label>
                    <input className="form-control input-editable" name="totalCost" value={Math.floor(Number(selectedOrder.totalCost)).toLocaleString("en-US")} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Ngày tạo</label>
                    <input className="form-control input-editable" name="createdAt" value={new Date(selectedOrder.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })} disabled />
                  </div>
                  <div className="col-md-3">
                    <label>Cập nhật cuối</label>
                    <input className="form-control input-editable" name="updatedAt" value={new Date(selectedOrder.updatedAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })} disabled />
                  </div>
                  <div className="col-md-3 ">
                    <label>Bắt đầu</label>
                    <input className="form-control" name="start" value={form.start} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label>Đã chạy</label>
                    <input className="form-control" name="dachay" value={form.dachay} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label>Trạng thái</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-center">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" name="iscancel" checked={!!form.iscancel} onChange={handleChange} />
                    </div>
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Trạng thái chờ hoàn</label>
                  </div>
                </div>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderAdmin;
