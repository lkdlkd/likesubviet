import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Napthecao from "./Napthecao";
import Banking from "./Banking";
import CardHistory from "./CardHistory";
import { getBanking, getCardHistory, getCard } from "@/Utils/api";

export default function NaptienPage() {
    const { token, user } = useOutletContext();
    const [banking, setBanking] = useState([]);
    const [historycard, setHistoryCard] = useState([]);
    const [cardData, setCardData] = useState([]);
    const username = user?.username;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [CardData, BankingData, HistorycardData] = await Promise.all([
                    getCard(token),
                    getBanking(token),
                    getCardHistory(token),
                ]);
                setCardData(CardData.data || []);
                setBanking(BankingData || []);
                setHistoryCard(HistorycardData.transactions || []);


            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };
        fetchData();
    }, [token]); // Chỉ gọi lại khi `token` thay đổi


    return (
        <div className="row">
            {/* Phần thông tin ngân hàng và nạp tiền qua chuyển khoản, quét mã QR */}
            <div className="col-md-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title">Nạp tiền</h5>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-danger mb-0">
                            <ul className="mb-0">
                                <li className="fw-bold text-dark">
                                    Vui lòng nạp đúng tài khoản và nội dung
                                </li>
                                <li className="fw-bold text-dark">
                                    Sai nội dung hoặc quên không có nội dung bị phạt 20% (ví dụ nạp
                                    100k còn 80k)
                                </li>
                                <li className="fw-bold text-dark">
                                    Nạp dưới min của web yêu cầu (mất tiền)
                                </li>
                                <li className="fw-bold text-dark">
                                    Không hỗ trợ nạp rồi rút ra với bất kì lý do gì
                                </li>
                                <li className="fw-bold text-dark">
                                    Sau 10p nếu chưa thấy tiền về tài khoản thì liên hệ trực tiếp Admin.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Component Banking */}
            <Banking banking={banking} username={username} />

            {/* Component Napthecao */}
            <Napthecao cardData={cardData} token={token} />

            {/* Component CardHistory */}
            <CardHistory historycard={historycard} />
        </div>
    );
}