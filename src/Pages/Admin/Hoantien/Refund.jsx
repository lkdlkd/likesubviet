import React, { useEffect, useState } from "react";
import { getRefunds, adminApproveRefund, adminDeleteRefunds } from "@/Utils/api";
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
        loadingg("Đang tải...", true, 9999999);
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
        loadingg("Đang duyệt hoàn tiền...", true, 9999999);

        try {
            // Gửi mảng mã đơn một lần
            const response = await adminApproveRefund({ madons: selected }, token);
            if (response.success) {
                // Tính tổng tiền đã hoàn
                const totalAmount = response.successes ? 
                    response.successes.reduce((sum, item) => sum + (item.amount || 0), 0) : 0;
                
                // Hiển thị kết quả chi tiết
                if (response.approved > 0 && response.failed === 0) {
                    const amountText = totalAmount > 0 ? ` (${Math.floor(Number(totalAmount)).toLocaleString("en-US")} VNĐ)` : '';
                    toast.success(`Duyệt hoàn thành công ${response.approved} đơn${amountText}!`);
                } else if (response.approved > 0 && response.failed > 0) {
                    const amountText = totalAmount > 0 ? ` (${Math.floor(Number(totalAmount)).toLocaleString("en-US")} VNĐ)` : '';
                    toast.warning(`Duyệt thành công ${response.approved} đơn${amountText}, thất bại ${response.failed} đơn!`);
                    
                    // Hiển thị chi tiết các đơn thất bại
                    if (response.failures && response.failures.length > 0) {
                        const failedDetails = response.failures.map(f => 
                            `${f.madon} (${f.reason || 'Lỗi không xác định'})`
                        ).join('<br/>');
                        
                        Swal.fire({
                            title: 'Một số đơn duyệt thất bại',
                            html: `
                                <div style="text-align: left;">
                                    <p><strong>Các đơn thất bại:</strong></p>
                                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px;">
                                        ${failedDetails}
                                    </div>
                                </div>
                            `,
                            icon: 'warning',
                            width: 600
                        });
                    }
                } else {
                    toast.error("Không có đơn nào được duyệt thành công!");
                }
                
                // Hiển thị chi tiết thành công nếu có ít đơn
                if (response.successes && response.successes.length > 0 && response.successes.length <= 5) {
                    const successDetails = response.successes.map(s => 
                        `${s.madon} - ${s.username}: ${Math.floor(Number(s.amount)).toLocaleString("en-US")} VNĐ`
                    ).join('<br/>');
                    
                    setTimeout(() => {
                        Swal.fire({
                            title: 'Chi tiết các đơn đã duyệt',
                            html: `
                                <div style="text-align: left;">
                                    <div style="background: #d1e7dd; padding: 10px; border-radius: 5px; font-size: 14px;">
                                        ${successDetails}
                                    </div>
                                </div>
                            `,
                            icon: 'success',
                            width: 600
                        });
                    }, 1500);
                }
            } else {
                toast.error(response.message || "Lỗi khi duyệt hoàn!");
            }
            
            setSelected([]);
            fetchRefunds(activeTab);
        } catch (err) {
            toast.error("Lỗi khi duyệt hoàn!");
        } finally {
            setLoading(false);
            loadingg("Đang duyệt hoàn tiền...", false);
        }
    };

    const handleDelete = async () => {
        if (selected.length === 0) {
            toast.info("Vui lòng chọn đơn hoàn để xóa!");
            return;
        }
        
        const confirm = await Swal.fire({
            title: `Xóa ${selected.length} đơn hoàn chờ duyệt?`,
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#dc3545"
        });
        
        if (!confirm.isConfirmed) return;
        
        setLoading(true);
        loadingg("Đang xóa đơn hoàn...", true, 9999999);

        try {
            const response = await adminDeleteRefunds({ madons: selected }, token);
            
            if (response.success) {
                if (response.deleted > 0 && response.failed === 0) {
                    toast.success(`Xóa thành công ${response.deleted} đơn hoàn!`);
                } else if (response.deleted > 0 && response.failed > 0) {
                    toast.warning(`Xóa thành công ${response.deleted} đơn, thất bại ${response.failed} đơn!`);
                    
                    // Hiển thị chi tiết các đơn thất bại
                    if (response.failures && response.failures.length > 0) {
                        const failedDetails = response.failures.map(f => 
                            `${f.madon} (${f.reason || 'Lỗi không xác định'})`
                        ).join('<br/>');
                        
                        Swal.fire({
                            title: 'Một số đơn xóa thất bại',
                            html: `
                                <div style="text-align: left;">
                                    <p><strong>Các đơn thất bại:</strong></p>
                                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 14px;">
                                        ${failedDetails}
                                    </div>
                                </div>
                            `,
                            icon: 'warning',
                            width: 600
                        });
                    }
                } else {
                    toast.error("Không có đơn nào được xóa thành công!");
                }
            } else {
                toast.error(response.message || "Lỗi khi xóa đơn hoàn!");
            }
            
            setSelected([]);
            fetchRefunds(activeTab);
        } catch (err) {
            toast.error("Lỗi khi xóa đơn hoàn!");
        } finally {
            setLoading(false);
            loadingg("Đang xóa đơn hoàn...", false);
        }
    };

    return (
        <>
            <style>
                {`
                    /* Modern Refund Page Styles */
                    .refund-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .refund-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .refund-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .refund-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .refund-header-content {
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .refund-icon-circle {
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
                    
                    .refund-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .refund-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .refund-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                        padding: 1.5rem;
                    }
                    
                    .refund-tabs {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 1.5rem;
                        flex-wrap: wrap;
                    }
                    
                    .refund-tab {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #dee2e6;
                        color: #495057;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        text-decoration: none;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    .refund-tab.active {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border-color: #667eea;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    }
                    
                    .refund-tab:hover:not(.active) {
                        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
                        transform: translateY(-1px);
                        color: #495057;
                    }
                    
                    .refund-actions {
                        background: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                        padding: 1rem;
                        margin-bottom: 1.5rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    
                    .refund-warning {
                        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                        border: 1px solid #ffeaa7;
                        border-radius: 8px;
                        padding: 0.75rem 1rem;
                        color: #856404;
                        font-size: 13px;
                        font-weight: 500;
                        flex: 1;
                        min-width: 200px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .refund-approve-btn {
                        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                        border: none;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .refund-approve-btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                        color: white;
                    }
                    
                    .refund-approve-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .refund-delete-btn {
                        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                        border: none;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-left: 10px;
                    }
                    
                    .refund-delete-btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
                        color: white;
                    }
                    
                    .refund-delete-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }
                    
                    .refund-action-buttons {
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 0;
                    }
                    
                    .refund-table {
                        font-size: 14px;
                    }
                    
                    @media (max-width: 768px) {
                        .refund-container {
                            font-size: 13px;
                        }
                        
                        .refund-main-title {
                            font-size: 20px;
                        }
                        
                        .refund-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .refund-actions {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        
                        .refund-warning {
                            min-width: auto;
                        }
                        
                        .refund-action-buttons {
                            flex-direction: column;
                            align-items: stretch;
                            gap: 10px;
                        }
                        
                        .refund-delete-btn {
                            margin-left: 0;
                        }
                    }
                `}
            </style>
            <div className="refund-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="refund-header-card card">
                            <div className="card-header">
                                <div className="refund-header-content">
                                    <div className="refund-icon-circle">
                                        <i className="fas fa-undo-alt"></i>
                                    </div>
                                    <h3 className="refund-main-title">Quản lý hoàn tiền</h3>
                                </div>
                            </div>
                        </div>
                        <div className="refund-content-card">
                            <div className="refund-tabs">
                                <button
                                    className={`refund-tab ${activeTab === "pending" ? "active" : ""}`}
                                    onClick={() => setActiveTab("pending")}
                                >
                                    <i className="fas fa-hourglass-half"></i>
                                    Đơn hoàn chờ duyệt
                                </button>
                                <button
                                    className={`refund-tab ${activeTab === "completed" ? "active" : ""}`}
                                    onClick={() => setActiveTab("completed")}
                                >
                                    <i className="fas fa-check-circle"></i>
                                    Đơn đã hoàn
                                </button>
                            </div>

                            {activeTab === "pending" && (
                                <div className="refund-actions">
                                    <div className="refund-warning">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span><strong>Chú ý:</strong> Hãy kiểm tra thông số hoàn thật kỹ trước khi duyệt để tránh sai sót.</span>
                                    </div>
                                    <div className="refund-action-buttons">
                                        <button
                                            className="refund-approve-btn"
                                            onClick={handleApprove}
                                            disabled={loading || selected.length === 0}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Đang duyệt...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check"></i>
                                                    Duyệt hoàn các đơn đã chọn ({selected.length})
                                                </>
                                            )}
                                        </button>
                                        <button
                                            className="refund-delete-btn"
                                            onClick={handleDelete}
                                            disabled={loading || selected.length === 0}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    Đang xóa...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-trash"></i>
                                                    Xóa đơn đã chọn ({selected.length})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

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
                    </div>
                </div>
            </div>
        </>
    );
}
