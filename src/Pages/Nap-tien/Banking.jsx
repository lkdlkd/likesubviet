
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import Modal from "react-bootstrap/Modal";

export default function Banking({ banking = [], depositCode, onGenerateNewCode }) {
    const { configWeb } = useOutletContext();
    const cuphap = configWeb?.cuphap;
    const [isGenerating, setIsGenerating] = useState(false);
    const [bankApps, setBankApps] = useState([]);
    const [loadingApps, setLoadingApps] = useState(false);

    // Modal state
    const [showAppModal, setShowAppModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');

    // Fetch bank apps from VietQR API (deeplinks) and merge with banks API for logos
    useEffect(() => {
        const fetchBankApps = async () => {
            setLoadingApps(true);
            try {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const deeplinkUrl = isIOS
                    ? 'https://api.vietqr.io/v2/ios-app-deeplinks'
                    : 'https://api.vietqr.io/v2/android-app-deeplinks';

                // Fetch both APIs
                const [deeplinkRes, banksRes] = await Promise.all([
                    fetch(deeplinkUrl),
                    fetch('https://api.vietqr.io/v2/banks')
                ]);

                const deeplinkData = await deeplinkRes.json();
                const banksData = await banksRes.json();

                if (deeplinkData.apps) {
                    // Create a map of bank info from banks API
                    const bankInfoMap = {};
                    if (banksData.data) {
                        banksData.data.forEach(bank => {
                            const info = { logo: bank.logo, shortName: bank.shortName };
                            bankInfoMap[bank.code?.toLowerCase()] = info;
                        });
                    }

                    // Merge: use deeplink data but replace logo/name with banks API data
                    const sorted = deeplinkData.apps
                        .sort((a, b) => (b.monthlyInstall || 0) - (a.monthlyInstall || 0))
                        .slice(0, 20)
                        .map(app => {
                            const info = bankInfoMap[app.appId?.toLowerCase()];
                            return {
                                ...app,
                                logo: info?.logo || app.appLogo,
                                shortName: info?.shortName || app.appName
                            };
                        });

                    setBankApps(sorted);
                }
            } catch (error) {
            } finally {
                setLoadingApps(false);
            }
        };
        fetchBankApps();
    }, []);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    const filteredApps = bankApps.filter(app => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            app.shortName?.toLowerCase().includes(term) ||
            app.appName?.toLowerCase().includes(term) ||
            app.appId?.toLowerCase().includes(term)
        );
    });

    // Build deeplink URL for selected bank app
    const getDeeplinkWithParams = (baseDeeplink, bank, amount) => {
        if (!bank) return baseDeeplink;
        // Kiểm tra xem deeplink đã có query string chưa
        const separator = baseDeeplink.includes('?') ? '&' : '?';
        // Lấy mã ngân hàng từ bank.bank_code hoặc rút gọn từ bank.bank_name
        const bankCode = bank.bank_code || bank.bank_name?.toLowerCase().replace(/\s+/g, '');
        const params = `ba=${bank.account_number}@${bankCode}&am=${amount || ''}&tn=${encodeURIComponent(`${cuphap} ${depositCode}`.trim())}&bn=${encodeURIComponent(bank.account_name || '')}`;
        return baseDeeplink + separator + params;
    };

    // Step state: 1 = select app, 2 = enter amount
    const [modalStep, setModalStep] = useState(1);
    const [selectedApp, setSelectedApp] = useState(null);

    const handleOpenAppModal = (bank) => {
        setSelectedBank(bank);
        setDepositAmount('');
        setSelectedApp(null);
        setModalStep(1);
        setShowAppModal(true);
    };

    const handleCloseModal = () => {
        setShowAppModal(false);
        setSelectedBank(null);
        setSelectedApp(null);
        setDepositAmount('');
        setModalStep(1);
    };

    const handleAmountChange = (value) => {
        const numValue = value.replace(/[^0-9]/g, '');
        setDepositAmount(numValue);
    };

    // Step 1: Select bank app
    const handleSelectBankApp = (app) => {
        setSelectedApp(app);
        setModalStep(2);
    };

    // Step 2: Back to step 1
    const handleBackToStep1 = () => {
        setSelectedApp(null);
        setModalStep(1);
    };

    // Step 2: Open app with amount
    const handleOpenBankApp = () => {
        if (!depositAmount || parseInt(depositAmount) < (selectedBank?.min_recharge || 0)) {
            toast.error(`Vui lòng nhập số tiền tối thiểu ${Number(selectedBank?.min_recharge || 10000).toLocaleString("en-US")} VNĐ`);
            return;
        }
        const deeplink = getDeeplinkWithParams(selectedApp?.deeplink, selectedBank, depositAmount);
        window.location.href = deeplink;
    };

    const handleCopy = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => toast.success(`Đã sao chép thành công ${text}`))
            .catch(() => toast.error("Lỗi khi sao chép!"));
    };

    const handleGenerateNewCode = async () => {
        if (!onGenerateNewCode) return;
        setIsGenerating(true);
        try {
            await onGenerateNewCode();
            toast.success("Đã tạo mã nạp tiền mới!");
        } catch (error) {
            toast.error(error.message || "Lỗi khi tạo mã mới");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {/* Enhanced Banking Styles */}
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes copySuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .banking-card {
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: slideInUp 0.5s ease both;
                    position: relative;
                    overflow: hidden;
                }
                .banking-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .banking-card:hover::before {
                    opacity: 1;
                }
                .banking-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
                }
                
                .banking-header {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                    font-weight: 600;
                    text-align: center;
                }
                .banking-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 3s infinite;
                }
                
                .banking-table {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .banking-table td {
                    padding: 16px 12px;
                    border: none;
                    vertical-align: middle;
                    transition: all 0.25s ease;
                }
                .banking-table tr {
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.25s ease;
                }
                .banking-table tr:hover {
                    background: linear-gradient(135deg, rgba(0,123,255,0.02), rgba(255,255,255,1));
                }
                .banking-table td:first-child {
                    font-weight: 600;
                    color: #495057;
                    min-width: 140px;
                }
                
                .bank-name {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .account-info {
                    font-weight: 600;
                    color: #212529;
                    transition: all 0.25s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .btn-copy {
                    border-radius: 8px;
                    padding: 6px 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .btn-copy::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s ease;
                }
                .btn-copy:hover::before {
                    left: 100%;
                }
                .btn-copy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,123,255,0.25);
                }
                .btn-copy:active {
                    animation: copySuccess 0.3s ease;
                }
                
                .amount-money {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                    font-size: 1.1em;
                }
                
                .qr-section {
                    text-align: center;
                    position: relative;
                }
                .qr-header {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                    font-weight: 600;
                }
                .qr-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 3s infinite;
                    animation-delay: 1s;
                }
                
                .qr-code {
                    border-radius: 16px;
                    padding: 16px;
                    background: white;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    display: inline-block;
                    position: relative;
                    overflow: hidden;
                }
                .qr-code::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: 3px solid transparent;
                    border-radius: 16px;
                    background: linear-gradient(45deg, #007bff, #28a745, #ffc107, #dc3545) border-box;
                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .qr-code:hover::before {
                    opacity: 1;
                }
                .qr-code:hover {
                    transform: scale(1.02);
                    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
                }
                .qr-code img {
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .banking-card {
                        margin-bottom: 20px;
                    }
                    .banking-header, .qr-header {
                        padding: 12px;
                        font-size: 0.9rem;
                    }
                    .banking-table td {
                        padding: 12px 8px;
                        font-size: 0.875rem;
                    }
                    .qr-code {
                        padding: 12px;
                    }
                    .account-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>

            {banking.map((bank) => (
                <div key={bank._id} className="card banking-card">
                    <div className="card-body">
                        <div className="row">
                            {/* Thông tin ngân hàng */}
                            <div className="col-md-6">
                                <div className="banking-header">
                                    <i className="fas fa-university me-2"></i>
                                    Nạp tiền qua chuyển khoản
                                </div>
                                <table className="table banking-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <i className="fas fa-building me-2 text-primary"></i>
                                                Ngân Hàng
                                            </td>
                                            <td>
                                                <div className="bank-name">
                                                    {bank.bank_name}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-user me-2 text-info"></i>
                                                Tên chủ tài khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{bank.account_name}</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-credit-card me-2 text-success"></i>
                                                Số tài khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{bank.account_number}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm btn-copy"
                                                        onClick={() => handleCopy(bank.account_number)}
                                                        title="Sao chép số tài khoản"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                maxWidth: "250px",
                                                whiteSpace: "normal",
                                                wordWrap: "break-word",
                                                overflowWrap: "break-word",
                                            }}>
                                                <i className="fas fa-comment-alt me-2 text-warning"></i>
                                                Nội dung chuyển khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{cuphap} {depositCode || 'Đang tải...'}</span>
                                                    <div> <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm btn-copy"
                                                        onClick={() => handleCopy(`${cuphap} ${depositCode}`)}
                                                        title="Sao chép nội dung chuyển khoản"
                                                        disabled={!depositCode}
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                        {onGenerateNewCode && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-warning btn-sm ms-2"
                                                                onClick={handleGenerateNewCode}
                                                                title="Tạo mã nạp tiền mới"
                                                                disabled={isGenerating}
                                                            >
                                                                {isGenerating ? (
                                                                    <i className="fas fa-spinner fa-spin"></i>
                                                                ) : (
                                                                    <i className="fas fa-sync-alt"></i>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>


                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-coins me-2 text-success"></i>
                                                Nạp ít nhất
                                            </td>
                                            <td>
                                                <div className="amount-money">
                                                    {bank?.min_recharge
                                                        ? Number(bank.min_recharge).toLocaleString("en-US")
                                                        : "0"}
                                                    đ
                                                </div>
                                            </td>
                                        </tr>
                                        {/* <tr className="d-lg-none">
                                            <td>
                                                <i className="fas fa-mobile-alt me-2 text-primary"></i>
                                                Mở App Ngân Hàng
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-lg d-lg-none"
                                                    onClick={() => handleOpenAppModal(bank)}
                                                    style={{
                                                        background: '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '14px 28px',
                                                        fontWeight: '600',
                                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <i className="fas fa-mobile-alt me-2"></i>
                                                    Mở App
                                                </button>
                                            </td>
                                        </tr> */}
                                    </tbody>
                                </table>
                            </div>

                            {/* QR Code */}
                            <div className="col-md-6 qr-section">
                                <div className="qr-header">
                                    <i className="fas fa-qrcode me-2"></i>
                                    Nạp tiền qua quét mã QR
                                </div>
                                <div className="qr-code mb-3">
                                    <img
                                        src={`https://img.vietqr.io/image/${bank.bank_name}-${bank.account_number}-qronly2.jpg?accountName=${encodeURIComponent(
                                            bank.account_name
                                        )}&addInfo=${encodeURIComponent(`${cuphap} ${depositCode || ''}`)}`}
                                        alt="QR CODE"
                                        width={280}
                                        height={280}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal - Chọn App Ngân Hàng */}
            <Modal show={showAppModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-mobile-alt me-2"></i>
                        {modalStep === 1 ? 'Chuyển tiền nhanh' : 'Nhập số tiền nạp'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalStep === 1 ? (
                        /* Step 1: Select Bank App */
                        <>
                            <p className="text-black fw-bold mb-3">
                                <i className="fas fa-hand-pointer me-2"></i>
                                Bước 1: Chọn App ngân hàng bạn đang sử dụng
                            </p>

                            {/* Search Input */}
                            <div className="mb-4">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control border-1 border-end-0 ps-3"
                                        placeholder="Tìm ngân hàng (ví dụ: vcb, mb, techcombank...)"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ boxShadow: 'none' }}
                                    />
                                    <span className="input-group-text bg-light border-start-0">
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                </div>
                            </div>

                            {loadingApps ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin fa-2x text-muted"></i>
                                    <p className="mt-2 text-muted">Đang tải danh sách app...</p>
                                </div>
                            ) : (
                                <div className="bank-grid-container" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                    gap: '12px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    padding: '4px'
                                }}>
                                    {filteredApps.length > 0 ? (
                                        filteredApps.map((app, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => handleSelectBankApp(app)}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    padding: '12px 8px',
                                                    borderRadius: '12px',
                                                    background: 'white',
                                                    border: '1px solid #e0e0e0',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                                    e.currentTarget.style.borderColor = '#667eea';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                                }}
                                            >
                                                <img
                                                    src={app.logo}
                                                    alt={app.shortName}
                                                    style={{
                                                        width: '64px',
                                                        height: '64px',
                                                        borderRadius: '12px',
                                                        objectFit: 'contain',
                                                        marginBottom: '8px'
                                                    }}
                                                />
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    textAlign: 'center',
                                                    lineHeight: '1.2'
                                                }}>{app.shortName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center w-100 py-3 text-muted" style={{ gridColumn: '1 / -1' }}>
                                            Không tìm thấy ngân hàng nào phù hợp
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Step 2: Enter Amount */
                        <>
                            {/* Selected App Info - Horizontal */}
                            <div className="d-flex align-items-center justify-content-between mb-4 p-2" style={{
                                background: '#f8f9fa',
                                borderRadius: '12px',
                                border: '1px solid #e9ecef'
                            }}>
                                <div className="d-flex align-items-center">
                                    <img
                                        src={selectedApp?.logo}
                                        alt={selectedApp?.shortName}
                                        style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '8px',
                                            objectFit: 'contain',
                                            marginRight: '12px'
                                        }}
                                    />
                                    <div>
                                        <small className="text-black d-block">Đang mở bằng:</small>
                                        <span className="fw-bold" style={{ color: '#198754' }}>{selectedApp?.shortName}</span>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleBackToStep1}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Thay đổi
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-3">
                                <label className="form-label fw-bold text-dark">
                                    Bước 2: Nhập số tiền cần nạp
                                </label>
                                <p className="text-danger d-block mb-2">
                                    Nạp ít nhất {Number(selectedBank?.min_recharge || 10000).toLocaleString("en-US")} đ
                                </p>
                                <div className="input-group input-group-lg">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="0"
                                        value={depositAmount ? Number(depositAmount).toLocaleString("en-US") : ''}
                                        onChange={(e) => handleAmountChange(e.target.value.replace(/,/g, ''))}
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: '700',
                                            textAlign: 'center',
                                            border: '2px solid #198754',
                                            borderRight: 'none',
                                            borderRadius: '12px 0 0 12px'
                                        }}
                                        autoFocus
                                    />
                                    <span className="input-group-text" style={{
                                        background: '#198754',
                                        color: 'white',
                                        fontWeight: '700',
                                        border: '2px solid #198754',
                                        borderRadius: '0 12px 12px 0',
                                        padding: '0 20px'
                                    }}>VND</span>
                                </div>
                                <p className="text-muted d-block text-center mt-2">
                                    Hệ thống sẽ tự động mở App và điền sẵn thông tin.
                                </p>
                            </div>

                            {/* Continue Button */}
                            <button
                                className="btn btn-lg w-100 mb-3"
                                onClick={handleOpenBankApp}
                                disabled={!depositAmount || parseInt(depositAmount) < (selectedBank?.min_recharge || 0)}
                                style={{
                                    background: '#198754',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}
                            >
                                <i className="fas fa-paper-plane me-2"></i>
                                Tiếp tục mở App
                            </button>

                            {/* Security Badge */}
                            <div className="text-center">
                                <p className="text-muted">
                                    <i className="fas fa-lock me-1"></i>
                                    Thanh toán bảo mật
                                </p>
                            </div>
                        </>
                    )}
                </Modal.Body>
            </Modal >
        </>
    );
}