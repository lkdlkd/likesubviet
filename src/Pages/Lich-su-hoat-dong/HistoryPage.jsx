import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { getUserHistory } from "@/Utils/api";
import HistoryHoantien from "./HistoryHoantien"; // Giả sử bạn đã tạo component HistoryHoantien
import { useOutletContext } from "react-router-dom";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này
export default function History() {
    const [activeTab, setActiveTab] = useState("lichsuhoatdong");
    const [historyData, setHistoryData] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    // Responsive number of visible page buttons (desktop: 10, mobile: 4)
    const [maxVisible, setMaxVisible] = useState(4);
    const [searchQuery, setSearchQuery] = useState("");
    const [orderIdSearch, setOrderIdSearch] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debouncedOrderIdSearch, setDebouncedOrderIdSearch] = useState("");
    const [loading, setLoading] = useState(true);
    // const [errorMessage, setErrorMessage] = useState(null);
    const { token, user } = useOutletContext();
    const role = user?.role || "user"; // Lấy role của người dùng, mặc định là "user" nếu không có
    // Debounce logic cho `searchQuery` và `orderIdSearch`
    // useEffect(() => {
    //     const handler = setTimeout(() => {
    //         setDebouncedSearchQuery(searchQuery);
    //         setDebouncedOrderIdSearch(orderIdSearch);
    //     }, 3000);
    //     return () => {
    //         clearTimeout(handler); // Xóa timeout nếu người dùng tiếp tục nhập
    //     };
    // }, [searchQuery, orderIdSearch]);

    // Gọi API để lấy dữ liệu lịch sử
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            loadingg("Vui lòng chờ...", true, 999999); // Hiển thị thông báo đang tải
            try {
                const response = await getUserHistory(
                    token,
                    page,
                    limit,
                    debouncedOrderIdSearch,
                    debouncedSearchQuery
                );
                setHistoryData(response.history || []);
                setTotalPages(response.totalPages || 1);
                // setErrorMessage(null);
            } catch (error) {
                // setErrorMessage(
                //     error.response?.data?.message || "Không thể tải dữ liệu lịch sử hoạt động."
                // );
            } finally {
                loadingg("", false); // Ẩn thông báo sau khi tải xong
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, page, limit, debouncedSearchQuery, debouncedOrderIdSearch]);

    // Update maxVisible based on screen width (>=1200: 20, 700-1199: 15, <700: 5)
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
            } catch {
                // no-op
            }
        };
        updateMaxVisible();
        window.addEventListener('resize', updateMaxVisible);
        return () => window.removeEventListener('resize', updateMaxVisible);
    }, []);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearch = () => {
        setDebouncedSearchQuery(searchQuery); // Gọi API ngay lập tức
        setDebouncedOrderIdSearch(orderIdSearch); // Gọi API ngay lập tức
        setPage(1); // Reset về trang đầu tiên
        loadingg("Đang tìm kiếm..."); // Hiển thị thông báo đang tìm kiếm
        setTimeout(() => {
            loadingg("", false); // Ẩn thông báo sau khi tìm kiếm
        }, 1000);
    };

    const handleLimitChange = (e) => {
        const newLimit = e.target.value;
        setLimit(parseInt(newLimit, 10));
        setPage(1); // Reset về trang đầu tiên
        loadingg("Vui lòng chờ"); // Hiển thị thông báo đang tìm kiếm
        setTimeout(() => {
            loadingg("", false); // Ẩn thông báo sau khi tìm kiếm
        }, 1000);
    };

    // if (loading) {
    //     return <div>Đang tải...</div>;
    // }

    // if (errorMessage) {
    //     return <div className="alert alert-danger">{errorMessage}</div>;
    // }

    return (
        <>
            <style>
                {`
                    /* Modern History Page Styles */
                    .history-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .history-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .history-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .history-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .history-header-content {
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .history-icon-circle {
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
                    
                    .history-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .history-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .history-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                        padding: 0;
                    }
                    
                    .history-nav-pills {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        padding: 0.5rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .history-nav-pills .nav-link {
                        background: transparent;
                        border: none;
                        color: #6c757d;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        margin: 0 0.25rem;
                    }
                    
                    .history-nav-pills .nav-link:hover {
                        background: rgba(102, 126, 234, 0.1);
                        color: #667eea;
                    }
                    
                    .history-nav-pills .nav-link.active {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                    }
                    
                    .history-alert-info {
                        background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
                        border: 1px solid #b8daff;
                        border-radius: 8px;
                        padding: 1rem 1.25rem;
                        margin-bottom: 1.5rem;
                        color: #0c5460;
                        font-size: 14px;
                        font-weight: 500;
                    }
                    
                    .history-controls-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .history-form-control {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.6rem 1rem;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .history-form-control:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    }
                    
                    .history-btn-primary {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        border: 1px solid #28a745;
                        color: white;
                        padding: 0.6rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .history-btn-primary:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        color: white;
                    }
                    
                    .history-pagination {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        padding: 1rem 1.5rem;
                        margin-top: 1.5rem;
                    }
                    
                    .history-pagination .btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        margin: 0 0.25rem;
                    }
                    
                    .history-pagination .btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
                    }
                    
                    .history-pagination .btn:disabled {
                        background: #6c757d;
                        opacity: 0.6;
                    }
                    
                    .history-pagination .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                    }
                    
                    .history-pagination .btn-outline-secondary {
                        background: white;
                        border: 1px solid #dee2e6;
                        color: #6c757d;
                    }
                    
                    .history-pagination .btn-outline-secondary:hover {
                        background: #f8f9fa;
                        border-color: #667eea;
                        color: #667eea;
                    }
                    
                    .history-table-container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                        border: 1px solid #e8ecef;
                    }
                    
                    @media (max-width: 768px) {
                        .history-container {
                            font-size: 13px;
                        }
                        
                        .history-main-title {
                            font-size: 20px;
                        }
                        
                        .history-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .history-content-card {
                            margin: 0 -15px;
                            border-radius: 0;
                        }
                        
                        .history-controls-section {
                            padding: 1rem;
                        }
                    }
                    
                    /* Row colors for plus/refund actions */
                    .history-row-plus {
                        background-color: #bcf0d6 !important;
                    }
                    
                    .history-row-refund {
                        background-color: #ffd6d6 !important;
                    }
                    
                    /* Dark mode styles */
                    [data-bs-theme="dark"] .history-row-plus {
                        background-color: #1a4d2e !important;
                        color: #a3e4bc !important;
                    }
                    
                    [data-bs-theme="dark"] .history-row-refund {
                        background-color: #4d1a1a !important;
                        color: #f5a3a3 !important;
                    }
                    
                    [data-bs-theme="dark"] .history-content-card {
                        background: #1a1d21 !important;
                        border-color: #2d3339 !important;
                    }
                    
                    [data-bs-theme="dark"] .history-controls-section {
                        background: linear-gradient(135deg, #1a1d21 0%, #23272b 100%) !important;
                        border-color: #2d3339 !important;
                    }
                    
                    [data-bs-theme="dark"] .history-form-control {
                        background-color: #23272b !important;
                        border-color: #3d4349 !important;
                        color: #e9ecef !important;
                    }
                    
                    [data-bs-theme="dark"] .history-table-container {
                        background: #1a1d21 !important;
                        border-color: #2d3339 !important;
                    }
                    
                    [data-bs-theme="dark"] .history-nav-pills {
                        background: linear-gradient(135deg, #1a1d21 0%, #23272b 100%) !important;
                    }
                    
                    [data-bs-theme="dark"] .history-nav-pills .nav-link {
                        color: #adb5bd !important;
                    }
                    
                    [data-bs-theme="dark"] .history-nav-pills .nav-link:hover {
                        background: rgba(102, 126, 234, 0.2) !important;
                        color: #8da4ef !important;
                    }
                    
                    [data-bs-theme="dark"] .history-container {
                        color: #e9ecef !important;
                    }
                    
                    [data-bs-theme="dark"] .form-label {
                        color: #adb5bd !important;
                    }
                `}
            </style>

            <div className="history-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="history-header-card">
                            <div className="card-header">
                                <div className="history-header-content">
                                    <div className="history-icon-circle">
                                        <i className="fas fa-history"></i>
                                    </div>
                                    <h2 className="history-main-title">Lịch Sử Hoạt Động</h2>
                                </div>
                            </div>
                        </div>

                        <div className="history-content-card">
                            <div className="card-body p-4">
                                <ul className="nav nav-pills history-nav-pills nav-justified mb-3">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link w-100 ${activeTab === "lichsuhoatdong" ? "active" : ""}`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setActiveTab("lichsuhoatdong")}
                                        >
                                            <i className="fas fa-list-ul me-2"></i>
                                            Lịch sử hoạt động
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link w-100 ${activeTab === "hoantien" ? "active" : ""}`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setActiveTab("hoantien")}
                                        >
                                            <i className="fas fa-undo me-2"></i>
                                            Danh sách hoàn tiền
                                        </button>
                                    </li>
                                </ul>
                                {/* {activeTab === "lichsuhoatdong" && (
                                    <div className="history-alert-info">
                                        <i className="fas fa-info-circle me-2"></i>
                                        <strong>Đơn hàng có lệnh trừ tiền mà không hiện mã đơn thì đơn hàng đó là đã tiếp nhận đơn, nếu đơn hàng không chạy thì báo admin để kiểm tra xử lý.</strong>
                                    </div>
                                )} */}
                                {activeTab === "lichsuhoatdong" && (
                                    <div>
                                        <div className="history-controls-section">
                                            <div className="row g-3">
                                                {/* Tìm kiếm theo mã đơn */}
                                                <div className="col-md-6 col-lg-3">
                                                    <label className="form-label fw-semibold text-muted mb-2">Tìm kiếm theo mã đơn:</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control history-form-control"
                                                            placeholder="Nhập mã đơn..."
                                                            value={orderIdSearch}
                                                            onChange={(e) => setOrderIdSearch(e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn history-btn-primary"
                                                            onClick={handleSearch}
                                                        >
                                                            <i className="fas fa-search me-1"></i>
                                                            Tìm
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Tìm kiếm theo username */}
                                                {role === "admin" && (
                                                    <div className="col-md-6 col-lg-3">
                                                        <label className="form-label fw-semibold text-muted mb-2">Tìm kiếm theo username:</label>
                                                        <div className="input-group">
                                                            <input
                                                                type="text"
                                                                className="form-control history-form-control"
                                                                placeholder="Nhập username..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                            <button
                                                                className="btn history-btn-primary"
                                                                onClick={handleSearch}
                                                            >
                                                                <i className="fas fa-search me-1"></i>
                                                                Tìm
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Thay đổi số lượng bản ghi mỗi trang */}
                                                <div className="col-md-6 col-lg-3">
                                                    <label className="form-label fw-semibold text-muted mb-2">Số lượng hiển thị:</label>
                                                    <select
                                                        className="form-select history-form-control"
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

                                        {/* Hiển thị bảng lịch sử */}
                                        <div className="history-table-container table-responsive p-3">
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        {role === "admin" && <th>Username</th>}
                                                        <th>Mã đơn</th>
                                                        <th>Hành động</th>
                                                        <th>Link</th>
                                                        <th>Số tiền</th>
                                                        <th>Ngày tạo</th>
                                                        <th>Diễn tả</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {loading ? (
                                                        <tr>
                                                            <td colSpan={8} className="text-center py-5">
                                                                <div className="d-flex flex-column align-items-center justify-content-center">
                                                                    <div className="spinner-border text-primary mb-2" role="status">
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                    <span className="mt-2">Đang tải dữ liệu...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : historyData && historyData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={8} className="text-center">
                                                                <div>
                                                                    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                                    <p className="font-semibold" >Không có dữ liệu</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        historyData.map((item, index) => {
                                                            const actionText = item.hanhdong.toLowerCase();
                                                            const isPlusAction =
                                                                actionText.includes("nạp tiền") ||
                                                                actionText.includes("cộng tiền");
                                                            const isRefundAction = actionText.includes("hoàn tiền");
                                                            let rowClass = "";
                                                            if (isPlusAction) {
                                                                rowClass = "history-row-plus";
                                                            } else if (isRefundAction) {
                                                                rowClass = "history-row-refund";
                                                            }
                                                            return (
                                                                <tr
                                                                    key={item._id}
                                                                    className={rowClass}
                                                                >
                                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                                    {role === "admin" && <td>{item.username}</td>}
                                                                    <td>{item.madon}</td>
                                                                    <td style={{
                                                                        maxWidth: "250px",
                                                                        whiteSpace: "normal",
                                                                        wordWrap: "break-word",
                                                                        overflowWrap: "break-word",
                                                                    }}>{item.hanhdong}</td>
                                                                    <td
                                                                        style={{
                                                                            maxWidth: "250px",
                                                                            whiteSpace: "normal",
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                        }}
                                                                    >
                                                                        {item.link}
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className="badge bg-info"
                                                                            style={{ backgroundColor: "#43bfe5", display: "block", marginBottom: 2 }}
                                                                        >
                                                                            {Math.floor(Number(item.tienhientai)).toLocaleString("en-US")}
                                                                            {/* {Number(item.tienhientai).toLocaleString("en-US")} */}
                                                                        </span>
                                                                        {isPlusAction || isRefundAction ? (
                                                                            <>
                                                                                +
                                                                                <span
                                                                                    className="badge"
                                                                                    style={{ backgroundColor: "#e53935", display: "block", marginBottom: 2 }}
                                                                                >
                                                                                    {Math.floor(Number(item.tongtien)).toLocaleString("en-US")}
                                                                                    {/* {Number(item.tongtien).toLocaleString("en-US")} */}
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                -
                                                                                <span
                                                                                    className="badge"
                                                                                    style={{ backgroundColor: "#e53935", display: "block", marginBottom: 2 }}
                                                                                >
                                                                                    {Math.floor(Number(item.tongtien)).toLocaleString("en-US")}
                                                                                    {/* {Number(item.tongtien).toLocaleString("en-US")} */}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        =
                                                                        <span className="badge bg-success" style={{ display: "block" }}>
                                                                            {Math.floor(Number(item.tienconlai)).toLocaleString("en-US")}
                                                                            {/* {Number(item.tienconlai).toLocaleString("en-US")} */}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        {new Date(item.createdAt).toLocaleString("vi-VN", {
                                                                            day: "2-digit",
                                                                            month: "2-digit",
                                                                            year: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                            second: "2-digit",
                                                                        })}
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            maxWidth: "570px",
                                                                            whiteSpace: "normal",
                                                                            wordWrap: "break-word",
                                                                            overflowWrap: "break-word",
                                                                        }}
                                                                    >
                                                                        {item.mota || "-"}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }))}
                                                </tbody>
                                            </Table>
                                        </div>

                                        {/* Phân trang */}
                                        {historyData && historyData.length > 0 && (
                                            <>
                                                <span>
                                                    Trang {page} / {totalPages}
                                                </span>
                                                <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                                                    {/* Arrow + numbers + arrow grouped together */}
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
                                )}
                                {activeTab === "hoantien" && (
                                    <div>
                                        <HistoryHoantien />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
