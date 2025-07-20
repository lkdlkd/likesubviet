import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import { loadingg } from "@/JS/Loading";
import { getUid, addOrder, getServer } from "@/Utils/api";
import { toast } from "react-toastify";

export default function Ordernhanh() {
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
    const [searchService, setSearchService] = useState(null);
    const navigate = useNavigate();
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            loadingg("Đang xử lý đơn hàng...", true, 9999999); // Hiển thị loading cho đến khi có response, không tự động tắt
            try {
                const payload = {
                    link: finalLink,
                    category: selectedCategory ? selectedCategory.value : "",
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
        return sorted.map((s) => ({
            value: s.Magoi,
            label: `${s.Magoi} - ${s.maychu} ${s.name} - ${Number(s.rate).toLocaleString("en-US")}đ`,
            server: s
        }));
    }, [servers]);




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
                    {server.logo && (
                        <img src={server.logo} alt={server.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    )}
                    <strong className="badge bg-info">[{server.Magoi}]</strong>
                    <span className="font-semibold"> - {server.maychu} {server.name} </span>
                    <span className="badge bg-primary">{Number(server.rate).toLocaleString("en-US")}đ</span>
                    <span className={`badge ms-1 ${server.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {server.isActive ? "Hoạt động" : "Không hoạt động"}
                    </span>
                    {server.refil === "on" && (
                        <span className="badge bg-success ">Bảo hành</span>
                    )}
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
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                                        setSearchService(opt);
                                    }}
                                    placeholder="---Tìm dịch vụ---"
                                    isClearable
                                    isSearchable
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
                                                dangerouslySetInnerHTML={{ __html: server.description }}
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
                                <div className="form-group mb-3">
                                    <label htmlFor="object_id" className="form-label">
                                        <strong>Link Hoặc UID:</strong>
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
                                                setObjectLink(val); // Lưu input gốc
                                            }
                                            setRawLink(val);
                                            setConvertedUID("");
                                        }}
                                        placeholder="Nhập link hoặc ID tùy các máy chủ"
                                        disabled={isConverting}
                                    />
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

