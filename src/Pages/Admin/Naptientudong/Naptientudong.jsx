import React, { useState, useEffect } from "react";
import { getTransactions } from "@/Utils/api";
import Table from "react-bootstrap/Table";
import moment from "moment";
import { loadingg } from "@/JS/Loading";

export default function Naptientudong() {
    const [transactions, setTransactions] = useState([]); // Lưu danh sách giao dịch
    const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
    const [error, setError] = useState(null); // Trạng thái lỗi
    const [page, setPage] = useState(1); // Trang hiện tại
    const [limit, setLimit] = useState(10); // Số lượng giao dịch mỗi trang
    const [hasMore, setHasMore] = useState(false); // Kiểm tra xem còn dữ liệu để phân trang không
    const [searchInput, setSearchInput] = useState(""); // Giá trị nhập vào ô tìm kiếm
    const [search, setSearch] = useState(""); // Giá trị tìm kiếm thực tế (khi nhấn nút)

    const fetchTransactions = async () => {
        setLoading(true);
        loadingg("Đang tải danh sách giao dịch...", true, 9999999);
        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const data = await getTransactions(token, page, limit, search); // Gọi API với page, limit và search
            setTransactions(data); // Lưu danh sách giao dịch
            setHasMore(data.length === limit); // Nếu số lượng giao dịch trả về bằng `limit`, có thể còn dữ liệu
        } catch (err) {
            setError("Không thể tải danh sách giao dịch.");
        } finally {
            setLoading(false); // Kết thúc tải dữ liệu
            loadingg("", false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, limit, search]); // Gọi lại API khi page, limit hoặc search thay đổi

    const handleSearch = () => {
        setError(null); // Xóa lỗi trước khi tìm kiếm
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
        setSearch(searchInput); // Cập nhật giá trị tìm kiếm thực tế
    };

    return (
        <>
            <style>
                {`
                    /* Modern Auto Recharge Page Styles */
                    .recharge-container {
                        font-size: 14px;
                        color: #2c3e50;
                    }
                    
                    .recharge-header-card {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        margin-bottom: 1.5rem;
                        overflow: hidden;
                    }
                    
                    .recharge-header-card .card-header {
                        background: transparent;
                        border: none;
                        padding: 1.5rem 2rem;
                        position: relative;
                    }
                    
                    .recharge-header-card .card-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                        pointer-events: none;
                    }
                    
                    .recharge-header-content {
                        display: flex;
                        align-items: center;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .recharge-icon-circle {
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
                    
                    .recharge-icon-circle i {
                        font-size: 24px;
                        color: white;
                    }
                    
                    .recharge-main-title {
                        font-size: 24px;
                        font-weight: 600;
                        margin: 0;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    
                    .recharge-content-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        border: 1px solid #e8ecef;
                        overflow: hidden;
                        padding: 1.5rem 2rem;
                    }
                    
                    .recharge-controls-section {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                        display: flex;
                        justify-content: between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 1rem;
                    }
                    
                    .recharge-control-group {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    
                    .recharge-control-label {
                        font-weight: 600;
                        color: #495057;
                        margin: 0;
                        font-size: 14px;
                        white-space: nowrap;
                    }
                    
                    .recharge-form-control {
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 0.6rem 1rem;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        min-width: 120px;
                    }
                    
                    .recharge-form-control:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    }
                    
                    .recharge-search-group {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    
                    .recharge-search-input {
                        border: 1px solid #dee2e6;
                        border-radius: 8px 0 0 8px;
                        padding: 0.6rem 1rem;
                        font-size: 14px;
                        transition: all 0.3s ease;
                        min-width: 200px;
                    }
                    
                    .recharge-search-input:focus {
                        border-color: #667eea;
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
                    }
                    
                    .recharge-search-btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: 1px solid #667eea;
                        border-left: none;
                        color: white;
                        padding: 0.6rem 1rem;
                        border-radius: 0 8px 8px 0;
                        font-weight: 500;
                        transition: all 0.3s ease;
                        font-size: 14px;
                    }
                    
                    .recharge-search-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        color: white;
                    }
                    
                    .recharge-pagination {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border: 1px solid #e8ecef;
                        border-radius: 12px;
                        padding: 1rem 1.5rem;
                        margin-top: 1.5rem;
                        display: flex;
                        justify-content: between;
                        align-items: center;
                    }
                    
                    .recharge-pagination-btn {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.6rem 1.2rem;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    }
                    
                    .recharge-pagination-btn:hover:not(:disabled) {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        color: white;
                    }
                    
                    .recharge-pagination-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        background: #6c757d;
                    }
                    
                    .recharge-page-info {
                        font-weight: 600;
                        color: #495057;
                        font-size: 14px;
                    }
                    
                    .recharge-loading {
                        text-align: center;
                        padding: 2rem;
                        color: #6c757d;
                        font-size: 16px;
                    }
                    
                    .recharge-empty-state {
                        text-align: center;
                        padding: 3rem 2rem;
                        color: #6c757d;
                    }
                    
                    .recharge-empty-icon {
                        margin-bottom: 1rem;
                        opacity: 0.7;
                    }
                    
                    .recharge-empty-text {
                        font-size: 16px;
                        font-weight: 600;
                        margin: 0;
                        color: #495057;
                    }
                    
                    @media (max-width: 768px) {
                        .recharge-container {
                            font-size: 13px;
                        }
                        
                        .recharge-main-title {
                            font-size: 20px;
                        }
                        
                        .recharge-header-card .card-header {
                            padding: 1rem 1.5rem;
                        }
                        
                        .recharge-content-card {
                            padding: 1rem 1.5rem;
                        }
                        
                        .recharge-controls-section {
                            padding: 1rem;
                        }
                        
                        .recharge-search-input {
                            min-width: 150px;
                        }
                        
                        .recharge-pagination {
                            padding: 1rem;
                        }
                    }
                `}
            </style>

            <div className="recharge-container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card recharge-header-card">
                            <div className="card-header">
                                <div className="recharge-header-content">
                                    <div className="recharge-icon-circle">
                                        <i className="fas fa-credit-card"></i>
                                    </div>
                                    <h2 className="recharge-main-title">Quản lý nạp tiền tự động</h2>
                                </div>
                            </div>
                        </div>

                        <div className="recharge-content-card">
                            <div className="recharge-controls-section">
                                <div className="recharge-control-group">
                                    <label htmlFor="limitSelect" className="recharge-control-label">
                                        Hiển thị:
                                    </label>
                                    <select
                                        id="limitSelect"
                                        className="form-select recharge-form-control"
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={500}>500</option>
                                    </select>
                                </div>
                                <div className="recharge-search-group">
                                    <input
                                        type="text"
                                        className="form-control recharge-search-input"
                                        placeholder="Tìm kiếm theo username"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                    />
                                    <button className="btn recharge-search-btn" onClick={handleSearch}>
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                            {loading ? (
                                <div className="recharge-loading">
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Đang tải dữ liệu...
                                </div>
                            ) : error ? (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Ngân hàng</th>
                                            <th>Username</th>
                                            <th>Mã giao dịch</th>
                                            <th>Số tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thời gian</th>
                                            <th>Nội dung</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={8} className="text-center">
                                                <div className="recharge-empty-state">
                                                    <div className="recharge-empty-icon">
                                                        <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                    </div>
                                                    <p className="recharge-empty-text">Không có dữ liệu</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            ) : (
                                <>
                                    <Table bordered responsive hover>
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Ngân hàng</th>
                                                <th>Số tài khoản</th>
                                                <th>Username</th>
                                                <th>Mã giao dịch</th>
                                                <th>Số tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thời gian</th>
                                                <th>Nội dung</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.length > 0 ? (
                                                transactions.map((transaction, index) => (
                                                    <tr key={transaction._id || index}>
                                                        <td>{(page - 1) * limit + index + 1}</td>
                                                        <td>{transaction.typeBank || "N/A"}</td>
                                                        <td>{transaction.accountNumber || "N/A"}</td>
                                                        <td>{transaction.username || "N/A"}</td>
                                                        <td>{transaction.transactionID || "N/A"}</td>
                                                        <td>{transaction.amount || "N/A"}</td>
                                                        <td>
                                                            {transaction.status === "COMPLETED" ? (
                                                                <span className="badge bg-success">Thành công</span>
                                                            ) : (
                                                                <span className="badge bg-danger">Thất bại</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {new Date(transaction.createdAt).toLocaleString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}
                                                        </td>
                                                        <td>{transaction.description || "N/A"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        Không có giao dịch nào.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                    <div className="recharge-pagination">
                                        <button
                                            className="btn recharge-pagination-btn"
                                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                        >
                                            <i className="fas fa-chevron-left me-2"></i>
                                            Previous
                                        </button>
                                        <span className="recharge-page-info">Trang {page}</span>
                                        <button
                                            className="btn recharge-pagination-btn"
                                            onClick={() => setPage((prev) => (hasMore ? prev + 1 : prev))}
                                            disabled={!hasMore}
                                        >
                                            Next
                                            <i className="fas fa-chevron-right ms-2"></i>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}