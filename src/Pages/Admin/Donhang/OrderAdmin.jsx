import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { getOrders, updateOrderStatus } from "@/Utils/api";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useOutletContext } from "react-router-dom";
import { loadingg } from "@/JS/Loading";
const statusOptions = [
  { value: "Completed", label: "Hoàn thành" },
  { value: "In progress", label: "Đang chạy" },
  { value: "Processing", label: "Đang xử lý" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Partial", label: "Hoàn một phần" },
  { value: "Canceled", label: "Đã hủy" },
];

const orderTayOptions = [
  { value: "true", label: "Order Tay" },
  { value: "false", label: "Order SMM" },
];

const OrderAdmin = () => {
  const { token, categories } = useOutletContext();
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedOrderTay, setSelectedOrderTay] = useState("");

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
  const [maxVisible, setMaxVisible] = useState(4);
  // Update maxVisible based on screen width (>=1000: 20, 600-999: 15, <600: 4)
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
      } catch { /* no-op for non-browser envs */ }
    };
    updateMaxVisible();
    window.addEventListener('resize', updateMaxVisible);
    return () => window.removeEventListener('resize', updateMaxVisible);
  }, []);
  const fetchOrders = async () => {
    setLoadingOrders(true);
    loadingg("Vui lòng chờ...", true, 9999999);
    try {
      const response = await getOrders(
        token,
        currentPage,
        limit,
        selectedCategory ? selectedCategory.value : "",
        searchTerm.trim(),
        selectedStatus,
        selectedOrderTay
      );
      setOrders(response.orders || []);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      setOrders([]);
      // toast.error("Không có đơn hàng nào!");
    } finally {
      setLoadingOrders(false);
      loadingg("Vui lòng chờ...", false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, currentPage, limit, selectedStatus, selectedCategory, selectedOrderTay]);

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
  const domainOptions = useMemo(() => {
    const domains = [...new Set(orders.map(order => order.DomainSmm).filter(Boolean))];
    return domains.map(domain => ({ value: domain, label: domain }));
  }, [orders]);

  const handleCopyAllOrdersByDomain = () => {
    if (!selectedDomain) {
      toast.error("Vui lòng chọn nguồn trước khi copy!");
      return;
    }

    // Lọc đơn hàng theo domain đã chọn
    const filteredOrders = orders.filter(order => order.DomainSmm === selectedDomain);

    if (filteredOrders.length === 0) {
      toast.error("Không có đơn hàng nào từ nguồn này!");
      return;
    }

    // Lấy tất cả OrderID từ nguồn đã chọn
    const orderIds = filteredOrders
      .filter(order => order.orderId)
      .map(order => order.orderId);

    if (orderIds.length === 0) {
      toast.error("Không có OrderID nào để sao chép!");
      return;
    }

    const copyText = orderIds.join(",");

    navigator.clipboard.writeText(copyText)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Sao chép thành công!",
          text: `Đã sao chép ${orderIds.length} OrderID từ nguồn: ${selectedDomain}`,
          confirmButtonText: "OK",
        });
      })
      .catch(() => {
        toast.error("Không thể sao chép!");
      });
  };
  const handleUpdate = async () => {
    if (!selectedOrder) return;
    loadingg("Đang cập nhật...", true, 9999999);
    try {
      await updateOrderStatus(selectedOrder.Madon, form, token);
      toast.success("Cập nhật trạng thái thành công!");
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(`Lỗi khi cập nhật trạng thái! ${err.message}`);
    } finally {
      loadingg("Đang cập nhật...", false);
    }
  };
  let decoded = {};
  if (token) {
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      // Có thể log lỗi nếu cần
    }
  }
  const userRole = decoded?.role || "user";

  return (
    <>
      <style>
        {`
          .input-editable {
            background-color: #fffbe6 !important;
            border: 1px solid #e9ecef !important;
            color: #495057 !important;
            cursor: not-allowed !important;
          }
          
          .input-editable:focus {
            box-shadow: none !important;
            border-color: #e9ecef !important;
          }
          
          /* Modern Modal Styles */
          .modal-modern .modal-content {
            border-radius: 15px;
            border: none;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          
          .modal-modern .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .modal-modern .modal-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .modal-modern .modal-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0;
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
          }
          
          .modal-modern .modal-title i {
            background: rgba(255,255,255,0.2);
            padding: 8px;
            border-radius: 50%;
            margin-right: 12px;
            font-size: 16px;
          }
          
          .modal-modern .btn-close {
            filter: invert(1);
            position: relative;
            z-index: 2;
          }
          
          .modal-modern .modal-body {
            padding: 2rem;
            background: #f8f9fa;
          }
          
          .modal-section {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #e9ecef;
          }
          
          .modal-section-header {
            display: flex;
            align-items: center;
            margin-bottom: 1.25rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #e9ecef;
          }
          
          .modal-section-icon {
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
          
          .modal-section-title {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
          }
          
          .modal-form-group {
            margin-bottom: 1.25rem;
          }
          
          .modal-form-label {
            display: flex;
            align-items: center;
            font-size: 13px;
            font-weight: 500;
            color: #495057;
            margin-bottom: 0.5rem;
          }
          
          .modal-form-label i {
            margin-right: 6px;
            color: #6c757d;
            width: 14px;
            text-align: center;
          }
          
          .modal-form-control {
            border-radius: 8px;
            border: 1px solid #d1d3e2;
            padding: 0.6rem 0.8rem;
            font-size: 14px;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .modal-form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
            outline: none;
          }
          
          .modal-form-control.readonly {
            background-color: #f8f9fa;
            border-color: #e9ecef;
            color: #6c757d;
            cursor: default;
          }
          
          .modal-switch-container {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          }
          
          .modal-switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
            margin-bottom: 0.5rem;
          }
          
          .modal-switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .modal-switch-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 24px;
          }
          
          .modal-switch-slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
          
          .modal-switch input:checked + .modal-switch-slider {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          .modal-switch input:checked + .modal-switch-slider:before {
            transform: translateX(26px);
          }
          
          .modal-switch-label {
            font-size: 12px;
            font-weight: 500;
            color: #495057;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .modal-switch-label i {
            margin-right: 4px;
          }
          
          .modal-modern .modal-footer {
            background: white;
            border: none;
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }
          
          .modal-btn {
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .modal-btn-secondary {
            background: #6c757d;
            color: white;
          }
          
          .modal-btn-secondary:hover {
            background: #5a6268;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }
          
          .modal-btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .modal-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }
          
          @media (max-width: 768px) {
            .modal-modern .modal-body {
              padding: 1rem;
            }
            
            .modal-section {
              padding: 1rem;
            }
            
            .modal-modern .modal-header {
              padding: 1rem 1.5rem;
            }
            
            .modal-modern .modal-footer {
              padding: 1rem 1.5rem;
            }
          }
          
          /* Modern Order Admin Page Styles */
          .order-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .order-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .order-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .order-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .order-header-content {
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .order-icon-circle {
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
          
          .order-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .order-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .order-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
            padding: 1.5rem 2rem;
          }
          
          .order-filters-section {
            background: linear-gradient(135deg, #fdfeffff 0%, #ffffffff 100%);
            border: 1px solid #e8ecef;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .order-filters-title {
            font-size: 16px;
            font-weight: 600;
            color: #495057;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .order-form-group {
            margin-bottom: 1rem;
          }
          
          .order-form-group label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.5rem;
            font-size: 13px;
          }
          
          .order-form-control {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .order-form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .order-search-group {
            position: relative;
          }
          
          .order-search-input {
            border: 1px solid #dee2e6;
            border-radius: 8px 0 0 8px;
            padding: 0.6rem 1rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .order-search-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .order-search-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 1px solid #667eea;
            border-left: none;
            color: white;
            padding: 0.6rem 1rem;
            border-radius: 0 8px 8px 0;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .order-search-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            color: white;
          }
          
          .order-select-control {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .order-select-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .order-admin-section {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffeaa7;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .order-admin-title {
            font-size: 16px;
            font-weight: 600;
            color: #856404;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .order-copy-btn {
            background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            border: none;
            color: white;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .order-copy-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
            color: white;
          }
          
          .order-copy-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          /* React Select Custom Styling */
          .order-react-select .react-select__control {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            min-height: 38px;
            transition: all 0.3s ease;
          }
          
          .order-react-select .react-select__control:hover {
            border-color: #667eea;
          }
          
          .order-react-select .react-select__control--is-focused {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .order-react-select .react-select__placeholder {
            color: #6c757d;
            font-size: 14px;
          }
          
          .order-react-select .react-select__single-value {
            color: #495057;
            font-size: 14px;
          }
          
          @media (max-width: 768px) {
            .order-container {
              font-size: 13px;
            }
            
            .order-main-title {
              font-size: 20px;
            }
            
            .order-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .order-content-card {
              padding: 1rem 1.5rem;
            }
            
            .order-filters-section,
            .order-admin-section {
              padding: 1rem;
            }
          }
        `}
      </style>
      <div className="order-container">
        <div className="row">
          <div className="col-md-12">
            <div className="card order-header-card">
              <div className="card-header">
                <div className="order-header-content">
                  <div className="order-icon-circle">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                  <h2 className="order-main-title">Lịch sử tạo đơn (Admin)</h2>
                </div>
              </div>
            </div>
            <div className="order-content-card">
              <div className="order-filters-section">
                <div className="order-filters-title">
                  <i className="fas fa-filter"></i>
                  Bộ lọc tìm kiếm
                </div>
                <div className="row">
                  <div className="col-md-6 col-lg-3">
                    <div className="order-form-group">
                      <label>Chọn Nền Tảng:</label>
                      <div className="order-react-select">
                        <Select
                          value={selectedType}
                          onChange={handleTypeChange}
                          options={typeOptions}
                          placeholder="Chọn"
                          isClearable
                          className="order-select-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="order-form-group">
                      <label>Phân Loại:</label>
                      <div className="order-react-select">
                        <Select
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                          options={categoryOptions}
                          placeholder="Chọn"
                          isClearable
                          className="order-select-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="order-form-group">
                      <label>Mã đơn hàng hoặc link</label>
                      <div className="order-search-group input-group">
                        <input
                          type="text"
                          className="form-control order-search-input"
                          placeholder="Tìm kiếm dữ liệu..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn order-search-btn d-flex align-items-center"
                          onClick={handleSearch}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="order-form-group">
                      <label>Số đơn hàng/trang:</label>
                      <select
                        className="form-select order-form-control"
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
              </div>

              <div className="row">
                <div className="col-md-6 col-lg-3">
                  <div className="order-form-group">
                    <label>Trạng thái:</label>
                    <div className="order-react-select">
                      <Select
                        value={statusOptions.find((option) => option.value === selectedStatus)}
                        onChange={(option) => setSelectedStatus(option ? option.value : "")}
                        options={statusOptions}
                        placeholder="Chọn trạng thái"
                        isClearable
                        className="order-select-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="order-form-group">
                    <label>Loại đơn hàng:</label>
                    <div className="order-react-select">
                      <Select
                        value={orderTayOptions.find((option) => option.value === selectedOrderTay)}
                        onChange={(option) => setSelectedOrderTay(option ? option.value : "")}
                        options={orderTayOptions}
                        placeholder="Chọn loại đơn"
                        isClearable
                        className="order-select-control"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {userRole === "admin" && (
                <div className="order-admin-section">
                  <div className="order-admin-title">
                    <i className="fas fa-tools"></i>
                    Công cụ Admin
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-lg-4">
                      <div className="order-form-group">
                        <label>Chọn nguồn để copy:</label>
                        <div className="order-react-select">
                          <Select
                            value={domainOptions.find(option => option.value === selectedDomain)}
                            onChange={(option) => setSelectedDomain(option ? option.value : "")}
                            options={domainOptions}
                            placeholder="Chọn nguồn"
                            isClearable
                            className="order-select-control"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="order-form-group">
                        <label>&nbsp;</label>
                        <div>
                          <button
                            className="btn order-copy-btn"
                            onClick={handleCopyAllOrdersByDomain}
                            disabled={!selectedDomain}
                          >
                            <i className="fas fa-copy me-2"></i>
                            Copy OrderID từ nguồn: {selectedDomain || "Chưa chọn"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive table-bordered">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Thao tác</th>
                      <th>Username</th>
                      <th>Link</th>
                      <th>Server</th>
                      <th>Loại đơn</th>
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
                        <td colSpan={12} className="text-center py-5">
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
                        <td colSpan={12} className="text-center">
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
                            <span dangerouslySetInnerHTML={{ __html: order.namesv }} />
                          </td>
                          <td>
                            {order.ordertay ? (
                              <span className="badge bg-warning text-dark">
                                <i className="fas fa-hand-paper me-1"></i>
                                Order Tay
                              </span>
                            ) : (
                              <span className="badge bg-info text-white">
                                <i className="fas fa-robot me-1"></i>
                                Order SMM
                              </span>
                            )}
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
                <>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                    {/* Arrow + numbers + arrow grouped together */}
                    <div
                      className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                      style={{ maxWidth: '100%' }}
                    >
                      <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        aria-label="Trang trước"
                        title="Trang trước"
                      >
                        <i className="fas fa-angle-left"></i>
                      </button>

                      {(() => {
                        const pages = [];
                        const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                        const end = Math.min(totalPages, start + maxVisible - 1);
                        const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                        // Leading first page and ellipsis
                        if (adjustedStart > 1) {
                          pages.push(
                            <button key={1} className={`btn btn-sm ${currentPage === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setCurrentPage(1)}>1</button>
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
                              className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={() => setCurrentPage(p)}
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
                            <button key={totalPages} className={`btn btn-sm ${currentPage === totalPages ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                          );
                        }

                        return pages;
                      })()}

                      <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
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
        {/* Modal chi tiết và cập nhật */}
        <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-xl modal-modern">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="fas fa-edit"></i>
              Chi tiết & Cập nhật đơn hàng
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <form>
                <div className="container-fluid">
                  {/* Section 1: Thông tin cơ bản */}
                  <div className="modal-section">
                    <div className="modal-section-header">
                      <div className="modal-section-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <h6 className="modal-section-title">Thông tin đơn hàng</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-hashtag"></i>
                            Mã đơn hàng
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.Madon || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-external-link-alt"></i>
                            Mã đơn nguồn
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.orderId || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-server"></i>
                            Nguồn
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.DomainSmm || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-user"></i>
                            Người dùng
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.username || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-tags"></i>
                            Dịch vụ
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.category || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-hdd"></i>
                            Máy chủ
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.namesv || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-hand-paper"></i>
                            Loại đơn hàng
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.ordertay ? 'Order Tay' : 'Order SMM'}
                            readOnly
                            style={{
                              backgroundColor: selectedOrder.ordertay ? '#fff3cd' : '#d1ecf1',
                              color: selectedOrder.ordertay ? '#856404' : '#0c5460',
                              fontWeight: 600
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-link"></i>
                            Link đơn hàng
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.link || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-12 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-calendar-plus"></i>
                            Ngày tạo đơn
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={new Date(selectedOrder.createdAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-12 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-calendar-check"></i>
                            Cập nhật cuối
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={new Date(selectedOrder.updatedAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Thông tin tài chính */}
                  <div className="modal-section">
                    <div className="modal-section-header">
                      <div className="modal-section-icon">
                        <i className="fas fa-money-bill-wave"></i>
                      </div>
                      <h6 className="modal-section-title">Thông tin tài chính</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-sort-numeric-up"></i>
                            Số lượng
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.quantity || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-dollar-sign"></i>
                            Giá đơn vị
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={selectedOrder.rate || ''}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-calculator"></i>
                            Tổng tiền
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={Math.floor(Number(selectedOrder.totalCost || 0)).toLocaleString("en-US")}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-chart-line"></i>
                            Lãi
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={Math.floor(Number(selectedOrder.lai || 0)).toLocaleString("en-US")}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Thời gian */}
                  {/* <div className="modal-section">
                    <div className="modal-section-header">
                      <div className="modal-section-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <h6 className="modal-section-title">Thông tin thời gian</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-calendar-plus"></i>
                            Ngày tạo đơn
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={new Date(selectedOrder.createdAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-12 col-lg-4">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-calendar-check"></i>
                            Cập nhật cuối
                          </label>
                          <input
                            className="modal-form-control readonly"
                            value={new Date(selectedOrder.updatedAt).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Section 4: Chỉnh sửa */}
                  <div className="modal-section">
                    <div className="modal-section-header">
                      <div className="modal-section-icon">
                        <i className="fas fa-edit"></i>
                      </div>
                      <h6 className="modal-section-title">Chỉnh sửa thông tin</h6>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-play"></i>
                            Số bắt đầu
                          </label>
                          <input
                            className="modal-form-control"
                            name="start"
                            value={form.start || ''}
                            onChange={handleChange}
                            placeholder="Nhập số bắt đầu..."
                            disabled={isAllowedApiUrl}

                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-running"></i>
                            Đã thực hiện
                          </label>
                          <input
                            className="modal-form-control"
                            name="dachay"
                            value={form.dachay || ''}
                            onChange={handleChange}
                            placeholder="Nhập số đã chạy..."
                            disabled={isAllowedApiUrl}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-flag"></i>
                            Trạng thái đơn
                          </label>
                          <select
                            className="modal-form-control"
                            name="status"
                            value={form.status || ''}
                            onChange={handleChange}
                            disabled={isAllowedApiUrl}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3">
                        <div className="modal-form-group">
                          <label className="modal-form-label">
                            <i className="fas fa-undo"></i>
                            Trạng thái chờ hoàn
                          </label>
                          <div className="modal-switch-container">
                            <label className="modal-switch">
                              <input
                                type="checkbox"
                                name="iscancel"
                                checked={!!form.iscancel}
                                onChange={handleChange}
                              />
                              <span className="modal-switch-slider"></span>
                            </label>
                            <span className="modal-switch-label">
                              <i className="fas fa-exclamation-triangle"></i>
                              {form.iscancel ? 'Đang chờ hoàn' : 'Tắt'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="modal-btn modal-btn-secondary"
              onClick={() => setShowModal(false)}
            >
              <i className="fas fa-times"></i>
              Đóng
            </button>
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleUpdate}
            >
              <i className="fas fa-save"></i>
              Cập nhật thông tin
            </button>
          </Modal.Footer>
        </Modal>
      </div>

    </>
  );
};

export default OrderAdmin;
