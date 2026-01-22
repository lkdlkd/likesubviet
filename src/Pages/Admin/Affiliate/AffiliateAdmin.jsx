import React, { useState, useEffect } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

const AffiliateAdmin = () => {
    const [formData, setFormData] = useState({
        affiliateEnabled: true,
        affiliateMinDeposit: 50000,
        affiliateCommissionPercent: 5
    });
    const [loading, setLoading] = useState(false);

    const fetchConfig = async () => {
        try {
            loadingg("Đang tải cấu hình affiliate...", true, 9999999);
            const token = localStorage.getItem("token");
            const config = await getConfigWeb(token);
            setFormData({
                affiliateEnabled: config.data.affiliateEnabled ?? true,
                affiliateMinDeposit: config.data.affiliateMinDeposit || 50000,
                affiliateCommissionPercent: config.data.affiliateCommissionPercent || 5
            });
        } catch (error) {
            toast.error("Không thể tải cấu hình affiliate!");
        } finally {
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        loadingg("Đang lưu cấu hình affiliate...", true, 9999999);
        try {
            const token = localStorage.getItem("token");
            await updateConfigWeb({
                affiliateEnabled: formData.affiliateEnabled,
                affiliateMinDeposit: Number(formData.affiliateMinDeposit),
                affiliateCommissionPercent: Number(formData.affiliateCommissionPercent)
            }, token);
            fetchConfig();
            toast.success("Cập nhật cấu hình affiliate thành công!");
        } catch (error) {
            toast.error("Cập nhật cấu hình thất bại!");
        } finally {
            setLoading(false);
            loadingg("", false);
        }
    };

    const formatMoney = (num) => {
        return Number(num || 0).toLocaleString('vi-VN');
    };

    return (
        <>
            <style>
                {`
                    .aff-admin {
                        --aff-primary: #3b82f6;
                        --aff-primary-dark: #2563eb;
                        --aff-bg: #ffffff;
                        --aff-bg-secondary: #f8fafc;
                        --aff-border: #e2e8f0;
                        --aff-text: #1e293b;
                        --aff-text-secondary: #64748b;
                        --aff-success: #22c55e;
                        --aff-warning: #f59e0b;
                    }
                    
                    [data-bs-theme="dark"] .aff-admin,
                    .dark .aff-admin {
                        --aff-primary: #60a5fa;
                        --aff-primary-dark: #3b82f6;
                        --aff-bg: #1e293b;
                        --aff-bg-secondary: #334155;
                        --aff-border: #475569;
                        --aff-text: #f1f5f9;
                        --aff-text-secondary: #94a3b8;
                        --aff-success: #4ade80;
                        --aff-warning: #fbbf24;
                    }
                    
                    .aff-admin .aff-card {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    
                    .aff-admin .aff-header {
                        background: var(--aff-primary);
                        padding: 1.25rem 1.5rem;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    
                    .aff-admin .aff-header-icon {
                        width: 44px;
                        height: 44px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .aff-admin .aff-header-icon i {
                        font-size: 20px;
                        color: #fff;
                    }
                    
                    .aff-admin .aff-header-title {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #fff;
                        margin: 0;
                    }
                    
                    .aff-admin .aff-header-sub {
                        font-size: 0.875rem;
                        color: rgba(255,255,255,0.8);
                        margin: 0;
                    }
                    
                    .aff-admin .aff-body {
                        padding: 1.5rem;
                    }
                    
                    .aff-admin .aff-form-group {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        border-radius: 10px;
                        padding: 1.25rem;
                        margin-bottom: 1rem;
                    }
                    
                    .aff-admin .aff-label {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        font-weight: 600;
                        color: var(--aff-text);
                        margin-bottom: 0.75rem;
                    }
                    
                    .aff-admin .aff-label i {
                        color: var(--aff-primary);
                    }
                    
                    .aff-admin .aff-hint {
                        font-size: 0.8rem;
                        color: var(--aff-text-secondary);
                        margin-top: 0.5rem;
                    }
                    
                    .aff-admin .aff-switch-row {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    
                    .aff-admin .aff-switch {
                        width: 50px !important;
                        height: 26px !important;
                    }
                    
                    .aff-admin .aff-switch:checked {
                        background-color: var(--aff-success) !important;
                        border-color: var(--aff-success) !important;
                    }
                    
                    .aff-admin .aff-input-group {
                        max-width: 220px;
                    }
                    
                    .aff-admin .aff-input {
                        background: var(--aff-bg);
                        border: 1px solid var(--aff-border);
                        color: var(--aff-text);
                        font-weight: 600;
                    }
                    
                    .aff-admin .aff-input:focus {
                        border-color: var(--aff-primary);
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    }
                    
                    .aff-admin .aff-addon {
                        background: var(--aff-primary);
                        border: none;
                        color: #fff;
                        font-weight: 600;
                    }
                    
                    .aff-admin .aff-example {
                        background: var(--aff-bg-secondary);
                        border: 1px solid var(--aff-border);
                        border-radius: 10px;
                        padding: 1.25rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .aff-admin .aff-example-title {
                        font-weight: 600;
                        color: var(--aff-warning);
                        margin-bottom: 0.5rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    
                    .aff-admin .aff-example-text {
                        color: var(--aff-text);
                    }
                    
                    .aff-admin .aff-example-highlight {
                        color: var(--aff-success);
                        font-weight: 700;
                    }
                    
                    .aff-admin .aff-btn-submit {
                        background: var(--aff-primary);
                        border: none;
                        color: #fff;
                        padding: 0.75rem 2rem;
                        border-radius: 8px;
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    
                    .aff-admin .aff-btn-submit:hover:not(:disabled) {
                        background: var(--aff-primary-dark);
                    }
                    
                    .aff-admin .aff-btn-submit:disabled {
                        opacity: 0.6;
                    }
                `}
            </style>

            <div className="aff-admin">
                <div className="row">
                    <div className="col-12">
                        <div className="aff-card">
                            <div className="aff-header">
                                <div className="aff-header-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <div>
                                    <h2 className="aff-header-title">Cấu hình Affiliate</h2>
                                    <p className="aff-header-sub">Hoa hồng cho người giới thiệu</p>
                                </div>
                            </div>
                            <div className="aff-body">
                                <form onSubmit={handleSubmit}>
                                    {/* Bật/tắt */}
                                    <div className="aff-form-group">
                                        <label className="aff-label">
                                            <i className="fas fa-toggle-on"></i>
                                            Trạng thái Affiliate
                                        </label>
                                        <div className="aff-switch-row">
                                            <input
                                                className="form-check-input aff-switch"
                                                type="checkbox"
                                                role="switch"
                                                checked={formData.affiliateEnabled}
                                                onChange={(e) => setFormData({ ...formData, affiliateEnabled: e.target.checked })}
                                            />
                                            {formData.affiliateEnabled ? (
                                                <span className="badge bg-success">Đang bật</span>
                                            ) : (
                                                <span className="badge bg-secondary">Đã tắt</span>
                                            )}
                                        </div>
                                        <div className="aff-hint">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Khi tắt, hệ thống sẽ không tính hoa hồng
                                        </div>
                                    </div>

                                    {/* Phần trăm */}
                                    <div className="aff-form-group">
                                        <label className="aff-label">
                                            <i className="fas fa-percent"></i>
                                            Tỷ lệ hoa hồng
                                        </label>
                                        <div className="input-group aff-input-group">
                                            <input
                                                type="number"
                                                className="form-control aff-input text-center"
                                                value={formData.affiliateCommissionPercent}
                                                onChange={(e) => setFormData({ ...formData, affiliateCommissionPercent: e.target.value })}
                                                min="0"
                                                max="100"
                                            />
                                            <span className="input-group-text aff-addon">%</span>
                                        </div>
                                        <div className="aff-hint">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Người giới thiệu nhận {formData.affiliateCommissionPercent}% khi người được giới thiệu nạp tiền
                                        </div>
                                    </div>

                                    {/* Mức nạp tối thiểu */}
                                    <div className="aff-form-group">
                                        <label className="aff-label">
                                            <i className="fas fa-money-bill-wave"></i>
                                            Mức nạp tối thiểu
                                        </label>
                                        <div className="input-group aff-input-group">
                                            <input
                                                type="number"
                                                className="form-control aff-input"
                                                value={formData.affiliateMinDeposit}
                                                onChange={(e) => setFormData({ ...formData, affiliateMinDeposit: e.target.value })}
                                                min="0"
                                            />
                                            <span className="input-group-text aff-addon">VNĐ</span>
                                        </div>
                                        <div className="aff-hint">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Chỉ tính hoa hồng khi nạp từ {formatMoney(formData.affiliateMinDeposit)} VNĐ
                                        </div>
                                    </div>

                                    {/* Ví dụ */}
                                    <div className="aff-example">
                                        <div className="aff-example-title">
                                            <i className="fas fa-lightbulb"></i>
                                            Ví dụ
                                        </div>
                                        <div className="aff-example-text">
                                            Với {formData.affiliateCommissionPercent}% hoa hồng, khi B nạp 100,000 VNĐ:
                                            <br />
                                            → A (người giới thiệu) nhận: <span className="aff-example-highlight">{formatMoney(100000 * formData.affiliateCommissionPercent / 100)} VNĐ</span>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <button type="submit" className="btn aff-btn-submit" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Lưu cấu hình
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AffiliateAdmin;
