import React, { useState, useEffect } from "react";
import { getTransactions } from "@/Utils/api";

const HistoryBanking = ({ token }) => {
    const [history, setHistory] = useState([]); // Danh sách giao dịch
    const [page, setPage] = useState(1); // Trang hiện tại
    const [limit, setLimit] = useState(10); // Số lượng giao dịch mỗi trang
    const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const data = await getTransactions(token, page, limit); // Gọi API với page và limit
                setHistory(data || []); // Lưu danh sách giao dịch
            } catch (error) {
                // console.error("Lỗi khi lấy danh sách giao dịch:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [page, limit, token]); // Gọi lại API khi `page`, `limit`, hoặc `token` thay đổi

    return (
        <div className="col-md-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title">Lịch sử nạp tiền ngân hàng</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <>
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

                                    </select>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Username</th>
                                            <th>Số tiền</th>
                                            <th>Nội dung</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history && history.length > 0 ? (
                                            history.map((transaction, index) => (
                                                <tr key={transaction._id || index}>
                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                    <td>{transaction.username || "N/A"}</td>
                                                    <td>
                                                        {Number(transaction.amount || 0).toLocaleString("en-US")} VNĐ
                                                    </td>
                                                    <td>{transaction.note || "N/A"}</td>
                                                    <td>
                                                        {new Date(transaction.createdAt).toLocaleString("vi-VN", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            second: "2-digit",
                                                        })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    Không có dữ liệu nạp tiền
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={history.length < limit}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryBanking;