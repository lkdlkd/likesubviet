import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { useOutletContext } from "react-router-dom";
import { getOrders, getServer } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này

const Danhsachdon = () => {
    const { token, categories } = useOutletContext();
    // const [servers, setServers] = useState([]);
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
    const userRole = decoded?.role || "user";
    const username = decoded.username;

    // useEffect(() => {
    //     const fetchServers = async () => {
    //         try {
    //             const response = await getServer(token); // Gọi API với token
    //             setServers(response.data || []); // Cập nhật danh sách servers
    //         } catch (error) {
    //           //  console.error("Lỗi khi gọi API getServer:", error);
    //             toast.error("Không có server!");

    //         }
    //     };

    //     if (token) {
    //         fetchServers(); // Gọi hàm fetchServers nếu có token
    //     }
    // }, [token]); // Chỉ gọi lại khi `token` thay đổi
    // Lấy danh sách nền tảng (type) duy nhất từ categories
    const uniqueTypes = useMemo(() => {
        if (!Array.isArray(categories)) return [];
        return Array.from(new Set(categories.map((cat) => cat.platforms_id?.name)));
    }, [categories]);

    // Tạo options cho react-select cho Nền tảng (Type)
    const typeOptions = uniqueTypes.map((type) => ({
        value: type,
        label: type,
    }));

    // Nếu đã chọn một Type, tạo danh sách options cho Category dựa theo Type đóW
    const categoryOptions = useMemo(() => {
        if (!selectedType || !Array.isArray(categories)) return [];
        const filtered = categories.filter((cat) => cat.platforms_id?.name === selectedType.value);
        return filtered.map((cat) => ({
            value: cat.name, // hoặc cat.path nếu muốn
            label: cat.name, // hoặc cat.path nếu muốn
        }));
    }, [categories, selectedType]);

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
            // toast.error("Không có đơn hàng nào!");
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
        loadingg("Vui lòng chờ...",true , 9999999); // Hiển thị thông báo đang tìm kiếm
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
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-3">
                                {/* {selectedType && ( */}
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
                                {/* )} */}
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
                                    isClearable
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
                                // <Table striped bordered hover responsive>
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
                                    <tbody >
                                        {filteredOrders.map((order, index) => (
                                            <tr key={index}>
                                                <td>{order.Madon}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => handleCopyText(order)} // Truyền toàn bộ đối tượng `order`
                                                    >
                                                        Copy
                                                    </button>
                                                </td>
                                                <td>{order.username}</td>
                                                {/* <td
                                                    style={{
                                                        maxWidth: "250px",
                                                        whiteSpace: "normal",
                                                        wordWrap: "break-word",
                                                        overflowWrap: "break-word",
                                                    }}
                                                >
                                                    <a href={order.ObjectLink || ""}>{order.link}</a>
                                                </td> */}
                                                <td style={{
                                                    maxWidth: "250px",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}>
                                                    <p><a href={order.ObjectLink} target="_blank">{order.link}</a></p>
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
                                                    ) : order.status === "Partial" ? (
                                                        <span className="badge bg-warning text-dark">Đã hoàn 1 phần</span>
                                                    ) : order.status === "Canceled" ? (
                                                        <span className="badge bg-danger">Đã hủy</span>
                                                    ) : (
                                                        <span>{order.status}</span>
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
                                                        { order.comments || "" }
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
