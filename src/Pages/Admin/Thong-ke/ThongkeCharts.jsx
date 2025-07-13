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
  const formatCurrency = (value) => Number(value).toLocaleString("en-US");

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
          <div className="card-header">Biểu Tạo đơn & Nạp tiền</div>
          <div className="card-body" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: "Đơn hàng", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Nạp tiền", angle: 90, position: "insideRight" }} tickFormatter={formatCurrency} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {/* <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" name="Đơn hàng" /> */}
                <Line yAxisId="left" type="monotone" dataKey="orderTotal" stroke="#3b82f6" name="Tạo đơn" dot={false} strokeWidth={3} />
                <Line yAxisId="right" type="monotone" dataKey="deposits" stroke="#10b981" name="Nạp tiền" dot={false} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card mb-3">
          <div className="card-header">Biểu đồ Đơn hoàn (partial)</div>
          <div className="card-body" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPartial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {/* <Bar yAxisId="left" dataKey="count" fill="#6366f1" name="Số đơn partial" radius={[6, 6, 0, 0]} /> */}
                <Bar yAxisId="right" dataKey="total" fill="#f59e42" name="Tổng tiền hoàn" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card mb-3">
          <div className="card-header">Biểu đồ Đơn hoàn (canceled)</div>
          <div className="card-body" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCanceled}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {/* <Bar yAxisId="left" dataKey="count" fill="#f43f5e" name="Số đơn canceled" radius={[6, 6, 0, 0]} /> */}
                <Bar yAxisId="right" dataKey="total" fill="#fbbf24" name="Tổng tiền hoàn" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
