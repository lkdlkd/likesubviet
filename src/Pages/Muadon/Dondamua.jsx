import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import { getOrders, refillOrder, cancelOrder } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";
import Select from "react-select";

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

    // Lấy đơn hàng theo category (path), tìm kiếm, phân trang
    const fetchOrders = async () => {
        if (!username) {
            setLoadingOrders(false);
            return;
        }
        setLoadingOrders(true);
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
        }
    };

    // Load dữ liệu khi thay đổi các tham số (KHÔNG fetch khi searchTerm thay đổi)
    useEffect(() => {
        fetchOrders();
    }, [username, currentPage, limit, category, selectedStatus]);

    // Khi nhấn nút tìm kiếm, reset trang về 1 và gọi fetchOrders với searchTerm hiện tại
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadingg("Đang tìm kiếm...");
        setTimeout(() => {
            fetchOrders();
            loadingg("", false);
        }, 0);
    };

    // Xử lý thay đổi số đơn hàng hiển thị mỗi trang
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
        loadingg("Vui lòng chờ");
        setTimeout(() => {
            loadingg("", false);
        }, 1000);
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
        const textToCopy = `Username : ${order.username} \nMã đơn : ${order.Madon} \nJob id : ${order.link} \nTên Sv : ${order.maychu || ""}${order.namesv || ""}\nNgày tạo : ${new Date(order.createdAt).toLocaleString("vi-VN", {
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
        <div className="row">
            <div className="col-md-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row md-3">

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
                            <div className="col-md-6 col-lg-3">
                                <div className="form-group">
                                    <label  >
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
                        <div className="table-responsive table-bordered">
                            {loadingOrders ? (
                                <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
                                    <div className="spinner-border text-primary" role="status" />
                                    <span className="ms-2">Đang tải dữ liệu...</span>
                                </div>
                            ) : orders.length > 0 ? (
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
                                            {showcmt && <th>Bình luận</th>}
                                            {/* <th>Bình luận</th> */}
                                            <th>Ngày tạo</th>
                                            <th>Thời gian cập nhật</th>
                                            <th>Ghi chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
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
                                                                                    loadingg(false);
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
                                                                                    loadingg(false);
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
                                                <td>{order.username}</td>
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
                                                    {order.namesv}
                                                </td>
                                                <td>
                                                    <ul>
                                                        <li><b>Bắt đầu</b> : {order.start}</li>
                                                        <li><b>Đã chạy</b> : {order.dachay}</li>
                                                        <li><b>Số lượng mua</b> : {order.quantity}</li>
                                                        <li><b>Giá</b> : {Number(order.rate).toLocaleString("en-US")}</li>
                                                        <li><b>Tổng tiền</b> : {Number(order.totalCost).toLocaleString("en-US")}</li>
                                                        {userRole === "admin" && (
                                                            <li><b>Lãi</b> : {Number(order.lai || 0).toLocaleString("en-US")} - {order.DomainSmm || ""} - {order.orderId}</li>
                                                        )}
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
                                                <td>{order.note}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <p>Không có đơn hàng nào.</p>
                            )}
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
        </div>
    );
};

export default Dondamua;
