import React, { useState, useEffect } from "react";
import { getTransactions } from "@/Utils/api";
import Table from "react-bootstrap/Table";
import moment from "moment";

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
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const data = await getTransactions(token, page, limit, search); // Gọi API với page, limit và search
            setTransactions(data); // Lưu danh sách giao dịch
            setHasMore(data.length === limit); // Nếu số lượng giao dịch trả về bằng `limit`, có thể còn dữ liệu
        } catch (err) {
            setError("Không thể tải danh sách giao dịch.");
          //  console.error(err);
        } finally {
            setLoading(false); // Kết thúc tải dữ liệu
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
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
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
                            <p className="text-danger">{error}</p>
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