
import React from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

export default function Banking({ banking = [], username }) {
    const { configWeb } = useOutletContext();
    const cuphap = configWeb?.cuphap;
    const handleCopy = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => toast.success(`Đã sao chép thành công ${text}`))
            .catch(() => toast.error("Lỗi khi sao chép!"));
    };

    return (
        <>
            {/* Enhanced Banking Styles */}
            <style>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes copySuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .banking-card {
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: slideInUp 0.5s ease both;
                    position: relative;
                    overflow: hidden;
                }
                .banking-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .banking-card:hover::before {
                    opacity: 1;
                }
                .banking-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
                }
                
                .banking-header {
                    background: linear-gradient(135deg, #007bff, #0056b3);
                    color: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                    font-weight: 600;
                    text-align: center;
                }
                .banking-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 3s infinite;
                }
                
                .banking-table {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .banking-table td {
                    padding: 16px 12px;
                    border: none;
                    vertical-align: middle;
                    transition: all 0.25s ease;
                }
                .banking-table tr {
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    transition: background 0.25s ease;
                }
                .banking-table tr:hover {
                    background: linear-gradient(135deg, rgba(0,123,255,0.02), rgba(255,255,255,1));
                }
                .banking-table td:first-child {
                    font-weight: 600;
                    color: #495057;
                    min-width: 140px;
                }
                
                .bank-name {
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .account-info {
                    font-weight: 600;
                    color: #212529;
                    transition: all 0.25s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .btn-copy {
                    border-radius: 8px;
                    padding: 6px 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .btn-copy::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.5s ease;
                }
                .btn-copy:hover::before {
                    left: 100%;
                }
                .btn-copy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,123,255,0.25);
                }
                .btn-copy:active {
                    animation: copySuccess 0.3s ease;
                }
                
                .amount-money {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: 700;
                    font-size: 1.1em;
                }
                
                .qr-section {
                    text-align: center;
                    position: relative;
                }
                .qr-header {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    position: relative;
                    overflow: hidden;
                    font-weight: 600;
                }
                .qr-header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 3s infinite;
                    animation-delay: 1s;
                }
                
                .qr-code {
                    border-radius: 16px;
                    padding: 16px;
                    background: white;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                    display: inline-block;
                    position: relative;
                    overflow: hidden;
                }
                .qr-code::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: 3px solid transparent;
                    border-radius: 16px;
                    background: linear-gradient(45deg, #007bff, #28a745, #ffc107, #dc3545) border-box;
                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    mask-composite: exclude;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .qr-code:hover::before {
                    opacity: 1;
                }
                .qr-code:hover {
                    transform: scale(1.02);
                    box-shadow: 0 12px 35px rgba(0,0,0,0.15);
                }
                .qr-code img {
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .banking-card {
                        margin-bottom: 20px;
                    }
                    .banking-header, .qr-header {
                        padding: 12px;
                        font-size: 0.9rem;
                    }
                    .banking-table td {
                        padding: 12px 8px;
                        font-size: 0.875rem;
                    }
                    .qr-code {
                        padding: 12px;
                    }
                    .account-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>
            
            {banking.map((bank) => (
                <div key={bank._id} className="card banking-card">
                    <div className="card-body">
                        <div className="row">
                            {/* Thông tin ngân hàng */}
                            <div className="col-md-6">
                                <div className="banking-header">
                                    <i className="fas fa-university me-2"></i>
                                    Nạp tiền qua chuyển khoản
                                </div>
                                <table className="table banking-table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <i className="fas fa-building me-2 text-primary"></i>
                                                Ngân Hàng
                                            </td>
                                            <td>
                                                <div className="bank-name">
                                                    {bank.bank_name}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-user me-2 text-info"></i>
                                                Tên chủ tài khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{bank.account_name}</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-credit-card me-2 text-success"></i>
                                                Số tài khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{bank.account_number}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm btn-copy"
                                                        onClick={() => handleCopy(bank.account_number)}
                                                        title="Sao chép số tài khoản"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{
                                                    maxWidth: "250px",
                                                    whiteSpace: "normal",
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                }}>
                                                <i className="fas fa-comment-alt me-2 text-warning"></i>
                                                Nội dung chuyển khoản
                                            </td>
                                            <td>
                                                <div className="account-info">
                                                    <span>{cuphap} {username}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm btn-copy"
                                                        onClick={() => handleCopy(`${cuphap} ${username}`)}
                                                        title="Sao chép nội dung chuyển khoản"
                                                    >
                                                        <i className="fas fa-copy"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <i className="fas fa-coins me-2 text-success"></i>
                                                Nạp ít nhất
                                            </td>
                                            <td>
                                                <div className="amount-money">
                                                    {bank?.min_recharge
                                                        ? Number(bank.min_recharge).toLocaleString("en-US")
                                                        : "0"}
                                                    đ
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* QR Code */}
                            <div className="col-md-6 qr-section">
                                <div className="qr-header">
                                    <i className="fas fa-qrcode me-2"></i>
                                    Nạp tiền qua quét mã QR
                                </div>
                                <div className="qr-code">
                                    <img
                                        src={`https://img.vietqr.io/image/${bank.bank_name}-${bank.account_number}-qronly2.jpg?accountName=${encodeURIComponent(
                                            bank.account_name
                                        )}&addInfo=${encodeURIComponent(`${cuphap} ${username}`)}`}
                                        alt="QR CODE"
                                        width={280}
                                        height={280}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}