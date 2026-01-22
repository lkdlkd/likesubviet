import React, { useState, useEffect } from "react";
import { getAffiliateCommissions, approveAffiliateCommission, rejectAffiliateCommission } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";

const AffiliateCommissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            loadingg("Đang tải...", true, 9999999);
            const token = localStorage.getItem("token");
            const data = await getAffiliateCommissions(token, status, page, 20);
            setCommissions(data.commissions || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            toast.error("Không thể tải danh sách hoa hồng!");
        } finally {
            setLoading(false);
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, [status, page]);

    const handleApprove = async (commissionId) => {
        const result = await Swal.fire({
            title: 'Xác nhận duyệt?',
            text: "Số tiền sẽ được cộng vào tài khoản người nhận!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Duyệt',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                loadingg("Đang xử lý...", true, 9999999);
                const token = localStorage.getItem("token");
                const data = await approveAffiliateCommission(token, commissionId);
                toast.success(data.message || "Duyệt thành công!");
                fetchCommissions();
            } catch (error) {
                toast.error(error.message || "Có lỗi xảy ra!");
            } finally {
                loadingg("", false);
            }
        }
    };

    const handleReject = async (commissionId) => {
        const { value: reason } = await Swal.fire({
            title: 'Từ chối hoa hồng',
            input: 'textarea',
            inputLabel: 'Lý do từ chối',
            inputPlaceholder: 'Nhập lý do (tuỳ chọn)...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Từ chối',
            cancelButtonText: 'Hủy'
        });

        if (reason !== undefined) {
            try {
                loadingg("Đang xử lý...", true, 9999999);
                const token = localStorage.getItem("token");
                await rejectAffiliateCommission(token, commissionId, reason);
                toast.success("Đã từ chối hoa hồng!");
                fetchCommissions();
            } catch (error) {
                toast.error(error.message || "Có lỗi xảy ra!");
            } finally {
                loadingg("", false);
            }
        }
    };

    const formatMoney = (num) => Number(num || 0).toLocaleString('vi-VN');
    const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

    const getStatusBadge = (s) => {
        switch (s) {
            case 'pending': return <span className="badge bg-warning text-dark">Chờ duyệt</span>;
            case 'approved': return <span className="badge bg-success">Đã duyệt</span>;
            case 'rejected': return <span className="badge bg-danger">Từ chối</span>;
            default: return <span className="badge bg-secondary">{s}</span>;
        }
    };

    // SVG empty state
    const EmptyState = () => (
        <tr>
            <td colSpan={12} className="text-center py-5">
                <div>
                    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                    <p className="font-semibold mt-3">Không có dữ liệu</p>
                </div>
            </td>
        </tr>
    );

    return (
        <>
            <style>
                {`
                    .aff-comm {
                        --aff-primary: #3b82f6;
                        --aff-primary-dark: #2563eb;
                        --aff-bg: #ffffff;
                        --aff-bg-secondary: #f8fafc;
                        --aff-border: #e2e8f0;
                        --aff-text: #1e293b;
                        --aff-text-secondary: #64748b;
                        --aff-success: #22c55e;
                        --aff-danger: #ef4444;
                    }
                    
                    [data-bs-theme="dark"] .aff-comm,
                    .dark .aff-comm {
                        --aff-primary: #60a5fa;
                        --aff-primary-dark: #3b82f6;
                        --aff-bg: #1e293b;
                        --aff-bg-secondary: #334155;
                        --aff-border: #475569;
                        --aff-text: #f1f5f9;
                        --aff-text-secondary: #94a3b8;
                        --aff-success: #4ade80;
                        --aff-danger: #f87171;
                    }
                    
                    .aff-comm .aff-card {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    
                    .aff-comm .aff-header {
                        background: var(--aff-primary);
                        padding: 1.25rem 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    
                    .aff-comm .aff-header-left {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    
                    .aff-comm .aff-header-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .aff-comm .aff-header-icon i {
                        font-size: 20px;
                        color: #fff;
                    }
                    
                    .aff-comm .aff-header-title {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #fff;
                        margin: 0;
                    }
                    
                    .aff-comm .aff-header-sub {
                        font-size: 0.875rem;
                        color: rgba(255,255,255,0.8);
                        margin: 0;
                    }
                    
                    .aff-comm .aff-filter {
                        border-radius: 8px;
                        padding: 0.5rem 1rem;
                        font-weight: 500;
                    }
                    
                    .aff-comm .aff-filter option {
                        background: var(--aff-bg);
                        color: var(--aff-text);
                    }
                    
                    .aff-comm .aff-body {
                        padding: 1rem;
                    }
                    
                    .aff-comm .aff-user {
                        font-weight: 600;
                        color: var(--aff-primary);
                    }
                    
                    .aff-comm .aff-amount {
                        font-weight: 700;
                        color: var(--aff-success);
                    }
                    
                    .aff-comm .aff-date {
                        color: var(--aff-text-secondary);
                        font-size: 0.85rem;
                    }
                    
                    .aff-comm .aff-btn {
                        padding: 0.4rem 0.75rem;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 0.85rem;
                        border: none;
                        cursor: pointer;
                        transition: opacity 0.2s;
                    }
                    
                    .aff-comm .aff-btn:hover {
                        opacity: 0.85;
                    }
                    
                    .aff-comm .aff-btn-approve {
                        background: var(--aff-success);
                        color: #fff;
                    }
                    
                    .aff-comm .aff-btn-reject {
                        background: var(--aff-danger);
                        color: #fff;
                    }
                    
                    .aff-comm .aff-pagination {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 1rem;
                        border-top: 1px solid var(--aff-border);
                    }
                    
                    .aff-comm .aff-page-btn {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        color: var(--aff-text);
                        padding: 0.5rem 0.75rem;
                        border-radius: 6px;
                        cursor: pointer;
                    }
                    
                    .aff-comm .aff-page-btn:hover:not(:disabled) {
                        background: var(--aff-primary);
                        color: #fff;
                        border-color: var(--aff-primary);
                    }
                    
                    .aff-comm .aff-page-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    .aff-comm .aff-page-info {
                        background: var(--aff-primary);
                        color: #fff;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                    }
                    
                    @media (max-width: 768px) {
                        .aff-comm .aff-header {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .aff-comm .aff-header-left {
                            flex-direction: column;
                        }
                        
                        .aff-comm .aff-btn {
                            padding: 0.35rem 0.5rem;
                            font-size: 0.75rem;
                        }
                    }
                `}
            </style>

            <div className="aff-comm">
                <div className="row">
                    <div className="col-12">
                        <div className="aff-card">
                            <div className="aff-header">
                                <div className="aff-header-left">
                                    <div className="aff-header-icon">
                                        <i className="fas fa-hand-holding-usd"></i>
                                    </div>
                                    <div>
                                        <h2 className="aff-header-title">Duyệt hoa hồng Affiliate</h2>
                                        <p className="aff-header-sub">Tổng: {total} yêu cầu</p>
                                    </div>
                                </div>
                                <select
                                    className="form-select aff-filter"
                                    value={status}
                                    onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                >
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="rejected">Từ chối</option>
                                    <option value="all">Tất cả</option>
                                </select>
                            </div>

                            <div className="aff-body">
                                <div className="table-responsive">
                                    <Table striped bordered hover>
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Người nhận</th>
                                                <th>Từ</th>
                                                <th className="text-end">Nạp</th>
                                                <th className="text-end">Hoa hồng</th>
                                                <th className="text-center">Trạng thái</th>
                                                <th>Thời gian</th>
                                                {status === 'pending' && <th className="text-center">Thao tác</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <EmptyState />
                                            ) : commissions.length > 0 ? (
                                                commissions.map((c) => (
                                                    <tr key={c._id}>
                                                        <td className="aff-user">{c.referrerUsername}</td>
                                                        <td>{c.depositorUsername}</td>
                                                        <td className="text-end">{formatMoney(c.depositAmount)} đ</td>
                                                        <td className="text-end">
                                                            <span className="aff-amount">+{formatMoney(c.commissionAmount)} đ</span>
                                                            <small className="text-muted ms-1">({c.commissionPercent}%)</small>
                                                        </td>
                                                        <td className="text-center">{getStatusBadge(c.status)}</td>
                                                        <td className="aff-date">{formatDate(c.createdAt)}</td>
                                                        {status === 'pending' && (
                                                            <td className="text-center">
                                                                <button
                                                                    className="aff-btn aff-btn-approve me-1"
                                                                    onClick={() => handleApprove(c._id)}
                                                                >
                                                                    <i className="fas fa-check me-1"></i>Duyệt
                                                                </button>
                                                                <button
                                                                    className="aff-btn aff-btn-reject"
                                                                    onClick={() => handleReject(c._id)}
                                                                >
                                                                    <i className="fas fa-times me-1"></i>Từ chối
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <EmptyState />
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>

                            {totalPages > 1 && (
                                <div className="aff-pagination">
                                    <button
                                        className="aff-page-btn"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <span className="aff-page-info">Trang {page}/{totalPages}</span>
                                    <button
                                        className="aff-page-btn"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AffiliateCommissions;
