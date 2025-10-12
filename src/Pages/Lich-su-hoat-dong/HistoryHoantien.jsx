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
    // Responsive number of visible page buttons (desktop: 10, mobile: 4)
    const [maxVisible, setMaxVisible] = useState(4);

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

    // Update maxVisible based on screen width (>=1200: 20, 700-1199: 15, <700: 5)
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
            } catch {
                // no-op
            }
        };
        updateMaxVisible();
        window.addEventListener('resize', updateMaxVisible);
        return () => window.removeEventListener('resize', updateMaxVisible);
    }, []);

    // if (loading) return <div>Đang tải danh sách hoàn tiền...</div>;

    return (
        <>
            <style>
                {`
                    .refund-section {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .refund-title {
                        font-size: 20px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 1.5rem;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .refund-title::before {
                        content: '';
                        width: 4px;
                        height: 24px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-radius: 2px;
                    }
                    
                    .refund-table-container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                        border: 1px solid #e8ecef;
                        margin-bottom: 1.5rem;
                    }
                    
                    .refund-pagination {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 12px;
                        padding: 1rem 1.5rem;
                        margin-top: 1.5rem;
                    }
                    
                    .refund-pagination .btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        margin: 0 0.25rem;
                    }
                    
                    .refund-pagination .btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
                    }
                    
                    .refund-pagination .btn:disabled {
                        background: #6c757d;
                        opacity: 0.6;
                    }
                    
                    .refund-pagination .btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                    }
                    
                    .refund-pagination .btn-outline-secondary {
                        background: white;
                        border: 1px solid #dee2e6;
                        color: #6c757d;
                    }
                    
                    .refund-pagination .btn-outline-secondary:hover {
                        background: #f8f9fa;
                        border-color: #667eea;
                        color: #667eea;
                    }
                `}
            </style>

            <div className="refund-section">
                <h3 className="refund-title">
                    <i className="fas fa-undo-alt"></i>
                    Danh sách hoàn tiền
                </h3>

                <div className="refund-table-container p-3">
                    <Table striped Responsive bordered hover>
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
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center">
                                            <div className="spinner-border text-primary mb-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span className="mt-2">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data && data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        <div>
                                            <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                            <p className="font-semibold" >Không có dữ liệu</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={item._id}>
                                        <td>{(page - 1) * limit + idx + 1}</td>
                                        <td>{item.username}</td>
                                        <td>{item.madon}</td>
                                        <td>{Math.floor(Number(item.tongtien)).toLocaleString("en-US")}</td>
                                        <td style={{
                                            maxWidth: "250px",
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                        }}>{item.link}</td>
                                        <td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
                                        <td>{item.mota || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Phân trang */}
                {data && data.length > 0 && (
                    <>
                        <span>
                            Trang {page} / {totalPages}
                        </span>
                        <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                            {/* Arrow + numbers + arrow grouped together */}
                            <div
                                className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                                style={{ maxWidth: '100%' }}
                            >
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    aria-label="Trang trước"
                                    title="Trang trước"
                                >
                                    <i className="fas fa-angle-left"></i>
                                </button>

                                {(() => {
                                    const pages = [];
                                    const start = Math.max(1, page - Math.floor(maxVisible / 2));
                                    const end = Math.min(totalPages, start + maxVisible - 1);
                                    const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                                    // Leading first page and ellipsis
                                    if (adjustedStart > 1) {
                                        pages.push(
                                            <button key={1} className={`btn btn-sm ${page === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(1)}>1</button>
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
                                                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => setPage(p)}
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
                                            <button key={totalPages} className={`btn btn-sm ${page === totalPages ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(totalPages)}>{totalPages}</button>
                                        );
                                    }

                                    return pages;
                                })()}

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages}
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
        </>);
}
