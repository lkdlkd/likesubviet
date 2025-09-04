import React, { useState, useEffect } from "react";
import { getTransactions } from "@/Utils/api";
import Table from "react-bootstrap/Table";
import moment from "moment";
import { loadingg } from "@/JS/Loading";

export default function Naptientudong() {
    const [transactions, setTransactions] = useState([]); // Lưu danh sách giao dịch
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Trạng thái lỗi
    const [page, setPage] = useState(1); // Trang hiện tại
    const [limit, setLimit] = useState(10); // Số lượng giao dịch mỗi trang
    const [hasMore, setHasMore] = useState(false); // Kiểm tra xem còn dữ liệu để phân trang không
    const [searchInput, setSearchInput] = useState(""); // Giá trị nhập vào ô tìm kiếm
    const [search, setSearch] = useState(""); // Giá trị tìm kiếm thực tế (khi nhấn nút)

    const fetchTransactions = async () => {
        setLoading(true);
        loadingg("Đang tải danh sách giao dịch...");
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const data = await getTransactions(token, page, limit, search); // Gọi API với page, limit và search
            setTransactions(data); // Lưu danh sách giao dịch
            setHasMore(data.length === limit); // Nếu số lượng giao dịch trả về bằng `limit`, có thể còn dữ liệu
        } catch (err) {
            setError("Không thể tải danh sách giao dịch.");
        } finally {
            setLoading(false); // Kết thúc tải dữ liệu
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, limit, search]); // Gọi lại API khi page, limit hoặc search thay đổi

    const handleSearch = () => {
        setError(null); // Xóa lỗi trước khi tìm kiếm
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
        setSearch(searchInput); // Cập nhật giá trị tìm kiếm thực tế
    };

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">Quản lý nạp tiền tự động</h2>
                    </div>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <label htmlFor="limitSelect" className="me-2">
                                    Hiển thị:
                                </label>
                                <select
                                    id="limitSelect"
                                    className="form-select d-inline-block w-auto"
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={500}>500</option>
                                </select>
                            </div>
                            <div className="d-flex">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Tìm kiếm theo username"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={handleSearch}>
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>
                        {loading ? (
                            <p>Đang tải dữ liệu...</p>
                        ) : error ? (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Ngân hàng</th>
                                        <th>Username</th>
                                        <th>Mã giao dịch</th>
                                        <th>Số tiền</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian</th>
                                        <th>Nội dung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={8} className="text-center">
                                            <div>
                                                <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                <p className="font-semibold" >Không có dữ liệu</p>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                        ) : (
                            <>
                                <Table bordered responsive hover>
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Ngân hàng</th>
                                            <th>Username</th>
                                            <th>Mã giao dịch</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                            <th>Nội dung</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.length > 0 ? (
                                            transactions.map((transaction, index) => (
                                                <tr key={transaction._id || index}>
                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                    <td>{transaction.typeBank || "N/A"}</td>
                                                    <td>{transaction.username || "N/A"}</td>
                                                    <td>{transaction.transactionID || "N/A"}</td>
                                                    <td>{transaction.amount || "N/A"}</td>
                                                    <td>
                                                        {transaction.status === "COMPLETED" ? (
                                                            <span className="badge bg-success">Thành công</span>
                                                        ) : (
                                                            <span className="badge bg-danger">Thất bại</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {moment(transaction.transactionDate).format(
                                                            "YYYY-MM-DD HH:mm:ss"
                                                        ) || "N/A"}
                                                    </td>
                                                    <td>{transaction.description || "N/A"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    Không có giao dịch nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>Trang {page}</span>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setPage((prev) => (hasMore ? prev + 1 : prev))}
                                        disabled={!hasMore}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}