import React, { useState, useContext, useEffect } from 'react';
import { setup2FA, verify2FA, disable2FA } from '@/Utils/api';
import { AuthContext } from '@/Context/AuthContext';
import { toast } from 'react-toastify';

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
        <div className="card p-3 mt-3">
            <h5 className="mb-3">Bảo mật 2 lớp (2FA)</h5>
            <p className="text-muted" style={{ fontSize: 14 }}>
                Sử dụng ứng dụng Google Authenticator (hoặc tương tự) để bảo vệ tài khoản tốt hơn.
            </p>

            {isEnabled && step === 'idle' && (
                <div className="mb-3 d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-success">Đã bật</span>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => { setCode(''); setStep('disable'); }}
                        disabled={loading}
                    >
                        Tắt 2FA
                    </button>
                </div>
            )}
            {step === 'disable' && isEnabled && (
                <div className="mt-3">
                    <h6>Xác nhận tắt 2FA</h6>
                    <p className="text-muted small mb-2">Nhập mã 6 số hiện tại trong ứng dụng để tắt bảo mật 2 lớp.</p>
                    <form onSubmit={submitDisable}>
                        <div className="mb-2">
                            <label className="form-label">Mã 6 số</label>
                            <input
                                type="text"
                                className="form-control"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Nhập mã hiện tại"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-danger btn-sm" disabled={loading}>
                                {loading ? 'Đang tắt...' : 'Xác nhận tắt'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => { setStep('idle'); setCode(''); }}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!isEnabled && step === 'idle' && (
                <button className="btn btn-primary btn-sm" onClick={startSetup} disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Bật 2FA'}
                </button>
            )}

            {step === 'verify' && !isEnabled && (
                <div className="mt-3">
                    <h6>Quét mã QR bằng ứng dụng Authenticator</h6>
                    {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR 2FA" style={{ width: 180, height: 180 }} />
                    ) : (
                        <div className="alert alert-warning p-2">Không tạo được QR – dùng thủ công URL bên dưới.</div>
                    )}
                    {otpAuthUrl && (
                        <div className="mt-2">
                            <small className="text-muted">Hoặc nhập thủ công:</small>
                            <div className="bg-light p-2 small" style={{ wordBreak: 'break-all' }}>{otpAuthUrl}</div>
                        </div>
                    )}
                    {tempSecret && (
                        <div className="mt-2">
                            <small className="text-muted d-block mb-1">Secret thủ công:</small>
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-light p-2 small" style={{ wordBreak: 'break-all', maxWidth: '100%' }}>
                                    {showSecret ? tempSecret : tempSecret.replace(/.(?=.{4})/g, '•')}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setShowSecret(s => !s)}
                                >
                                    {showSecret ? 'Ẩn' : 'Hiện'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(tempSecret).then(() => toast.success('Đã copy secret'));
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                            <small className="text-warning d-block mt-1">Không chia sẻ secret này cho người khác.</small>
                        </div>
                    )}
                    <form onSubmit={submitVerify} className="mt-3">
                        <div className="mb-2">
                            <label className="form-label">Nhập mã xác minh ( Mã 6 số )</label>
                            <input
                                type="text"
                                className="form-control"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Nhập mã trong ứng dụng"
                                required
                            />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                                {loading ? 'Đang xác minh...' : 'Xác minh & bật'}
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setStep('idle'); setQrDataUrl(''); setOtpAuthUrl(''); setCode(''); }} disabled={loading}>
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TwoFASettings;
