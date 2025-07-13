import React from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";

export function ThongkeCharts({ chartData }) {
    if (!chartData) return null;
    // Chuẩn hóa dữ liệu ngày cho các biểu đồ
    const dailyOrders = chartData.dailyOrders?.map(item => ({ ...item, date: item._id })) || [];
    const dailyDeposits = chartData.dailyDeposits?.map(item => ({ ...item, date: item._id })) || [];
    // Gộp các ngày lại cho biểu đồ tổng hợp
    const merged = dailyOrders.map(order => {
        const deposit = dailyDeposits.find(d => d._id === order._id);
        return {
            date: order._id,
            //   orders: order.count,
            orderTotal: order.total || 0,
            deposits: deposit ? deposit.total : 0
        };
    });

    const dailyPartial = chartData.dailyPartial?.map(item => ({ ...item, date: item._id, total: item.total || 0 })) || [];
    const dailyCanceled = chartData.dailyCanceled?.map(item => ({ ...item, date: item._id, total: item.total || 0 })) || [];

    // Hàm format tiền tệ
    // Làm tròn số tiền về hàng nghìn, hiển thị dạng 1,000,000
    const formatCurrency = (value) => {
        if (!value) return 0;
        return Math.round(Number(value)).toLocaleString("en-US");
    };

    // Custom tooltip cho các biểu đồ có trường total
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-sm">
                    <div><b>{label}</b></div>
                    {payload.map((entry, idx) => (
                        <div key={idx} style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number' && (entry.dataKey === 'total' || entry.dataKey === 'orderTotal' || entry.dataKey === 'deposits')
                                ? formatCurrency(entry.value)
                                : entry.value}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="row mb-4">
            <div className="col-md-12">
                <div className="card mb-3">
                    <div className="card-header">Biểu đồ cột: Tạo đơn & Nạp tiền</div>
                    <div className="card-body" style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={merged} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    label={{ value: "Số tiền (VNĐ)", angle: -90, position: "insideLeft",offset : -20 }}
                                    tickFormatter={formatCurrency}
                                    domain={(() => {
                                        const maxOrder = Math.max(...merged.map(d => d.orderTotal || 0));
                                        const maxDeposit = Math.max(...merged.map(d => d.deposits || 0));
                                        const maxY = Math.max(maxOrder, maxDeposit);
                                        return [0, Math.ceil(maxY * 1.1 / 10000) * 10000];
                                    })()}
                                />
                                <Tooltip content={CustomTooltip} cursor={{ fill: '#f3f4f6' }} />
                                <Legend iconType="rect" />
                                <Bar dataKey="orderTotal" fill="#2563eb" name="Tạo đơn" radius={[6, 6, 0, 0]}/>
                                <Bar dataKey="deposits" fill="#10b981" name="Nạp tiền" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card mb-3">
                    <div className="card-header">Biểu đồ Đơn hoàn (partial)</div>
                    <div className="card-body" style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyPartial} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    label={{ value: "Số tiền (VNĐ)", angle: -90, position: "insideLeft",offset : -20 }}
                                    tickFormatter={formatCurrency}
                                    domain={(() => {
                                        const maxY = Math.max(...dailyPartial.map(d => d.total || 0));
                                        return [0, Math.ceil(maxY * 1.1 / 10000) * 10000];
                                    })()}
                                />
                                <Tooltip content={CustomTooltip} cursor={{ fill: '#f3f4f6' }} />
                                <Legend iconType="rect" />
                                <Bar dataKey="total" fill="#f59e42" name="Tổng tiền partial" radius={[6, 6, 0, 0]}  />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="card mb-3">
                    <div className="card-header">Biểu đồ Đơn hoàn (canceled)</div>
                    <div className="card-body" style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyCanceled} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis
                                    label={{ value: "Số tiền (VNĐ)", angle: -90, position: "insideLeft",offset : -20 }}
                                    tickFormatter={formatCurrency}
                                    domain={(() => {
                                        const maxY = Math.max(...dailyCanceled.map(d => d.total || 0));
                                        return [0, Math.ceil(maxY * 1.1 / 10000) * 10000];
                                    })()}
                                />
                                <Tooltip content={CustomTooltip} cursor={{ fill: '#f3f4f6' }} />
                                <Legend iconType="rect" />
                                <Bar dataKey="total" fill="#fbbf24" name="Tổng tiền canceled" radius={[6, 6, 0, 0]}  />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
