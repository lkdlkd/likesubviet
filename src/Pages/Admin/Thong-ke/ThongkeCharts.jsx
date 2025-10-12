import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from "recharts";

export function ThongkeCharts({ chartData }) {
    const [selectedBars, setSelectedBars] = React.useState(['ordersTotal', 'deposits', 'partialTotal', 'canceledTotal']);
    const legendItems = [
        { key: 'ordersTotal', color: '#2563eb', label: 'Tạo đơn' },
        { key: 'deposits', color: '#10b981', label: 'Nạp tiền' },
        { key: 'partialTotal', color: '#f59e42', label: 'Hoàn 1 phần' },
        { key: 'canceledTotal', color: '#f43f5e', label: 'Hoàn 100%' }
    ];

    if (!chartData) return null;
    // Nếu chartData là mảng mới dạng [{date, orders, ordersTotal, deposits, partial, partialTotal, canceled, canceledTotal}]
    const data = Array.isArray(chartData) ? chartData : [];

    // Hàm format tiền tệ
    const formatCurrency = (value) => {
        if (!value) return 0;
        return Math.round(Number(value)).toLocaleString("en-US");
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-sm">
                    <div><b>{label}</b></div>
                    {payload.map((entry, idx) => (
                        <div key={idx} style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number'
                                ? formatCurrency(entry.value)
                                : entry.value}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Tìm max cho domain Y
    const maxY = Math.max(
        ...data.map(d => Math.max(
            d.ordersTotal || 0,
            d.deposits || 0,
            d.partialTotal || 0,
            d.canceledTotal || 0
        ))
    );

    // Lấy tháng/năm hiển thị
    let monthYearLabel = '';
    if (data.length > 0) {
        // Nếu nhiều ngày, lấy tháng/năm đầu và cuối
        const first = data[0].date;
        const last = data[data.length - 1].date;
        const firstDate = new Date(first);
        const lastDate = new Date(last);
        if (first.slice(0, 7) === last.slice(0, 7)) {
            // Cùng tháng
            monthYearLabel = `Tháng ${firstDate.getMonth() + 1}/${firstDate.getFullYear()}`;
        } else {
            monthYearLabel = `Từ ${firstDate.toLocaleDateString()} đến ${lastDate.toLocaleDateString()}`;
        }
    }

    return (
        <div className="row mb-4">
            <div className="col-md-12">
                <div className="card-header stats-chart-header">
                    <i className="fas fa-chart-bar me-2"></i>
                    Biểu đồ tổng hợp: Tạo đơn, Nạp tiền, Hoàn 1 phần, Hoàn 100%
                </div>
                <div className="px-3 pt-2 pb-1 text-secondary small fw-bold">{monthYearLabel}</div>
                <div className="card-body" style={{ height: 400 }}>
                    <div className="mb-2 d-flex justify-content-center align-items-center gap-3">
                        {legendItems.map(item => {
                            const isActive = selectedBars.includes(item.key);
                            return (
                                <span
                                    key={item.key}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontWeight: isActive ? 'bold' : 'normal',
                                        opacity: isActive ? 1 : 0.5,
                                        textDecoration: isActive ? 'none' : 'line-through'
                                    }}
                                    onClick={() => {
                                        setSelectedBars(prev =>
                                            prev.includes(item.key)
                                                ? prev.filter(k => k !== item.key)
                                                : [...prev, item.key]
                                        );
                                    }}
                                >
                                    <span style={{
                                        width: 18,
                                        height: 18,
                                        background: item.color,
                                        display: 'inline-block',
                                        marginRight: 6,
                                        borderRadius: 3,
                                        opacity: isActive ? 1 : 0.3
                                    }} />
                                    {item.label}
                                </span>
                            );
                        })}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={date => {
                                    // Hiển thị chỉ ngày (dd) từ yyyy-mm-dd
                                    if (!date) return '';
                                    const parts = date.split('-');
                                    return parts.length === 3 ? parts[2] : date;
                                }}
                                interval={0}
                            />
                            <YAxis
                                // label={{ value: "Số tiền (VNĐ)", angle: -90, position: "insideLeft", offset: -20 }}
                                tickFormatter={formatCurrency}
                                domain={[0, Math.ceil(maxY * 1.1 / 10000) * 10000]}
                            />
                            <Tooltip content={CustomTooltip} cursor={{ fill: '#f3f4f6' }} />
                            {selectedBars.includes('ordersTotal') && (
                                <Bar dataKey="ordersTotal" fill="#2563eb" name="Tạo đơn" radius={[6, 6, 0, 0]} />
                            )}
                            {selectedBars.includes('deposits') && (
                                <Bar dataKey="deposits" fill="#10b981" name="Nạp tiền" radius={[6, 6, 0, 0]} />
                            )}
                            {selectedBars.includes('partialTotal') && (
                                <Bar dataKey="partialTotal" fill="#f59e42" name="Hoàn 1 phần" radius={[6, 6, 0, 0]} />
                            )}
                            {selectedBars.includes('canceledTotal') && (
                                <Bar dataKey="canceledTotal" fill="#f43f5e" name="Hoàn 100%" radius={[6, 6, 0, 0]} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
