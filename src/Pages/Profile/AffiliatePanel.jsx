import { useState, useEffect } from 'react';
import { getAffiliateInfo, getAffiliateReferrals, getMyPendingCommissions, requestCommissionWithdrawal, getMyWithdrawals, getBankList } from '@/Utils/api';
import Table from "react-bootstrap/Table";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
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
    const [activeTab, setActiveTab] = useState('overview');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawType, setWithdrawType] = useState('balance');
    const [bankInfo, setBankInfo] = useState({ bankCode: '', bankName: '', accountNumber: '', accountName: '' });
    const [bankList, setBankList] = useState([]);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);
    // Pagination states
    const [withdrawalPage, setWithdrawalPage] = useState(1);
    const [withdrawalTotalPages, setWithdrawalTotalPages] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);
    const [maxVisible, setMaxVisible] = useState(5);

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

    useEffect(() => {
        fetchWithdrawals();
    }, [withdrawalPage]);

    useEffect(() => {
        fetchPendingInfo();
    }, [pendingPage]);

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

    const fetchAffiliateInfo = async () => {
        try {
            const data = await getAffiliateInfo(token);
            setAffiliateInfo(data);
        } catch (err) { }
        finally { setLoading(false); }
    };

    const fetchPendingInfo = async () => {
        try {
            const data = await getMyPendingCommissions(token, pendingPage, 10);
            setPendingInfo({
                totalPending: data.totalPending || 0,
                count: data.count || 0,
                pendingCommissions: data.pendingCommissions || []
            });
            setPendingTotalPages(data.totalPages || 1);
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
        toast.success('Copy thành công!');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatMoney = (amount) => Math.floor(Number(amount)).toLocaleString("en-US");

    const fetchWithdrawals = async () => {
        try {
            const data = await getMyWithdrawals(token, withdrawalPage, 10);
            setWithdrawals(data.withdrawals || []);
            setWithdrawalTotalPages(data.totalPages || 1);
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
        <>
            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                {/* Tab Navigation */}
                <Nav variant="tabs" className="mb-3">
                    <Nav.Item>
                        <Nav.Link eventKey="overview">
                            <i className="fas fa-home me-2"></i>Tổng quan
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="guide">
                            <i className="fas fa-book me-2"></i>Hướng dẫn
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="withdraw">
                            <i className="fas fa-money-bill-transfer me-2"></i>Rút tiền
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="referrals">
                            <i className="fas fa-users me-2"></i>Danh sách ({referrals.length + pendingInfo.count})
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Tab Content */}
                <Tab.Content>
                    {/* TAB 1: TỔNG QUAN */}
                    <Tab.Pane eventKey="overview">
                        <div className="row g-4">
                            {/* Link giới thiệu */}
                            <div className="col-lg-6">
                                <div className="card h-100 border-0 shadow-sm">
                                    <div className="card-header bg-primary text-white">
                                        <i className="fas fa-link me-2"></i>Link giới thiệu của bạn
                                    </div>
                                    <div className="card-body">
                                        {affiliateInfo?.referralLink ? (
                                            <>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={affiliateInfo.referralLink || ''}
                                                        readOnly
                                                    />
                                                    <button
                                                        className={`btn ${copied ? 'btn-success' : 'btn-primary'}`}
                                                        onClick={() => copyToClipboard(affiliateInfo.referralLink)}
                                                    >
                                                        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} me-1`}></i>
                                                        {copied ? 'Đã copy' : 'Copy'}
                                                    </button>
                                                </div>
                                                <small className="text-muted d-block mt-2">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Chia sẻ link này để nhận hoa hồng khi người khác đăng ký và nạp tiền
                                                </small>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted py-3">
                                                <i className="fas fa-info-circle me-2"></i>Chưa có link giới thiệu.
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

                            {/* Chính sách */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-secondary text-white">
                                        <i className="fas fa-file-invoice-dollar me-2"></i>Chính sách & Điều kiện
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3 text-center mb-4">
                                            <div className="col-md-3 col-6">
                                                <div className="p-3 border rounded bg-light h-100">
                                                    <i className="fas fa-percent text-primary mb-2 fs-4"></i>
                                                    <h6 className="fw-bold mb-1">{configWeb?.affiliateCommissionPercent || 0}%</h6>
                                                    <small className="text-muted">Hoa hồng mỗi lần nạp</small>
                                                </div>
                                            </div>
                                            <div className="col-md-3 col-6">
                                                <div className="p-3 border rounded bg-light h-100">
                                                    <i className="fas fa-money-bill-wave text-success mb-2 fs-4"></i>
                                                    <h6 className="fw-bold mb-1">{formatMoney(configWeb?.affiliateMinDeposit || 0)} đ</h6>
                                                    <small className="text-muted">Nạp tối thiểu để tính hoa hồng</small>
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
                                                    <small className="text-muted">Cổng rút tiền</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chi tiết chính sách */}
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="border rounded p-3 h-100">
                                                    <h6 className="text-primary mb-3"><i className="fas fa-coins me-2"></i>Điều kiện nhận hoa hồng</h6>
                                                    <ul className="mb-0 ps-3 small">
                                                        <li className="mb-2">Người được giới thiệu phải đăng ký bằng mã/link của bạn</li>
                                                        <li className="mb-2">Chỉ tính hoa hồng cho người giới thiệu <strong>trực tiếp</strong></li>
                                                        <li className="mb-2">Mỗi lần nạp tiền ≥ <strong>{formatMoney(configWeb?.affiliateMinDeposit || 0)} đ</strong> sẽ được tính hoa hồng</li>
                                                        <li className="mb-2">Hoa hồng = <strong>{configWeb?.affiliateCommissionPercent || 0}%</strong> số tiền nạp của người được giới thiệu</li>
                                                        <li>Hoa hồng cần được admin <strong>duyệt</strong> trước khi có thể rút</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="border rounded p-3 h-100">
                                                    <h6 className="text-success mb-3"><i className="fas fa-wallet me-2"></i>Quy định rút tiền</h6>
                                                    <ul className="mb-0 ps-3 small">
                                                        <li className="mb-2">Số dư tối thiểu để rút: <strong>{formatMoney(configWeb?.withdrawMinAmount || 0)} đ</strong></li>
                                                        <li className="mb-2">Số tiền tối đa mỗi lần rút: <strong>{formatMoney(configWeb?.withdrawMaxAmount || 10000000)} đ</strong></li>
                                                        <li className="mb-2">Phí rút: <strong>{configWeb?.withdrawFeePercent || 0}%{configWeb?.withdrawFeeFixed > 0 ? ` + ${formatMoney(configWeb?.withdrawFeeFixed)} đ` : ''}</strong></li>
                                                        <li className="mb-2">Thời gian xử lý: <strong>1-24 giờ</strong> (trong giờ hành chính)</li>
                                                        <li>Vui lòng nhập <strong>chính xác</strong> thông tin ngân hàng khi rút tiền</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lưu ý quan trọng */}
                                        <div className="alert alert-warning mb-0 mt-3 small">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Lưu ý:</strong> Mọi hành vi gian lận (tự ref, spam, fake...) sẽ bị <strong>hủy hoa hồng</strong> và <strong>khóa tài khoản vĩnh viễn</strong>. Liên hệ admin nếu có thắc mắc.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab.Pane>

                    {/* TAB 2: HƯỚNG DẪN */}
                    <Tab.Pane eventKey="guide">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <i className="fas fa-lightbulb me-2"></i>Hướng dẫn sử dụng chương trình Affiliate
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <h6 className="text-primary mb-3"><i className="fas fa-share-alt me-2"></i>Cách kiếm hoa hồng</h6>
                                        <ol className="ps-3">
                                            <li className="mb-2">
                                                <strong>Sao chép mã giới thiệu</strong> hoặc link của bạn ở tab Tổng quan
                                            </li>
                                            <li className="mb-2">
                                                <strong>Chia sẻ</strong> với bạn bè qua mạng xã hội, diễn đàn, group
                                            </li>
                                            <li className="mb-2">
                                                Khi họ <strong>đăng ký</strong> bằng mã/link của bạn, bạn trở thành người giới thiệu
                                            </li>
                                            <li className="mb-2">
                                                Mỗi lần họ <strong>nạp tiền ≥ {formatMoney(configWeb?.affiliateMinDeposit || 0)} đ</strong>, bạn nhận <strong>{configWeb?.affiliateCommissionPercent || 0}% hoa hồng</strong>
                                            </li>
                                            <li className="mb-2">
                                                Hoa hồng sẽ <strong>chờ admin duyệt</strong>, sau khi duyệt sẽ vào số dư có thể rút
                                            </li>
                                        </ol>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-success mb-3"><i className="fas fa-money-check-alt me-2"></i>Cách rút hoa hồng</h6>
                                        <ol className="ps-3">
                                            <li className="mb-2">
                                                Đảm bảo <strong>số dư hoa hồng ≥ {formatMoney(configWeb?.withdrawMinAmount || 0)} đ</strong>
                                            </li>
                                            <li className="mb-2">
                                                Chọn phương thức rút: <strong>{[
                                                    configWeb?.withdrawToBankEnabled !== false && 'Ngân hàng',
                                                    configWeb?.withdrawToBalanceEnabled !== false && 'Số dư web',
                                                ].filter(Boolean).join(' hoặc ')}</strong>
                                            </li>
                                            <li className="mb-2">
                                                Nếu rút về ngân hàng: nhập <strong>đầy đủ thông tin</strong> (Tên NH, STK, Tên chủ TK)
                                            </li>
                                            <li className="mb-2">
                                                Phí rút: <strong>{configWeb?.withdrawFeePercent || 0}%{configWeb?.withdrawFeeFixed > 0 && ` + ${formatMoney(configWeb?.withdrawFeeFixed)} đ`}</strong>
                                            </li>
                                            <li className="mb-2">
                                                Chờ admin duyệt, kiểm tra <strong>lịch sử rút</strong> để theo dõi
                                            </li>
                                        </ol>
                                    </div>
                                    <div className="col-12">
                                        <div className="alert alert-info mb-0 d-flex align-items-start">
                                            <i className="fas fa-info-circle me-2 mt-1"></i>
                                            <div>
                                                <strong>Lưu ý quan trọng:</strong>
                                                <ul className="mb-0 mt-2 ps-3">
                                                    <li>Chỉ tính hoa hồng cho người được giới thiệu <strong>trực tiếp</strong></li>
                                                    <li>Hoa hồng sẽ <strong>chờ admin duyệt</strong> trước khi có thể rút</li>
                                                    <li>Đảm bảo nhập <strong>chính xác thông tin ngân hàng</strong> khi rút tiền</li>
                                                    <li>Liên hệ admin nếu có thắc mắc về hoa hồng hoặc yêu cầu rút tiền</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Tab.Pane>

                    {/* TAB 3: RÚT TIỀN */}
                    <Tab.Pane eventKey="withdraw">
                        <div className="row">
                            {/* Form rút tiền */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-warning text-dark">
                                        <i className="fas fa-money-bill-transfer me-2"></i>Tạo yêu cầu rút hoa hồng
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lịch sử rút tiền */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                                        <span><i className="fas fa-history me-2"></i>Lịch sử rút tiền</span>
                                        <span className="badge bg-white text-info">{withdrawals.length} đơn</span>
                                    </div>
                                    <div className="card-body p-2">
                                        {withdrawals.length > 0 ? (
                                            <Table striped bordered hover size="sm" responsive className="align-middle mb-0">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Số tiền</th>
                                                        <th>Thông tin nhận</th>
                                                        <th>Trạng thái</th>
                                                        <th>Ngày tạo</th>
                                                        <th>Ghi chú</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {withdrawals.map((w) => (
                                                        <tr key={w._id}>
                                                            <td>
                                                                Số tiền: <span>{formatMoney(w.amount)}</span> <br />
                                                                Phí: <span>{formatMoney(w.fee)}</span> <br />
                                                                Thực nhận: <span>{formatMoney(w.netAmount || w.amount - w.fee)}</span>
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
                                                            <td>{new Date(w.createdAt).toLocaleString('vi-VN')}</td>
                                                            <td>{w.adminNote || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                                                Chưa có đơn rút tiền nào
                                            </div>
                                        )}
                                        {withdrawalTotalPages > 1 && (
                                            <>
                                                <span>Trang {withdrawalPage} / {withdrawalTotalPages}</span>
                                                <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                                                    <div
                                                        className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                                                        style={{ maxWidth: '100%' }}
                                                    >
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => setWithdrawalPage((prev) => Math.max(prev - 1, 1))}
                                                            disabled={withdrawalPage === 1}
                                                        >
                                                            <i className="fas fa-angle-left"></i>
                                                        </button>

                                                        {(() => {
                                                            const pages = [];
                                                            const start = Math.max(1, withdrawalPage - Math.floor(maxVisible / 2));
                                                            const end = Math.min(withdrawalTotalPages, start + maxVisible - 1);
                                                            const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                                                            if (adjustedStart > 1) {
                                                                pages.push(
                                                                    <button key={1} className={`btn btn-sm ${withdrawalPage === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setWithdrawalPage(1)}>1</button>
                                                                );
                                                                if (adjustedStart > 2) {
                                                                    pages.push(<span key="start-ellipsis">...</span>);
                                                                }
                                                            }

                                                            for (let p = adjustedStart; p <= end; p++) {
                                                                pages.push(
                                                                    <button
                                                                        key={p}
                                                                        className={`btn btn-sm ${withdrawalPage === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                        onClick={() => setWithdrawalPage(p)}
                                                                    >
                                                                        {p}
                                                                    </button>
                                                                );
                                                            }

                                                            if (end < withdrawalTotalPages) {
                                                                if (end < withdrawalTotalPages - 1) {
                                                                    pages.push(<span key="end-ellipsis">...</span>);
                                                                }
                                                                pages.push(
                                                                    <button key={withdrawalTotalPages} className={`btn btn-sm ${withdrawalPage === withdrawalTotalPages ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setWithdrawalPage(withdrawalTotalPages)}>{withdrawalTotalPages}</button>
                                                                );
                                                            }

                                                            return pages;
                                                        })()}

                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => setWithdrawalPage((prev) => Math.min(prev + 1, withdrawalTotalPages))}
                                                            disabled={withdrawalPage === withdrawalTotalPages}
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
                    </Tab.Pane>

                    {/* TAB 4: DANH SÁCH */}
                    <Tab.Pane eventKey="referrals">
                        <div className="row">
                            {/* Hoa hồng chờ duyệt */}
                            {pendingInfo.count > 0 && (
                                <div className="col-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-secondary text-white">
                                            <i className="fas fa-clock me-2"></i>Hoa hồng chờ duyệt ({pendingInfo.count})
                                        </div>
                                        <div className="card-body p-2">
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
                                                            <td className="text-end">{formatMoney(c.depositAmount)}</td>
                                                            <td className="text-end text-success fw-bold">+{formatMoney(c.commissionAmount)} ({c.commissionPercent}%)</td>
                                                            <td>{new Date(c.createdAt).toLocaleString('vi-VN')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            {pendingTotalPages > 1 && (
                                                <>
                                                    <span>Trang {pendingPage} / {pendingTotalPages}</span>
                                                    <div className="pagination d-flex justify-content-between align-items-center mt-3 gap-2">
                                                        <div
                                                            className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                                                            style={{ maxWidth: '100%' }}
                                                        >
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
                                                                disabled={pendingPage === 1}
                                                            >
                                                                <i className="fas fa-angle-left"></i>
                                                            </button>

                                                            {(() => {
                                                                const pages = [];
                                                                const start = Math.max(1, pendingPage - Math.floor(maxVisible / 2));
                                                                const end = Math.min(pendingTotalPages, start + maxVisible - 1);
                                                                const adjustedStart = Math.max(1, Math.min(start, end - maxVisible + 1));

                                                                if (adjustedStart > 1) {
                                                                    pages.push(
                                                                        <button key={1} className={`btn btn-sm ${pendingPage === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPendingPage(1)}>1</button>
                                                                    );
                                                                    if (adjustedStart > 2) {
                                                                        pages.push(<span key="start-ellipsis">...</span>);
                                                                    }
                                                                }

                                                                for (let p = adjustedStart; p <= end; p++) {
                                                                    pages.push(
                                                                        <button
                                                                            key={p}
                                                                            className={`btn btn-sm ${pendingPage === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                            onClick={() => setPendingPage(p)}
                                                                        >
                                                                            {p}
                                                                        </button>
                                                                    );
                                                                }

                                                                if (end < pendingTotalPages) {
                                                                    if (end < pendingTotalPages - 1) {
                                                                        pages.push(<span key="end-ellipsis">...</span>);
                                                                    }
                                                                    pages.push(
                                                                        <button key={pendingTotalPages} className={`btn btn-sm ${pendingPage === pendingTotalPages ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPendingPage(pendingTotalPages)}>{pendingTotalPages}</button>
                                                                    );
                                                                }

                                                                return pages;
                                                            })()}

                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => setPendingPage((prev) => Math.min(prev + 1, pendingTotalPages))}
                                                                disabled={pendingPage === pendingTotalPages}
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
                            )}

                            {/* Danh sách người đã giới thiệu */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-info text-white">
                                        <i className="fas fa-users me-2"></i>Danh sách người đã giới thiệu ({affiliateInfo?.stats?.totalReferrals || 0})
                                    </div>
                                    <div className="card-body p-2">
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
                                        {totalPages > 1 && (
                                            <>
                                                <span>Trang {page} / {totalPages}</span>
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
                                                                    pages.push(<span key="start-ellipsis" className="px-1">...</span>);
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
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    );
}
