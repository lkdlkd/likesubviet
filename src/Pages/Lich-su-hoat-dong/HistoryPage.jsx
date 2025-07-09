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
    const [searchQuery, setSearchQuery] = useState("");
    const [orderIdSearch, setOrderIdSearch] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
    const [debouncedOrderIdSearch, setDebouncedOrderIdSearch] = useState("");
    const [loading, setLoading] = useState(true);
    // const [errorMessage, setErrorMessage] = useState(null);
    const { token, user } = useOutletContext();
    const role = user?.role || "user"; // Lấy role của người dùng, mặc định là "user" nếu không có
    // Debounce logic cho `searchQuery` và `orderIdSearch`
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setDebouncedOrderIdSearch(orderIdSearch);
        }, 3000);
        return () => {
            clearTimeout(handler); // Xóa timeout nếu người dùng tiếp tục nhập
        };
    }, [searchQuery, orderIdSearch]);

    // Gọi API để lấy dữ liệu lịch sử
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
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
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, page, limit, debouncedSearchQuery, debouncedOrderIdSearch]);

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
        <div className="row">
            <div className="col-md-12">
                <div className="card">
                    {/* <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title mb-0">Lịch sử hoạt động</h2>
                        <div>
                            <button
                                className={`btn btn-sm me-2 ${activeTab === "lichsuhoatdong" ? "btn-light" : "btn-outline-light"}`}
                                onClick={() => setActiveTab("lichsuhoatdong")}
                            >
                                Lịch sử hoạt động
                            </button>
                            <button
                                className={`btn btn-sm ${activeTab === "hoantien" ? "btn-light" : "btn-outline-light"}`}
                                onClick={() => setActiveTab("hoantien")}
                            >
                                Danh sách hoàn tiền
                            </button>
                        </div>
                    </div> */}
                    <div className="card-body">
                        <ul className="nav nav-pills navtab-bg nav-justified mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link w-100 ${activeTab === "lichsuhoatdong" ? "active" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setActiveTab("lichsuhoatdong")}
                                >
                                    Lịch sử hoạt động
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link w-100 ${activeTab === "hoantien" ? "active" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setActiveTab("hoantien")}
                                >
                                    Danh sách hoàn tiền
                                </button>
                            </li>
                        </ul>
                        {activeTab === "lichsuhoatdong" && (
                            <div className="alert alert-info py-2 mb-3">
                                <strong>Đơn hàng có lệnh trừ tiền mà không hiện mã đơn thì đơn hàng đó là đã tiếp nhận đơn, nếu đơn hàng không chạy thì báo admin để kiểm tra xử lý.</strong>
                            </div>
                        )}
                        {activeTab === "lichsuhoatdong" && (
                            <div>
                                <div className="row">
                                    {/* Tìm kiếm theo mã đơn */}
                                    <div className="col-md-6 col-lg-3">
                                        <div className="form">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Tìm theo mã đơn"
                                                    value={orderIdSearch}
                                                    onChange={(e) => setOrderIdSearch(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-primary d-flex align-items-center"
                                                    onClick={handleSearch}
                                                >
                                                    <i className="fas fa-search"></i>
                                                    Tìm
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tìm kiếm theo username */}
                                    <div className="col-md-6 col-lg-3">
                                        <div className="input-group">
                                            {role === "admin" && (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Tìm theo username"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                    <button
                                                        className="btn btn-primary d-flex align-items-center"
                                                        onClick={handleSearch}
                                                    >
                                                        <i className="fas fa-search"></i>
                                                        Tìm
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Thay đổi số lượng bản ghi mỗi trang */}
                                    <div className="col-md-6 col-lg-3">
                                        <div className="form-group">
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

                                {/* Hiển thị bảng lịch sử */}
                                <div className="table-responsive">
                                    {loading ? (
                                        <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
                                            <div className="spinner-border text-primary" role="status" />
                                            <span className="ms-2">Đang tải dữ liệu...</span>
                                        </div>
                                    ) : historyData && historyData.length > 0 ? (
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Username</th>
                                                    <th>Mã đơn</th>
                                                    <th>Hành động</th>
                                                    <th>Link</th>
                                                    <th>Số tiền</th>
                                                    <th>Ngày tạo</th>
                                                    <th>Diễn tả</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyData.map((item, index) => {
                                                    const actionText = item.hanhdong.toLowerCase();
                                                    const isPlusAction =
                                                        actionText.includes("nạp tiền") ||
                                                        actionText.includes("cộng tiền");
                                                    const isRefundAction = actionText.includes("hoàn tiền");
                                                    let rowStyle = {};
                                                    if (isPlusAction) {
                                                        rowStyle = { backgroundColor: "#bcf0d6" };
                                                    } else if (isRefundAction) {
                                                        rowStyle = { backgroundColor: "#ffd6d6" };
                                                    }
                                                    return (
                                                        <tr
                                                            key={item._id}
                                                            style={rowStyle}
                                                        >
                                                            <td>{(page - 1) * limit + index + 1}</td>
                                                            <td>{item.username}</td>
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
                                                                    {Number(item.tienhientai).toLocaleString("en-US")}
                                                                </span>
                                                                {isPlusAction || isRefundAction ? (
                                                                    <>
                                                                        +
                                                                        <span
                                                                            className="badge"
                                                                            style={{ backgroundColor: "#e53935", display: "block", marginBottom: 2 }}
                                                                        >
                                                                            {Number(item.tongtien).toLocaleString("en-US")}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        -
                                                                        <span
                                                                            className="badge"
                                                                            style={{ backgroundColor: "#e53935", display: "block", marginBottom: 2 }}
                                                                        >
                                                                            {Number(item.tongtien).toLocaleString("en-US")}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                =
                                                                <span className="badge bg-success" style={{ display: "block" }}>
                                                                    {Number(item.tienconlai).toLocaleString("en-US")}
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
                                                })}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p>Không có lịch sử hoạt động nào.</p>
                                    )}
                                </div>

                                {/* Phân trang */}
                                {historyData && historyData.length > 0 && (
                                    <div className="pagination d-flex justify-content-between align-items-center mt-3">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            Trước
                                        </button>
                                        <span>
                                            Trang {page} / {totalPages}
                                        </span>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                        >
                                            Sau
                                        </button>
                                    </div>
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
    );
}
