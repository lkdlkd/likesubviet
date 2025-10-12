import { useState, useEffect, useRef } from "react";
import Table from "react-bootstrap/Table";
import { ThongkeCharts } from "./ThongkeCharts";
import { getStatistics } from "@/Utils/api";
import { loadingg } from "@/JS/Loading";

export default function ThongkePage() {
    const [statistics, setStatistics] = useState(null);
    const [doanhthuRange, setDoanhthuRange] = useState("today");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [customApplied, setCustomApplied] = useState(false);
    const prevRange = useRef(doanhthuRange);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showLaiTheoDomain, setShowLaiTheoDomain] = useState(false);

    // Lấy token từ localStorage (hoặc từ context nếu cần)
    const token = localStorage.getItem("token");

    // Gọi API để lấy dữ liệu thống kê
    useEffect(() => {
        // Reset customApplied if range changes away from custom
        if (prevRange.current !== doanhthuRange) {
            setCustomApplied(false);
            prevRange.current = doanhthuRange;
        }
        const fetchStatistics = async () => {
            setLoading(true);
            loadingg("Đang tải...", true, 9999999);
            try {
                let data;
                if (customStart && customEnd) {
                    if (!customApplied) return; // Only fetch if user applied
                    data = await getStatistics(token, doanhthuRange, customStart, customEnd);
                    setDoanhthuRange(`(${customStart} - ${customEnd})`);
                } else {
                    data = await getStatistics(token, doanhthuRange);
                }
                setStatistics(data);
                setErrorMessage(null);
            } catch (error) {
                setErrorMessage(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
            } finally {
                setLoading(false);
                loadingg("Đang tải...", false);
            }
        };
        fetchStatistics();
    }, [token, doanhthuRange, customApplied]);

    // Xử lý thay đổi khoảng thời gian
    const handleRangeChange = (type, value) => {
        if (type === "doanhthuRange") {
            setDoanhthuRange(value);
            setCustomStart("");
            setCustomEnd("");
            setCustomApplied(false);
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (errorMessage) {
        return <div className="alert alert-danger">{errorMessage}</div>;
    }

    if (!statistics) {
        return <div>Không có dữ liệu thống kê.</div>;
    }

    const rangeLabels = {
        today: "Hôm nay",
        yesterday: "Hôm qua",
        this_week: "Tuần này",
        last_week: "Tuần trước",
        this_month: "Tháng này",
        last_month: "Tháng trước",
    };

    const stats = [
        {
            label: `Nạp tiền ${rangeLabels[doanhthuRange] || doanhthuRange}`,
            value: statistics.tongnapngay,
            icon: "ti ti-coin",
            bg: "bg-light-primary",
        },
        {
            label: `Tiền tiêu ${rangeLabels[doanhthuRange] || doanhthuRange}`,
            value: statistics.tongdoanhthuhnay,
            icon: "ti ti-coin",
            bg: "bg-light-primary",
        },
        {
            label: "Tổng thành viên",
            value: statistics.tonguser,
            icon: "ti ti-users",
            bg: "bg-light-success",
        },
        {
            label: "Tổng số dư còn lại",
            value: statistics.tongtienweb,
            icon: "ti ti-coin",
            bg: "bg-light-warning",
        },
        {
            label: "Tổng đã nạp",
            value: statistics.tongdanap,
            icon: "ti ti-coin",
            bg: "bg-light-primary",
        },
        {
            label: "Tổng nạp tháng",
            value: statistics.tongnapthang,
            icon: "ti ti-users",
            bg: "bg-light-info",
        },
        {
            label: "Đơn hàng đang chạy",
            value: statistics.tongdondangchay,
            icon: "ti ti-coin",
            bg: "bg-light-warning",
        },
        {
            label: "Đơn hoàn (partial)",
            value: statistics.partialCount,
            icon: "ti ti-rotate",
            bg: "bg-light-warning",
            extra: (
                <div className="text-warning small">Tổng tiền: {Math.floor(Number(statistics.partialHoan || 0)).toLocaleString("en-US")}
                    {/* {Number(statistics.partialHoan || 0).toLocaleString('en-US')} */}
                </div>
            )
        },
        {
            label: "Đơn hoàn (canceled)",
            value: statistics.canceledCount,
            icon: "ti ti-ban",
            bg: "bg-light-danger",
            extra: (
                <div className="text-danger small">Tổng tiền: {Math.floor(Number(statistics.canceledHoan || 0)).toLocaleString("en-US")}
                    {/* {Number(statistics.canceledHoan || 0).toLocaleString('en-US')} */}
                </div>
            )
        },
    ];

    return (
        <>
            <style>
                {`
                    /* Modern Statistics Page Styles */
                    .stats-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .stats-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .stats-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .stats-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .stats-header-content {
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .stats-icon-circle {
                        width: 50px;
                        height: 50px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        backdrop-filter: blur(10px);
                    }
                    
                    .stats-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .stats-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .stats-filters-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stats-filters-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #495057;
                        margin-bottom: 1rem;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .stats-form-control {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.6rem 1rem;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .stats-form-control:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    }
                    
                    .stats-btn-primary {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: 1px solid #667eea;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        margin-top: 0.5rem;
                    }
                    
                    .stats-btn-primary:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        color: white;
                    }
                    
                    .stats-btn-primary:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }
                    
                    .stats-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        transition: all 0.3s ease;
                        height: 100%;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stats-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.12);
                    }
                    
                    .stats-card .card-body {
                        padding: 1.5rem;
                    }
                    
                    .stats-chart-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stats-chart-card .card-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-bottom: 1px solid #e8ecef;
                        border-radius: 12px 12px 0 0;
                        padding: 1rem 1.5rem;
                        font-weight: 600;
                        color: #495057;
                    }
                    
                    .stats-details-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        margin-bottom: 1.5rem;
                    }
                    
                    .stats-details-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-bottom: 1px solid #e8ecef;
                        border-radius: 12px 12px 0 0;
                        padding: 1rem 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: between;
                        gap: 1rem;
                    }
                    
                    .stats-details-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #495057;
                        margin: 0;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .stats-avtar {
                        width: 45px;
                        height: 45px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 1rem;
                    }
                    
                    .stats-value {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 0.25rem;
                        color: #2c3e50;
                    }
                    
                    .stats-label {
                        font-size: 13px;
                        color: #6c757d;
                        font-weight: 500;
                        margin-bottom: 0;
                    }
                    
                    .stats-badge {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        color: white;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        font-weight: 500;
                        font-size: 14px;
                    }
                    
                    .stats-detail-btn {
                        background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                        border: none;
                        color: white;
                        padding: 0.4rem 0.8rem;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        transition: all 0.3s ease;
                    }
                    
                    .stats-detail-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 3px 10px rgba(23, 162, 184, 0.3);
                        color: white;
                    }
                    
                    .stats-detail-info {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.75rem;
                        margin-top: 0.5rem;
                    }
                    
                    @media (max-width: 768px) {
                        .stats-container {
                            font-size: 13px;
                        }
                        
                        .stats-main-title {
                            font-size: 20px;
                        }
                        
                        .stats-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .stats-filters-section {
                            padding: 1rem;
                        }
                        
                        .stats-card .card-body {
                            padding: 1rem;
                        }
                    }
                `}
            </style>

            <div className="stats-container">
                <div className="stats-header-card">
                    <div className="card-header">
                        <div className="stats-header-content">
                            <div className="stats-icon-circle">
                                <i className="fas fa-chart-bar"></i>
                            </div>
                            <h2 className="stats-main-title">Thống kê tổng quan</h2>
                        </div>
                    </div>
                </div>

                <div className="stats-filters-section">
                    <div className="stats-filters-title">
                        <i className="fas fa-calendar-alt"></i>
                        Bộ lọc thời gian
                    </div>
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-muted mb-2">Chọn khoảng thời gian thống kê:</label>
                            <select
                                className="form-select stats-form-control mb-2"
                                value={doanhthuRange}
                                onChange={(e) => handleRangeChange("doanhthuRange", e.target.value)}
                            >
                                <option value="today">Hôm nay</option>
                                <option value="yesterday">Hôm qua</option>
                                <option value="this_week">Tuần này</option>
                                <option value="last_week">Tuần trước</option>
                                <option value="this_month">Tháng này</option>
                                <option value="last_month">Tháng trước</option>
                            </select>
                            <div className="d-flex gap-2 align-items-center">
                                <input
                                    type="date"
                                    className="form-control "
                                    value={customStart}
                                    onChange={e => { setCustomStart(e.target.value); setCustomApplied(false); }}
                                    max={customEnd || undefined}
                                />
                                <span className="text-muted">đến</span>
                                <input
                                    type="date"
                                    className="form-control "
                                    value={customEnd}
                                    onChange={e => { setCustomEnd(e.target.value); setCustomApplied(false); }}
                                    min={customStart || undefined}
                                />
                            </div>
                            <button
                                className="btn stats-btn-primary"
                                type="button"
                                disabled={!customStart || !customEnd || customApplied}
                                onClick={() => setCustomApplied(true)}
                            >
                                <i className="fas fa-check me-2"></i>
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>

            <div className="row">
                {stats.map((stat, index) => (
                    <div className="col-md-3" key={index}>
                        <div className="card">
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className={`avtar ${stat.bg} me-3`}>
                                        <i className={`${stat.icon} fs-2`}></i>
                                    </div>
                                    <div>
                                        <h4 className="mb-0"> {Math.floor(Number(stat.value)).toLocaleString("en-US")}
                                            {/* {Number(stat.value).toLocaleString("en-US")} */}
                                            </h4>
                                            <p className="stats-label mb-0 text-opacity-75 capitalize">{stat.label}</p>
                                            {stat.extra}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Biểu đồ tổng hợp */}
                {statistics.chartData && (
                    <div className="stats-chart-card">
                        <ThongkeCharts chartData={statistics.chartData} />
                    </div>
                )}
                {/* Luôn hiển thị bảng laiTheoDomain và tổng lãi */}
                {statistics.laiTheoDomain && (
                    <div className="card stats-details-card">
                        <div className="stats-details-header">
                            <h5 className="stats-details-title">
                                <i className="fas fa-chart-pie"></i>
                                Chi tiết lãi theo nguồn
                            </h5>
                            <span className="stats-badge fs-6">Tổng lãi: {Math.floor(Number(statistics.tongdoanhthu)).toLocaleString("en-US")}
                                {/* {Number(statistics.tongdoanhthu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} */}
                            </span>
                        </div>
                        <div className="card-body p-2">
                            <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <Table striped bordered hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>Nguồn</th>
                                            <th>Order nguồn</th>
                                            <th>Order site</th>
                                            <th>Lãi</th>
                                            <th>Hoàn</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.laiTheoDomain.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.DomainSmm || <i>Không xác định</i>}</td>
                                                <td>{Math.floor(Number(item.totalTientieu)).toLocaleString("en-US")}</td>
                                                <td>{Math.floor(Number(item.totalCost)).toLocaleString("en-US")}</td>
                                                <td>{Math.floor(Number(item.totalLai)).toLocaleString("en-US")}</td>
                                                <td>
                                                    {Math.floor(Number(item.totalRefund)).toLocaleString("en-US")}
                                                    <button
                                                        className="btn stats-detail-btn ms-2"
                                                        type="button"
                                                        onClick={() => setShowLaiTheoDomain(showLaiTheoDomain === idx ? null : idx)}
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    {showLaiTheoDomain === idx && (
                                                        <div className="stats-detail-info">
                                                            <div><b>Hoàn Partial:</b> {Math.floor(Number(item.totalRefundPartial)).toLocaleString("en-US")}</div>
                                                            <div><b>Hoàn Canceled:</b> {Math.floor(Number(item.totalRefundCanceled)).toLocaleString("en-US")}</div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
                {statistics.magoiStats && statistics.magoiStats.length > 0 && (
                    <div className="card stats-details-card">
                        <div className="stats-details-header">
                            <h5 className="stats-details-title">
                                <i className="fas fa-box"></i>
                                Thống kê theo Mã gói
                            </h5>
                        </div>
                        <div className="card-body p-2">
                            <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
                                <Table striped bordered hover size="sm" className="mb-0">
                                    <thead>
                                        <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                                            <td>#</td>

                                            <td colSpan={2}>Tổng</td>
                                            <td>
                                                {statistics.magoiStats.reduce((sum, item) => sum + Math.floor(Number(item.totalOrders || 0)), 0).toLocaleString('en-US')}
                                            </td>
                                            <td>
                                                {statistics.magoiStats.reduce((sum, item) => sum + Math.floor(Number(item.totalAmount || 0)), 0).toLocaleString('en-US')}
                                            </td>
                                            <td>
                                                {statistics.magoiStats.reduce((sum, item) => sum + (item.partialCount || 0), 0).toLocaleString('en-US')}
                                            </td>
                                            <td>
                                                {statistics.magoiStats.reduce((sum, item) => sum + (item.canceledCount || 0), 0).toLocaleString('en-US')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>#</th>
                                            <th>Mã gói</th>
                                            <th>Tên dịch vụ</th>
                                            <th>Tổng đơn</th>
                                            <th>Tổng tiền</th>
                                            <th>Đơn partial</th>
                                            <th>Đơn huỷ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.magoiStats.map((item, idx) => (
                                            <tr key={item.Magoi || idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.Magoi}</td>
                                                <td style={{
                                                    maxWidth: "250px",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}>{item.namesv}</td>
                                                <td>{item.totalOrders}</td>
                                                <td>{Math.floor(Number(item.totalAmount)).toLocaleString('en-US')}</td>
                                                <td>{item.partialCount}</td>
                                                <td>{item.canceledCount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
        </>
    );
}