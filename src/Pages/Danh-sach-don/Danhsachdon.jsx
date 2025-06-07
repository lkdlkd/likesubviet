import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { useOutletContext } from "react-router-dom";
import { getOrders, getServer } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này

const Danhsachdon = () => {
    const { token } = useOutletContext();
    const [servers, setServers] = useState([]);
    const [selectedType, setSelectedType] = useState(null); // react-select object
    const [selectedCategory, setSelectedCategory] = useState(null); // react-select object
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10); // Số đơn hàng mỗi trang, mặc định là 10
    const [selectedStatus, setSelectedStatus] = useState(""); // Lưu trạng thái được chọn

    let decoded = {};
    if (token) {
        try {
            decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (error) {
            // Có thể log lỗi nếu cần
        }
    }
    const username = decoded.username;

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await getServer(token); // Gọi API với token
                setServers(response.data || []); // Cập nhật danh sách servers
            } catch (error) {
                console.error("Lỗi khi gọi API getServer:", error);
                toast.error("Không có server!");

            }
        };

        if (token) {
            fetchServers(); // Gọi hàm fetchServers nếu có token
        }
    }, [token]); // Chỉ gọi lại khi `token` thay đổi
    // Tạo danh sách các loại nền tảng (Type) độc nhất từ servers
    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(servers.map((server) => server.type)));
    }, [servers]);

    // Tạo options cho react-select cho Nền tảng (Type)
    const typeOptions = uniqueTypes.map((type) => ({
        value: type,
        label: type,
    }));

    // Nếu đã chọn một Type, tạo danh sách options cho Category dựa theo Type đó
    const categoryOptions = useMemo(() => {
        if (!selectedType) return [];
        const categories = Array.from(
            new Set(
                servers
                    .filter((server) => server.type === selectedType.value)
                    .map((server) => server.category)
            )
        );
        return categories.map((cat) => ({
            value: cat,
            label: cat,
        }));
    }, [servers, selectedType]);

    // Khi thay đổi Type, reset Category
    const handleTypeChange = (option) => {
        setSelectedType(option);
        setSelectedCategory(null);
    };

    const handleCategoryChange = (option) => {
        setSelectedCategory(option);
    };

    // Hàm fetchOrders: Nếu có searchTerm hoặc selectedCategory thì dùng endpoint /api/order/screach, ngược lại dùng endpoint /api/order/orders
    const fetchOrders = async () => {
        if (!username) {
            setLoadingOrders(false);
            return;
        }
        setLoadingOrders(true);
        try {
            // Gọi hàm getOrders
            const response = await getOrders(
                token,
                currentPage,
                limit,
                selectedCategory ? selectedCategory.value : "",
                searchTerm.trim()
            );

            // Giả sử API trả về object { orders, currentPage, totalPages }
            setOrders(response.orders || []);
            setCurrentPage(response.currentPage || 1);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            toast.error("Không có đơn hàng nào!");
        } finally {
            setLoadingOrders(false);
        }
    };

    // Khi nhấn nút tìm kiếm, reset trang về 1 và gọi fetchOrders
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchOrders();
        loadingg("Đang tìm kiếm..."); // Hiển thị thông báo đang tìm kiếm
        setTimeout(() => {
            loadingg("", false); // Ẩn thông báo sau khi tìm kiếm
        }, 1000);
    };

    // Load dữ liệu mặc định khi component mount và mỗi khi currentPage hoặc limit thay đổi
    useEffect(() => {
        fetchOrders();

    }, [username, currentPage, limit]);

    // Xử lý thay đổi số đơn hàng hiển thị mỗi trang
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
        loadingg("Vui lòng chờ"); // Hiển thị thông báo đang tìm kiếm
        setTimeout(() => {
            loadingg("", false); // Ẩn thông báo sau khi tìm kiếm
        }, 1000);
    };
    const filteredOrders = useMemo(() => {
        if (!selectedStatus) return orders; // Nếu không chọn trạng thái, trả về toàn bộ orders
        return orders.filter((order) => order.status === selectedStatus);
    }, [orders, selectedStatus]);
    const statusOptions = [
        { value: "", label: "Tất cả" },
        { value: "Completed", label: "Hoàn thành" },
        { value: "In progress", label: "Đang chạy" },
        { value: "Pending", label: "Chờ xử lý" },
        { value: "Canceled", label: "Đã hủy" },
    ];
    const handleCopyText = (order) => {
        const textToCopy = `Mã đơn: ${order.Madon}\nLink: ${order.link}\nServer: ${order.maychu || "Không có"} - ${order.namesv || "Không có"}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Sao chép thành công!",
                    text: `Mã đơn: ${order.Madon}\nLink: ${order.link}\nServer: ${order.maychu || "Không có"} - ${order.namesv || "Không có"}`,
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
                    <div className="card-header bg-primary text-white">
                        <h2 className="card-title ">Lịch sử tạo đơn</h2>
                    </div>
                    <div className="card-body">
                        <p className="text-muted">
                            Nếu muốn xem đơn của loại nào thì chọn - ấn tìm (mặc định sẽ hiện tất cả)
                        </p>

                        <div className="row">
                            <div className="col-md-6 col-lg-3">
                                <div className="form-group">
                                    <label>Chọn Nền Tảng:</label>
                                    <Select
                                        value={selectedType}
                                        onChange={handleTypeChange}
                                        options={typeOptions}
                                        placeholder="Chọn"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                {selectedType && (
                                    <div className="form-group">
                                        <label>Phân Loại:</label>
                                        <Select
                                            value={selectedCategory}
                                            onChange={handleCategoryChange}
                                            options={categoryOptions}
                                            placeholder="Chọn"
                                        />
                                    </div>
                                )}
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
                                    onChange={(option) => setSelectedStatus(option.value)}
                                    options={statusOptions}
                                    placeholder="Chọn trạng thái"
                                />
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
                                            <th>STT</th>
                                            <th>Thao tác</th>
                                            <th>Mã đơn</th>
                                            <th>Username</th>
                                            <th>Link</th>
                                            <th>Server</th>
                                            <th>Thông tin</th>
                                            <th>Trạng thái</th>
                                            {selectedCategory && selectedCategory.value === "BÌNH LUẬN" && <th>Bình luận</th>}
                                            <th>Ghi chú</th>
                                            <th>Ngày tạo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order, index) => (
                                            <tr key={index}>
                                                <td>{(currentPage - 1) * limit + index + 1}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleCopyText(order)} // Truyền toàn bộ đối tượng `order`
                                                    >
                                                        Copy
                                                    </button>
                                                </td>
                                                <td>{order.Madon}</td>
                                                <td>{order.username}</td>
                                                <td
                                                    style={{
                                                        maxWidth: "250px",
                                                        whiteSpace: "normal",
                                                        wordWrap: "break-word",
                                                        overflowWrap: "break-word",
                                                    }}
                                                >
                                                    {order.link}
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
                                                    </ul>
                                                    {/* <td>{order.start}</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <span>Bắt đầu</span>
                                                    <span>Đã chạy</span>
                                                    <span>Số lượng mua</span>
                                                    <span>Giá</span> */}
                                                </td>

                                                {/* <td>{Number(order.totalCost).toLocaleString("en-US")}</td> */}
                                                <td>
                                                    {order.status === "Completed" ? (
                                                        <span className="badge bg-success">
                                                            Hoàn thành
                                                        </span>
                                                    ) : order.status === "In progress" ||
                                                        order.status === "Processing" ||
                                                        order.status === "Pending" ? (
                                                        <span className="badge bg-primary">
                                                            Đang chạy
                                                        </span>
                                                    ) : order.status === "Canceled" ? (
                                                        <span className="badge bg-danger">Đã hủy</span>
                                                    ) : (
                                                        <span>{order.status}</span>
                                                    )}
                                                </td>
                                                {selectedCategory &&
                                                    selectedCategory.value === "BÌNH LUẬN" && (
                                                        <td>
                                                            <textarea
                                                                readOnly
                                                                rows={2}
                                                            >
                                                                {order.category === "BÌNH LUẬN"
                                                                    ? order.comments || "Không có bình luận"
                                                                    : ""}
                                                            </textarea>
                                                        </td>
                                                    )}
                                                <td>{order.note}</td>
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
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Trước
                                </button>
                                <span>
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
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

export default Danhsachdon;
