import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getUid, addOrder, getServerByTypeAndCategory } from "@/Utils/api";
import { toast } from "react-toastify";

export default function Order() {
    const { type, path } = useParams(); // Lấy `type` và `path` từ URL
    const [servers, setServers] = useState([]);
    const [rawLink, setRawLink] = useState("");
    const [convertedUID, setConvertedUID] = useState("");
    const [selectedMagoi, setSelectedMagoi] = useState("");
    const [quantity, setQuantity] = useState(100);
    const [comments, setComments] = useState("");
    const [note, setNote] = useState("");
    const [totalCost, setTotalCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [min, setMin] = useState(100);
    const [max, setMax] = useState(10000);
    const [rate, setRate] = useState(0);
    const [cmtqlt, setcomputedQty] = useState(0);
    const [isConverting, setIsConverting] = useState(false);

    const token = localStorage.getItem("token");
    let decoded = {};
    if (token) {
        try {
            decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (error) {
            console.error("Token decode error:", error);
        }
    }
    const username = decoded.username;

    // Gọi API để lấy danh sách servers
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await getServerByTypeAndCategory(type, path, token);
                setServers(response.data || []); // Giả sử API trả về `data`
            } catch (error) {
                console.error("Lỗi khi gọi API getServerByTypeAndCategory:", error);
                Swal.fire({
                    title: "Lỗi",
                    text: "Không thể tải danh sách máy chủ.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
            }
        };

        if (type && path) {
            fetchServers();
        }
    }, [type, path, token]); // Đảm bảo `type`, `path`, và `token` nằm trong mảng dependency

    // Lọc danh sách server
    const filteredServers = useMemo(() => {
        if (!Array.isArray(servers)) return [];
        return servers; // Không cần lọc theo `selectedType` và `selectedCategory`
    }, [servers]);

    // Tính tổng chi phí dựa vào dịch vụ được chọn
    useEffect(() => {
        if (selectedMagoi) {
            const selectedService = filteredServers.find(
                (service) => service.Magoi === selectedMagoi
            );
            if (selectedService) {
                if (selectedService.comment === "on") {
                    const lines = comments.split(/\r?\n/).filter((line) => line.trim() !== "");
                    setTotalCost(lines.length * selectedService.rate);
                } else {
                    setTotalCost(selectedService.rate * quantity);
                }
            }
        } else {
            setTotalCost(0);
        }
    }, [selectedMagoi, quantity, filteredServers, comments]);

    // Xử lý chuyển đổi UID từ link
    useEffect(() => {
        if (!rawLink) {
            setConvertedUID("");
            return;
        }

        const selectedService = filteredServers.find((service) => service.Magoi === selectedMagoi);
        if (!selectedService || selectedService.getid !== "on") {
            setConvertedUID(rawLink); // Nếu không cần get UID, sử dụng rawLink
            return;
        }

        setIsConverting(true);
        const timer = setTimeout(async () => {
            try {
                const res = await getUid({ link: rawLink });
                if (res.status !== "error" && res.uid) {
                    setConvertedUID(res.uid);
                    toast.success("Chuyển đổi UID thành công!");
                } else {
                    setConvertedUID("");
                }
            } catch (error) {
                setConvertedUID("");
            } finally {
                setIsConverting(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [rawLink, selectedMagoi, filteredServers]);

    // Tính số lượng comment từ nội dung
    useEffect(() => {
        const computedQty = comments
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "").length;
        setcomputedQty(computedQty);
    }, [comments]);

    // Hiển thị link: nếu có UID chuyển đổi thì ưu tiên nó
    const displayLink = useMemo(() => {
        const selectedService = filteredServers.find((server) => server.Magoi === selectedMagoi);
        return selectedService && selectedService.getid === "on" ? convertedUID || rawLink : rawLink;
    }, [convertedUID, rawLink, selectedMagoi, filteredServers]);

    // Xử lý gửi đơn hàng
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username) {
            Swal.fire({
                title: "Lỗi",
                text: "Bạn cần đăng nhập trước khi mua hàng!",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
            return;
        }
        const finalLink = convertedUID || rawLink;
        if (!finalLink || !selectedMagoi) {
            Swal.fire({
                title: "Lỗi",
                text: "Vui lòng chọn dịch vụ và nhập link.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
            return;
        }
        const selectedService = filteredServers.find(
            (service) => service.Magoi === selectedMagoi
        );
        const qty =
            selectedService && selectedService.comment === "on" ? cmtqlt : quantity;
        const confirmResult = await Swal.fire({
            title: "Xác nhận thanh toán",
            text: `Bạn sẽ tăng ${qty} lượng với giá ${rate} đ. Tổng thanh toán: ${totalCost.toLocaleString(
                "en-US"
            )} VNĐ.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (confirmResult.isConfirmed) {
            setIsSubmitting(true);
            const payload = {
                category: servers.find((server) => server.Magoi === selectedMagoi)?.category || "",
                link: finalLink,
                username,
                magoi: selectedMagoi,
                note,
            };

            if (selectedService && selectedService.comment === "on") {
                payload.quantity = qty;
                payload.comments = comments;
            } else {
                payload.quantity = quantity;
            }
            try {
                const res = await addOrder(payload, token);
                Swal.fire({
                    title: "Thành công",
                    text: "Mua dịch vụ thành công",
                    icon: "success",
                    confirmButtonText: "Xác nhận",
                });
            } catch (error) {
                Swal.fire({
                    title: "Lỗi",
                    text: error.message || "Có lỗi xảy ra, vui lòng thử lại!",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    useEffect(() => {
        setRawLink("");
        setConvertedUID("");
    }, [path]); // Theo dõi sự thay đổi của đường dẫn
    const convertNumberToWords = (num) => {
        const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        const tens = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
        const scales = ["", "nghìn", "triệu", "tỷ"];

        if (num === 0) return "không đồng";

        const [integerPart, decimalPart] = num.toString().split(".");
        let result = "";

        // Xử lý phần nguyên
        if (integerPart === "0") {
            result = "không";
        } else {
            let numStr = integerPart;
            const numGroups = [];

            while (numStr.length > 0) {
                numGroups.unshift(numStr.slice(-3));
                numStr = numStr.slice(0, -3);
            }

            const words = numGroups.map((group, index) => {
                const [hundreds, tensDigit, unitsDigit] = group.padStart(3, "0").split("").map(Number);
                const groupWords = [];

                if (hundreds > 0) groupWords.push(`${units[hundreds]} trăm`);
                if (tensDigit > 1) {
                    groupWords.push(tens[tensDigit]);
                    if (unitsDigit > 0) groupWords.push(units[unitsDigit]);
                } else if (tensDigit === 1) {
                    groupWords.push("mười");
                    if (unitsDigit > 0) groupWords.push(unitsDigit === 5 ? "lăm" : units[unitsDigit]);
                } else if (unitsDigit > 0) {
                    groupWords.push(units[unitsDigit]);
                }

                return groupWords.join(" ") + (groupWords.length > 0 ? ` ${scales[numGroups.length - index - 1]}` : "");
            });

            result = words.filter(Boolean).join(" ");
        }

        // Xử lý phần thập phân
        if (decimalPart) {
            const decimalWords = decimalPart
                .split("")
                .map((digit) => units[Number(digit)])
                .join(" ");
            result += ` phẩy ${decimalWords}`;
        }

        return result + " đồng";
    };
    const tien = useMemo(() => convertNumberToWords(totalCost), [totalCost]);
    const category = servers.length > 0 ? servers[0].category : path;

    return (
        <div className="main-content">
            <div className="row">
                <div className="col-md-12 col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title d-flex align-items-center gap-2 mb-4u">
                                <span className="text-primary">{category}</span>
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <>
                                    <div className="form-group mb-3">
                                        <label htmlFor="object_id" className="form-label">
                                            <strong>Link Hoặc UID:</strong>
                                        </label>
                                        <input
                                            className="form-control ipt-link"
                                            type="text"
                                            value={isConverting ? "Đang xử lý..." : displayLink}
                                            onChange={(e) => {
                                                setRawLink(e.target.value);
                                                setConvertedUID("");
                                            }}
                                            placeholder="Nhập link hoặc ID tùy các máy chủ"
                                            disabled={isConverting}
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">
                                            {/* <>Máy chủ:</strong> */}
                                            <strong>Chọn máy chủ ( ấn vào máy chủ để đọc lưu ý )</strong>

                                        </label>
                                        {filteredServers.map((server) => (

                                            // <div className="mb-3">
                                            //     <div className="mb-0">
                                            //         <div
                                            //             className="form-check mb-2 d-flex align-items-start"
                                            //             style={{ gap: "10px" }} // Thêm khoảng cách giữa các phần tử
                                            //         >
                                            //             <input
                                            //                 type="radio"
                                            //                 id={`server-${server.Magoi}`}
                                            //                 name="server"
                                            //                 value={server.Magoi}
                                            //                 checked={selectedMagoi === server.Magoi}
                                            //                 onChange={(e) => {
                                            //                     setSelectedMagoi(e.target.value);
                                            //                     setMin(server.min);
                                            //                     setMax(server.max);
                                            //                     setRate(server.rate);
                                            //                 }}
                                            //                 className="form-check-input radio-custom"
                                            //                 style={{ cursor: "pointer", marginTop: "7px" }}
                                            //             />
                                            //             <label
                                            //                 className="form-check-label"
                                            //                 htmlFor={`server-${server.Magoi}`}
                                            //                 style={{ cursor: "pointer" }}
                                            //             >
                                            //                 <strong className="text-sm fw-semibold">[{server.Magoi}]  </strong>
                                            //                 <span
                                            //                     className="text-danger fw-bold small-number"
                                            //                     style={{ fontSize: "17px" }}
                                            //                 >
                                            //                     {server.maychu}
                                            //                 </span> - <span className="text-sm fw-semibold">{server.name} </span> - <span
                                            //                     className="text-danger fw-bold small-number"
                                            //                     style={{ fontSize: "17px" }}
                                            //                 >
                                            //                     {Number(server.rate).toLocaleString("en-US")}đ
                                            //                 </span>
                                            //                 <div>
                                            //                     {/* <span className="badge bg-secondary">Đã bán: 15</span> */}
                                            //                     <span className="badge bg-success">{server.trangthai ? "Hoạt động" : "Không hoạt động"}
                                            //                     </span>
                                            //                     {/* <span className="badge bg-primary">Tỷ lệ: 66%</span> */}
                                            //                 </div>
                                            //             </label>
                                            //         </div>
                                            //     </div>
                                            // </div>

                                            <div
                                                key={server.Magoi}
                                                className="form-check mb-3 d-flex align-items-center gap-2 "
                                            >
                                                <input
                                                    id={`server-${server.Magoi}`}
                                                    className="form-check-input "
                                                    type="radio"
                                                    name="server"
                                                    value={server.Magoi}
                                                    checked={selectedMagoi === server.Magoi}
                                                    onChange={(e) => {
                                                        setSelectedMagoi(e.target.value);
                                                        setMin(server.min);
                                                        setMax(server.max);
                                                        setRate(server.rate);
                                                    }}
                                                />
                                                <label className="form-check-label" htmlFor={`server-${server.Magoi}`}>
                                                    <strong className="badge bg-info">[{server.Magoi}] </strong>
                                                    {/* <span className="badge bg-success ">{server.maychu}</span> */}
                                                    <span className="font-semibold"> - {server.maychu} {server.name} </span>
                                                    <span className="badge bg-primary ">
                                                        {Number(server.rate).toLocaleString("en-US")}đ
                                                        {/* {server.rate}đ */}
                                                    </span>

                                                    <span className="badge bg-success ms-1">
                                                        {server.isActive ? "Hoạt động" : "Không hoạt động"}
                                                    </span>
                                                    {/* <span className="custom-control-label">
                                                        {" "}
                                                        - ID server - {server.Magoi}
                                                    </span> */}
                                                </label>
                                            </div>
                                        ))}
                                        {servers.map((server, index) => (
                                            selectedMagoi === server.Magoi && (
                                                <div key={index} className="alert text-white alert-info bg-info">
                                                    <h6>
                                                        Mã máy chủ: <span className="text-white">{server.Magoi}</span>
                                                    </h6>
                                                    <h6 >
                                                        Lưu ý :
                                                    </h6>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: server.description }}
                                                    />
                                                </div>
                                            )
                                        ))}
                                    </div>
                                    {(() => {
                                        const selectedService = filteredServers.find(
                                            (service) => service.Magoi === selectedMagoi
                                        );
                                        if (selectedService && selectedService.comment === "on") {
                                            return (
                                                <div
                                                    className="form-group mb-3 comments"
                                                    id="comments_type"
                                                    style={{ display: "block" }}
                                                >
                                                    <strong>
                                                        Số lượng: <span id="quantity_limit">({min} ~ {max})</span>
                                                    </strong>
                                                    <label htmlFor="comments" className="form-label">
                                                        <strong>Nội dung bình luận: </strong>
                                                        <strong>số lượng: {cmtqlt}</strong>
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        name="comments"
                                                        id="comments"
                                                        rows="3"
                                                        placeholder="Nhập nội dung bình luận, mỗi dòng là 1 comment"
                                                        value={comments}
                                                        onChange={(e) => setComments(e.target.value)}
                                                    ></textarea>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="form-group mb-3 quantity" id="quantity_type">
                                                    <label htmlFor="quantity" className="form-label">
                                                        <strong>
                                                            Số lượng: <span id="quantity_limit">({min} ~ {max})</span>
                                                        </strong>
                                                    </label>
                                                    <input
                                                        list="suggestions"
                                                        type="number"
                                                        className="form-control"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(e.target.value)}
                                                    />
                                                    <datalist id="suggestions">
                                                        <option value="100"></option>
                                                        <option value="1000"></option>
                                                        <option value="10000"></option>
                                                    </datalist>
                                                </div>
                                            );
                                        }
                                    })()}
                                    <div className="form-group mb-3">
                                        <label htmlFor="note" className="form-label">
                                            <strong>Ghi chú:</strong>
                                        </label>
                                        <textarea
                                            className="form-control"

                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Ghi chú đơn hàng"
                                        />
                                    </div>
                                    {(() => {
                                        const selectedService = filteredServers.find(
                                            (service) => service.Magoi === selectedMagoi
                                        );
                                        const qty =
                                            selectedService && selectedService.comment === "on"
                                                ? cmtqlt
                                                : quantity;
                                        return (
                                            <div className="form-group mb-3">
                                                <div className="alert bg-primary text-center text-white">
                                                    <h3 className="alert-heading">
                                                        Tổng thanh toán:{" "}
                                                        <span className="text-danger">
                                                            {Number(totalCost).toLocaleString("en-US")}
                                                        </span>{" "}
                                                        VNĐ
                                                    </h3>
                                                    <p className="fs-5 mb-0">{tien}</p>
                                                    <p className="fs-4 mb-0">
                                                        Bạn sẽ tăng{" "}
                                                        <span className="text-danger">{qty} </span>số lượng với giá{" "}
                                                        <span className="text-danger">{rate}</span> đ
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div className="form-group">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <i className="fas fa-shopping-cart"></i>
                                            {isSubmitting ? "Đang xử lý..." : "Tạo đơn hàng"}
                                        </button>
                                    </div>
                                </>
                            </form>
                            {isSubmitting && (
                                <div className="overlay">
                                    <div className="spinner-container">
                                        <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
                                            <div className="spinner-border text-primary" role="status" />
                                            <span className="ms-2">Đang xử lý</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-12 col-lg-4">
                    <div className="alert alert-danger bg-danger text-white mb-3">
                        <h5 className="alert-heading">Lưu ý</h5>
                        <span>
                            Nghiêm cấm buff các đơn có nội dung vi phạm pháp luật, chính trị, đồ trụy...
                            Nếu cố tình buff bạn sẽ bị trừ hết tiền và ban khỏi hệ thống vĩnh viễn, và phải chịu hoàn toàn trách nhiệm trước pháp luật.
                            Nếu đơn đang chạy trên hệ thống mà bạn vẫn mua ở các hệ thống bên khác hoặc đè nhiều đơn, nếu có tình trạng hụt, thiếu số lượng giữa 2 bên thì sẽ không được xử lí.
                            Đơn cài sai thông tin hoặc lỗi trong quá trình tăng hệ thống sẽ không hoàn lại tiền.
                            Nếu gặp lỗi hãy nhắn tin hỗ trợ phía bên phải góc màn hình hoặc vào mục liên hệ hỗ trợ để được hỗ trợ tốt nhất.
                        </span>
                    </div>
                    <div className="alert alert-primary bg-primary text-white">
                        <h5 className="alert-heading">Các trường hợp huỷ đơn hoặc không chạy</h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

