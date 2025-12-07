import { loadingg } from "@/JS/Loading";
import { cancelOrder, getOrders, refillOrder } from "@/Utils/api";
import { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Dondamua = ({ category, showcmt }) => {
    const token = localStorage.getItem("token");
    let decoded = {};
    if (token) {
        try {
            decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (error) { }
    }
    const userRole = decoded?.role || "user";
    const username = decoded.username;

    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedStatus, setSelectedStatus] = useState("");
    // const [selectedDomain, setSelectedDomain] = useState("");

    // Lấy đơn hàng theo category (path), tìm kiếm, phân trang
    const fetchOrders = async () => {
        if (!username) {
            setLoadingOrders(false);
            return;
        }
        setLoadingOrders(true);
        // loadingg("Vui lòng chờ...", true, 9999999);
        try {
            const response = await getOrders(
                token,
                currentPage,
                limit,
                category,
                searchTerm.trim(),
                selectedStatus,
            );
            setOrders(response.orders || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            setOrders([]);
        } finally {
            setLoadingOrders(false);
            // loadingg("Vui lòng chờ...", false);
        }
    };

    // Load dữ liệu khi thay đổi các tham số (KHÔNG fetch khi searchTerm thay đổi)
    useEffect(() => {
        fetchOrders();
    }, [username, currentPage, limit, category, selectedStatus]);

    // Responsive number of visible page buttons (desktop: 10, mobile: 4)
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

    // Khi nhấn nút tìm kiếm, reset trang về 1 và gọi fetchOrders với searchTerm hiện tại
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        // loadingg("Đang tìm kiếm...");
        // setTimeout(() => {
        fetchOrders();
        // loadingg("", false);
        // }, 0);
    };

    // Xử lý thay đổi số đơn hàng hiển thị mỗi trang
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
        // loadingg("Vui lòng chờ");
        // setTimeout(() => {
        //     loadingg("", false);
        // }, 1000);
    };

    // Lọc theo trạng thái
    // const filteredOrders = useMemo(() => {
    //     if (!selectedStatus) return orders;
    //     return orders.filter((order) => order.status === selectedStatus);
    // }, [orders, selectedStatus]);

    const statusOptions = [
        { value: "", label: "Tất cả" },
        { value: "Completed", label: "Hoàn thành" },
        { value: "In progress", label: "Đang chạy" },
        { value: "Processing", label: "Đang xử lý" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Partial", label: "Hoàn một phần" },
        { value: "Canceled", label: "Đã hủy" },
    ];

    const handleCopyText = (order) => {
        const textToCopy = `Mã đơn : ${order.Madon} \nJob id : ${order.link} \nTên sv : ${order.maychu || ""}${order.namesv || ""}\nThời gian : ${new Date(order.createdAt).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Sao chép thành công!",
                    text: textToCopy,
                    confirmButtonText: "OK",
                });
            })
            .catch(() => {
                toast.error("Không thể sao chép!");
            });
    };



    return (
        <>
            <style>
                {`
                    /* Modern Order Component Styles */
                    .order-component-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .order-controls-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
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
                    
                    .order-btn-primary {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        border: 1px solid #28a745;
                        color: white;
                        padding: 0.6rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .order-btn-primary:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        color: white;
                    }
                    
                    .order-table-container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                        border: 1px solid #e8ecef;
                        margin-bottom: 1.5rem;
                        padding: 1.5rem;
                    }
                    
                    .order-pagination {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        padding: 1rem 1.5rem;
                        margin-top: 1.5rem;
                    }
                    
                    .order-pagination .btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        margin: 0 0.25rem;
                    }
                    
                    .order-pagination .btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
                    }
                    
                    .order-pagination .btn:disabled {
                        background: #6c757d;
                        opacity: 0.6;
                    }
                    
                    .order-pagination .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                    }
                    
                    .order-pagination .btn-outline-secondary {
                        background: white;
                        border: 1px solid #dee2e6;
                        color: #6c757d;
                    }
                    
                    .order-pagination .btn-outline-secondary:hover {
                        background: #f8f9fa;
                        border-color: #667eea;
                        color: #667eea;
                    }
                    .orders-controls-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    @media (max-width: 768px) {
                        .order-component-container {
                            font-size: 13px;
                        }
                        
                        .orders-controls-section {
                            padding: 1rem;
                        }
                        
                        .order-table-container {
                            padding: 1rem;
                            margin: 0 -15px;
                            border-radius: 0;
                        }
                    }
                `}
            </style>

            <div className="order-component-container">
                <div className="row">
                    <div className="col-md-12">

                        <div className="orders-controls-section">
                            <div className="row g-3">
                                <div className="col-md-6 col-lg-3">
                                    <div className="form-group ">
                                        <label className="form-label fw-bold text-dark">
                                            <i className="fas fa-search text-primary me-2"></i>
                                            Mã đơn hàng hoặc link
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control order-form-control"
                                                placeholder="Tìm kiếm dữ liệu..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="order-btn-primary d-flex align-items-center"
                                                onClick={handleSearch}
                                            >
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold text-muted mb-2">
                                            <i className="fas fa-filter text-info me-2"></i>
                                            Trạng thái:
                                        </label>
                                        <Select
                                            value={statusOptions.find((option) => option.value === selectedStatus)}
                                            onChange={(option) => setSelectedStatus(option ? option.value : "")}
                                            options={statusOptions}
                                            placeholder="Chọn trạng thái"
                                            isClearable
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-3">
                                    <div className="form-group">
                                        <label className="form-label fw-bold text-dark">
                                            <i className="fas fa-list text-warning me-2"></i>
                                            Số đơn hàng/trang:
                                        </label>
                                        <select
                                            className="select form-control order-form-control"
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
                        <div className="order-table-container">
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Thao tác</th>
                                        {userRole === "admin" && <th>Username</th>}
                                        <th>Link</th>
                                        <th>Server</th>
                                        <th>Thông tin</th>
                                        <th>Trạng thái</th>
                                        {showcmt && <th>Bình luận</th>}
                                        {/* <th>Bình luận</th> */}
                                        <th>Thời gian</th>
                                        {/* <th>Thời gian cập nhật</th> */}
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
                                                    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                    <p className="font-semibold" >Không có dữ liệu</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, index) => (
                                            <tr key={index}>
                                                <td>{order.Madon}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleCopyText(order)}
                                                    >
                                                        Copy
                                                    </button>
                                                    <div className="dropdown-placeholder mt-1">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            type="button"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            Thao tác <i className="las la-angle-right ms-1"></i>
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            {order.status === "Completed" && (
                                                                <li>
                                                                    {order.refil === "on" && (
                                                                        <button
                                                                            className="dropdown-item text-success"
                                                                            onClick={async () => {
                                                                                const confirm = await Swal.fire({
                                                                                    title: `Bạn có chắc chắn muốn bảo hành cho đơn ${order.Madon}?`,
                                                                                    text: `Nếu đơn hàng bị từ chối bảo hành thì hãy kiểm tra xem các vấn đề sau : quá thời gian bảo hành hoặc vi phạm điều khoản lưu ý của dịch vụ.`,
                                                                                    icon: "question",
                                                                                    showCancelButton: true,
                                                                                    confirmButtonText: "Xác nhận",
                                                                                    cancelButtonText: "Hủy"
                                                                                });
                                                                                if (!confirm.isConfirmed) return;
                                                                                loadingg("Đang thực hiện bảo hành...", true, 9999999);
                                                                                try {
                                                                                    const result = await refillOrder(order.Madon, token);
                                                                                    if (result.success) {
                                                                                        toast.success(`Bảo hành thành công cho đơn ${order.Madon}`);
                                                                                    }
                                                                                } catch (err) {
                                                                                    toast.error(`Bảo hành thất bại: ${err.message}`);
                                                                                } finally {
                                                                                    loadingg("Đang tải...", false);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Bảo hành
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            )}
                                                            {(order.status === "In progress" || order.status === "Processing" || order.status === "Pending") && (
                                                                <li>
                                                                    {order.cancel === "on" && (
                                                                        <button
                                                                            className="dropdown-item text-danger"
                                                                            onClick={async () => {
                                                                                const confirm = await Swal.fire({
                                                                                    title: `Bạn có chắc chắn muốn hủy hoàn đơn #${order.Madon}?`,
                                                                                    text: `Hệ thống sẽ hoàn lại SỐ LƯỢNG CHƯA CHẠY và Trừ phí hoàn 1k hoặc 0đ tùy dịch vụ ( Nếu Sv ghi không hỗ trợ hủy , yêu cầu này sẽ bị từ chối )`,
                                                                                    icon: "warning",
                                                                                    showCancelButton: true,
                                                                                    confirmButtonText: "Xác nhận",
                                                                                    cancelButtonText: "Hủy"
                                                                                });
                                                                                if (!confirm.isConfirmed) return;
                                                                                loadingg("Đang thực hiện hủy hoàn...", true, 9999999);
                                                                                try {
                                                                                    const result = await cancelOrder(order.Madon, token);
                                                                                    if (result.success) {
                                                                                        toast.success(`Hủy hoàn thành công cho đơn ${order.Madon}`);
                                                                                    }
                                                                                } catch (err) {
                                                                                    toast.error(`Hủy hoàn thất bại: ${err.message}`);
                                                                                } finally {
                                                                                    loadingg("Đang tải...", false);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Hủy hoàn
                                                                        </button>
                                                                    )}
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </td>
                                                {userRole === "admin" && <td>{order.username}</td>}
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
                                                    maxWidth: "250px",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}>
                                                    {order.maychu}
                                                    <span dangerouslySetInnerHTML={{ __html: order.namesv }} />
                                                </td>
                                                <td>
                                                    <ul>
                                                        <li><b>Bắt đầu</b> : {order.start}</li>
                                                        <li><b>Đã chạy</b> : {order.dachay}</li>
                                                        <li><b>Số lượng mua</b> : {order.quantity}</li>
                                                        <li><b>Giá</b> : {Number(order.rate).toLocaleString("en-US")}</li>
                                                        <li><b>Tổng tiền</b> : {Math.floor(Number(order.totalCost)).toLocaleString("en-US")}
                                                            {/* {Number(order.totalCost).toLocaleString("en-US")} */}
                                                        </li>
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

                                                {showcmt && (
                                                    <td>
                                                        {order.comments ? (
                                                            <textarea
                                                                readOnly
                                                                rows={2}
                                                                style={{
                                                                    maxWidth: "100px",
                                                                }}
                                                            >
                                                                {order.comments}
                                                            </textarea>
                                                        ) : (
                                                            <span className="badge bg-secondary">Không có</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td>
                                                    <span> {new Date(order.createdAt).toLocaleString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}</span>
                                                    <br />
                                                    <span> {new Date(order.updatedAt).toLocaleString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                    })}</span>
                                                </td>

                                                <td style={{
                                                    maxWidth: "250px",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}>{order.note}</td>
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
        </>
    );
};

export default Dondamua;
