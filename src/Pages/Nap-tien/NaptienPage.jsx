import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Napthecao from "./Napthecao";
import Banking from "./Banking";
import CardHistory from "./CardHistory";
import HistoryBank from "./HistoryBanking";
import { getBanking, getCardHistory, getCard, getPromotions } from "@/Utils/api";

export default function NaptienPage() {
    const { token, user } = useOutletContext();
    const [banking, setBanking] = useState([]);
    const [historycard, setHistoryCard] = useState([]);
    const [cardData, setCardData] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [activeTab, setActiveTab] = useState("banking");
    const username = user?.username;

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
        try {
            const BankingData = await getBanking(token);
            setBanking(BankingData || []);
        } catch (error) {
            // console.error("Lỗi khi gọi API ngân hàng:", error);
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
                        <Banking banking={banking} username={username} />
                        <HistoryBank token={token} />
                    </div>

                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header">
                                <h3 className="mb-0">Danh sách khuyến mãi</h3>
                            </div>
                            <div className="card-body">
                                {promotions.length > 0 ? (
                                    <div className="row row-cols-1 row-cols-md-2 g-3">
                                        {promotions.map((promotion, index) => (
                                            <div className="col" key={promotion._id || index}>
                                                <div className="card h-100 border-0 shadow-sm">
                                                    <div className="card-body">
                                                        <h4 className="mt-1 text-dark">
                                                            {promotion.name} <b className="text-danger">{promotion.percentBonus}%</b>
                                                        </h4>
                                                        <p className="text-muted mb-1 fs-6">
                                                            NẠP {Number(promotion.minAmount || 0).toLocaleString("en-US")} TRỞ LÊN
                                                        </p>
                                                        <p className="text-muted mb-1">
                                                            Từ <b>{new Date(promotion.startTime).toLocaleString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}</b> đến <b>{new Date(promotion.endTime).toLocaleString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}</b>
                                                        </p>
                                                        <p className="text-muted mb-1">{promotion.description}</p>
                                                    </div>
                                                    <div className="card-footer bg-light text-center">
                                                        <small className="text-muted">Áp dụng cho tất cả giao dịch</small>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p>Không có chương trình khuyến mãi nào.</p>
                                    </div>
                                )}
                            </div>
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