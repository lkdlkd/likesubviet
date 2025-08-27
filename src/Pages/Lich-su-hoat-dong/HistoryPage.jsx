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
