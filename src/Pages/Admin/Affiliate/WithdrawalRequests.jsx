import React, { useState, useEffect } from "react";
import { getAdminWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";

const WithdrawalRequests = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [searchKey, setSearchKey] = useState(''); // trigger fetch

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            loadingg("Đang tải...", true, 9999999);
            const token = localStorage.getItem("token");
            const data = await getAdminWithdrawals(token, status, page, 20, searchKey);
            setWithdrawals(data.withdrawals || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            toast.error("Không thể tải danh sách!");
        } finally {
            setLoading(false);
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [status, page, searchKey]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearchKey(search); // trigger useEffect
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchKey('');
        setPage(1);
    };

    const handleApprove = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận duyệt?',
            text: "Nếu rút về số dư, tiền sẽ được cộng vào tài khoản user!",
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
                const data = await approveWithdrawal(token, id);
                toast.success(data.message || "Duyệt thành công!");
                fetchWithdrawals();
            } catch (error) {
                toast.error(error.message || "Có lỗi xảy ra!");
            } finally {
                loadingg("", false);
            }
        }
    };

    const handleReject = async (id) => {
        const { value: reason } = await Swal.fire({
            title: 'Từ chối yêu cầu',
            input: 'textarea',
            inputLabel: 'Lý do (tiền sẽ được hoàn lại)',
            inputPlaceholder: 'Nhập lý do...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Từ chối & Hoàn tiền',
            cancelButtonText: 'Hủy'
        });

        if (reason !== undefined) {
            try {
                loadingg("Đang xử lý...", true, 9999999);
                const token = localStorage.getItem("token");
                await rejectWithdrawal(token, id, reason);
                toast.success("Đã từ chối và hoàn tiền!");
                fetchWithdrawals();
            } catch (error) {
                toast.error(error.message || "Có lỗi xảy ra!");
            } finally {
                loadingg("", false);
            }
        }
    };

    const formatMoney = (num) => Math.floor(Number(num)).toLocaleString("en-US");
    const formatDate = (date) => new Date(date).toLocaleString('vi-VN');

    const getStatusBadge = (s) => {
        switch (s) {
            case 'pending': return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
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
                    .wd-comm {
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
                    
                    [data-bs-theme="dark"] .wd-comm,
                    .dark .wd-comm {
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
                    
                    .wd-comm .aff-card {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    
                    .wd-comm .aff-header {
                        background: var(--aff-primary);
                        padding: 1.25rem 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    
                    .wd-comm .aff-header-left {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    
                    .wd-comm .aff-header-icon {
                        width: 44px;
                        height: 44px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .wd-comm .aff-header-icon i {
                        font-size: 20px;
                        color: #fff;
                    }
                    
                    .wd-comm .aff-header-title {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #fff;
                        margin: 0;
                    }
                    
                    .wd-comm .aff-header-sub {
                        font-size: 0.875rem;
                        color: rgba(255,255,255,0.8);
                        margin: 0;
                    }
                    
                    .wd-comm .aff-filter {
                        border-radius: 8px;
                        padding: 0.5rem 1rem;
                        font-weight: 500;
                    }
                    
                    .wd-comm .aff-filter option {
                        background: var(--aff-bg);
                        color: var(--aff-text);
                    }
                    
                    .wd-comm .aff-body {
                        padding: 1rem;
                    }
                    
                    .wd-comm .aff-user {
                        font-weight: 600;
                        color: var(--aff-primary);
                    }
                    
                    .wd-comm .aff-amount {
                        font-weight: 700;
                        color: var(--aff-success);
                    }
                    
                    .wd-comm .aff-date {
                        color: var(--aff-text-secondary);
                        font-size: 0.85rem;
                    }
                    
                    .wd-comm .aff-btn {
                        padding: 0.4rem 0.75rem;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 0.85rem;
                        border: none;
                        cursor: pointer;
                        transition: opacity 0.2s;
                    }
                    
                    .wd-comm .aff-btn:hover {
                        opacity: 0.85;
                    }
                    
                    .wd-comm .aff-btn-approve {
                        background: var(--aff-success);
                        color: #fff;
                    }
                    
                    .wd-comm .aff-btn-reject {
                        background: var(--aff-danger);
                        color: #fff;
                    }
                    
                    .wd-comm .aff-pagination {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 1rem;
                        border-top: 1px solid var(--aff-border);
                    }
                    
                    .wd-comm .aff-page-btn {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        color: var(--aff-text);
                        padding: 0.5rem 0.75rem;
                        border-radius: 6px;
                        cursor: pointer;
                    }
                    
                    .wd-comm .aff-page-btn:hover:not(:disabled) {
                        background: var(--aff-primary);
                        color: #fff;
                        border-color: var(--aff-primary);
                    }
                    
                    .wd-comm .aff-page-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    .wd-comm .aff-page-info {
                        background: var(--aff-primary);
                        color: #fff;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-weight: 500;
                    }
                    
                    .wd-comm .aff-bank-info {
                        font-size: 0.8rem;
                        color: var(--aff-text-secondary);
                    }
                    
                    @media (max-width: 768px) {
                        .wd-comm .aff-header {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .wd-comm .aff-header-left {
                            flex-direction: column;
                        }
                        
                        .wd-comm .aff-btn {
                            padding: 0.35rem 0.5rem;
                            font-size: 0.75rem;
                        }
                    }
                `}
            </style>

            <div className="wd-comm">
                <div className="row">
                    <div className="col-12">
                        {/* Header Card */}
                        <div className="aff-card mb-3">
                            <div className="aff-header">
                                <div className="aff-header-left">
                                    <div className="aff-header-icon">
                                        <i className="fas fa-money-bill-transfer"></i>
                                    </div>
                                    <div>
                                        <h2 className="aff-header-title">Duyệt rút hoa hồng</h2>
                                        <p className="aff-header-sub">Tổng: {total} yêu cầu</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search/Filter Form */}
                        <div className="aff-card mb-3">
                            <div className="aff-body">
                                <form onSubmit={handleSearch}>
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="form-label fw-semibold">Tìm kiếm</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nhập username..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-semibold">Trạng thái</label>
                                            <select
                                                className="form-select"
                                                value={status}
                                                onChange={(e) => { setStatus(e.target.value); setPage(1); setSearchKey(''); setSearch(''); }}
                                            >
                                                <option value="pending">Chờ xử lý</option>
                                                <option value="approved">Đã duyệt</option>
                                                <option value="rejected">Từ chối</option>
                                                <option value="all">Tất cả</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <button type="submit" className="btn btn-primary w-100">
                                                <i className="fas fa-search me-2"></i>Tìm kiếm
                                            </button>
                                        </div>
                                        {searchKey && (
                                            <div className="col-md-2">
                                                <button type="button" className="btn btn-outline-secondary w-100" onClick={handleClearSearch}>
                                                    <i className="fas fa-times me-1"></i>Xóa lọc
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Table Card */}
                        <div className="aff-card">
                            <div className="aff-body">
                                <Table striped bordered responsive hover>
                                    <thead className="table-primary">
                                        <tr>
                                            <th>Thao tác</th>
                                            <th>Người dùng</th>
                                            <th>Số tiền</th>
                                            <th>Phí</th>
                                            <th>Thực nhận</th>
                                            <th>Loại</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <EmptyState />
                                        ) : withdrawals.length > 0 ? (
                                            withdrawals.map((w) => (
                                                <tr key={w._id}>

                                                    <td className="text-center">
                                                        <div className="dropdown-placeholder mt-1">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                type="button"
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded="false"
                                                            >
                                                                Thao tác <i className="las la-angle-right ms-1"></i>
                                                            </button>
                                                            <ul className="dropdown-menu">
                                                                {w.status === "pending" && (
                                                                    <li>

                                                                        <button
                                                                            className="dropdown-item text-success"
                                                                            onClick={() => handleApprove(w._id)}

                                                                        >
                                                                            Duyệt
                                                                        </button>
                                                                        <button
                                                                            className="dropdown-item text-danger"
                                                                            onClick={() => handleReject(w._id)}
                                                                        >
                                                                            Từ chối
                                                                        </button>

                                                                    </li>
                                                                )}

                                                            </ul>
                                                        </div>
                                                    </td>

                                                    <td>{w.username}</td>
                                                    <td>{formatMoney(w.amount)} đ</td>
                                                    <td>{formatMoney(w.fee)} đ</td>
                                                    <td>
                                                        <span className="aff-amount">{formatMoney(w.netAmount)} đ</span>
                                                    </td>
                                                    <td>{w.type === 'bank' ? <td>
                                                        Ngân hàng: <span>{w.bankInfo?.bankName}</span> <br />
                                                        STK: <span>{w.bankInfo?.accountNumber}</span> <br />
                                                        Tên chủ TK: <span>{w.bankInfo?.accountName}</span>
                                                    </td> : <span >Số dư web</span>}</td>
                                                    <td>{getStatusBadge(w.status)}</td>
                                                    <td>{formatDate(w.createdAt)}</td>

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
                            <div className="aff-card mt-3">
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WithdrawalRequests;
