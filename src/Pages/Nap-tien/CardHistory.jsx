

import React from "react";
import Table from "react-bootstrap/Table";


export default function CardHistory({ historycard = [] }) {
    return (
        <div className="col-md-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title">Lịch sử nạp thẻ cào</h5>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Thời gian</th>
                                    <th>Loại thẻ</th>
                                    <th>Mệnh giá</th>
                                    <th>Seri</th>
                                    <th>Mã thẻ</th>
                                    <th>Thực nhận</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historycard.length > 0 ? (
                                    historycard.map((thecao, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {new Date(thecao.createdAt).toLocaleString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </td>
                                            <td>{thecao.type}</td>
                                            <td>{thecao.amount.toLocaleString("en-US")} VNĐ</td>
                                            <td>{thecao.serial}</td>
                                            <td>{thecao.code}</td>
                                            <td>{thecao.real_amount.toLocaleString("en-US")} VNĐ</td>
                                            <td>
                                                {thecao.status === "success" ? (
                                                    <span className="badge bg-success">Hoàn thành</span>
                                                ) : thecao.status === "pending" ? (
                                                    <span className="badge bg-primary">Đang xử lý</span>
                                                ) : thecao.status === "warning" ? (
                                                    <span className="badge bg-warning">Sai mệnh giá</span>
                                                ) : thecao.status === "failed" ? (
                                                    <span className="badge bg-danger">Thẻ lỗi</span>
                                                ) : (
                                                    <span>{thecao.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center">
                                            Không có dữ liệu lịch sử nạp thẻ.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}