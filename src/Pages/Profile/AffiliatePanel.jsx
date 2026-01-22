import { useState, useEffect } from 'react';
import { getAffiliateInfo, getAffiliateReferrals, getMyPendingCommissions } from '@/Utils/api';
import Table from "react-bootstrap/Table";
import { useOutletContext } from "react-router-dom";

export default function AffiliatePanel({ token }) {
    const [affiliateInfo, setAffiliateInfo] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pendingInfo, setPendingInfo] = useState({ totalPending: 0, count: 0, pendingCommissions: [] });
    const { configWeb } = useOutletContext();

    useEffect(() => {
        fetchAffiliateInfo();
        fetchPendingInfo();
    }, []);

    useEffect(() => {
        fetchReferrals();
    }, [page]);

    const fetchAffiliateInfo = async () => {
        try {
            const data = await getAffiliateInfo(token);
            setAffiliateInfo(data);
        } catch (err) {

        } finally {
            setLoading(false);
        }
    };

    const fetchPendingInfo = async () => {
        try {
            const data = await getMyPendingCommissions(token);
            setPendingInfo({
                totalPending: data.totalPending || 0,
                count: data.count || 0,
                pendingCommissions: data.pendingCommissions || []
            });
        } catch (err) {

        }
    };

    const fetchReferrals = async () => {
        try {
            const data = await getAffiliateReferrals(token, page, 10, 1);
            setReferrals(data.referrals || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {

        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString('vi-VN');
    };

    // SVG empty state
    const EmptyState = ({ message, subMessage }) => (
        <tr>
            <td colSpan={12} className="text-center py-5">
                <div>
                    <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                    <p className="font-semibold mt-3">{message}</p>
                    {subMessage && <small className="text-muted">{subMessage}</small>}
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    .aff-panel {
                        --aff-primary: #3b82f6;
                        --aff-primary-dark: #2563eb;
                        --aff-bg: #ffffff;
                        --aff-bg-secondary: #f8fafc;
                        --aff-border: #e2e8f0;
                        --aff-text: #1e293b;
                        --aff-text-secondary: #64748b;
                        --aff-success: #22c55e;
                        --aff-warning: #f59e0b;
                        --aff-info: #06b6d4;
                    }
                    
                    [data-bs-theme="dark"] .aff-panel,
                    .dark .aff-panel {
                        --aff-primary: #60a5fa;
                        --aff-primary-dark: #3b82f6;
                        --aff-bg: #1e293b;
                        --aff-bg-secondary: #334155;
                        --aff-border: #475569;
                        --aff-text: #f1f5f9;
                        --aff-text-secondary: #94a3b8;
                        --aff-success: #4ade80;
                        --aff-warning: #fbbf24;
                        --aff-info: #22d3ee;
                    }
                    
                    .aff-panel .aff-card {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        border-radius: 12px;
                        overflow: hidden;
                        height: 100%;
                    }
                    
                    .aff-panel .aff-header {
                        background: var(--aff-primary);
                        padding: 1rem 1.25rem;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }
                    
                    .aff-panel .aff-header.success {
                        background: var(--aff-success);
                    }
                    
                    .aff-panel .aff-header.warning {
                        background: var(--aff-warning);
                    }
                    
                    .aff-panel .aff-header.info {
                        background: var(--aff-info);
                    }
                    
                    .aff-panel .aff-header-title {
                        font-size: 1rem;
                        font-weight: 600;
                        color: #fff;
                        margin: 0;
                    }
                    
                    .aff-panel .aff-header i {
                        color: #fff;
                    }
                    
                    .aff-panel .aff-body {
                        padding: 1.25rem;
                        color: var(--aff-text);
                    }
                    
                    .aff-panel .aff-stat-box {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        border-radius: 10px;
                        padding: 1rem;
                        text-align: center;
                    }
                    
                    .aff-panel .aff-stat-label {
                        font-size: 0.8rem;
                        color: var(--aff-text-secondary);
                        margin-bottom: 0.25rem;
                    }
                    
                    .aff-panel .aff-stat-value {
                        font-size: 1.25rem;
                        font-weight: 700;
                    }
                    
                    .aff-panel .aff-stat-value.primary { color: var(--aff-primary); }
                    .aff-panel .aff-stat-value.success { color: var(--aff-success); }
                    .aff-panel .aff-stat-value.warning { color: var(--aff-warning); }
                    .aff-panel .aff-stat-value.info { color: var(--aff-info); }
                    
                    .aff-panel .aff-input {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        color: var(--aff-text);
                    }
                    
                    .aff-panel .aff-input:focus {
                        border-color: var(--aff-primary);
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    }
                    
                    .aff-panel .aff-btn-copy {
                        background: var(--aff-primary);
                        border: none;
                        color: #fff;
                    }
                    
                    .aff-panel .aff-btn-copy:hover {
                        background: var(--aff-primary-dark);
                    }
                    
                    .aff-panel .aff-alert {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        border-radius: 8px;
                        padding: 0.75rem 1rem;
                        color: var(--aff-text);
                    }
                    
                    .aff-panel .aff-pagination {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 0.5rem;
                        padding-top: 1rem;
                    }
                    
                    .aff-panel .aff-page-btn {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        color: var(--aff-text);
                        padding: 0.4rem 0.6rem;
                        border-radius: 6px;
                        cursor: pointer;
                    }
                    
                    .aff-panel .aff-page-btn:hover:not(:disabled) {
                        background: var(--aff-primary);
                        color: #fff;
                        border-color: var(--aff-primary);
                    }
                    
                    .aff-panel .aff-page-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                    
                    .aff-panel .aff-page-info {
                        background: var(--aff-primary);
                        color: #fff;
                        padding: 0.4rem 0.75rem;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 0.875rem;
                    }
                `}
            </style>

            <div className="aff-panel">
                <div className="row">
                    {/* Mã giới thiệu */}
                    <div className="col-lg-6 mb-4">
                        <div className="aff-card">
                            <div className="aff-header">
                                <i className="fas fa-link"></i>
                                <h5 className="aff-header-title">Mã giới thiệu của bạn</h5>
                            </div>
                            <div className="aff-body">
                                {affiliateInfo?.referralCode ? (
                                    <>
                                        <div className="input-group mb-3">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg text-center fw-bold aff-input"
                                                value={affiliateInfo.referralCode}
                                                readOnly
                                            />
                                            <button
                                                className="btn aff-btn-copy"
                                                onClick={() => copyToClipboard(affiliateInfo.referralCode)}
                                            >
                                                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label small" style={{ color: 'var(--aff-text-secondary)' }}>Link giới thiệu:</label>
                                            <div className="input-group input-group-sm">
                                                <input
                                                    type="text"
                                                    className="form-control aff-input"
                                                    value={affiliateInfo.referralLink || ''}
                                                    readOnly
                                                />
                                                <button
                                                    className="btn aff-btn-copy"
                                                    onClick={() => copyToClipboard(affiliateInfo.referralLink)}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-3" style={{ color: 'var(--aff-text-secondary)' }}>
                                        <i className="fas fa-info-circle me-2"></i>
                                        Chưa có mã giới thiệu. Vui lòng liên hệ admin.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thống kê */}
                    <div className="col-lg-6 mb-4">
                        <div className="aff-card">
                            <div className="aff-header success">
                                <i className="fas fa-chart-line"></i>
                                <h5 className="aff-header-title">Thống kê hoa hồng</h5>
                            </div>
                            <div className="aff-body">
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="aff-stat-box">
                                            <div className="aff-stat-label">Tổng hoa hồng</div>
                                            <div className="aff-stat-value success">
                                                {formatMoney(affiliateInfo?.stats?.totalEarnings)} đ
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="aff-stat-box">
                                            <div className="aff-stat-label">Tháng này</div>
                                            <div className="aff-stat-value primary">
                                                {formatMoney(affiliateInfo?.stats?.monthlyEarnings)} đ
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="aff-stat-box">
                                            <div className="aff-stat-label">
                                                <i className="fas fa-clock me-1"></i>Chờ duyệt
                                            </div>
                                            <div className="aff-stat-value warning">
                                                {formatMoney(pendingInfo.totalPending)} đ
                                            </div>
                                            <small style={{ color: 'var(--aff-text-secondary)' }}>({pendingInfo.count} yêu cầu)</small>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="aff-stat-box">
                                            <div className="aff-stat-label">Người giới thiệu</div>
                                            <div className="aff-stat-value info">
                                                <i className="fas fa-users me-1"></i>
                                                {affiliateInfo?.stats?.totalReferrals || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chính sách hoa hồng */}
                    <div className="col-12 mb-4">
                        <div className="aff-alert">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <div className="d-flex align-items-center gap-2">
                                    <i className="fas fa-info-circle" style={{ color: 'var(--aff-primary)', fontSize: '1.25rem' }}></i>
                                    <strong>Chính sách hoa hồng:</strong>
                                </div>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <span>
                                        khi người được giới thiệu nạp tiền vào tài khoản thành công.
                                    </span>
                                    <i className="fas fa-wallet me-1" style={{ color: 'var(--aff-warning)' }}></i>
                                    Nạp tối thiểu: <strong style={{ color: 'var(--aff-warning)' }}>{formatMoney(configWeb?.affiliateMinDeposit || 0)} đ</strong>
                                    <span>
                                        bạn sẽ nhận được hoa hồng
                                    </span>
                                    Tỷ lệ: <strong style={{ color: 'var(--aff-success)' }}>{configWeb?.affiliateCommissionPercent || 0}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hoa hồng chờ duyệt */}
                    {pendingInfo.pendingCommissions.length > 0 && (
                        <div className="col-12 mb-4">
                            <div className="aff-card">
                                <div className="aff-header warning">
                                    <i className="fas fa-clock"></i>
                                    <h5 className="aff-header-title">Hoa hồng chờ duyệt ({pendingInfo.count})</h5>
                                </div>
                                <div className="aff-body p-0">
                                    <div className="table-responsive">
                                        <Table striped bordered hover className="mb-0">
                                            <thead className="table-warning">
                                                <tr>
                                                    <th>Từ</th>
                                                    <th className="text-end">Số tiền nạp</th>
                                                    <th className="text-end">Hoa hồng</th>
                                                    <th>Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingInfo.pendingCommissions.map((c) => (
                                                    <tr key={c._id}>
                                                        <td><strong>{c.depositorUsername}</strong></td>
                                                        <td className="text-end">{formatMoney(c.depositAmount)} đ</td>
                                                        <td className="text-end" style={{ color: 'var(--aff-success)', fontWeight: 700 }}>
                                                            +{formatMoney(c.commissionAmount)} đ ({c.commissionPercent}%)
                                                        </td>
                                                        <td>
                                                            <small style={{ color: 'var(--aff-text-secondary)' }}>
                                                                {new Date(c.createdAt).toLocaleString('vi-VN')}
                                                            </small>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danh sách người đã giới thiệu */}
                    <div className="col-12">
                        <div className="aff-card">
                            <div className="aff-header info">
                                <i className="fas fa-users"></i>
                                <h5 className="aff-header-title">Danh sách người đã giới thiệu</h5>
                            </div>
                            <div className="aff-body">
                                <div className="table-responsive">
                                    <Table striped bordered hover>
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
                                                <EmptyState
                                                    message="Chưa có người được giới thiệu"
                                                    subMessage="Chia sẻ mã giới thiệu để nhận hoa hồng!"
                                                />
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {/* Pagination */}
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
            </div>
        </>
    );
}
