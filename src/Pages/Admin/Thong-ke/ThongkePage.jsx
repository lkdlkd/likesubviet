import { useState, useEffect } from "react";
import { getStatistics } from "@/Utils/api";
import { loadingg } from "@/JS/Loading";

export default function ThongkePage() {
    const [statistics, setStatistics] = useState(null);
    const [napRange, setNapRange] = useState("today");
    const [doanhthuRange, setDoanhthuRange] = useState("today");
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showLaiTheoDomain, setShowLaiTheoDomain] = useState(false);

    // Lấy token từ localStorage (hoặc từ context nếu cần)
    const token = localStorage.getItem("token");

    // Gọi API để lấy dữ liệu thống kê
    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            loadingg("Đang tải...", true, 9999999);
            try {
                const data = await getStatistics(token, napRange, doanhthuRange);
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
    }, [token, napRange, doanhthuRange]);

    // Xử lý thay đổi khoảng thời gian
    const handleRangeChange = (type, value) => {
        if (type === "napRange") {
            setNapRange(value);
        } else {
            setDoanhthuRange(value);
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
            label: `Nạp tiền ${rangeLabels[napRange] || napRange}`,
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
            label: "Tổng lãi ( ấn vào để xem chi tiết )",
            value: statistics.tongdoanhthu,
            icon: "ti ti-coin",
            bg: "bg-light-warning",
            isLaiTheoDomain: true
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
    ];

    return (
        <div>
            <div className="row mb-4">
                <div className="col-md-6">
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
                </div>
                <div className="col-md-6">
                    <label>Chọn khoảng thời gian doanh thu:</label>
                    <select
                        className="form-select"
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
                </div>
            </div>

            <div className="row">
                {stats.map((stat, index) => (
                    <div className="col-md-3" key={index}>
                        <div className="card" style={{ cursor: stat.isLaiTheoDomain ? 'pointer' : undefined }}
                            onClick={() => {
                                if (stat.isLaiTheoDomain) setShowLaiTheoDomain(v => !v);
                            }}
                        >
                            <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                    <div className={`avtar ${stat.bg} me-3`}>
                                        <i className={`${stat.icon} fs-2`}></i>
                                    </div>
                                    <div>
                                        <h4 className="mb-0">{Number(stat.value).toLocaleString("en-US")}</h4>
                                        <p className="mb-0 text-opacity-75 capitalize">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Hiển thị bảng laiTheoDomain khi click Tổng lãi */}
                        {stat.isLaiTheoDomain && showLaiTheoDomain && statistics.laiTheoDomain && (
                            <div className="mt-2">
                                <div className="card card-body p-2">
                                    <h5 className="mb-2">Chi tiết lãi theo nguồn</h5>
                                    <table className="table table-sm table-bordered mb-0">
                                        <thead>
                                            <tr>
                                                <th>Nguồn</th>
                                                <th>Lãi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.laiTheoDomain.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item._id || <i>Không xác định</i>}</td>
                                                    {/* <td>{item.totalLai}</td> */}
                                                    <td>{Number(item.totalLai).toLocaleString('en-US')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}