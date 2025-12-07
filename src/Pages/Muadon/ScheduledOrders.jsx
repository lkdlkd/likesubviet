import { loadingg } from "@/JS/Loading";
import {
  cancelScheduledOrder,
  getScheduledOrders,
  rescheduleScheduledOrder,
} from "@/Utils/api";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const STATUS_META = {
  Pending: { label: "Chờ xử lý", variant: "warning" },
  Running: { label: "Đang thực thi", variant: "info" },
  Success: { label: "Hoàn thành", variant: "success" },
  Failed: { label: "Thất bại", variant: "danger" },
  Cancelled: { label: "Đã hủy", variant: "secondary" },
};

function formatDateTimeDisplay(rawDate) {
  if (!rawDate) return "-";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDateTimeLocalInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
  return localISOTime.slice(0, 16);
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "-";
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return "-";
  return numeric.toLocaleString("en-US");
}

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Running", label: "Đang thực thi" },
  { value: "Success", label: "Hoàn thành" },
  { value: "Failed", label: "Thất bại" },
  { value: "Cancelled", label: "Đã hủy" },
];

const ScheduledOrders = () => {
  const token = localStorage.getItem("token");

  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [maxVisible, setMaxVisible] = useState(4);

  let decoded = {};
  if (token) {
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      // Có thể log lỗi nếu cần
    }
  }
  const userRole = decoded?.role || "user";
  // Update maxVisible based on screen width
  useEffect(() => {
    const updateMaxVisible = () => {
      try {
        const width = window.innerWidth || 0;
        if (width >= 1200) {
          setMaxVisible(20);
        } else if (width >= 700) {
          setMaxVisible(15);
        } else {
          setMaxVisible(5);
        }
      } catch { /* no-op */ }
    };
    updateMaxVisible();
    window.addEventListener('resize', updateMaxVisible);
    return () => window.removeEventListener('resize', updateMaxVisible);
  }, []);

  useEffect(() => {
    if (!token) {
      setScheduledOrders([]);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getScheduledOrders(token, {
          page,
          limit,
          status: statusFilter || undefined,
        });
        if (!isMounted) return;
        setScheduledOrders(response.scheduledOrders || []);
        setTotalPages(response.pagination?.totalPages || 0);
      } catch (error) {
        if (!isMounted) return;
        setScheduledOrders([]);
        toast.error(error.message || "Không thể tải đơn hẹn giờ");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [token, page, limit, statusFilter, refreshKey]);

  const refreshList = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleReschedule = async (order) => {
    if (!order || !token) return;
    const existingDate = formatDateTimeLocalInput(new Date(order.scheduleTime));
    const minScheduleTime = formatDateTimeLocalInput(new Date(Date.now() + 60 * 1000));

    const { value: newSchedule } = await Swal.fire({
      title: "Cập nhật thời gian chạy",
      html: `
        <div class="d-flex flex-column gap-2">
          <input
            type="datetime-local"
            id="scheduled-time-input"
            class="swal2-input"
            value="${existingDate || minScheduleTime}"
            min="${minScheduleTime}"
          />
          <small class="text-muted">Thời gian phải lớn hơn hiện tại tối thiểu 1 phút.</small>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Lưu",
      cancelButtonText: "Hủy",
      preConfirm: () => {
        const input = document.getElementById("scheduled-time-input");
        return input ? input.value : "";
      },
    });

    if (!newSchedule) {
      return;
    }

    const validationDate = new Date(newSchedule);
    if (Number.isNaN(validationDate.getTime()) || validationDate <= new Date(Date.now() + 60 * 1000)) {
      toast.error("Thời gian hẹn giờ không hợp lệ");
      return;
    }

    try {
      loadingg("Đang cậ pnhật thời gian", true, 999999);
      const scheduleISO = new Date(newSchedule).toISOString();
      await rescheduleScheduledOrder(order._id, scheduleISO, token);
      toast.success("Cập nhật thời gian thành công");
      refreshList();
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật thời gian");
    } finally {
      loadingg("", false);
    }
  };

  const handleCancel = async (order) => {
    if (!order || !token) return;
    const result = await Swal.fire({
      title: "Hủy đơn hẹn giờ",
      text: `Bạn chắc chắn muốn hủy đơn hẹn giờ cho dịch vụ ${order.magoi}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy đơn",
      cancelButtonText: "Đóng",
    });

    if (!result.isConfirmed) return;

    try {
      loadingg("Đang hủy đơn", true, 999999);
      await cancelScheduledOrder(order._id, token);
      toast.success("Đã hủy đơn hẹn giờ");
      refreshList();
    } catch (error) {
      toast.error(error.message || "Không thể hủy đơn hẹn giờ");
    } finally {
      loadingg("", false);
    }
  };

  const canControl = (order) => order.status === "Pending";

  const currentPageLabel = totalPages === 0 ? 0 : page;

  return (
    <>
      <style>
        {`
                    /* Modern Order List Page Styles */
                    .orders-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .orders-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .orders-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .orders-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .orders-header-content {
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .orders-icon-circle {
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
                    
                    .orders-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .orders-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .orders-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                        padding: 0;
                    }
                    
                    .orders-info-alert {
                        background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
                        border: 1px solid #b8daff;
                        border-radius: 8px;
                        padding: 1rem 1.25rem;
                        margin-bottom: 1.5rem;
                        color: #0c5460;
                        font-size: 14px;
                        font-weight: 500;
                    }
                    
                    .orders-controls-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .orders-form-control {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.6rem 1rem;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .orders-form-control:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    }
                    
                    .orders-btn-primary {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        border: 1px solid #28a745;
                        color: white;
                        padding: 0.6rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .orders-btn-primary:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        color: white;
                    }
                    
                    .orders-table-container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                        border: 1px solid #e8ecef;
                        margin-bottom: 1.5rem;
                    }
                    
                    .orders-pagination {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        padding: 1rem 1.5rem;
                        margin-top: 1.5rem;
                    }
                    
                    .orders-pagination .btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        margin: 0 0.25rem;
                    }
                    
                    .orders-pagination .btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
                    }
                    
                    .orders-pagination .btn:disabled {
                        background: #6c757d;
                        opacity: 0.6;
                    }
                    
                    .orders-pagination .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                    }
                    
                    .orders-pagination .btn-outline-secondary {
                        background: white;
                        border: 1px solid #dee2e6;
                        color: #6c757d;
                    }
                    
                    .orders-pagination .btn-outline-secondary:hover {
                        background: #f8f9fa;
                        border-color: #667eea;
                        color: #667eea;
                    }
                    
                    @media (max-width: 768px) {
                        .orders-container {
                            font-size: 13px;
                        }
                        
                        .orders-main-title {
                            font-size: 20px;
                        }
                        
                        .orders-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .orders-content-card {
                            margin: 0 -15px;
                            border-radius: 0;
                        }
                        
                        .orders-controls-section {
                            padding: 1rem;
                        }
                    }
                `}
      </style>

      <div className="orders-container">
        <div className="row">
          <div className="col-md-12">
            <div className="card orders-header-card">
              <div className="card-header">
                <div className="orders-header-content">
                  <div className="orders-icon-circle">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="orders-header-text">
                    <h4>Đơn hẹn giờ</h4>
                    <p>Quản lý các đơn hàng hẹn giờ của bạn</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="orders-content-card">
              <div className="card-body p-4">
                <div className="orders-info-alert">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Vui lòng đảm bảo số dư đủ để thực hiện đơn hàng</strong>
                </div>
                <div className="orders-controls-section">
                  <div className="row g-3">
                    <div className="col-md-6 col-lg-3">
                      <div className="form-group">
                        <label className="form-label fw-bold text-dark">
                          <i className="fas fa-filter text-info me-2"></i>
                          Trạng thái
                        </label>
                        <select
                          className="form-select order-form-control"
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                          }}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="form-group">
                        <label className="form-label fw-bold text-dark">
                          <i className="fas fa-list text-warning me-2"></i>
                          Số đơn/trang
                        </label>
                        <select
                          className="form-select order-form-control"
                          value={limit}
                          onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                          }}
                        >
                          {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-12 col-lg-4 d-flex align-items-end justify-content-lg-end">
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                        onClick={refreshList}
                        disabled={loading}
                      >
                        <i className="fas fa-sync-alt me-2" /> Làm mới
                      </button>
                    </div>
                  </div>
                </div>

                <div className="orders-table-container p-3">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        {userRole === "admin" && <th>Username</th>}
                        <th>Mã đơn</th>
                        <th>Thao tác</th>
                        <th>Link</th>
                        <th>Dịch vụ</th>
                        <th>Thông tin</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Bình luận</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="text-center py-4">
                            <div className="d-flex flex-column align-items-center gap-2">
                              <div className="spinner-border text-primary" role="status" />
                              <span>Đang tải dữ liệu...</span>
                            </div>
                          </td>
                        </tr>
                      ) : scheduledOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center">
                            <div>
                              <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                              <p className="font-semibold" >Không có dữ liệu</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        scheduledOrders.map((order) => {
                          const meta = STATUS_META[order.status] || STATUS_META.Pending;
                          return (
                            <tr key={order._id}>
                              {userRole === "admin" && <td>{order.username}</td>}
                              <td>
                                {order.madon ? (
                                  order.madon
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>

                              <td className="text-nowrap">
                                <button
                                  className="btn btn-sm btn-outline-primary me-1 mb-1"
                                  onClick={() => handleReschedule(order)}
                                  disabled={!canControl(order)}
                                >
                                  Hẹn giờ lại
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger mb-1"
                                  onClick={() => handleCancel(order)}
                                  disabled={!canControl(order)}
                                >
                                  Hủy
                                </button>
                              </td>
                              <td style={{
                                maxWidth: "250px",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}>
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
                              <td style={{
                                minWidth: "200px",
                                maxWidth: "300px",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}>
                                Mã gói: {order.magoi} - <span dangerouslySetInnerHTML={{ __html: order.serviceName }} />

                              </td>

                              <td>
                                <ul>
                                  <li><b>Số lượng:</b> {order.quantity}</li>
                                  <li><b>Giá:</b> {formatCurrency(order.serviceRate)}</li>
                                  <li><b>Tổng tiền dự kiến:</b> {Math.floor(Number(order.estimatedCost)).toLocaleString("en-US")}</li>
                                </ul>
                              </td>

                              <td>
                                <ul>
                                  <li><b>Tạo lúc:</b> {formatDateTimeDisplay(order.createdAt)}</li>
                                  <li><b>Thời gian hẹn:</b> {formatDateTimeDisplay(order.scheduleTime)}</li>
                                  {order.executedAt && (
                                    <li><b>Thực hiện:</b> {formatDateTimeDisplay(order.executedAt)}</li>
                                  )}
                                </ul>
                              </td>
                              <td style={{
                                maxWidth: "200px",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}>
                                <span className={`badge bg-${meta.variant}`}>{meta.label}</span>
                                {order.errorMessage && (
                                  <div className="mt-1">
                                    <div className="text-danger">{order.errorMessage}</div>
                                  </div>
                                )}
                              </td>
                              <td >
                                <textarea
                                  readOnly
                                  rows={2}
                                  style={{
                                    maxWidth: "100px",
                                  }}
                                >
                                  {order.comments || ""}
                                </textarea>
                              </td>
                              <td style={{
                                maxWidth: "250px",
                                whiteSpace: "normal",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                              }}>{order.note}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                </div>
                {scheduledOrders.length > 0 && (
                  <>
                    <span >
                      Trang {currentPageLabel} / {totalPages}
                    </span>
                    <div className="pagination d-flex justify-content-between align-items-center gap-2">
                      <div
                        className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                        style={{ maxWidth: '100%' }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                          disabled={page === 1}
                          aria-label="Trang trước"
                          title="Trang trước"
                        >
                          <i className="fas fa-angle-left"></i>
                        </button>

                        {(() => {
                          const pages = [];
                          const start = Math.max(1, page - Math.floor(maxVisible / 2));
                          const end = Math.min(totalPages, start + maxVisible - 1);
                          const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                          // Leading first page and ellipsis
                          if (adjustedStart > 1) {
                            pages.push(
                              <button key={1} className={`btn btn-sm ${page === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(1)}>1</button>
                            );
                            if (adjustedStart > 2) {
                              pages.push(<span key="start-ellipsis">...</span>);
                            }
                          }

                          // Main window
                          for (let p = adjustedStart; p <= end; p++) {
                            pages.push(
                              <button
                                key={p}
                                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </button>
                            );
                          }

                          // Trailing ellipsis and last page
                          if (end < totalPages) {
                            if (end < totalPages - 1) {
                              pages.push(<span key="end-ellipsis">...</span>);
                            }
                            pages.push(
                              <button key={totalPages} className={`btn btn-sm ${page === totalPages ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                            );
                          }

                          return pages;
                        })()}

                        <button
                          className="btn btn-secondary"
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={page === totalPages}
                          aria-label="Trang sau"
                          title="Trang sau"
                        >
                          <i className="fas fa-angle-right"></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduledOrders;
