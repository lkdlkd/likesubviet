import React, { useState, useEffect } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading";

const AffiliateAdmin = () => {
    const [formData, setFormData] = useState({
        affiliateEnabled: true,
        affiliateMinDeposit: 50000,
        affiliateCommissionPercent: 5,
        withdrawMinAmount: 50000,
        withdrawMaxAmount: 10000000,
        withdrawFeePercent: 0,
        withdrawFeeFixed: 0,
        withdrawToBankEnabled: true,
        withdrawToBalanceEnabled: true
    });
    const [loading, setLoading] = useState(false);

    const fetchConfig = async () => {
        try {
            loadingg("Đang tải...", true, 9999999);
            const token = localStorage.getItem("token");
            const config = await getConfigWeb(token);
            setFormData({
                affiliateEnabled: config.data.affiliateEnabled ?? true,
                affiliateMinDeposit: config.data.affiliateMinDeposit || 50000,
                affiliateCommissionPercent: config.data.affiliateCommissionPercent || 5,
                withdrawMinAmount: config.data.withdrawMinAmount || 50000,
                withdrawMaxAmount: config.data.withdrawMaxAmount || 10000000,
                withdrawFeePercent: config.data.withdrawFeePercent || 0,
                withdrawFeeFixed: config.data.withdrawFeeFixed || 0,
                withdrawToBankEnabled: config.data.withdrawToBankEnabled !== false,
                withdrawToBalanceEnabled: config.data.withdrawToBalanceEnabled !== false
            });
        } catch (error) {
            toast.error("Không thể tải cấu hình!");
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
        loadingg("Đang lưu...", true, 9999999);
        try {
            const token = localStorage.getItem("token");
            await updateConfigWeb({
                affiliateEnabled: formData.affiliateEnabled,
                affiliateMinDeposit: Number(formData.affiliateMinDeposit),
                affiliateCommissionPercent: Number(formData.affiliateCommissionPercent),
                withdrawMinAmount: Number(formData.withdrawMinAmount),
                withdrawMaxAmount: Number(formData.withdrawMaxAmount),
                withdrawFeePercent: Number(formData.withdrawFeePercent),
                withdrawFeeFixed: Number(formData.withdrawFeeFixed),
                withdrawToBankEnabled: formData.withdrawToBankEnabled,
                withdrawToBalanceEnabled: formData.withdrawToBalanceEnabled
            }, token);
            fetchConfig();
            toast.success("Cập nhật thành công!");
        } catch (error) {
            toast.error("Cập nhật thất bại!");
        } finally {
            setLoading(false);
            loadingg("", false);
        }
    };

    const formatMoney = (num) => Number(num || 0).toLocaleString('vi-VN');

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">
                    <i className="fas fa-users-cog me-2"></i>
                    Cấu hình Affiliate & Rút hoa hồng
                </h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Cột trái - Cấu hình Affiliate */}
                        <div className="col-lg-6">
                            <h6 className="text-primary mb-3">
                                <i className="fas fa-hand-holding-usd me-2"></i>
                                Cấu hình hoa hồng
                            </h6>

                            {/* Bật/tắt */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Trạng thái</label>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            id="affiliateEnabled"
                                            checked={formData.affiliateEnabled}
                                            onChange={(e) => setFormData({ ...formData, affiliateEnabled: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="affiliateEnabled">
                                            {formData.affiliateEnabled ? (
                                                <span className="badge bg-success">Đang bật</span>
                                            ) : (
                                                <span className="badge bg-secondary">Đã tắt</span>
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <small className="text-muted">Khi tắt, hệ thống sẽ không tính hoa hồng</small>
                            </div>

                            {/* Tỷ lệ */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Tỷ lệ hoa hồng</label>
                                <div className="input-group" style={{ maxWidth: '180px' }}>
                                    <input
                                        type="number"
                                        className="form-control text-center"
                                        value={formData.affiliateCommissionPercent}
                                        onChange={(e) => setFormData({ ...formData, affiliateCommissionPercent: e.target.value })}
                                        min="0"
                                        max="100"
                                    />
                                    <span className="input-group-text">%</span>
                                </div>
                                <small className="text-muted">Người giới thiệu nhận {formData.affiliateCommissionPercent}% khi người được giới thiệu nạp tiền</small>
                            </div>

                            {/* Nạp tối thiểu */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Nạp tối thiểu để tính hoa hồng</label>
                                <div className="input-group" style={{ maxWidth: '200px' }}>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={formData.affiliateMinDeposit}
                                        onChange={(e) => setFormData({ ...formData, affiliateMinDeposit: e.target.value })}
                                        min="0"
                                    />
                                    <span className="input-group-text">VNĐ</span>
                                </div>
                            </div>

                            {/* Ví dụ */}
                            <div className="alert alert-info">
                                <i className="fas fa-lightbulb me-2"></i>
                                <strong>Ví dụ:</strong> Với {formData.affiliateCommissionPercent}%, khi B nạp 100,000đ → A nhận <strong className="text-success">{formatMoney(100000 * formData.affiliateCommissionPercent / 100)}đ</strong>
                            </div>
                        </div>

                        {/* Cột phải - Cấu hình rút */}
                        <div className="col-lg-6">
                            <h6 className="text-primary mb-3">
                                <i className="fas fa-money-bill-transfer me-2"></i>
                                Cấu hình rút hoa hồng
                            </h6>

                            <div className="row">
                                {/* Rút tối thiểu */}
                                <div className="col-6 mb-3">
                                    <label className="form-label fw-semibold">Rút tối thiểu</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.withdrawMinAmount}
                                            onChange={(e) => setFormData({ ...formData, withdrawMinAmount: e.target.value })}
                                            min="0"
                                        />
                                        <span className="input-group-text">đ</span>
                                    </div>
                                </div>

                                {/* Rút tối đa */}
                                <div className="col-6 mb-3">
                                    <label className="form-label fw-semibold">Rút tối đa</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.withdrawMaxAmount}
                                            onChange={(e) => setFormData({ ...formData, withdrawMaxAmount: e.target.value })}
                                            min="0"
                                        />
                                        <span className="input-group-text">đ</span>
                                    </div>
                                </div>

                                {/* Phí % */}
                                <div className="col-6 mb-3">
                                    <label className="form-label fw-semibold">Phí rút (%)</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.withdrawFeePercent}
                                            onChange={(e) => setFormData({ ...formData, withdrawFeePercent: e.target.value })}
                                            min="0"
                                            max="100"
                                        />
                                        <span className="input-group-text">%</span>
                                    </div>
                                </div>

                                {/* Phí cố định */}
                                <div className="col-6 mb-3">
                                    <label className="form-label fw-semibold">Phí cố định</label>
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.withdrawFeeFixed}
                                            onChange={(e) => setFormData({ ...formData, withdrawFeeFixed: e.target.value })}
                                            min="0"
                                        />
                                        <span className="input-group-text">đ</span>
                                    </div>
                                </div>
                            </div>

                            {/* Loại rút cho phép */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Loại rút cho phép</label>
                                <div className="d-flex gap-4">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="withdrawToBalance"
                                            checked={formData.withdrawToBalanceEnabled}
                                            onChange={(e) => setFormData({ ...formData, withdrawToBalanceEnabled: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="withdrawToBalance">
                                            Về số dư web
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="withdrawToBank"
                                            checked={formData.withdrawToBankEnabled}
                                            onChange={(e) => setFormData({ ...formData, withdrawToBankEnabled: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="withdrawToBank">
                                            Về ngân hàng
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="alert alert-warning">
                                <i className="fas fa-info-circle me-2"></i>
                                Phí = {formData.withdrawFeePercent}% + {formatMoney(formData.withdrawFeeFixed)}đ mỗi lần rút
                            </div>
                        </div>
                    </div>

                    {/* Nút lưu */}
                    <div className="text-center mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
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
    );
};

export default AffiliateAdmin;
