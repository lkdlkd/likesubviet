import React, { useState, useContext, useEffect } from 'react';
import { setup2FA, verify2FA, disable2FA } from '@/Utils/api';
import { AuthContext } from '@/Context/AuthContext';
import { toast } from 'react-toastify';
import { max } from 'moment';

/*
 TwoFASettings component usage:
 <TwoFASettings isEnabled={user.twoFAEnabled} />

 Backend expected endpoints:
  POST /api/2fa/setup    -> returns { otpauthUrl, qrImageDataUrl?, tempSecret }
  POST /api/2fa/verify   -> body { code } returns { enabled: true }
  POST /api/2fa/disable  -> body {} returns { disabled: true }

 Props:
  - isEnabled (boolean): initial state whether 2FA is active for the user
  - onStatusChange?: callback(newStatusBoolean)
*/

const TwoFASettings = ({ user, isEnabled: initialEnabled = false, onStatusChange }) => {
    const { auth } = useContext(AuthContext); // expects { token }
    const token = auth?.token;

    const [isEnabled, setIsEnabled] = useState(user?.twoFactorEnabled ?? initialEnabled);
    // Đồng bộ khi prop user.twoFactorEnabled hoặc initialEnabled thay đổi
    useEffect(() => {
        const enabled = user?.twoFactorEnabled ?? initialEnabled;
        setIsEnabled(enabled);
    }, [user?.twoFactorEnabled, initialEnabled]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('idle'); // idle | provisioning | verify | disable
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [otpAuthUrl, setOtpAuthUrl] = useState('');
    const [code, setCode] = useState('');
    const [tempSecret, setTempSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    const startSetup = async () => {
        if (!token) return toast.error('Thiếu token xác thực');
        setLoading(true);
        try {
            setStep('provisioning');
            const res = await setup2FA(token);

            if (!res.status) {
                toast.error(`${res.message}`);
            }

            // Chuẩn hoá (giữ fallback snake_case một thời gian)
            const otpauth = res.otpauthUrl || res.otpauth_url || '';
            const qr = res.qrImageDataUrl || res.qr || '';
            const secret = res.tempSecret || res.base32 || '';

            if (qr) setQrDataUrl(qr);
            if (otpauth) setOtpAuthUrl(otpauth);
            if (!qr && otpauth) {
                setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauth)}`);
            }
            if (secret) setTempSecret(secret);
            setStep('verify');
        } catch (e) {
            toast.error(`Không thể khởi tạo 2FA: ${e.message}`);
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const submitVerify = async (e) => {
        e.preventDefault();
        if (!token) return toast.error('Thiếu token xác thực');
        if (!code) return toast.error('Nhập mã xác minh');
        setLoading(true);
        try {
            const res = await verify2FA({ code }, token);
            if (res.status && (res.enabled || res.twoFactorEnabled)) {
                toast.success(res.message || 'Đã bật 2FA thành công');
                setIsEnabled(true);
                setStep('idle');
                setCode('');
                setQrDataUrl('');
                setOtpAuthUrl('');
                setTempSecret('');
                setShowSecret(false);
                onStatusChange && onStatusChange(true, res);
            } else {
                toast.error(res.error || res.message || 'Mã không hợp lệ');
            }
        } catch (e) {
            toast.error(`Xác minh thất bại: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const submitDisable = async (e) => {
        e.preventDefault();
        if (!token) return toast.error('Thiếu token xác thực');
        if (!code) return toast.error('Nhập mã 2FA hiện tại để tắt');
        setLoading(true);
        try {
            const res = await disable2FA({ code }, token);
            if (res.status && (res.disabled || res.twoFactorEnabled === false)) {
                toast.success(res.message || 'Đã tắt 2FA');
                setIsEnabled(false);
                setCode('');
                setStep('idle');
                onStatusChange && onStatusChange(false, res);
            } else {
                toast.error(res.error || res.message || 'Không thể tắt 2FA');
            }
        } catch (e) {
            toast.error(e.message || 'Lỗi khi tắt 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Enhanced TwoFASettings Styles */}
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes qrAppear {
                    from { opacity: 0; transform: scale(0.8) rotate(-5deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes successBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                
                .twofa-container {
                    animation: slideInRight 0.6s ease both;
                }
                
                .twofa-card-enhanced {
                    border: none;
                    border-radius: 16px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,250,0.95));
                    backdrop-filter: blur(10px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    position: relative;
                    margin-top: 20px;
                }
                .twofa-card-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #28a745, #20c997, #28a745);
                    background-size: 200% 100%;
                    animation: shimmer 2s linear infinite;
                }
                .twofa-card-enhanced:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                }
                
                .twofa-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .twofa-header h5 {
                    margin: 0;
                    color: #495057;
                    font-weight: 700;
                }
                .twofa-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #28a745, #20c997);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }
                
                .description-text {
                    color: #6c757d;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin-bottom: 20px;
                    padding: 12px;
                    background: rgba(0,123,255,0.05);
                    border-radius: 8px;
                    border-left: 4px solid #007bff;
                }
                
                .status-container {
                    margin-bottom: 20px;
                    animation: fadeInScale 0.5s ease both;
                }
                
                .badge-enhanced {
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    animation: successBounce 0.6s ease both;
                }
                .badge-success-enhanced {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    box-shadow: 0 4px 12px rgba(40,167,69,0.3);
                }
                .badge-danger-enhanced {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    color: white;
                    box-shadow: 0 4px 12px rgba(220,53,69,0.3);
                }
                
                .btn-enhanced {
                    border-radius: 12px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                    padding: 10px 20px;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-enhanced::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s ease;
                }
                .btn-enhanced:hover::before {
                    left: 100%;
                }
                .btn-enhanced:hover {
                    transform: translateY(-2px);
                }
                .btn-enhanced:active {
                    transform: translateY(0);
                }
                .btn-enhanced:disabled {
                    opacity: 0.7;
                    transform: none;
                    cursor: not-allowed;
                }
                
                .btn-primary-enhanced {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 12px rgba(0,123,255,0.3);
                }
                .btn-primary-enhanced:hover:not(:disabled) {
                    background: linear-gradient(135deg, #0056b3, #003d82);
                    box-shadow: 0 6px 16px rgba(0,123,255,0.4);
                    color: white;
                }
                
                .btn-success-enhanced {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 12px rgba(40,167,69,0.3);
                }
                .btn-success-enhanced:hover:not(:disabled) {
                    background: linear-gradient(135deg, #218838, #1e7e34);
                    box-shadow: 0 6px 16px rgba(40,167,69,0.4);
                    color: white;
                }
                
                .btn-danger-enhanced {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    border: none;
                    color: white;
                    box-shadow: 0 4px 12px rgba(220,53,69,0.3);
                }
                .btn-danger-enhanced:hover:not(:disabled) {
                    background: linear-gradient(135deg, #c82333, #a71e2a);
                    box-shadow: 0 6px 16px rgba(220,53,69,0.4);
                    color: white;
                }
                
                .btn-outline-enhanced {
                    background: rgba(255,255,255,0.9);
                    border: 2px solid #6c757d;
                    color: #6c757d;
                }
                .btn-outline-enhanced:hover:not(:disabled) {
                    background: #6c757d;
                    color: white;
                    border-color: #6c757d;
                }
                
                .verification-section {
                    animation: fadeInScale 0.5s ease both;
                    background: rgba(255,255,255,0.7);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                    border: 1px solid rgba(0,0,0,0.1);
                }
                
                .qr-container {
                    text-align: center;
                    margin: 20px 0;
                }
                .qr-image {
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                    animation: qrAppear 0.8s ease both;
                    border: 4px solid white;
                    background: white;
                }
                
                .manual-entry {
                    background: rgba(248,249,250,0.8);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 12px;
                    border: 1px dashed #dee2e6;
                }
                .manual-entry small {
                    color: #6c757d;
                    font-weight: 600;
                }
                .manual-url {
                    background: #fff;
                    padding: 8px;
                    border-radius: 6px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.8rem;
                    word-break: break-all;
                    border: 1px solid #dee2e6;
                }
                
                .secret-container {
                    margin-top: 12px;
                }
                .secret-display {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .secret-text {
                    background: #fff;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.85rem;
                    border: 1px solid #dee2e6;
                    flex: 1;
                    min-width: 200px;
                }
                .secret-warning {
                    color: #fd7e14;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .form-control-enhanced {
                    border-radius: 12px;
                    border: 2px solid rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    padding: 12px 16px;
                    font-size: 0.95rem;
                    background: rgba(255,255,255,0.9);
                }
                .form-control-enhanced:focus {
                    border-color: #007bff;
                    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
                    transform: translateY(-1px);
                    background: white;
                }
                .form-control-enhanced:hover {
                    border-color: rgba(0,123,255,0.3);
                }
                
                .form-label-enhanced {
                    font-weight: 600;
                    color: #495057;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .alert-enhanced {
                    border: none;
                    border-radius: 12px;
                    padding: 12px 16px;
                    font-weight: 500;
                }
                .alert-warning-enhanced {
                    background: linear-gradient(135deg, rgba(255,193,7,0.1), rgba(253,126,20,0.1));
                    color: #856404;
                    border-left: 4px solid #ffc107;
                }
                
                .button-group {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 16px;
                }
                
                .loading-icon {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .disable-section {
                    animation: fadeInScale 0.5s ease both;
                    background: rgba(255,255,255,0.7);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 20px;
                    border: 1px solid rgba(220,53,69,0.2);
                    border-left: 4px solid #dc3545;
                }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .twofa-card-enhanced {
                        border-radius: 12px;
                        margin-top: 16px;
                    }
                    .twofa-header {
                        flex-direction: column;
                        text-align: center;
                        gap: 8px;
                    }
                    .verification-section,
                    .disable-section {
                        padding: 16px;
                    }
                    .button-group {
                        flex-direction: column;
                    }
                    .btn-enhanced {
                        width: 100%;
                        justify-content: center;
                    }
                    .secret-display {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .secret-text {
                        min-width: auto;
                    }
                }
            `}</style>
            
            <div className="twofa-container">
                <div className="card twofa-card-enhanced p-3">
                    <div className="twofa-header">
                        <div className="twofa-icon">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <h5>Bảo mật 2 lớp (2FA)</h5>
                    </div>
                    
                    <div className="description-text">
                        <i className="fas fa-info-circle me-2"></i>
                        Sử dụng ứng dụng Google Authenticator (hoặc tương tự) để bảo vệ tài khoản tốt hơn.
                    </div>

                    {isEnabled && step === 'idle' && (
                        <div className="status-container">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="badge badge-enhanced badge-success-enhanced">
                                    <i className="fas fa-check-circle"></i>
                                    Đã bật
                                </span>
                                <button
                                    className="btn btn-enhanced btn-danger-enhanced"
                                    onClick={() => { setCode(''); setStep('disable'); }}
                                    disabled={loading}
                                >
                                    <i className="fas fa-times-circle"></i>
                                    Tắt 2FA
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {step === 'disable' && isEnabled && (
                        <div className="disable-section">
                            <h6 className="text-danger mb-3">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Xác nhận tắt 2FA
                            </h6>
                            <p className="text-muted small mb-3">
                                Nhập mã 6 số hiện tại trong ứng dụng để tắt bảo mật 2 lớp.
                            </p>
                            <form onSubmit={submitDisable}>
                                <div className="mb-3">
                                    <label className="form-label form-label-enhanced">
                                        <i className="fas fa-key text-danger"></i>
                                        Mã 6 số
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-enhanced"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="Nhập mã hiện tại"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="btn btn-enhanced btn-danger-enhanced" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner loading-icon"></i>
                                                Đang tắt...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-shield-alt"></i>
                                                Xác nhận tắt
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-enhanced btn-outline-enhanced"
                                        onClick={() => { setStep('idle'); setCode(''); }}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-times"></i>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {!isEnabled && step === 'idle' && (
                        <div className="status-container">
                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="badge badge-enhanced badge-danger-enhanced">
                                    <i className="fas fa-times-circle"></i>
                                    Chưa bật
                                </span>
                                <button className="btn btn-enhanced btn-primary-enhanced" onClick={startSetup} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner loading-icon"></i>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-plus-circle"></i>
                                            Bật 2FA
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'verify' && !isEnabled && (
                        <div className="verification-section">
                            <h6 className="text-success mb-3">
                                <i className="fas fa-qrcode me-2"></i>
                                Quét mã QR bằng ứng dụng Authenticator
                            </h6>
                            
                            {qrDataUrl ? (
                                <div className="qr-container">
                                    <img src={qrDataUrl} alt="QR 2FA" className="qr-image" style={{ width: 180, height: 180 }} />
                                </div>
                            ) : (
                                <div className="alert alert-enhanced alert-warning-enhanced">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Không tạo được QR – dùng thủ công URL bên dưới.
                                </div>
                            )}
                            
                            {/* {otpAuthUrl && (
                                <div className="manual-entry">
                                    <small className="text-muted d-block mb-2">
                                        <i className="fas fa-keyboard me-1"></i>
                                        Hoặc nhập thủ công:
                                    </small>
                                    <div className="manual-url">{otpAuthUrl}</div>
                                </div>
                            )}
                             */}
                            {tempSecret && (
                                <div className="secret-container">
                                    <small className="text-muted d-block mb-2">
                                        <i className="fas fa-key me-1"></i>
                                        Secret thủ công:
                                    </small>
                                    <div className="secret-display">
                                        <div className="secret-text"
                                            style={{ maxWidth: '100%' }}>
                                            {showSecret ? tempSecret : tempSecret.replace(/.(?=.{5})/g, '•')}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-enhanced btn-outline-enhanced"
                                            onClick={() => setShowSecret(s => !s)}
                                        >
                                            <i className={`fas ${showSecret ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                            {showSecret ? 'Ẩn' : 'Hiện'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-enhanced btn-primary-enhanced"
                                            onClick={() => {
                                                navigator.clipboard.writeText(tempSecret).then(() => toast.success('Đã copy secret'));
                                            }}
                                        >
                                            <i className="fas fa-copy"></i>
                                            Copy
                                        </button>
                                    </div>
                                    <div className="secret-warning">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        Không chia sẻ secret này cho người khác.
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={submitVerify} className="mt-4">
                                <div className="mb-3">
                                    <label className="form-label form-label-enhanced">
                                        <i className="fas fa-mobile-alt text-success"></i>
                                        Nhập mã xác minh (Mã 6 số)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-enhanced"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="Nhập mã trong ứng dụng"
                                        required
                                    />
                                </div>
                                <div className="button-group">
                                    <button type="submit" className="btn btn-enhanced btn-success-enhanced" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner loading-icon"></i>
                                                Đang xác minh...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check-circle"></i>
                                                Xác minh & bật
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-enhanced btn-outline-enhanced" 
                                        onClick={() => { 
                                            setStep('idle'); 
                                            setQrDataUrl(''); 
                                            setOtpAuthUrl(''); 
                                            setCode(''); 
                                        }} 
                                        disabled={loading}
                                    >
                                        <i className="fas fa-times"></i>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TwoFASettings;
