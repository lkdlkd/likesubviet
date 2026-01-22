import { useState, useEffect } from 'react';
import { getAffiliateInfo, getAffiliateReferrals, getMyPendingCommissions, requestCommissionWithdrawal, getMyWithdrawals, getBankList } from '@/Utils/api';
import Table from "react-bootstrap/Table";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function AffiliatePanel({ token }) {
    const [affiliateInfo, setAffiliateInfo] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pendingInfo, setPendingInfo] = useState({ totalPending: 0, count: 0, pendingCommissions: [] });
    const { configWeb } = useOutletContext();
    // Withdrawal states
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawType, setWithdrawType] = useState('balance');
    const [bankInfo, setBankInfo] = useState({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
    const [bankList, setBankList] = useState([]);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);

    useEffect(() => {
        fetchAffiliateInfo();
        fetchPendingInfo();
        fetchWithdrawals();
        fetchBankList();
    }, []);

    const fetchBankList = async () => {
        try {
            const res = await getBankList();
            if (res?.data) setBankList(res.data);
        } catch (err) { }
    };

    useEffect(() => {
        fetchReferrals();
    }, [page]);

    const fetchAffiliateInfo = async () => {
        try {
            const data = await getAffiliateInfo(token);
            setAffiliateInfo(data);
        } catch (err) { }
        finally { setLoading(false); }
    };

    const fetchPendingInfo = async () => {
        try {
            const data = await getMyPendingCommissions(token);
            setPendingInfo({
                totalPending: data.totalPending || 0,
                count: data.count || 0,
                pendingCommissions: data.pendingCommissions || []
            });
        } catch (err) { }
    };

    const fetchReferrals = async () => {
        try {
            const data = await getAffiliateReferrals(token, page, 10, 1);
            setReferrals(data.referrals || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) { }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatMoney = (amount) => Math.floor(Number(amount)).toLocaleString("en-US");

    const fetchWithdrawals = async () => {
        try {
            const data = await getMyWithdrawals(token, 1, 10);
            setWithdrawals(data.withdrawals || []);
        } catch (err) { }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        const amount = Number(withdrawAmount);
        if (!amount || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }
        if (amount > (affiliateInfo?.commissionBalance || 0)) {
            toast.error('Số dư hoa hồng không đủ');
            return;
        }
        if (withdrawType === 'bank' && (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName)) {
            toast.error('Vui lòng nhập đầy đủ thông tin ngân hàng');
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận rút hoa hồng?',
            html: `Rút <b>${formatMoney(amount)} VNĐ</b> về ${withdrawType === 'bank' ? 'ngân hàng' : 'số dư tài khoản'}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                setWithdrawing(true);
                const data = { amount, type: withdrawType };
                if (withdrawType === 'bank') data.bankInfo = bankInfo;
                const res = await requestCommissionWithdrawal(data, token);
                toast.success(res.message || 'Yêu cầu rút hoa hồng đã được gửi!');
                setWithdrawAmount('');
                fetchAffiliateInfo();
                fetchWithdrawals();
            } catch (err) {
                toast.error(err.message || err.error || 'Có lỗi xảy ra');
            } finally {
                setWithdrawing(false);
            }
        }
    };

    const getStatusBadge = (s) => {
        switch (s) {
            case 'pending': return <span className="badge bg-warning text-dark">Chờ xử lý</span>;
            case 'approved': return <span className="badge bg-success">Đã duyệt</span>;
            case 'rejected': return <span className="badge bg-danger">Từ chối</span>;
            default: return <span className="badge bg-secondary">{s}</span>;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    return (
        <div className="row g-4">
            {/* Mã giới thiệu */}
            <div className="col-lg-6">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-primary text-white">
                        <i className="fas fa-link me-2"></i>Mã giới thiệu của bạn
                    </div>
                    <div className="card-body">
                        {affiliateInfo?.referralCode ? (
                            <>
                                <div className="input-group mb-3">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-center fw-bold"
                                        value={affiliateInfo.referralCode}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => copyToClipboard(affiliateInfo.referralCode)}
                                    >
                                        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                    </button>
                                </div>
                                <label className="form-label small text-muted">Link giới thiệu:</label>
                                <div className="input-group input-group-sm">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={affiliateInfo.referralLink || ''}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => copyToClipboard(affiliateInfo.referralLink)}
                                    >
                                        <i className="fas fa-copy"></i>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted py-3">
                                <i className="fas fa-info-circle me-2"></i>Chưa có mã giới thiệu.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Thống kê */}
            <div className="col-lg-6">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-success text-white">
                        <i className="fas fa-chart-line me-2"></i>Thống kê hoa hồng
                    </div>
                    <div className="card-body">
                        <div className="row g-3 text-center">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded border">
                                    <small className="text-muted d-block mb-1">Tổng hoa hồng</small>
                                    <strong className="text-success fs-5">{formatMoney(affiliateInfo?.stats?.totalEarnings)} đ</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded border">
                                    <small className="text-muted d-block mb-1">Người giới thiệu</small>
                                    <strong className="text-primary fs-5">{affiliateInfo?.stats?.totalReferrals || 0}</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded border">
                                    <small className="text-muted d-block mb-1">Đang chờ duyệt</small>
                                    <strong className="text-warning fs-5">{formatMoney(pendingInfo.totalPending)} đ</strong>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded border">
                                    <small className="text-muted d-block mb-1">Số dư có thể rút</small>
                                    <strong className="text-info fs-5">{formatMoney(affiliateInfo?.commissionBalance)} đ</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chính sách hoa hồng */}
            <div className="col-12">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-secondary text-white">
                        <i className="fas fa-file-invoice-dollar me-2"></i>Chính sách & Điều kiện
                    </div>
                    <div className="card-body">
                        <div className="row g-3 text-center">
                            <div className="col-md-3 col-6">
                                <div className="p-3 border rounded bg-light h-100">
                                    <i className="fas fa-percent text-primary mb-2 fs-4"></i>
                                    <h6 className="fw-bold mb-1">{configWeb?.affiliateCommissionPercent || 0}%</h6>
                                    <small className="text-muted">Hoa hồng</small>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 border rounded bg-light h-100">
                                    <i className="fas fa-money-bill-wave text-success mb-2 fs-4"></i>
                                    <h6 className="fw-bold mb-1">{formatMoney(configWeb?.affiliateMinDeposit || 0)} đ</h6>
                                    <small className="text-muted">Nạp tối thiểu</small>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 border rounded bg-light h-100">
                                    <i className="fas fa-hand-holding-usd text-warning mb-2 fs-4"></i>
                                    <h6 className="fw-bold mb-1">{formatMoney(configWeb?.withdrawMinAmount || 0)} đ</h6>
                                    <small className="text-muted">Rút tối thiểu</small>
                                </div>
                            </div>
                            <div className="col-md-3 col-6">
                                <div className="p-3 border rounded bg-light h-100">
                                    <i className="fas fa-university text-info mb-2 fs-4"></i>
                                    <h6 className="fw-bold mb-1">
                                        {[
                                            configWeb?.withdrawToBankEnabled !== false && 'Bank',
                                            configWeb?.withdrawToBalanceEnabled !== false && 'Số dư',
                                        ].filter(Boolean).join(' / ') || 'N/A'}
                                    </h6>
                                    <small className="text-muted">Cổng rút</small>
                                </div>
                            </div>
                            {(configWeb?.withdrawFeePercent > 0 || configWeb?.withdrawFeeFixed > 0) && (
                                <div className="col-12">
                                    <div className="alert alert-light border mb-0 py-2 small text-start">
                                        <i className="fas fa-info-circle me-2 text-primary"></i>
                                        <strong>Phí rút:</strong> {configWeb?.withdrawFeePercent > 0 && <span>{configWeb?.withdrawFeePercent}%</span>}
                                        {configWeb?.withdrawFeePercent > 0 && configWeb?.withdrawFeeFixed > 0 && <span> + </span>}
                                        {configWeb?.withdrawFeeFixed > 0 && <span>{formatMoney(configWeb?.withdrawFeeFixed)} đ</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rút hoa hồng */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-warning text-dark">
                        <i className="fas fa-money-bill-transfer me-2"></i>Rút hoa hồng
                    </div>
                    <div className="card-body">
                        <div className="row align-items-center">
                            <div className="col-md-4 mb-3 mb-md-0">
                                <div className="text-center">
                                    <small className="text-muted">Số dư có thể rút</small>
                                    <div className="fs-3 fw-bold text-success">{formatMoney(affiliateInfo?.commissionBalance)} đ</div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <form onSubmit={handleWithdraw}>
                                    <div className="row g-2">
                                        <div className="col-md-5">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Số tiền rút"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                min={configWeb?.withdrawMinAmount || 50000}
                                                max={configWeb?.withdrawMaxAmount || 10000000}
                                            />
                                            <small className="text-muted">Min: {formatMoney(configWeb?.withdrawMinAmount || 50000)} - Max: {formatMoney(configWeb?.withdrawMaxAmount || 10000000)}</small>
                                        </div>
                                        <div className="col-md-4">
                                            <select
                                                className="form-select"
                                                value={withdrawType}
                                                onChange={(e) => setWithdrawType(e.target.value)}
                                            >
                                                {configWeb?.withdrawToBalanceEnabled !== false && <option value="balance">Về số dư web</option>}
                                                {configWeb?.withdrawToBankEnabled !== false && <option value="bank">Về ngân hàng</option>}
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <button type="submit" className="btn btn-success w-100" disabled={withdrawing}>
                                                {withdrawing ? <span className="spinner-border spinner-border-sm"></span> : <><i className="fas fa-paper-plane me-1"></i>Rút</>}
                                            </button>
                                        </div>
                                    </div>
                                    {withdrawType === 'bank' && (
                                        <div className="row g-2 mt-2">
                                            <div className="col-md-4">
                                                <select
                                                    className="form-select"
                                                    value={bankInfo.bankCode}
                                                    onChange={(e) => {
                                                        const code = e.target.value;
                                                        const bank = bankList.find(b => b.code === code);
                                                        setBankInfo({
                                                            ...bankInfo,
                                                            bankCode: code,
                                                            bankName: bank ? bank.shortName : ''
                                                        });
                                                    }}
                                                >
                                                    <option value="">-- Chọn ngân hàng --</option>
                                                    {bankList.map((b) => (
                                                        <option key={b.code} value={b.code}>
                                                            {b.shortName} - {b.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <input type="text" className="form-control" placeholder="Số tài khoản"
                                                    value={bankInfo.accountNumber} onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} />
                                            </div>
                                            <div className="col-md-4">
                                                <input type="text" className="form-control" placeholder="Tên chủ TK"
                                                    value={bankInfo.accountName} onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })} />
                                            </div>
                                        </div>
                                    )}
                                    {(configWeb?.withdrawFeePercent > 0 || configWeb?.withdrawFeeFixed > 0) && (
                                        <small className="text-muted d-block mt-2">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Phí rút: {configWeb?.withdrawFeePercent || 0}% + {formatMoney(configWeb?.withdrawFeeFixed || 0)} VNĐ
                                        </small>
                                    )}
                                </form>
                                <button className="btn btn-link btn-sm mt-2 p-0" onClick={() => setShowWithdrawHistory(!showWithdrawHistory)}>
                                    <i className={`fas fa-chevron-${showWithdrawHistory ? 'up' : 'down'} me-1`}></i>
                                    {showWithdrawHistory ? 'Ẩn lịch sử rút' : 'Xem lịch sử rút'}
                                </button>
                                {showWithdrawHistory && withdrawals.length > 0 && (
                                    <div className="mt-3">
                                        <Table striped bordered hover size="sm" responsive>
                                            <thead>
                                                <tr>
                                                    <th>Số tiền</th>
                                                    <th>Phí</th>
                                                    <th>Thực nhận</th>
                                                    <th>Loại</th>
                                                    <th>Trạng thái</th>
                                                    <th>Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {withdrawals.map((w) => (
                                                    <tr key={w._id}>
                                                        <td>{formatMoney(w.amount)} đ</td>
                                                        <td>{formatMoney(w.fee)} đ</td>
                                                        <td>{formatMoney(w.netAmount || w.amount - w.fee)} đ</td>
                                                        <td>{w.type === 'bank' ? <td>
                                                            Ngân hàng: <span>{w.bankInfo?.bankName}</span> <br />
                                                            STK: <span>{w.bankInfo?.accountNumber}</span> <br />
                                                            Tên chủ TK: <span>{w.bankInfo?.accountName}</span>
                                                        </td> : <span >Số dư web</span>}</td>
                                                        <td>{getStatusBadge(w.status)}</td>
                                                        <td><small>{new Date(w.createdAt).toLocaleString('vi-VN')}</small></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hoa hồng chờ duyệt */}
            {pendingInfo.count > 0 && (
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-secondary text-white">
                            <i className="fas fa-clock me-2"></i>Hoa hồng chờ duyệt ({pendingInfo.count})
                        </div>
                        <div className="card-body p-0">
                            <Table striped bordered hover responsive className="mb-0">
                                <thead className="table-secondary">
                                    <tr>
                                        <th>Từ</th>
                                        <th className="text-end">Nạp</th>
                                        <th className="text-end">Hoa hồng</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingInfo.pendingCommissions.map((c) => (
                                        <tr key={c._id}>
                                            <td><strong>{c.depositorUsername}</strong></td>
                                            <td className="text-end">{formatMoney(c.depositAmount)} đ</td>
                                            <td className="text-end text-success fw-bold">+{formatMoney(c.commissionAmount)} đ ({c.commissionPercent}%)</td>
                                            <td><small className="text-muted">{new Date(c.createdAt).toLocaleString('vi-VN')}</small></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            )}

            {/* Danh sách người đã giới thiệu */}
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-info text-white">
                        <i className="fas fa-users me-2"></i>Danh sách người đã giới thiệu
                    </div>
                    <div className="card-body p-0">
                        <Table striped bordered hover responsive className="mb-0">
                            <thead className="table-info">
                                <tr>
                                    <th><i className="fas fa-user me-2"></i>Tài khoản</th>
                                    <th><i className="fas fa-calendar me-2"></i>Ngày đăng ký</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.length > 0 ? (
                                    referrals.map((ref, index) => (
                                        <tr key={index}>
                                            <td><strong>{ref.username}</strong></td>
                                            <td>{new Date(ref.createdAt).toLocaleDateString('vi-VN')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4 text-muted">
                                            <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                                            Chưa có người được giới thiệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <div className="card-footer d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <span className="badge bg-primary align-self-center">Trang {page}/{totalPages}</span>
                            <button className="btn btn-outline-primary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
