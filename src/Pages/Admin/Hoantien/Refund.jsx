import React, { useEffect, useState } from "react";
import { getRefunds, adminApproveRefund } from "@/Utils/api";
import { toast } from "react-toastify";
import Table from "react-bootstrap/Table";
import Swal from "sweetalert2";
import { loadingg } from "@/JS/Loading";
export default function Refund() {
    const [refunds, setRefunds] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("pending"); // pending | completed
    const token = localStorage.getItem("token") || "";

    const fetchRefunds = async (status) => {
        setLoading(true);
        loadingg("Đang tải...", true);
        try {
            // Gọi API với status nếu có
            let res;
            if (status === "completed") {
                res = await getRefunds(token, true); // hoặc truyền params nếu API hỗ trợ
            } else {
                res = await getRefunds(token, false); // lấy tất cả hoặc chờ duyệt
            }
            setRefunds(res.data || []);
        } catch (err) {
            toast.error("Không thể tải danh sách hoàn!");
            loadingg("Đang tải...", false);
        } finally {
            setLoading(false);
            loadingg("Đang tải...", false);
        }
    };

    useEffect(() => {
        fetchRefunds(activeTab);
    }, [token, activeTab]);

    const handleSelect = (madon) => {
        setSelected((prev) =>
            prev.includes(madon) ? prev.filter((id) => id !== madon) : [...prev, madon]
        );
    };

    const handleApprove = async () => {
        if (selected.length === 0) {
            toast.info("Vui lòng chọn đơn hoàn!");
            return;
        }
        const confirm = await Swal.fire({
            title: `Duyệt hoàn cho ${selected.length} đơn?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Duyệt",
            cancelButtonText: "Hủy"
        });
        if (!confirm.isConfirmed) return;
        setLoading(true);
        loadingg("Đang duyệt hoàn tiền...", true);

        try {
            for (const madon of selected) {
                await adminApproveRefund({ madon }, token);
            }
            toast.success("Duyệt hoàn thành công!");
            setSelected([]);
            fetchRefunds(activeTab);
        } catch (err) {
            toast.error("Lỗi khi duyệt hoàn!");
        } finally {
            setLoading(false);
            loadingg("Đang duyệt hoàn tiền...", false);
        }
    };

    return (
        <div className="container mt-4">
            <h3>Danh sách hoàn tiền</h3>
            <div className="mb-3">
                <button
                    className={`btn btn-${activeTab === "pending" ? "primary" : "outline-primary"} me-2`}
                    onClick={() => setActiveTab("pending")}
                >
                    Đơn hoàn chờ duyệt
                </button>
                <button
                    className={`btn btn-${activeTab === "completed" ? "primary" : "outline-primary"}`}
                    onClick={() => setActiveTab("completed")}
                >
                    Đơn đã hoàn
                </button>
            </div>
            {activeTab === "pending" && (
                <button className="btn btn-success mb-3" onClick={handleApprove} disabled={loading}>
                    Duyệt hoàn các đơn đã chọn
                </button>

            )}
            {activeTab === "pending" && (
                <h4 style={{ color: "red" }}>
                    <b>
                        Hãy kiểm tra thông số hoàn thật kỹ trước khi hoàn tiền tránh sai sót . xin cảm ơn .
                    </b>
                </h4>
            )
            }
            <div className="table-responsive">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            {activeTab === "pending" && (
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={refunds.length > 0 && selected.length === refunds.length}
                                        onChange={e => {
                                            if (e.target.checked) setSelected(refunds.map(r => r.madon));
                                            else setSelected([]);
                                        }}
                                    />
                                </th>
                            )}
                            <th>Mã đơn</th>
                            <th>Username</th>
                            <th>Trạng thái</th>
                            <th>Link</th>
                            <th>Server</th>
                            <th>Số lượng mua</th>
                            <th>Giá tiền</th>
                            <th>Chưa chạy</th>
                            <th>Tổng hoàn</th>
                            <th>Nội dung</th>
                            <th>Thời gian tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={activeTab === "pending" ? 12 : 11} className="text-center py-5">
                                    <div className="d-flex flex-column align-items-center justify-content-center">
                                        <div className="spinner-border text-primary mb-2" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <span className="mt-2">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : refunds.length === 0 ? (
                            <tr>
                                <td colSpan={activeTab === "pending" ? 12 : 11} className="text-center">
                                    <div>
                                        <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                        <p className="font-semibold" >Không có dữ liệu</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            refunds
                                .filter(r => activeTab === "completed" ? r.status === true : r.status !== true)
                                .map((r) => (
                                    <tr key={r._id}>
                                        {activeTab === "pending" && (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(r.madon)}
                                                    onChange={() => handleSelect(r.madon)}
                                                />
                                            </td>
                                        )}
                                        <td>{r.madon}</td>
                                        <td>{r.username}</td>
                                        <td>{r.status ? <span className="badge bg-success">Đã duyệt</span> : <span className="badge bg-warning text-dark">Chờ duyệt</span>}</td>
                                        <td style={{
                                            maxWidth: "250px",
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                        }}>{r.link} </td>
                                        <td style={{
                                            maxWidth: "250px",
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                        }}>{r.server}</td>
                                        <td>{r.soluongmua}</td>
                                        <td>{Number(r.giatien).toLocaleString("en-US")}</td>
                                        <td>{r.chuachay}</td>
                                        <td>{Math.floor(Number(r.tonghoan)).toLocaleString("en-US")}</td>
                                        <td style={{
                                            maxWidth: "250px",
                                            whiteSpace: "normal",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                        }}>{r.noidung}</td>
                                        <td>{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                                    </tr>
                                ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
