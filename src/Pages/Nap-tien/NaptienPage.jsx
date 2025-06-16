import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Napthecao from "./Napthecao";
import Banking from "./Banking";
import CardHistory from "./CardHistory";
import HistoryBank from "./HistoryBanking"; // Import component hiển thị lịch sử giao dịch ngân hàng
import { getBanking, getCardHistory, getCard, getPromotions } from "@/Utils/api"; // Import hàm getPromotions

export default function NaptienPage() {
    const { token, user } = useOutletContext();
    const [banking, setBanking] = useState([]);
    const [historycard, setHistoryCard] = useState([]);
    const [cardData, setCardData] = useState([]);
    const [promotions, setPromotions] = useState([]); // Lưu danh sách chương trình khuyến mãi
    const [activeTab, setActiveTab] = useState("banking"); // Trạng thái để điều khiển nội dung hiển thị
    const username = user?.username;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [CardData, BankingData, HistorycardData, PromotionsData] = await Promise.all([
                    getCard(token),
                    getBanking(token),
                    getCardHistory(token),
                    getPromotions(token), // Gọi API lấy danh sách chương trình khuyến mãi
                ]);
                setCardData(CardData.data || []);
                setBanking(BankingData || []);
                setHistoryCard(HistorycardData.transactions || []);
                setPromotions(PromotionsData || []); // Lưu danh sách chương trình khuyến mãi
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };
        fetchData();
    }, [token]); // Chỉ gọi lại khi `token` thay đổi
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

            {/* {promotions.length > 0 ? (
                <div className="row">
                    {promotions.map((promotion, index) => (
                        <div className="col-md-12 mb-4" key={promotion._id || index}>
                            <div className="widget-rounded-circle card-box">
                                <div className="text-left">
                                    <h3 className="mt-1 text-dark">
                                        <span>{promotion.name}</span> <b>{promotion.percentBonus}%</b>
                                    </h3>
                                    <p className="text-muted mb-1">
                                        Từ <b>{new Date(promotion.startTime).toLocaleString("vi-VN")}</b> đến{" "}
                                        <b>{new Date(promotion.endTime).toLocaleString("vi-VN")}</b>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center">
                    <p>Không có chương trình khuyến mãi nào.</p>
                </div>
            )} */}
            {/* Bảng hiển thị danh sách chương trình khuyến mãi */}


            {/* Nội dung hiển thị dựa trên trạng thái activeTab */}
            {activeTab === "banking" && (
                <div className="col-md-12">
                    <Banking banking={banking} username={username} />
                    <HistoryBank token={token} />
                </div>
            )}

            <div className="col-md-12">
                <div className="card shadow-sm">
                    <div className="card-header ">
                        <h3 className="mb-0">Danh sách khuyến mãi</h3>
                    </div>

                    <div className="card-body">
                        {promotions.length > 0 ? (
                            <div className="row row-cols-1 row-cols-md-2  g-3">
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
                                                    Từ <b>{new Date(promotion.startTime).toLocaleString("vi-VN")}</b> đến{" "}
                                                    <b>{new Date(promotion.endTime).toLocaleString("vi-VN")}</b>
                                                </p>

                                                <p className="text-muted  mb-1">
                                                    {promotion.description}
                                                </p>
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


            {/* <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên</th>
                                    <th>Nạp Tối Thiểu</th>
                                    <th>Khuyến mãi (%)</th>
                                    <th>Thời gian bắt đầu</th>
                                    <th>Thời gian kết thúc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.length > 0 ? (
                                    promotions.map((promotion, index) => (
                                        <tr key={promotion._id}>
                                            <td>{index + 1}</td>
                                            <td >{promotion.name}</td>
                                            <td>{promotion.minAmount || 0}</td>
                                            <td>{promotion.percentBonus || 0}</td>
                                            <td>{new Date(promotion.startTime).toLocaleString("vi-VN")}</td>
                                            <td>{new Date(promotion.endTime).toLocaleString("vi-VN")}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            Không có chương trình khuyến mãi nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div> */}
            {
                activeTab === "napthecao" && (
                    <>
                        <div className="col-md-12">
                            <Napthecao cardData={cardData} token={token} />
                        </div>
                        <div className="col-md-12">
                            <CardHistory historycard={historycard} />
                        </div>
                    </>
                )
            }
        </div >
    );
}