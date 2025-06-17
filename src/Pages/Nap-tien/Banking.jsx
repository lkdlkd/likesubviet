
import React from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";

export default function Banking({ banking = [], username }) {
    const { configWeb } = useOutletContext();
const cuphap = configWeb?.cuphap ;
console.log(cuphap);
    const handleCopy = (text) => {
        navigator.clipboard
            .writeText(text)
            .then(() => toast.success("Đã sao chép thành công!"))
            .catch(() => toast.error("Lỗi khi sao chép!"));
    };

    return (
        <>
            {banking.map((bank) => (
                <div key={bank._id} className="card">
                    <div className="card-body">
                        <div className="row">
                            {/* Thông tin ngân hàng */}
                            <div className="col-md-6">
                                <div className="py-3 text-center bg-light-primary rounded-2 fw-bold mb-4">
                                    Nạp tiền qua chuyển khoản
                                </div>
                                <table className="table table-row-dashed table-row-gray-300 gy-7">
                                    <tbody>
                                        <tr>
                                            <td>Ngân Hàng</td>
                                            <td>
                                                <p
                                                    className="text-danger fw-bold bank-name"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {bank.bank_name}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Tên chủ tài khoản</td>
                                            <td>
                                                <p
                                                    className="text-black fw-bold account-owner"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {bank.account_name}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Số tài khoản</td>
                                            <td>
                                                <p
                                                    className="text-black fw-bold account-number"
                                                    style={{
                                                        cursor: "pointer",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {bank.account_number}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm ms-2 btn-copy"
                                                    onClick={() => handleCopy(bank.account_number)}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Nội dung chuyển khoản</td>
                                            <td>
                                                <p
                                                    className="text-black fw-bold content-tranfer"
                                                    style={{
                                                        cursor: "pointer",
                                                        display: "inline-block",
                                                    }}
                                                >
                                                    {cuphap} {username}
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm ms-2 btn-copy"
                                                    onClick={() => handleCopy(`${cuphap} ${username}`)}
                                                >
                                                    <i className="fas fa-copy"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Nạp ít nhất</td>
                                            <td>
                                                <p
                                                    className="fw-bold amount-money"
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {bank?.min_recharge
                                                        ? Number(bank.min_recharge).toLocaleString("en-US")
                                                        : "0"}
                                                    đ
                                                </p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* QR Code */}
                            <div className="col-md-6">
                                <div className="py-3 text-center bg-light-primary rounded-2 fw-bold mb-4">
                                    Nạp tiền qua quét mã QR
                                </div>
                                <div className="text-center mb-3">
                                    <img
                                        src={`https://img.vietqr.io/image/${bank.bank_name}-${bank.account_number}-qronly2.jpg?accountName=${encodeURIComponent(
                                            bank.account_name
                                        )}&addInfo=${encodeURIComponent(`${cuphap} ${username}`)}`}
                                        alt="QR CODE"
                                        width={300}
                                        height={300}
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