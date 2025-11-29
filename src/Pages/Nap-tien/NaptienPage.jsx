import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Napthecao from "./Napthecao";
import Banking from "./Banking";
import CardHistory from "./CardHistory";
import {loadingg} from "@/JS/Loading";
// import HistoryBank from "./HistoryBanking";
import { getBanking, getCardHistory, getCard, getPromotions, getTransactions } from "@/Utils/api";

export default function NaptienPage() {
    const { token, user } = useOutletContext();
    const [banking, setBanking] = useState([]);
    const [historycard, setHistoryCard] = useState([]);
    const [cardData, setCardData] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [activeTab, setActiveTab] = useState("banking");
    const username = user?.username;
    const [history, setHistory] = useState([]); // Danh sách giao dịch
    const [page, setPage] = useState(1); // Trang hiện tại
    const [limit, setLimit] = useState(10); // Số lượng giao dịch mỗi trang
    const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
    // Responsive number of visible page buttons (desktop: 10, mobile: 4)
    const [maxVisible, setMaxVisible] = useState(4);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const data = await getTransactions(token, page, limit); // Gọi API với page và limit
                setHistory(data || []); // Lưu danh sách giao dịch
            } catch (error) {
                // console.error("Lỗi khi lấy danh sách giao dịch:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [page, limit, token]); // Gọi lại API khi `page`, `limit`, hoặc `token` thay đổi

    // Update maxVisible based on screen width (>=1200: 20, 700-1199: 15, <700: 5)
    useEffect(() => {
        const updateMaxVisible = () => {
            try {
                const width = window.innerWidth || 0;
                if (width >= 1200) {
                    setMaxVisible(20);
                } else if (width >= 700) {
                    setMaxVisible(15);
                } else {
                    setMaxVisible(5);
                }
            } catch {
                // no-op
            }
        };
        updateMaxVisible();
        window.addEventListener('resize', updateMaxVisible);
        return () => window.removeEventListener('resize', updateMaxVisible);
    }, []);
    // Hàm gọi API lấy dữ liệu thẻ cào
    const fetchCardData = async () => {
        try {
            const CardData = await getCard(token);
            setCardData(CardData.data || []);
        } catch (error) {
            // console.error("Lỗi khi gọi API thẻ cào:", error);
        }
    };

    // Hàm gọi API lấy dữ liệu ngân hàng
    const fetchBankingData = async () => {
        loadingg("Vui lòng chờ...", true, 9999999);
        try {
            const BankingData = await getBanking(token);
            setBanking(BankingData || []);
            loadingg("", false);
        } catch (error) {
            // console.error("Lỗi khi gọi API ngân hàng:", error);
        }finally {
            loadingg("", false);
        }
    };

    // Hàm gọi API lấy lịch sử giao dịch thẻ cào
    const fetchCardHistory = async () => {
        try {
            const HistorycardData = await getCardHistory(token);
            setHistoryCard(HistorycardData.transactions || []);
        } catch (error) {
            // console.error("Lỗi khi gọi API lịch sử thẻ cào:", error);
        }
    };

    // Hàm gọi API lấy danh sách khuyến mãi
    const fetchPromotions = async () => {
        try {
            const PromotionsData = await getPromotions(token);
            setPromotions(PromotionsData || []);
        } catch (error) {
            // console.error("Lỗi khi gọi API khuyến mãi:", error);
        }
    };

    // Gọi tất cả các hàm API khi component được mount
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchCardData(),
                fetchBankingData(),
                fetchCardHistory(),
                fetchPromotions(),
            ]);
        };
        fetchData();
    }, [token]);


    return (
        <div className="row">
            {/* Phần tiêu đề và nút chọn */}
            <div className="col-md-12 mb-4">
                <div className="row">
                    <div className="col-6 d-grid gap-2">
                        <button
                            className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "banking" ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => setActiveTab("banking")}
                        >
                            <i className="fas fa-university"></i> Ngân hàng
                        </button>
                    </div>
                    <div className="col-6 d-grid gap-2">
                        <button
                            className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "napthecao" ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => setActiveTab("napthecao")}
                        >
                            <i className="fas fa-sim-card"></i> Thẻ cào
                        </button>
                    </div>
                </div>
            </div>

            {/* Nội dung hiển thị dựa trên trạng thái activeTab */}
            {activeTab === "banking" && (
                <>
                    <div className="col-md-12">
                        {/* Hiển thị thông tin banking trước */}
                        <Banking banking={banking} username={username} />
                    </div>
                    {/* Sau đó mới hiển thị các trường khác */}
                    <div className="col-md-12">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title">Lịch sử nạp tiền ngân hàng</h5>
                                </div>
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div>
                                            <label htmlFor="limitSelect" className="me-2">
                                                Hiển thị:
                                            </label>
                                            <select
                                                id="limitSelect"
                                                className="form-select d-inline-block w-auto"
                                                value={limit}
                                                onChange={(e) => setLimit(Number(e.target.value))}
                                            >
                                                <option value={10}>10</option>
                                                <option value={20}>20</option>
                                                <option value={50}>50</option>
                                                <option value={100}>100</option>

                                            </select>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-striped table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Username</th>
                                                    <th>Số tiền</th>
                                                    <th>Nội dung</th>
                                                    <th>Thời gian</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-5">
                                                            <div className="d-flex flex-column align-items-center justify-content-center">
                                                                <div className="spinner-border text-primary mb-2" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <span className="mt-2">Đang tải dữ liệu...</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <>
                                                        {history && history.length > 0 ? (
                                                            history.map((transaction, index) => (
                                                                <tr key={transaction._id || index}>
                                                                    <td>{(page - 1) * limit + index + 1}</td>
                                                                    <td>{transaction.username || "N/A"}</td>
                                                                    <td>
                                                                        {Number(transaction.amount || 0).toLocaleString("en-US")} VNĐ
                                                                    </td>
                                                                    <td>{transaction.note || "N/A"}</td>
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
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={5} className="text-center">
                                                                    <div>
                                                                        <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                                                        <p className="font-semibold" >Không có dữ liệu</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3">
                                        <span>Trang {page}</span>
                                        <div className="pagination d-flex justify-content-between align-items-center mt-2 gap-2">
                                            {/* Arrow + numbers + arrow grouped together */}
                                            <div
                                                className="d-flex align-items-center gap-2 flex-nowrap overflow-auto text-nowrap flex-grow-1"
                                                style={{ maxWidth: '100%' }}
                                            >
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={page === 1}
                                                    aria-label="Trang trước"
                                                    title="Trang trước"
                                                >
                                                    <i className="fas fa-angle-left"></i>
                                                </button>

                                                {(() => {
                                                    const pages = [];
                                                    const start = Math.max(1, page - Math.floor(maxVisible / 2));
                                                    let end = start + maxVisible - 1;
                                                    // If this looks like the last page (fewer items than limit), avoid showing pages beyond current
                                                    if (history.length < limit) {
                                                        end = Math.min(end, page);
                                                    }

                                                    // Leading first page and ellipsis
                                                    if (start > 1) {
                                                        pages.push(
                                                            <button key={1} className={`btn btn-sm ${page === 1 ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setPage(1)}>1</button>
                                                        );
                                                        if (start > 2) {
                                                            pages.push(<span key="start-ellipsis">...</span>);
                                                        }
                                                    }

                                                    for (let p = start; p <= end; p++) {
                                                        pages.push(
                                                            <button
                                                                key={p}
                                                                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                onClick={() => setPage(p)}
                                                            >
                                                                {p}
                                                            </button>
                                                        );
                                                    }

                                                    return pages;
                                                })()}

                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setPage((prev) => prev + 1)}
                                                    disabled={history.length < limit}
                                                    aria-label="Trang sau"
                                                    title="Trang sau"
                                                >
                                                    <i className="fas fa-angle-right"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="card promotion-banner mb-3">
                            <div className="card-body text-center py-3">
                                <div className="mb-2">
                                    <i className="fas fa-tags text-primary" style={{fontSize: '2rem'}}></i>
                                </div>
                                <h4 className="fw-bold mb-1">CHƯƠNG TRÌNH KHUYẾN MÃI</h4>
                                <p className="text-muted mb-0">Nạp tiền ngay để nhận ưu đãi</p>
                            </div>
                        </div>

                        <div className="col-md-12">
                            {promotions.length > 0 ? (
                                <div className="row">
                                    {promotions.map((promotion, index) => (
                                        <div className="col-md-6 mb-3" key={promotion._id || index}>
                                            <div className="card promotion-card h-100">
                                                {/* Card Header */}
                                                <div className="card-header bg-primary text-white">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-fire me-2"></i>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold">{promotion.name}</h6>
                                                                <div className="opacity-75">Khuyến mãi đặc biệt</div>
                                                            </div>
                                                        </div>
                                                        <div className="badge bg-warning text-dark fs-6 px-3 py-2">
                                                            +{promotion.percentBonus}%
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="card-body">
                                                    <div className="row g-3">
                                                        {/* Amount Section */}
                                                        <div className="col-12">
                                                            <div className="d-flex align-items-center p-3 rounded border">
                                                                <i className="fas fa-money-bill-wave text-primary me-3" style={{fontSize: '1.5rem'}}></i>
                                                                <div>
                                                                    <div className="text-muted">Nạp tối thiểu</div>
                                                                    <h5 className="mb-0 fw-bold">
                                                                        {Number(promotion.minAmount || 0).toLocaleString("en-US")} <div className="text-muted">VNĐ</div>
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Time Section */}
                                                        <div className="col-6">
                                                            <div className="p-2 rounded border">
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <i className="fas fa-play-circle text-success me-2"></i>
                                                                    <div className="fw-bold text-success">Bắt đầu</div>
                                                                </div>
                                                                <div className="d-block">
                                                                    {new Date(promotion.startTime).toLocaleDateString("vi-VN")}
                                                                </div>
                                                                <div className="text-muted">
                                                                    {new Date(promotion.startTime).toLocaleTimeString("vi-VN", {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-6">
                                                            <div className="p-2 rounded border">
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <i className="fas fa-stop-circle text-danger me-2"></i>
                                                                    <div className="fw-bold text-danger">Kết thúc</div>
                                                                </div>
                                                                <div className="d-block">
                                                                    {new Date(promotion.endTime).toLocaleDateString("vi-VN")}
                                                                </div>
                                                                <div className="text-muted">
                                                                    {new Date(promotion.endTime).toLocaleTimeString("vi-VN", {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        {promotion.description && (
                                                            <div className="col-12">
                                                                <div className="p-2 rounded border bg-light">
                                                                    <div className="d-flex">
                                                                        <i className="fas fa-info-circle text-info me-2 mt-1"></i>
                                                                        <div>{promotion.description}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Footer */}
                                                <div className="card-footer">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="text-muted">
                                                            <i className="fas fa-check-circle text-success me-1"></i>
                                                            Áp dụng mọi phương thức
                                                        </div>
                                                        {(() => {
                                                            const now = new Date();
                                                            const startTime = new Date(promotion.startTime);
                                                            const endTime = new Date(promotion.endTime);
                                                            const isActive = now >= startTime && now <= endTime;
                                                            
                                                            if (isActive) {
                                                                return (
                                                                    <span className="badge bg-success">
                                                                        <i className="fas fa-bolt me-1"></i>Đang hoạt động
                                                                    </span>
                                                                );
                                                            } else if (now < startTime) {
                                                                return (
                                                                    <span className="badge bg-warning text-dark">
                                                                        <i className="fas fa-clock me-1"></i>Sắp diễn ra
                                                                    </span>
                                                                );
                                                            } else {
                                                                return (
                                                                    <span className="badge bg-secondary">
                                                                        <i className="fas fa-times me-1"></i>Đã kết thúc
                                                                    </span>
                                                                );
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="card">
                                    <div className="card-body text-center py-4">
                                        <div className="mb-3">
                                            <i className="fas fa-gift text-muted" style={{fontSize: '3rem'}}></i>
                                        </div>
                                        <h5 className="fw-bold mb-2">Hiện tại chưa có khuyến mãi</h5>
                                        <p className="text-muted mb-3">
                                            Chúng tôi đang chuẩn bị những chương trình khuyến mãi hấp dẫn.
                                        </p>
                                        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => window.location.reload()}>
                                            <i className="fas fa-sync-alt me-2"></i>Tải lại trang
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === "napthecao" && (
                <>
                    <div className="col-md-12">
                        <Napthecao cardData={cardData} token={token} />
                    </div>
                    <div className="col-md-12">
                        <CardHistory historycard={historycard} />
                    </div>
                </>
            )}
        </div>
    );
}