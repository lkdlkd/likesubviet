import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { getUserHistory } from "@/Utils/api";
import { useOutletContext } from "react-router-dom";

export default function HistoryHoantien() {
    const { token, user } = useOutletContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchRefundHistory = async () => {
            setLoading(true);
            try {
                const res = await getUserHistory(token, page, limit, undefined, undefined, "Hoàn tiền");
                setData(res.history || []);
                setTotalPages(res.totalPages || 1);
            } catch (err) {
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRefundHistory();
    }, [token, page, limit]);

    // if (loading) return <div>Đang tải danh sách hoàn tiền...</div>;

    return (
        <div>
            <h3>Danh sách hoàn tiền</h3>
            <div className="table-responsive">
                {loading ? (
                    <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
                        <div className="spinner-border text-primary" role="status" />
                        <span className="ms-2">Đang tải dữ liệu...</span>
                    </div>
                ) : data && data.length > 0 ? (
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Mã đơn</th>
                                <th>Tổng hoàn</th>
                                <th>uid</th>
                                <th>Ngày tạo</th>
                                <th>Diễn tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, idx) => (
                                <tr key={item._id}>
                                    <td>{(page - 1) * limit + idx + 1}</td>
                                    <td>{item.username}</td>
                                    <td>{item.madon}</td>
                                    <td>{Number(Math.round(item.tongtien)).toLocaleString("en-US")}</td>
                                    <td style={{
                                        maxWidth: "250px",
                                        whiteSpace: "normal",
                                        wordWrap: "break-word",
                                        overflowWrap: "break-word",
                                    }}>{item.link}</td>
                                    <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                                    <td>{item.mota || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p>Không có lịch sử hoàn tiền nào.</p>
                )}
            </div>
            {/* Phân trang */}
            {data && data.length > 0 && (
                <div className="pagination d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        Trước
                    </button>
                    <span>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}
