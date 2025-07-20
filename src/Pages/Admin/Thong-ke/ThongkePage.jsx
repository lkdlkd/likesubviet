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
                loadingg(false);
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
                <div className="text-warning small">Tổng tiền: {Number(statistics.partialHoan || 0).toLocaleString('en-US')}</div>
            )
        },
        {
            label: "Đơn hoàn (canceled)",
            value: statistics.canceledCount,
            icon: "ti ti-ban",
            bg: "bg-light-danger",
            extra: (
                <div className="text-danger small">Tổng tiền: {Number(statistics.canceledHoan || 0).toLocaleString('en-US')}</div>
            )
        },
    ];

    return (
        <div>
            <div className="row mb-4">
                {/* <div className="col-md-6">
                    <label>Chọn khoảng thời gian nạp tiền:</label>
                    <select
                        className="form-select"
                        value={napRange}
                        onChange={(e) => handleRangeChange("napRange", e.target.value)}
                    >
                        <option value="today">Hôm nay</option>
                        <option value="yesterday">Hôm qua</option>
                        <option value="this_week">Tuần này</option>
                        <option value="last_week">Tuần trước</option>
                        <option value="this_month">Tháng này</option>
                        <option value="last_month">Tháng trước</option>
                    </select>
                </div> */}
                <div className="col-md-6">
                    <label>Chọn khoảng thời gian thống kê:</label>
                    <select
                        className="form-select mb-2"
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
                            className="form-control"
                            value={customStart}
                            onChange={e => { setCustomStart(e.target.value); setCustomApplied(false); }}
                            max={customEnd || undefined}
                        />
                        <span>đến</span>
                        <input
                            type="date"
                            className="form-control"
                            value={customEnd}
                            onChange={e => { setCustomEnd(e.target.value); setCustomApplied(false); }}
                            min={customStart || undefined}
                        />

                    </div>
                    <button
                        className="btn btn-primary"
                        type="button"
                        disabled={!customStart || !customEnd || customApplied}
                        onClick={() => setCustomApplied(true)}
                    >
                        Áp dụng
                    </button>

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
                                        <h4 className="mb-0">{Number(stat.value).toLocaleString("en-US")}</h4>
                                        <p className="mb-0 text-opacity-75 capitalize">{stat.label}</p>
                                        {stat.extra}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Biểu đồ tổng hợp */}
            {statistics.chartData && <ThongkeCharts chartData={statistics.chartData} />}
            {/* Luôn hiển thị bảng laiTheoDomain và tổng lãi */}
            {statistics.laiTheoDomain && (
                <div className="card card-body p-2 mt-3">
                    <div className="d-flex flex-wrap align-items-center justify-content-between mb-2">
                        <h5 className="mb-0">Chi tiết lãi theo nguồn</h5>
                        <span className="badge bg-success fs-6">Tổng lãi: {Number(statistics.tongdoanhthu).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
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
                                        <td>{item._id || <i>Không xác định</i>}</td>
                                        <td>{Number(item.totalTientieu).toLocaleString('en-US')}</td>
                                        <td>{Number(item.totalCost).toLocaleString('en-US')}</td>
                                        <td>{Number(item.totalLai).toLocaleString('en-US')}</td>
                                        <td>
                                            {Number(item.totalRefund).toLocaleString('en-US')}
                                            <button
                                                className="btn btn-sm btn-outline-info ms-2"
                                                type="button"
                                                onClick={() => setShowLaiTheoDomain(showLaiTheoDomain === idx ? null : idx)}
                                            >
                                                Chi tiết
                                            </button>
                                            {showLaiTheoDomain === idx && (
                                                <div className="mt-2 p-2 bg-light border rounded">
                                                    <div><b>Hoàn Partial:</b> {Number(item.totalRefundPartial).toLocaleString('en-US')}</div>
                                                    <div><b>Hoàn Canceled:</b> {Number(item.totalRefundCanceled).toLocaleString('en-US')}</div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )}
            {statistics.magoiStats && statistics.magoiStats.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header d-flex flex-wrap align-items-center justify-content-between">
                        <h5 className="mb-0">Thống kê theo Mã gói</h5>
                    </div>
                    <div className="card-body p-2">
                        <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}>
                            <Table striped bordered hover size="sm" className="mb-0">
                                <thead>
                                    <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                                        <td>#</td>

                                        <td colSpan={2}>Tổng</td>
                                        <td>
                                            {statistics.magoiStats.reduce((sum, item) => sum + (item.totalOrders || 0), 0).toLocaleString('en-US')}
                                        </td>
                                        <td>
                                            {statistics.magoiStats.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toLocaleString('en-US')}
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
                                            <td>{Number(item.totalAmount).toLocaleString('en-US')}</td>
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
    );
}