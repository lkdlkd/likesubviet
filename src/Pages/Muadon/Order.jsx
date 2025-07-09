import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getUid, addOrder, getServerByTypeAndCategory } from "@/Utils/api";
import { toast } from "react-toastify";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này
import Modalnote from "./Modal_note"; // Giả sử bạn đã định nghĩa Modalnote trong cùng thư mục
import MultiLinkModal from "./MultiLinkModal";
// import { useTranslation } from "react-i18next";
// import { useDispatch } from "react-redux";
// import { setUser } from "@/redux/slices/userSlice";
// import { io } from "socket.io-client";
import { Button, Modal } from "react-bootstrap";
import Select from "react-select";
import Dondamua from "./Dondamua";

export default function Order() {
    const { path } = useParams(); // Lấy `type` và `path` từ URL
    const [servers, setServers] = useState([]);
    const [rawLink, setRawLink] = useState("");
    const [convertedUID, setConvertedUID] = useState("");
    const [selectedMagoi, setSelectedMagoi] = useState("");
    const [quantity, setQuantity] = useState("");
    const [comments, setComments] = useState("");
    const [note, setNote] = useState("");
    const [totalCost, setTotalCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [min, setMin] = useState(100);
    const [max, setMax] = useState(10000);
    const [rate, setRate] = useState(0);
    const [ObjectLink, setObjectLink] = useState("");
    const [cmtqlt, setcomputedQty] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [modal_Show, setModalShow] = useState("");
    const [multiLinkModal, setMultiLinkModal] = useState(false);
    const [isStopped, setIsStopped] = React.useState(false);
    const isStoppedRef = React.useRef(isStopped);
    const [activeTab, setActiveTab] = useState("muadichvu");
    const [showcmt, setShowcmt] = useState(false);
    React.useEffect(() => {
        isStoppedRef.current = isStopped;
    }, [isStopped]);

    // Thêm state cho danh sách link và link nhập mới
    const [multiLinkList, setMultiLinkList] = useState([]);
    const [multiLinkInput, setMultiLinkInput] = useState("");
    const [selectedMultiLinks, setSelectedMultiLinks] = useState([]);
    const token = localStorage.getItem("token");
    let decoded = {};
    if (token) {
        try {
            decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (error) {

        }
    }
    const username = decoded.username;
    // Gọi API để lấy danh sách servers
    useEffect(() => {
        loadingg("Vui lòng chờ...", true, 9999999); // Hiển thị loading khi bắt đầu fetch
        const fetchServers = async () => {
            try {
                const response = await getServerByTypeAndCategory(path, token);
                setServers(response.data || []); // Giả sử API trả về `data`
                setModalShow(response.notes || ""); // Lưu ý: `modal_show` cần được trả về từ API
            } catch (error) {

                // Swal.fire({
                //     title: "Lỗi",
                //     text: "Không thể tải danh sách máy chủ.",
                //     icon: "error",
                //     confirmButtonText: "Xác nhận",
                // });
            } finally {
                loadingg("", false); // Đóng loading khi xong
            }
        };

        if (path) {
            fetchServers();
        } else {
            loadingg("", false); // Đóng loading nếu không có type/path
        }
        // eslint-disable-next-line
    }, [path, token]); // Đảm bảo `type`, `path`, và `token` nằm trong mảng dependency

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
    // Theo dõi selectedService để setShowcmt đúng cách
    useEffect(() => {
        const hasCommentService = filteredServers.some(service => service.comment === "on");
        if (hasCommentService) {
            setShowcmt(true);
        } else {
            setShowcmt(false);
        }
    }, [selectedMagoi, filteredServers]);
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
            loadingg("Đang xử lý đơn hàng...", true, 9999999); // Hiển thị loading cho đến khi có response, không tự động tắt
            setIsSubmitting(true);
            try {
                const payload = {
                    category: servers.find((server) => server.Magoi === selectedMagoi)?.category || "",
                    link: finalLink,
                    magoi: selectedMagoi,
                    note,
                    ObjectLink: ObjectLink, // Lưu input gốc
                };

                if (selectedService && selectedService.comment === "on") {
                    payload.quantity = qty;
                    payload.comments = comments;
                } else {
                    payload.quantity = quantity;
                }
                const res = await addOrder(payload, token);
                loadingg("", false); // Đóng loading khi xong
                await Swal.fire({
                    title: "Thành công",
                    text: "Mua dịch vụ thành công",
                    icon: "success",
                    confirmButtonText: "Xác nhận",
                });
            } catch (error) {
                loadingg("", false); // Đóng loading khi xong

                await Swal.fire({
                    title: "Lỗi",
                    text: error.message || "Có lỗi xảy ra, vui lòng thử lại!",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
            } finally {
                setIsSubmitting(false);
                loadingg("", false); // Đóng loading khi xong
            }
        }
    };
    // Hàm xử lý mua nhiều link
    const handleMultiLinkSubmit = async () => {
        if (!selectedMagoi || !quantity || selectedMultiLinks.length === 0) return;
        const selectedService = filteredServers.find(
            (service) => service.Magoi === selectedMagoi
        );
        const qty = selectedService && selectedService.comment === "on" ? cmtqlt : quantity;
        setIsSubmitting(true);
        // Tạo bản sao để cập nhật trạng thái từng link
        let updatedList = [...multiLinkList];
        let success = 0, fail = 0;
        try {
            for (const idx of selectedMultiLinks) {
                if (isStoppedRef.current) break;
                // Đánh dấu đang xử lý
                updatedList[idx] = { ...updatedList[idx], trangthai: "Đang xử lý", status: 1 };
                setMultiLinkList([...updatedList]);
                const item = updatedList[idx];
                const payload = {
                    category: servers.find((server) => server.Magoi === selectedMagoi)?.category || "",
                    link: item.link,
                    magoi: selectedMagoi,
                    note,
                    ObjectLink: item.ObjectLink || item.link,
                };
                if (selectedService && selectedService.comment === "on") {
                    payload.quantity = item.quantity;
                    payload.comments = item.comment;
                } else {
                    payload.quantity = item.quantity;
                }
                try {
                    const res = await addOrder(payload, token);
                    updatedList[idx] = { ...updatedList[idx], trangthai: res.message || "Thành công", status: res.status || 200 };
                    success++;
                } catch (error) {
                    updatedList[idx] = { ...updatedList[idx], trangthai: error.message || "Thất bại", status: error.status || 500 };
                    fail++;
                }
                setMultiLinkList([...updatedList]);
            }
            // if (!isStopped) {
            //     setMultiLinkModal(false);
            //     setMultiLinkList([]);
            //     setSelectedMultiLinks([]);
            //     await Swal.fire({
            //         title: "Kết quả",
            //         text: `Thành công: ${success}, Thất bại: ${fail}`,
            //         icon: "info",
            //         confirmButtonText: "Xác nhận",
            //     });
            // }
        } catch (error) {
            await Swal.fire({
                title: "Lỗi",
                text: error.message || "Có lỗi xảy ra, vui lòng thử lại!",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        setObjectLink("");
        setRawLink("");
        setConvertedUID("");
        setMultiLinkList([]);
        setSelectedMagoi(""); // Reset selectedMagoi khi path thay đổi
        setActiveTab("muadichvu"); // Reset activeTab khi path thay đổi
    }, [path]); // Theo dõi sự thay đổi của đường dẫn
    // const convertNumberToWords = (num) => {
    //     const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    //     const tens = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    //     const scales = ["", "nghìn", "triệu", "tỷ"];

    //     if (num === 0) return "không đồng";

    //     const [integerPart, decimalPart] = num.toString().split(".");
    //     let result = "";

    //     // Xử lý phần nguyên
    //     if (integerPart === "0") {
    //         result = "không";
    //     } else {
    //         let numStr = integerPart;
    //         const numGroups = [];

    //         while (numStr.length > 0) {
    //             numGroups.unshift(numStr.slice(-3));
    //             numStr = numStr.slice(0, -3);
    //         }

    //         const words = numGroups.map((group, index) => {
    //             const [hundreds, tensDigit, unitsDigit] = group.padStart(3, "0").split("").map(Number);
    //             const groupWords = [];

    //             if (hundreds > 0) groupWords.push(`${units[hundreds]} trăm`);
    //             if (tensDigit > 1) {
    //                 groupWords.push(tens[tensDigit]);
    //                 if (unitsDigit > 0) groupWords.push(units[unitsDigit]);
    //             } else if (tensDigit === 1) {
    //                 groupWords.push("mười");
    //                 if (unitsDigit > 0) groupWords.push(unitsDigit === 5 ? "lăm" : units[unitsDigit]);
    //             } else if (unitsDigit > 0) {
    //                 groupWords.push(units[unitsDigit]);
    //             }

    //             return groupWords.join(" ") + (groupWords.length > 0 ? ` ${scales[numGroups.length - index - 1]}` : "");
    //         });

    //         result = words.filter(Boolean).join(" ");
    //     }

    //     // Xử lý phần thập phân
    //     if (decimalPart) {
    //         const decimalWords = decimalPart
    //             .split("")
    //             .map((digit) => units[Number(digit)])
    //             .join(" ");
    //         result += ` phẩy ${decimalWords}`;
    //     }

    //     return result + " đồng";
    // };
    const convertNumberToWords = (number) => {
        const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
        function docSoHangTram(so) {
            let tram = Math.floor(so / 100);
            let chuc = Math.floor((so % 100) / 10);
            let donvi = so % 10;
            let ketqua = "";

            if (tram > 0) {
                ketqua += `${chuSo[tram]} trăm `;
            }

            if (chuc > 1) {
                ketqua += `${chuSo[chuc]} mươi `;
                if (donvi > 0) ketqua += chuSo[donvi];
            } else if (chuc === 1) {
                ketqua += "mười ";
                if (donvi > 0) ketqua += donvi === 5 ? "lăm" : chuSo[donvi];
            } else if (donvi > 0) {
                ketqua += chuSo[donvi];
            }

            return ketqua.trim();
        }

        function docSoNguyen(n) {
            if (n === 0) return "không";

            let result = "";
            let hangTy = Math.floor(n / 1_000_000_000);
            let hangTrieu = Math.floor((n % 1_000_000_000) / 1_000_000);
            let hangNghin = Math.floor((n % 1_000_000) / 1000);
            let hangDonVi = n % 1000;

            if (hangTy > 0) result += `${docSoHangTram(hangTy)} tỷ `;
            if (hangTrieu > 0) result += `${docSoHangTram(hangTrieu)} triệu `;
            if (hangNghin > 0) result += `${docSoHangTram(hangNghin)} nghìn `;
            if (hangDonVi > 0) result += `${docSoHangTram(hangDonVi)}`;

            return result.trim().replace(/,\s*$/, '');
        }

        // ✅ Loại bỏ dấu phẩy khỏi chuỗi số
        number = number.toString().replace(/,/g, '');

        // ✅ Làm tròn 4 chữ số phần thập phân
        number = Number(number).toFixed(4);

        // ✅ Xoá số 0 vô nghĩa ở cuối phần thập phân
        number = number.replace(/(\.\d*?[1-9])0+$/g, '$1');
        number = number.replace(/\.0+$/g, '');

        const [phanNguyenStr, phanThapPhanStr] = number.split(".");
        const phanNguyen = Number(phanNguyenStr);

        let ketQua = docSoNguyen(phanNguyen);

        if (phanThapPhanStr) {
            ketQua += " phẩy";
            for (let digit of phanThapPhanStr) {
                ketQua += ` ${chuSo[Number(digit)]}`;
            }
        }

        // ✅ Viết hoa chữ cái đầu & chuẩn dấu phẩy
        ketQua = ketQua.charAt(0).toUpperCase() + ketQua.slice(1);
        return ketQua;
    };
    const tien = useMemo(() => convertNumberToWords(Number(totalCost).toLocaleString("en-US")), [totalCost]);
    const category = servers.length > 0 ? servers[0].category : path;


    const shortenSocialLink = (url) => {
        if (typeof url !== 'string') return url;

        // Loại bỏ query và fragment
        let cleanUrl = url.split('?')[0].split('#')[0];

        // Xử lý TikTok
        if (cleanUrl.includes('tiktok.com') || cleanUrl.includes('vt.tiktok.com')) {
            if (/vt\.tiktok\.com|tiktok\.com\/t\//.test(cleanUrl)) {
                return url; // giữ nguyên link redirect TikTok
            }
            const mMatch = cleanUrl.match(/m\.tiktok\.com\/v\/(\d+)\.html/);
            if (mMatch) {
                return `https://www.tiktok.com/video/${mMatch[1]}`;
            }
            const userVideoMatch = cleanUrl.match(/tiktok\.com\/@([\w.-]+)\/video\/(\d+)/);
            if (userVideoMatch) {
                return `https://www.tiktok.com/@${userVideoMatch[1]}/video/${userVideoMatch[2]}`;
            }
            const userPhotoMatch = cleanUrl.match(/tiktok\.com\/@([\w.-]+)\/photo\/(\d+)/);
            if (userPhotoMatch) {
                return `https://www.tiktok.com/@${userPhotoMatch[1]}/photo/${userPhotoMatch[2]}`;
            }
            const videoMatch = cleanUrl.match(/tiktok\.com\/video\/(\d+)/);
            if (videoMatch) {
                return `https://www.tiktok.com/video/${videoMatch[1]}`;
            }
            return cleanUrl;
        }

        // Xử lý Instagram: chỉ giữ lại đường dẫn gốc
        if (cleanUrl.includes('instagram.com')) {
            return cleanUrl;
        }

        // Xử lý YouTube
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            const ytMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&#?]|$)/);
            if (ytMatch) {
                return `https://www.youtube.com/watch?v=${ytMatch[1]}`;
            }
        }

        // Mặc định: trả về URL không có query và fragment
        return cleanUrl;
    };

    // if (!filteredServers || filteredServers.length === 0) {
    //     return (
    //         <div className="main-content">
    //             <div className="row">
    //                 <div className="col-md-12 col-lg-8">
    //                     <div className="card">
    //                         <div className="card-body">
    //                             <h3 className="card-title d-flex align-items-center gap-2 mb-4u">
    //                             </h3>
    //                             <form onSubmit={handleSubmit}>
    //                                 <>
    //                                     <div className="form-group mb-3">
    //                                         <label htmlFor="object_id" className="form-label">
    //                                             <strong>Link Hoặc UID:</strong>
    //                                         </label>
    //                                         <input
    //                                             className="form-control ipt-link"
    //                                             type="text"
    //                                             value={isConverting ? "Đang xử lý..." : displayLink}
    //                                             onChange={(e) => {
    //                                                 let val = e.target.value.replace(/\s+/g, ''); // Bỏ tất cả khoảng trắng
    //                                                 // Nếu là link TikTok thì rút gọn
    //                                                 if (val !== "") {
    //                                                     val = shortenSocialLink(val);
    //                                                 }
    //                                                 setRawLink(val);
    //                                                 setConvertedUID("");
    //                                             }}
    //                                             placeholder="Nhập link hoặc ID tùy các máy chủ"
    //                                             disabled={isConverting}
    //                                         />
    //                                     </div>

    //                                     <div className="form-group mb-3">
    //                                         <label className="form-label">
    //                                             {/* <>Máy chủ:</strong> */}
    //                                             <strong>Chọn máy chủ ( ấn vào máy chủ để đọc lưu ý )</strong>

    //                                         </label>
    //                                         <label className="form-label">
    //                                             <h3>CHƯA CÓ MÁY CHỦ NÀO VUI LÒNG IB ADMIN  </h3>
    //                                         </label>
    //                                     </div>

    //                                     <div className="form-group mb-3">
    //                                         <label htmlFor="note" className="form-label">
    //                                             <strong>Ghi chú:</strong>
    //                                         </label>
    //                                         <textarea
    //                                             className="form-control"

    //                                             value={note}
    //                                             onChange={(e) => setNote(e.target.value)}
    //                                             placeholder="Ghi chú đơn hàng"
    //                                         />
    //                                     </div>
    //                                     {(() => {
    //                                         const selectedService = filteredServers.find(
    //                                             (service) => service.Magoi === selectedMagoi
    //                                         );
    //                                         const qty =
    //                                             selectedService && selectedService.comment === "on"
    //                                                 ? cmtqlt
    //                                                 : quantity;
    //                                         return (
    //                                             <div className="form-group mb-3">
    //                                                 <div className="alert bg-primary text-center text-white">
    //                                                     <h3 className="alert-heading">
    //                                                         Tổng thanh toán:{" "}
    //                                                         <span className="text-danger">
    //                                                             {Number(totalCost).toLocaleString("en-US")}
    //                                                         </span>{" "}
    //                                                         VNĐ
    //                                                     </h3>
    //                                                     <p className="fs-5 mb-0">{tien}</p>
    //                                                     <p className="fs-4 mb-0">
    //                                                         Bạn sẽ tăng{" "}
    //                                                         <span className="text-danger">{qty} </span>số lượng với giá{" "}
    //                                                         <span className="text-danger">{rate}</span> đ
    //                                                     </p>
    //                                                 </div>
    //                                             </div>
    //                                         );
    //                                     })()}
    //                                     <div className="form-group">
    //                                         <button
    //                                             type="submit"
    //                                             className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
    //                                         >
    //                                             <i className="fas fa-shopping-cart"></i>
    //                                             {isSubmitting ? "Đang xử lý..." : "Tạo đơn hàng"}
    //                                         </button>
    //                                     </div>
    //                                 </>
    //                             </form>
    //                             {isSubmitting && (
    //                                 <div className="overlay">
    //                                     <div className="spinner-container">
    //                                         <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
    //                                             <div className="spinner-border text-primary" role="status" />
    //                                             <span className="ms-2">Đang xử lý</span>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <div className="col-md-12 col-lg-4">
    //                     <div className="alert alert-danger bg-danger text-white mb-3">
    //                         <h5 className="alert-heading">Lưu ý</h5>
    //                         <span>
    //                             Nghiêm cấm buff các đơn có nội dung vi phạm pháp luật, chính trị, đồ trụy...
    //                             Nếu cố tình buff bạn sẽ bị trừ hết tiền và ban khỏi hệ thống vĩnh viễn, và phải chịu hoàn toàn trách nhiệm trước pháp luật.
    //                             Nếu đơn đang chạy trên hệ thống mà bạn vẫn mua ở các hệ thống bên khác hoặc đè nhiều đơn, nếu có tình trạng hụt, thiếu số lượng giữa 2 bên thì sẽ không được xử lí.
    //                             Đơn cài sai thông tin hoặc lỗi trong quá trình tăng hệ thống sẽ không hoàn lại tiền.
    //                             Nếu gặp lỗi hãy nhắn tin hỗ trợ phía bên phải góc màn hình hoặc vào mục liên hệ hỗ trợ để được hỗ trợ tốt nhất.
    //                         </span>
    //                     </div>
    //                     <div className="alert alert-primary bg-primary text-white">
    //                         <h5 className="alert-heading">Các trường hợp huỷ đơn hoặc không chạy</h5>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }
    return (
        <div className="main-content">
            <Modalnote modal_Show={modal_Show.modal_show} />
            <div className="col-md-12 mb-4">
                <div className="row">
                    <div className="col-6 d-grid gap-2">
                        <button
                            className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "muadichvu" ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => setActiveTab("muadichvu")}
                        >
                            <i className="fa fa-shopping-cart"></i> Mua dịch vụ
                        </button>
                    </div>
                    <div className="col-6 d-grid gap-2">
                        <button
                            className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "danhsachdon" ? "btn-primary" : "btn-outline-primary"
                                }`}
                            onClick={() => setActiveTab("danhsachdon")}
                        >
                            <i className="fa fa-history"></i> Danh sách đơn
                        </button>
                    </div>
                </div>
            </div>
            {activeTab === "muadichvu" && (
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
                                            <label htmlFor="object_id" className="form-label text-dark">
                                                Link Hoặc UID :
                                                <a className="text-primary" onClick={() => setMultiLinkModal(true)}> Mua nhiều link cùng lúc
                                                </a>
                                            </label>
                                            <input
                                                className="form-control ipt-link"
                                                type="text"
                                                value={isConverting ? "Đang xử lý..." : displayLink}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\s+/g, ''); // Bỏ tất cả khoảng trắng
                                                    // Nếu là link TikTok thì rút gọn
                                                    if (val !== "") {
                                                        val = shortenSocialLink(val);
                                                        setObjectLink(val); // Lưu link gốc
                                                    }
                                                    setRawLink(val);
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
                                                    className="form-check mb-2 d-flex align-items-center gap-2 "
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
                                                            setQuantity(server.min); // Đặt giá trị mặc định cho quantity
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

                                                        <span className={`badge ms-1 ${server.isActive ? 'bg-success' : 'bg-danger'}`}>
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
                                                    <div key={index} >

                                                        <div className="alert text-white alert-info bg-info">
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
                                                        {/* <div className="alert text-white alert-info bg-info"> */}
                                                        <div >
                                                            <label className="form-label" data-lang="">Thời gian hoàn thành trung bình</label>
                                                            <br />
                                                            <small className="form-text text-muted fst-italic">Thời gian cập nhật : {new Date(server.updatedAt).toLocaleString("vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}</small>
                                                            <input type="text" value={server.tocdodukien} className="form-control form-control-solid" disabled="" />
                                                            <small className="form-text text-muted fst-italic"><span data-lang="">Thời gian trung bình hoàn thành số lượng 1000 của 10 đơn hàng gần nhất</span></small>
                                                        </div>
                                                        {/* <div className="alert text-white alert-info bg-info">
                                                        Tốc độ dự kiến {server.tocdodukien}
                                                    </div> */}

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
                                                )
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
                                                            đ
                                                            {/* -{" "}
                                                        <span class="text-danger">
                                                            {Number(totalCost / 25000)}
                                                        </span>{" "}
                                                        $ */}
                                                        </h3>
                                                        <p className="fs-5 mb-0">{tien} đ</p>
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
                                {/* {isSubmitting && (
                                <div className="overlay">
                                    <div className="spinner-container">
                                        <div style={{ minHeight: "200px" }} className="d-flex justify-content-center align-items-center">
                                            <div className="spinner-border text-primary" role="status" />
                                            <span className="ms-2">Đang xử lý</span>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-lg-4">
                        <div className="alert alert-warning fade show mt-3 border-0 rounded-10">
                            <h3 className="text-dark text-uppercase text-center">LƯU Ý NÊN ĐỌC TRÁNH MẤT TIỀN</h3>
                            <div>
                                {modal_Show.note ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: modal_Show.note,
                                        }}
                                    />
                                ) : (
                                    <span>
                                        Nghiêm cấm buff các đơn có nội dung vi phạm pháp luật, chính trị, đồ trụy...
                                        Nếu cố tình buff bạn sẽ bị trừ hết tiền và ban khỏi hệ thống vĩnh viễn, và phải chịu hoàn toàn trách nhiệm trước pháp luật.
                                        Nếu đơn đang chạy trên hệ thống mà bạn vẫn mua ở các hệ thống bên khác hoặc đè nhiều đơn, nếu có tình trạng hụt, thiếu số lượng giữa 2 bên thì sẽ không được xử lí.
                                        Đơn cài sai thông tin hoặc lỗi trong quá trình tăng hệ thống sẽ không hoàn lại tiền.
                                        Nếu gặp lỗi hãy nhắn tin hỗ trợ phía bên phải góc màn hình hoặc vào mục liên hệ hỗ trợ để được hỗ trợ tốt nhất.
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="alert alert-primary bg-primary text-white">
                            <h5 className="alert-heading">Các trường hợp huỷ đơn hoặc không chạy</h5>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal mua nhiều link */}
            <MultiLinkModal
                show={multiLinkModal}
                onHide={() => setMultiLinkModal(false)}
                filteredServers={filteredServers}
                selectedMagoi={selectedMagoi}
                setSelectedMagoi={setSelectedMagoi}
                isSubmitting={isSubmitting}
                quantity={quantity}
                setQuantity={setQuantity}
                setIsStopped={setIsStopped}
                isStopped={isStopped}
                cmtqlt={cmtqlt}
                setcomputedQty={setcomputedQty}
                setMin={setMin}
                comments={comments}
                setComments={setComments}
                setMax={setMax}
                min={min}
                max={max}
                multiLinkInput={multiLinkInput}
                setMultiLinkInput={setMultiLinkInput}
                multiLinkList={multiLinkList}
                setMultiLinkList={setMultiLinkList}
                selectedMultiLinks={selectedMultiLinks}
                setSelectedMultiLinks={setSelectedMultiLinks}
                rate={rate}
                setRate={setRate} // truyền thêm setRate
                handleMultiLinkSubmit={handleMultiLinkSubmit}
            />
            {activeTab === "danhsachdon" && (
                <div >
                    <div >
                        <Dondamua
                            showcmt={showcmt}
                            category={servers.length > 0 ? servers[0].category : path}
                        />
                    </div>

                </div>

            )}
        </div>
    );
}

