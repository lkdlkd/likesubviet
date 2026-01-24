import React, { useState, useEffect } from "react";
import { getAdminWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/Utils/api";
import { toast } from "react-toastify"
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
    const [maxVisible, setMaxVisible] = useState(5);

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            loadingg("Đang tải...", true, 9999999);
            const token = localStorage.getItem("token");
            const data = await getAdminWithdrawals(token, status, page, 10, searchKey);
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

    // Responsive number of visible page buttons
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
            } catch { /* no-op for non-browser envs */ }
        };
        updateMaxVisible();
        window.addEventListener('resize', updateMaxVisible);
        return () => window.removeEventListener('resize', updateMaxVisible);
    }, []);

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

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        {/* Header Card */}
                        <div className="card-header bg-primary text-white">
                            <i className="fas fa-wallet me-2"></i>Duyệt rút hoa hồng
                        </div>

                        {/* Search/Filter Form */}
                        <div className="card-body p-3">
                            <form onSubmit={handleSearch}>
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold text-muted mb-2">Tìm kiếm</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập username..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold text-muted mb-2">Trạng thái</label>
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
                                    <div className="col-12">
                                        <div className="text-muted">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Tổng: <strong>{total}</strong> yêu cầu
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Table Card */}
                        <div className="card-body p-2">
                            <Table striped bordered responsive hover>
                                <thead className="table-primary">
                                    <tr>
                                        <th>Thao tác</th>
                                        <th>Người dùng</th>
                                        <th>Số tiền</th>
                                        <th>Thông tin thanh toán</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian</th>
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
                                                                <>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item text-success"
                                                                            onClick={() => handleApprove(w._id)}
                                                                        >
                                                                            Duyệt
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            className="dropdown-item text-danger"
                                                                            onClick={() => handleReject(w._id)}
                                                                        >
                                                                            Từ chối
                                                                        </button>
                                                                    </li>
                                                                </>
                                                            )}
                                                            {w.status !== "pending" && (
                                                                <li>
                                                                    <span className="dropdown-item text-muted">Không có thao tác</span>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-primary">{w.username}</td>
                                                <td>
                                                    số tiền: <span>{formatMoney(w.amount)}</span> <br />
                                                    phí: <span>{formatMoney(w.fee)}</span> <br />
                                                    số tiền nhận: <span>{formatMoney(w.netAmount)}</span>
                                                </td>
                                                <td>
                                                    {w.type === 'bank' ? (
                                                        <>
                                                            Ngân hàng: <span>{w.bankInfo?.bankName}</span> <br />
                                                            STK: <span>{w.bankInfo?.accountNumber}</span> <br />
                                                            Tên chủ TK: <span>{w.bankInfo?.accountName}</span>
                                                        </>
                                                    ) : (
                                                        <span>Số dư web</span>
                                                    )}
                                                </td>
                                                <td>{getStatusBadge(w.status)}</td>
                                                <td>{formatDate(w.createdAt)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <EmptyState />
                                    )}
                                </tbody>
                            </Table>
                            {totalPages > 1 && (
                                <>
                                    <span className="text-muted">Trang {page} / {totalPages}</span>
                                    <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                                        <div
                                            className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                                            style={{ maxWidth: '100%' }}
                                        >
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={page === 1}
                                            >
                                                <i className="fas fa-angle-left"></i>
                                            </button>

                                            {(() => {
                                                const pages = [];
                                                const start = Math.max(1, page - Math.floor(maxVisible / 2));
                                                const end = Math.min(totalPages, start + maxVisible - 1);
                                                const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                                                if (adjustedStart > 1) {
                                                    pages.push(
                                                        <button key={1} className={`btn btn-sm ${page === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(1)}>1</button>
                                                    );
                                                    if (adjustedStart > 2) {
                                                        pages.push(<span key="start-ellipsis" className="px-1">...</span>);
                                                    }
                                                }

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

                                                if (end < totalPages) {
                                                    if (end < totalPages - 1) {
                                                        pages.push(<span key="end-ellipsis" className="px-1">...</span>);
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
                                            >
                                                <i className="fas fa-angle-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WithdrawalRequests;
