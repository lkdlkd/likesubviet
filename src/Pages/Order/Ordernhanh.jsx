import { loadingg } from "@/JS/Loading";
import { addOrder, getServer, getUid } from "@/Utils/api";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";
export default function Ordernhanh() {
    const { configWeb } = useOutletContext();
    // Các state của form
    const [servers, setServers] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
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
    const [ObjectLink, setObjectLink] = useState(""); // Lưu input gốc
    const [isConverting, setIsConverting] = useState(false);
    const [isScheduledOrder, setIsScheduledOrder] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [isMultiLink, setIsMultiLink] = useState(false); // Chế độ mua nhiều link
    const [multiLinks, setMultiLinks] = useState(""); // Lưu nhiều link (mỗi dòng 1 link)
    const token = localStorage.getItem("token");
    let decoded = {};
    if (token) {
        try {
            decoded = JSON.parse(atob(token.split(".")[1]));
        } catch (error) {
            // console.error("Token decode error:", error);
        }
    }
    const username = decoded.username;

    const formatDateTimeLocal = (date) => {
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
        return localISOTime.slice(0, 16);
    };

    const minScheduleTime = useMemo(() => {
        const minDate = new Date(Date.now() + 60 * 1000);
        return formatDateTimeLocal(minDate);
    }, []);

    const handleScheduleToggle = (checked) => {
        setIsScheduledOrder(checked);
        if (checked) {
            setScheduleTime((prev) => prev || formatDateTimeLocal(new Date(Date.now() + 5 * 60 * 1000)));
        } else {
            setScheduleTime("");
        }
    };

    const handleScheduleTimeChange = (value) => {
        setScheduleTime(value);
    };

    // Cập nhật danh sách servers khi `server` thay đổi
    useEffect(() => {
        loadingg("Vui lòng chờ...", true, 9999999); // Hiển thị loading khi bắt đầu fetch
        const fetchServers = async () => {
            try {
                const response = await getServer(token); // Gọi API với token
                setServers(response.data || []); // Cập nhật danh sách servers
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

        fetchServers(); // Gọi hàm fetchServers
    }, [token]); // Chỉ gọi lại khi token thay đổi

    // Khi servers thay đổi, set mặc định các lựa chọn đầu tiên
    useEffect(() => {
        if (servers.length > 0) {
            // Lấy type đầu tiên
            const firstType = servers[0].type;
            // Tìm server đầu tiên có type này để lấy logo (nếu có)
            const serverWithLogo = servers.find(s => s.type === firstType && s.logo);
            setSelectedType({
                value: firstType,
                label: (
                    <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {serverWithLogo && serverWithLogo.logo && (
                            <img src={serverWithLogo.logo} alt={firstType} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        )}
                        {firstType}
                    </span>
                ),
                rawLabel: firstType
            });
            // Lấy category đầu tiên theo type
            const firstCategory = servers.find(s => s.type === firstType)?.category;
            if (firstCategory) {
                // Tìm server đầu tiên có type và category này để lấy logo (nếu có)
                const serverWithLogoCat = servers.find(s => s.type === firstType && s.category === firstCategory && s.logo);
                setSelectedCategory({
                    value: firstCategory,
                    label: (
                        <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {serverWithLogoCat && serverWithLogoCat.logo && (
                                <img src={serverWithLogoCat.logo} alt={firstCategory} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                            )}
                            {firstCategory}
                        </span>
                    ),
                    rawLabel: firstCategory
                });
            }
            // Lấy server đầu tiên theo type và category
            const firstServer = servers.find(s => s.type === firstType && s.category === firstCategory);
            if (firstServer) {
                setSelectedMagoi(firstServer.Magoi);
                setMin(firstServer.min);
                setMax(firstServer.max);
                setRate(firstServer.rate);
            }
        }
    }, [servers]);

    // Tính toán danh sách các loại nền tảng (Type) độc nhất từ servers
    const uniqueTypes = useMemo(() => {
        if (!Array.isArray(servers)) return [];
        return Array.from(new Set(servers.map((server) => server.type)));
    }, [servers]);

    // Tạo options cho react-select cho Type (bổ sung logo)
    const typeOptions = uniqueTypes.map((type) => {
        // Tìm server đầu tiên có type này để lấy logo (nếu có)
        const serverWithLogo = servers.find(s => s.type === type && s.logo);
        return {
            value: type,
            label: (
                <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {serverWithLogo && serverWithLogo.logo && (
                        <img src={serverWithLogo.logo} alt={type} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    )}
                    {type}
                </span>
            ),
            rawLabel: type // giữ lại label gốc nếu cần
        };
    });

    // Nếu đã chọn một Type, tạo danh sách options cho Category dựa theo Type đó (bổ sung logo)
    const categoryOptions = useMemo(() => {
        if (!selectedType || !Array.isArray(servers)) return [];
        const categories = Array.from(
            new Set(
                servers
                    .filter((server) => server.type === (selectedType.value || selectedType.rawLabel))
                    .map((server) => server.category)
            )
        );
        return categories.map((cat) => {
            // Tìm server đầu tiên có type và category này để lấy logo (nếu có)
            const serverWithLogo = servers.find(s => (s.type === (selectedType.value || selectedType.rawLabel)) && s.category === cat && s.logo);
            return {
                value: cat,
                label: (
                    <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {serverWithLogo && serverWithLogo.logo && (
                            <img src={serverWithLogo.logo} alt={cat} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        )}
                        {cat}
                    </span>
                ),
                rawLabel: cat // giữ lại label gốc nếu cần
            };
        });
    }, [servers, selectedType]);

    // Lọc danh sách server theo Type và Category đã chọn
    const filteredServers = useMemo(() => {
        if (!Array.isArray(servers)) return [];
        return servers.filter((server) => {
            const matchType = selectedType ? server.type === selectedType.value : true;
            const matchCategory = selectedCategory
                ? server.category === selectedCategory.value
                : true;
            return matchType && matchCategory;
        });
    }, [servers, selectedType, selectedCategory]);

    // Handler cho khi chọn Type từ react-select
    const handleTypeChange = (option) => {
        if (option) {
            // Tìm server đầu tiên có type này để lấy logo (nếu có)
            const serverWithLogo = servers.find(s => s.type === option.value && s.logo);
            setSelectedType({
                value: option.value,
                label: (
                    <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {serverWithLogo && serverWithLogo.logo && (
                            <img src={serverWithLogo.logo} alt={option.value} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        )}
                        {option.value}
                    </span>
                ),
                rawLabel: option.value
            });
            // Tìm category đầu tiên theo type mới chọn
            const firstCategory = servers.find(s => s.type === option.value)?.category;
            if (firstCategory) {
                // Tìm server đầu tiên có type và category này để lấy logo (nếu có)
                const serverWithLogoCat = servers.find(s => s.type === option.value && s.category === firstCategory && s.logo);
                setSelectedCategory({
                    value: firstCategory,
                    label: (
                        <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {serverWithLogoCat && serverWithLogoCat.logo && (
                                <img src={serverWithLogoCat.logo} alt={firstCategory} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                            )}
                            {firstCategory}
                        </span>
                    ),
                    rawLabel: firstCategory
                });
                // Tìm server đầu tiên theo type và category
                const firstServer = servers.find(s => s.type === option.value && s.category === firstCategory);
                if (firstServer) {
                    setSelectedMagoi(firstServer.Magoi);
                    setMin(firstServer.min);
                    setMax(firstServer.max);
                    setRate(firstServer.rate);
                } else {
                    setSelectedMagoi("");
                }
            } else {
                setSelectedCategory(null);
                setSelectedMagoi("");
            }
        } else {
            setSelectedType(null);
            setSelectedCategory(null);
            setSelectedMagoi("");
        }
        setObjectLink(""); // Reset link gốc
        setTotalCost(0);
        setRawLink("");
        setConvertedUID("");
        setQuantity(100);
        setComments("");
        setNote("");
    };

    // Handler cho khi chọn Category từ react-select
    const handleCategoryChange = (option) => {
        setSelectedCategory(option);
        setObjectLink(""); // Reset link gốc
        setSelectedMagoi("");
        setTotalCost(0);
        setRawLink("");
        setConvertedUID("");
        setQuantity(100);
        setComments("");
        setNote("");

        if (option) {
            // Tìm server đầu tiên theo category (và type nếu có chọn)
            let firstServer;
            if (selectedType) {
                // Nếu đã chọn type cụ thể
                firstServer = servers.find(s => s.type === selectedType.value && s.category === option.value);
            } else {
                // Nếu chọn All (selectedType = null), tìm server đầu tiên theo category
                firstServer = servers.find(s => s.category === option.value);
            }

            if (firstServer) {
                setSelectedMagoi(firstServer.Magoi);
                setMin(firstServer.min);
                setMax(firstServer.max);
                setRate(firstServer.rate);
            } else {
                setSelectedMagoi("");
            }
        } else {
            setSelectedMagoi("");
        }
    };

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

        // Kiểm tra nếu server được chọn và `getid` là "on"
        const selectedService = filteredServers.find((service) => service.Magoi === selectedMagoi);
        if (!selectedService || selectedService.getid !== "on") {
            setConvertedUID(rawLink); // Nếu không cần get UID, sử dụng rawLink
            return;
        }

        setIsConverting(true);
        const timer = setTimeout(async () => {
            try {
                const res = await getUid({ link: rawLink });
                if (res.success && res.uid) {
                    setConvertedUID(res.uid);
                    toast.success("Chuyển đổi UID thành công!");

                } else {
                    toast.error(res.message || "Chuyển đổi UID thất bại!");
                    setConvertedUID("");
                }
            } catch (error) {
                toast.error(error.message || "Chuyển đổi UID thất bại!");
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

        // Xử lý chế độ mua nhiều link
        if (isMultiLink) {
            const links = multiLinks.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
            if (links.length === 0 || !selectedMagoi) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Vui lòng chọn dịch vụ và nhập ít nhất 1 link.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
                return;
            }
            const selectedService = filteredServers.find(
                (service) => service.Magoi === selectedMagoi
            );
            const qty = selectedService && selectedService.comment === "on" ? cmtqlt : quantity;
            if (!qty || Number(qty) <= 0) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Vui lòng nhập số lượng hợp lệ.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
                return;
            }
            if (isScheduledOrder) {
                if (!scheduleTime) {
                    Swal.fire({
                        title: "Lỗi",
                        text: "Vui lòng chọn thời gian hẹn giờ.",
                        icon: "error",
                        confirmButtonText: "Xác nhận",
                    });
                    return;
                }
                const scheduleDate = new Date(scheduleTime);
                if (Number.isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
                    Swal.fire({
                        title: "Lỗi",
                        text: "Thời gian hẹn giờ phải lớn hơn thời điểm hiện tại.",
                        icon: "error",
                        confirmButtonText: "Xác nhận",
                    });
                    return;
                }
            }
            const totalCostMulti = links.length * (selectedService && selectedService.comment === "on" ? cmtqlt * selectedService.rate : quantity * rate);
            const confirmResult = await Swal.fire({
                title: "Xác nhận thanh toán",
                html: `Bạn sẽ tạo <b>${links.length}</b> đơn hàng, mỗi đơn <b>${qty}</b> lượng </b><br/>Tổng thanh toán: <b>${Math.round(totalCostMulti).toLocaleString("de-DE")} VNĐ</b>.`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Hủy",
            });
            if (confirmResult.isConfirmed) {
                loadingg("Đang xử lý đơn hàng...", true, 9999999);
                let successCount = 0;
                let failCount = 0;
                const failedLinks = [];
                for (const link of links) {
                    try {
                        const shortenedLink = shortenSocialLink(link);
                        const payload = {
                            link: shortenedLink,
                            category: selectedCategory ? selectedCategory.value : "",
                            magoi: selectedMagoi,
                            note,
                            ObjectLink: shortenedLink,
                            isScheduled: isScheduledOrder,
                            scheduleTime: isScheduledOrder ? scheduleTime : undefined,
                        };
                        if (selectedService && selectedService.comment === "on") {
                            payload.quantity = qty;
                            payload.comments = comments;
                        } else {
                            payload.quantity = quantity;
                        }
                        const res = await addOrder(payload, token);
                        if (res.success) {
                            successCount++;
                        } else {
                            failCount++;
                            failedLinks.push(link);
                        }
                    } catch (error) {
                        failCount++;
                        failedLinks.push(link);
                    }
                }
                loadingg("", false);
                if (failCount === 0) {
                    await Swal.fire({
                        title: "Thành công",
                        html: `Đã tạo thành công <b>${successCount}</b> đơn hàng!`,
                        icon: "success",
                        confirmButtonText: "Xác nhận",
                    });
                    setMultiLinks("");
                } else {
                    await Swal.fire({
                        title: "Hoàn tất",
                        html: `Thành công: <b>${successCount}</b> đơn.<br/>Thất bại: <b>${failCount}</b> đơn.`,
                        icon: successCount > 0 ? "warning" : "error",
                        confirmButtonText: "Xác nhận",
                    });
                }
                setIsScheduledOrder(false);
                setScheduleTime("");
            }
            return;
        }

        // Xử lý chế độ mua 1 link (code cũ)
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
        if (!qty || Number(qty) <= 0) {
            Swal.fire({
                title: "Lỗi",
                text: "Vui lòng nhập số lượng hợp lệ.",
                icon: "error",
                confirmButtonText: "Xác nhận",
            });
            return;
        }
        if (isScheduledOrder) {
            if (!scheduleTime) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Vui lòng chọn thời gian hẹn giờ.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
                return;
            }
            const scheduleDate = new Date(scheduleTime);
            if (Number.isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Thời gian hẹn giờ phải lớn hơn thời điểm hiện tại.",
                    icon: "error",
                    confirmButtonText: "Xác nhận",
                });
                return;
            }
        }
        const confirmResult = await Swal.fire({
            title: isScheduledOrder
                ? `Bạn sẽ tăng số lượng ${qty} <br/>Tổng dự kiến: ${Math.round(totalCost).toLocaleString("de-DE")} VNĐ.<br/>Đơn sẽ chạy vào ${new Date(scheduleTime).toLocaleString("vi-VN")}.`
                : `Bạn sẽ tăng số lượng ${qty} <br/>Tổng thanh toán: ${Math.round(totalCost).toLocaleString("de-DE")} VNĐ.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (confirmResult.isConfirmed) {
            loadingg("Đang xử lý đơn hàng...", true, 9999999); // Hiển thị loading cho đến khi có response, không tự động tắt
            try {
                const wasScheduledOrder = isScheduledOrder;
                const payload = {
                    link: finalLink,
                    category: selectedCategory ? selectedCategory.value : "",
                    magoi: selectedMagoi,
                    note,
                    ObjectLink: ObjectLink, // Lưu input gốc
                    isScheduled: isScheduledOrder,
                    scheduleTime: isScheduledOrder ? scheduleTime : undefined,
                };
                if (selectedService && selectedService.comment === "on") {
                    payload.quantity = qty;
                    payload.comments = comments;
                } else {
                    payload.quantity = quantity;
                }

                const res = await addOrder(payload, token);
                if (res.success) {
                    loadingg("", false); // Đóng loading khi xong
                    setRawLink("");
                    setConvertedUID("");
                    await Swal.fire({
                        title: "Thành công",
                        text: `${res.message}! ${wasScheduledOrder ? "" : `Mã đơn: ${res.orderId || res.order?.Madon || 'N/A'}`}` || (wasScheduledOrder ? "Đơn đã được hẹn giờ thành công" : "Mua dịch vụ thành công"),
                        icon: "success",
                        confirmButtonText: "Xác nhận",
                    });
                    setIsScheduledOrder(false);
                    setScheduleTime("");
                }

            } catch (error) {
                loadingg("", false); // Đóng loading khi xong
                Swal.fire({
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
    const convertNumberToWords = (number) => {
        const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

        function docSoHangTram(so, coHangTramPhiaTruoc = false) {
            let tram = Math.floor(so / 100);
            let chuc = Math.floor((so % 100) / 10);
            let donvi = so % 10;
            let ketqua = "";

            if (tram > 0) {
                ketqua += `${chuSo[tram]} trăm `;
            } else if (coHangTramPhiaTruoc && (chuc > 0 || donvi > 0)) {
                ketqua += "không trăm ";
            }

            if (chuc > 1) {
                ketqua += `${chuSo[chuc]} mươi `;
                if (donvi === 1) {
                    ketqua += "mốt";
                } else if (donvi === 5) {
                    ketqua += "lăm";
                } else if (donvi > 0) {
                    ketqua += chuSo[donvi];
                }
            } else if (chuc === 1) {
                ketqua += "mười ";
                if (donvi === 5) {
                    ketqua += "lăm";
                } else if (donvi > 0) {
                    ketqua += chuSo[donvi];
                }
            } else if (chuc === 0 && donvi > 0) {
                if (tram > 0 || coHangTramPhiaTruoc) {
                    ketqua += "lẻ ";
                }
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

            if (hangTy > 0) {
                result += `${docSoHangTram(hangTy)} tỷ `;
            }
            if (hangTrieu > 0) {
                result += `${docSoHangTram(hangTrieu, hangTy > 0)} triệu `;
            }
            if (hangNghin > 0) {
                result += `${docSoHangTram(hangNghin, hangTy > 0 || hangTrieu > 0)} nghìn `;
            }
            if (hangDonVi > 0) {
                result += `${docSoHangTram(hangDonVi, hangTy > 0 || hangTrieu > 0 || hangNghin > 0)}`;
            }

            return result.trim();
        }

        // Chuyển về số nguyên (làm tròn)
        const soNguyen = Math.round(Number(number));

        let ketQua = docSoNguyen(soNguyen);

        // Viết hoa chữ cái đầu
        ketQua = ketQua.charAt(0).toUpperCase() + ketQua.slice(1);
        return ketQua;
    };
    const tien = useMemo(() => convertNumberToWords(totalCost), [totalCost]);
    // Tạo options cho Select tìm dịch vụ nhanh (chỉ giữ 1 useMemo, mỗi option có server)
    const serviceOptions = useMemo(() => {
        // Lấy thứ tự category xuất hiện đầu tiên
        const categoryOrder = [];
        servers.forEach(s => {
            if (s.category && !categoryOrder.includes(s.category)) {
                categoryOrder.push(s.category);
            }
        });
        // Sắp xếp theo thứ tự category xuất hiện trong dữ liệu
        const sorted = [...servers].sort((a, b) => {
            const aIdx = categoryOrder.indexOf(a.category);
            const bIdx = categoryOrder.indexOf(b.category);
            return aIdx - bIdx;
        });
        // Hàm strip HTML để lấy text thuần từ name
        const stripHtml = (html) => {
            if (!html) return '';
            return html.replace(/<[^>]*>/g, '').trim();
        };
        return sorted.map((s) => ({
            value: s.Magoi,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="font-semibold"> {s.logo && (
                        <img src={s.logo} alt={s.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    )} <strong className="badge bg-info">[{s.Magoi}]</strong> - {s.maychu} <span style={{ lineHeight: "1.2", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: s.name }} /> <span className="badge bg-primary">{configWeb?.priceDisplayUnit === 1000 ? `${Math.round(s.rate * 1000).toLocaleString('de-DE')}đ / 1000` : `${s.rate}đ`}</span>
                        {!s.isActive && (<span className="badge ms-1 bg-danger"> Bảo trì</span>)}
                        {s.refil === "on" && (<span className="badge bg-success ms-1"> Bảo hành</span>)}
                        {s.cancel === "on" && (<span className="badge bg-warning ms-1"> Có hủy hoàn</span>)}
                    </span>

                </div>
            ),
            // Thêm searchLabel để tìm kiếm theo tên hoặc Magoi
            searchLabel: `${s.Magoi} ${stripHtml(s.name)} ${s.maychu || ''} ${s.category || ''} ${s.type || ''}`,
            server: s
        }));
    }, [servers, configWeb?.priceDisplayUnit]);




    const shortenSocialLink = (url) => {
        if (typeof url !== 'string') return url;
        // Nếu là Facebook hoặc fb thì trả về nguyên bản
        if (/facebook\.com|fb\.com/i.test(url)) {
            return url;
        }
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

    // const typeOptions = uniqueTypes.map((type) => {
    //     // Tìm server đầu tiên có type này để lấy logo (nếu có)
    //     const serverWithLogo = servers.find(s => s.type === type && s.logo);
    //     return {
    //         value: type,
    //         label: (
    //             <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    //                 {serverWithLogo && serverWithLogo.logo && (
    //                     <img src={serverWithLogo.logo} alt={type} style={{ width: 24, height: 24, objectFit: 'contain' }} />
    //                 )}
    //                 {type}
    //             </span>
    //         ),
    //         rawLabel: type // giữ lại label gốc nếu cần
    //     };
    // });
    const serverOptions = filteredServers.map(server => {
        // Lấy logo từ server.logo nếu có
        return {
            value: server.Magoi,
            label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="font-semibold"> {server.logo && (
                        <img src={server.logo} alt={server.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    )} <strong className="badge bg-info">[{server.Magoi}]</strong> - {server.maychu} <span style={{ lineHeight: "1.2", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: server.name }} /> <span className="badge bg-primary">{configWeb?.priceDisplayUnit === 1000 ? `${Math.round(server.rate * 1000).toLocaleString('de-DE')}đ / 1000` : `${server.rate}đ`}
                        </span>
                        {!server.isActive && (<span className="badge ms-1 bg-danger"> Bảo trì</span>)}
                        {server.refil === "on" && (<span className="badge bg-success ms-1"> Bảo hành</span>)}
                        {server.cancel === "on" && (<span className="badge bg-warning ms-1"> Có hủy hoàn</span>)}
                    </span>

                </div>
            ),
            server
        };

    });
    return (
        <div className="main-content">
            <div className="row">
                <div className="col-md-12 col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <h3 className="card-title d-flex align-items-center gap-2 mb-3">
                                <span className="text-primary">Tạo đơn hàng mới: </span>
                            </h3>
                            <div className="form-group mb-3">
                                <label className="form-label fw-semibold">TÌM DỊCH VỤ:</label>
                                <Select
                                    className="mb-3"
                                    options={serviceOptions}
                                    value={serviceOptions.find(opt => opt.value === selectedMagoi) || null}
                                    onChange={opt => {
                                        if (opt) {
                                            // Lấy logo cho type
                                            setSelectedType(opt.server.type ? {
                                                value: opt.server.type,
                                                label: (
                                                    <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {opt.server.logo && (
                                                            <img src={opt.server.logo} alt={opt.server.type} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                                        )}
                                                        {opt.server.type}
                                                    </span>
                                                ),
                                                rawLabel: opt.server.type
                                            } : null);
                                            // Lấy logo cho category
                                            setSelectedCategory(opt.server.category ? {
                                                value: opt.server.category,
                                                label: (
                                                    <span className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {opt.server.logo && (
                                                            <img src={opt.server.logo} alt={opt.server.category} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                                        )}
                                                        {opt.server.category}
                                                    </span>
                                                ),
                                                rawLabel: opt.server.category
                                            } : null);
                                            setSelectedMagoi(opt.value);
                                            setMin(opt.server.min);
                                            setMax(opt.server.max);
                                            setRate(opt.server.rate);
                                        } else {
                                            setSelectedMagoi("");
                                        }
                                    }}
                                    placeholder="---Tìm dịch vụ theo tên hoặc mã---"
                                    isClearable
                                    isSearchable
                                    filterOption={(option, inputValue) => {
                                        if (!inputValue) return true;
                                        const searchText = inputValue.toLowerCase();
                                        // Tìm theo searchLabel (chứa Magoi, name, maychu, category, type)
                                        return option.data.searchLabel?.toLowerCase().includes(searchText) || 
                                               option.value?.toLowerCase().includes(searchText);
                                    }}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <div className="row g-2 align-items-end">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold md-2">NỀN TẢNG:</label>
                                        <Select
                                            value={selectedType}
                                            onChange={handleTypeChange}
                                            options={typeOptions}
                                            placeholder="Chọn nền tảng"
                                            isClearable
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold mb-2">DỊCH VỤ:</label>
                                        <Select
                                            value={selectedCategory}
                                            onChange={handleCategoryChange}
                                            options={categoryOptions}
                                            placeholder="Chọn phân loại"
                                            isClearable
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-semibold mb-2" >CHỌN MÁY CHỦ</label>
                                <Select
                                    options={serverOptions}
                                    value={serverOptions.find(opt => opt.value === selectedMagoi) || null}
                                    onChange={opt => {
                                        if (opt) {
                                            setSelectedMagoi(opt.value);
                                            setMin(opt.server.min);
                                            setMax(opt.server.max);
                                            setRate(opt.server.rate);
                                        } else {
                                            setSelectedMagoi("");
                                        }
                                    }}
                                    placeholder="Chọn máy chủ"
                                    isClearable
                                />
                            </div>
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
                                                dangerouslySetInnerHTML={{ __html: server.description ? server.description.replace(/\\n/g, '<br>') : '' }}
                                            />
                                        </div>
                                        {/* <div >
                                            <label className="form-label" data-lang="">Thời gian hoàn thành trung bình</label>
                                            <input type="text" value={server.tocdodukien} className="form-control form-control-solid" disabled="" />
                                            <small className="form-text text-muted fst-italic"><span data-lang="">Thời gian trung bình hoàn thành số lượng 1000 của 10 đơn hàng gần nhất</span></small>
                                        </div> */}
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
                                    </div>
                                )
                            ))}
                            {/* {servers.map((server, index) => (
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
                            ))} */}
                            <form onSubmit={handleSubmit}>
                                {/* Toggle mua nhiều link */}
                                <div className="form-group mb-1 form-switch d-flex align-items-center gap-2">
                                    <input
                                        id="multiLinkToggle"
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={isMultiLink}
                                        onChange={(e) => {
                                            setIsMultiLink(e.target.checked);
                                            if (e.target.checked) {
                                                // Chuyển sang chế độ nhiều link
                                                setRawLink("");
                                                setConvertedUID("");
                                            } else {
                                                // Chuyển về chế độ 1 link
                                                setMultiLinks("");
                                            }
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="multiLinkToggle">
                                        Đặt nhiều link
                                    </label>
                                    {isMultiLink && (
                                        <span className="badge bg-info ms-2">
                                            {multiLinks.split(/\r?\n/).filter(l => l.trim() !== "").length} link
                                        </span>
                                    )}
                                </div>

                                <div className="form-group mb-3">
                                    <label htmlFor="object_id" className="form-label">
                                        <strong>Link Hoặc UID:</strong>
                                    </label>
                                    {isMultiLink ? (
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={multiLinks}
                                            onChange={(e) => setMultiLinks(e.target.value)}
                                            placeholder="Nhập mỗi link 1 dòng&#10;https://example.com/link1&#10;https://example.com/link2&#10;https://example.com/link3"
                                        />
                                    ) : (
                                        <input
                                            className="form-control ipt-link"
                                            type="text"
                                            value={isConverting ? "Đang xử lý..." : displayLink}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\s+/g, ''); // Bỏ tất cả khoảng trắng
                                                // Nếu là link TikTok thì rút gọn
                                                if (val !== "") {
                                                    val = shortenSocialLink(val);
                                                    setObjectLink(val); // Lưu input gốc
                                                }
                                                setRawLink(val);
                                                setConvertedUID("");
                                            }}
                                            placeholder="Nhập link hoặc ID tùy các máy chủ"
                                            disabled={isConverting}
                                        />
                                    )}
                                    {isMultiLink && (
                                        <small className="form-text text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            Mỗi link sẽ tạo 1 đơn hàng riêng với cùng số lượng và cấu hình.
                                        </small>
                                    )}
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
                                                    Số lượng: <span id="quantity_limit">({Number(min).toLocaleString("de-DE")} ~ {Number(max).toLocaleString("de-DE")})</span>
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
                                                        Số lượng: <span id="quantity_limit">({Number(min).toLocaleString("de-DE")} ~ {Number(max).toLocaleString("de-DE")})</span>
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
                                <div className="form-group mb-3 form-switch d-flex align-items-center gap-2">
                                    <input
                                        id="scheduleToggle"
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={isScheduledOrder}
                                        onChange={(e) => handleScheduleToggle(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="scheduleToggle">
                                        Hẹn giờ chạy đơn
                                    </label>
                                </div>
                                {isScheduledOrder && (
                                    <div className="form-group mb-3">
                                        <label htmlFor="scheduleTime" className="form-label">
                                            <strong>Thời gian hẹn giờ:</strong>
                                        </label>
                                        <input
                                            id="scheduleTime"
                                            type="datetime-local"
                                            className="form-control"
                                            value={scheduleTime}
                                            min={minScheduleTime}
                                            onChange={(e) => handleScheduleTimeChange(e.target.value)}
                                        />
                                        <small className="form-text text-muted">Thời gian phải lớn hơn hiện tại tối thiểu 1 phút.</small>
                                    </div>
                                )}
                                <div className="form-group mb-3">
                                    <label htmlFor="note" className="form-label">
                                        <strong>Ghi chú:</strong>
                                    </label>
                                    <textarea
                                        value={note}
                                        className="form-control"
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
                                    const linkCount = isMultiLink ? multiLinks.split(/\r?\n/).filter(l => l.trim() !== "").length : 1;
                                    const totalCostDisplay = isMultiLink ? totalCost * linkCount : totalCost;
                                    const tienDisplay = convertNumberToWords(totalCostDisplay);
                                    return (
                                        <div className="form-group mb-3">
                                            <div className="alert bg-primary text-center text-white">
                                                <h3 className="alert-heading">
                                                    Tổng thanh toán:{" "}
                                                    <span className="text-danger">
                                                        {Math.round(Number(totalCostDisplay)).toLocaleString("de-DE")}
                                                    </span>{" "}
                                                    VNĐ
                                                </h3>
                                                <p className="fs-5 mb-0">{tienDisplay} đ</p>
                                                {isMultiLink ? (
                                                    <p className="fs-4 mb-0">
                                                        Bạn sẽ tạo{" "}
                                                        <span className="text-danger">{linkCount} </span>đơn hàng, mỗi đơn{" "}
                                                        <span className="text-danger">{qty} </span>lượng 
                                                    </p>
                                                ) : (
                                                    <p className="fs-4 mb-0">
                                                        Bạn sẽ tăng{" "}
                                                        <span className="text-danger">{qty} </span>số lượng 
                                                    </p>
                                                )}
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
                    <div className="alert alert-warning fade show mt-3 border-0 rounded-10">
                        <h3 className="text-dark text-uppercase text-center">LƯU Ý NÊN ĐỌC TRÁNH MẤT TIỀN</h3>
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
};

