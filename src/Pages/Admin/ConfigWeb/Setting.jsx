import React, { useState, useEffect, useRef } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { loadingg } from "@/JS/Loading";
import Swal from "sweetalert2";

// Suppress ResizeObserver errors
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Handle ResizeObserver errors
window.addEventListener('error', e => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
        e.message === 'ResizeObserver loop limit exceeded') {
        const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
        const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
        if (resizeObserverErr) {
            resizeObserverErr.setAttribute('style', 'display: none');
        }
        if (resizeObserverErrDiv) {
            resizeObserverErrDiv.setAttribute('style', 'display: none');
        }
    }
});

// const platformLogos = {
//     Gmail : "/img/gmail.png",
//     Zalo : "/img/zalo13.png",
//     Facebook: "/img/fb.png",
//     TikTok: "/img/tiktok.gif",
//     Instagram: "/img/instagram.gif",
//     Twitter: "/img/twitter.gif",
//     Telegram: "/img/telegram.gif",
//     Discord: "/img/discord.gif",
//     Thread: "/img/thread.gif",
// };
const images = require.context('@/assets/img/', false, /\.(png|jpe?g|gif)$/); // false: không lấy thư mục con
const platformLogos = {};
images.keys().forEach((key) => {
    const name = key.replace('./', '').replace(/\.[^/.]+$/, '');
    if (!name.includes('/')) {
        platformLogos[name.charAt(0).toUpperCase() + name.slice(1)] = images(key);
    }
});
// Danh sách favicon có sẵn
const faviconList = [
    { url: "/img/favicon.png", label: "Favicon mặc định" },
    { url: "/img/favicon1.png", label: "Logo 1" },
    // Thêm favicon khác nếu muốn
];

const Setting = () => {
    const [formData, setFormData] = useState({
        tieude: "",
        title: "",
        logo: "",
        favicon: "",
        linktele: "",
        lienhe: [
            { type: "", value: "", logolienhe: "" },
        ],
        viewluotban: false,
        autoactive: false,
        autoremove: false, // Thêm trường autoremove
        autoDeleteMonths: "", // Thêm trường autoDeleteMonths
        deleteOrders: false, // Xóa đơn hàng
        deleteUsers: false, // Xóa user không nạp tiền
        deleteHistory: false, // Xóa lịch sử
        cuphap: "", // Thêm trường cuphap
        daily: "", // Thêm trường daily (đại lý)
        distributor: "", // Thêm trường distributor (nhà phân phối)
        headerJs: "", // Mã JS header
        footerJs: "", // Mã JS footer
    });
    const [loading, setLoading] = useState(false);
    const editorRef = useRef(null);
    const fetchConfig = async () => {
        try {
            loadingg("Đang tải cấu hình website...", true, 9999999);
            const token = localStorage.getItem("token");
            const config = await getConfigWeb(token);
            setFormData({
                ...config.data,
                lienhe: Array.isArray(config.data.lienhe) ? config.data.lienhe : [],
                cuphap: config.data.cuphap || "", // Lấy giá trị cuphap từ API
                linktele: config.data.linktele || "",
                daily: config.data.daily || "", // Lấy giá trị daily từ API
                distributor: config.data.distributor || "", // Lấy giá trị distributor từ API
                viewluotban: config.data.viewluotban || false, // Lấy giá trị viewluotban từ API
                autoactive: config.data.autoactive || false, // Lấy giá trị autoactive từ API
                autoremove: config.data.autoremove || false, // Lấy giá trị autoremove từ API
                autoDeleteMonths: config.data.autoDeleteMonths || "", // Lấy giá trị autoDeleteMonths từ API
                deleteOrders: config.data.deleteOrders || false, // Xóa đơn hàng
                deleteUsers: config.data.deleteUsers || false, // Xóa user không nạp tiền
                deleteHistory: config.data.deleteHistory || false, // Xóa lịch sử
                headerJs: config.data.headerJs || "", // Lấy giá trị headerJs từ API
                footerJs: config.data.footerJs || "", // Lấy giá trị footerJs từ API
            });
        } catch (error) {
            toast.error("Không thể tải cấu hình website!");
        } finally {
            loadingg("", false);
        }
    };
    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        loadingg("Đang lưu cấu hình website...", true, 9999999);
        try {
            const token = localStorage.getItem("token");
            const sanitizedData = {
                tieude: formData.tieude,
                title: formData.title,
                logo: formData.logo,
                favicon: formData.favicon,
                lienhe: formData.lienhe.filter(
                    (contact) => contact.type || contact.value || contact.logolienhe
                ),
                cuphap: formData.cuphap, // Gửi trường cuphap lên API
                linktele: formData.linktele, // Gửi trường linktele lên API
                daily: formData.daily, // Gửi trường daily lên API
                distributor: formData.distributor, // Gửi trường distributor lên API
                viewluotban: formData.viewluotban, // Gửi trường viewluotban lên API
                autoactive: formData.autoactive, // Gửi trường autoactive lên API
                autoremove: formData.autoremove, // Gửi trường autoremove lên API
                autoDeleteMonths: formData.autoDeleteMonths, // Gửi trường autoDeleteMonths lên API
                deleteOrders: formData.deleteOrders, // Xóa đơn hàng
                deleteUsers: formData.deleteUsers, // Xóa user không nạp tiền
                deleteHistory: formData.deleteHistory, // Xóa lịch sử
                headerJs: formData.headerJs, // Gửi mã JS header lên API
                footerJs: formData.footerJs, // Gửi mã JS footer lên API
            };
            await updateConfigWeb(sanitizedData, token);
            fetchConfig(); // Tải lại cấu hình sau khi cập nhật
            toast.success("Cập nhật cấu hình thành công!");
        } catch (error) {
            toast.error("Cập nhật cấu hình thất bại!");
        } finally {
            setLoading(false);
            loadingg("", false);
        }
    };

    const updateContact = (index, field, value) => {
        const updatedContacts = [...formData.lienhe];
        updatedContacts[index][field] = value;
        setFormData({ ...formData, lienhe: updatedContacts });
    };

    const addContact = () => {
        if (formData.lienhe.length >= 10) {
            toast.warning("Chỉ có thể thêm tối đa 10 liên hệ!");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            lienhe: [...prev.lienhe, { type: "", value: "", logolienhe: "" }],
        }));
    };

    const removeContact = (index) => {
        const updatedContacts = formData.lienhe.filter((_, i) => i !== index);
        setFormData({ ...formData, lienhe: updatedContacts });
    };

    return (
        <div className="row">
            <div className="col-md-12">
                <div className="card border-0 shadow-lg">
                    <div className="card-header bg-gradient-primary text-white border-0 py-3">
                        <div className="d-flex align-items-center">
                            <div className="icon-circle bg-white bg-opacity-20 me-3" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                                <i className="fas fa-cogs text-white fs-5"></i>
                            </div>
                            <div>
                                <h2 className="mb-0 fw-bold" style={{ fontSize: '1.5rem' }}>Cấu hình Website</h2>
                                <p className="mb-0 opacity-75" style={{ fontSize: '0.875rem' }}>Thiết lập thông tin và giao diện website</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-3">
                        <form onSubmit={handleSubmit}>
                            {/* Thông báo GHIM - Full width */}
                            <div className="card border-0 shadow-sm mb-3">
                                <div className="card-header bg-warning text-white border-0 py-2">
                                    <h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>
                                        <i className="fas fa-thumbtack me-2"></i>
                                        Thông báo GHIM
                                    </h6>
                                </div>
                                <div className="card-body p-3">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.tieude}
                                        onReady={(editor) => {
                                            editorRef.current = editor;
                                            setTimeout(() => {
                                                if (editor && editor.ui && editor.ui.view && editor.ui.view.editable && editor.ui.view.editable.element) {
                                                    editor.ui.view.editable.element.style.height = "200px";
                                                }
                                            }, 100);
                                        }}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormData((prev) => ({ ...prev, tieude: data }));
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Layout 2 cột */}
                            <div className="row g-3">
                                {/* Cột trái */}
                                <div className="col-lg-6">
                                    {/* Thông tin cơ bản */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-info text-white border-0 py-2">
                                            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                                                <i className="fas fa-info-circle me-2"></i>
                                                Thông tin cơ bản
                                            </h6>
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-heading me-1 text-success"></i>
                                                    Tiêu đề Website
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                    placeholder="Nhập tiêu đề website"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-image me-1 text-info"></i>
                                                    Logo Website
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.logo}
                                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                    placeholder="Nhập URL logo"
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-star me-1 text-warning"></i>
                                                    Favicon
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control mb-2"
                                                    value={formData.favicon}
                                                    onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                                                    placeholder="Nhập URL favicon"
                                                />
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={formData.favicon}
                                                    onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                                                >
                                                    <option value="">Chọn favicon có sẵn</option>
                                                    {faviconList.map(f => (
                                                        <option value={f.url} key={f.url}>{f.label}</option>
                                                    ))}
                                                </select>
                                                {formData.favicon && (
                                                    <div className="mt-2 text-center">
                                                        <img src={formData.favicon} alt="Preview" className="border rounded" style={{ maxWidth: "40px" }} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nâng cấp bậc */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-gradient-warning text-white border-0 py-2">
                                            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                                                <i className="fas fa-level-up-alt me-2"></i>
                                                Nâng cấp bậc tự động
                                            </h6>
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-user-tie me-1 text-warning"></i>
                                                    Đại lý
                                                </label>
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={formData.daily}
                                                        onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                                                        placeholder="0"
                                                    />
                                                    <span className="input-group-text">VNĐ</span>
                                                </div>
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-industry me-1 text-dark"></i>
                                                    Nhà phân phối
                                                </label>
                                                <div className="input-group input-group-sm">
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={formData.distributor}
                                                        onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                                                        placeholder="0"
                                                    />
                                                    <span className="input-group-text">VNĐ</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mã JavaScript */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-gradient-success text-white border-0 py-2">
                                            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                                                <i className="fas fa-code me-2"></i>
                                                Mã JavaScript tùy chỉnh

                                            </h6>
                                            <span className="text-danger">Cẩn thận với script có thể ảnh hưởng đến bảo mật website</span><br />
                                            <span className="text-danger">KHÔNG BIẾT DÙNG TỐT NHẤT ĐỂ TRỐNG</span>
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-file-code me-1 text-success"></i>
                                                    Script/HTML Header
                                                </label>
                                                <textarea
                                                    className="form-control font-monospace"
                                                    rows="4"
                                                    value={formData.headerJs}
                                                    onChange={(e) => setFormData({ ...formData, headerJs: e.target.value })}
                                                    placeholder="<script>&#10;  // Mã JS được chèn vào <head>&#10;</script>"
                                                    style={{ fontSize: '0.85rem' }}
                                                />
                                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Mã này sẽ được chèn vào thẻ &lt;head&gt; ( Link , Meta tags, Script.)

                                                </small>
                                            </div>
                                            <div className="mb-0">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-file-code me-1 text-info"></i>
                                                    Script/HTML Footer
                                                </label>
                                                <textarea
                                                    className="form-control font-monospace"
                                                    rows="4"
                                                    value={formData.footerJs}
                                                    onChange={(e) => setFormData({ ...formData, footerJs: e.target.value })}
                                                    placeholder="<script>&#10;  // Mã JS được chèn trước </body>&#10;</script>"
                                                    style={{ fontSize: '0.85rem' }}
                                                />
                                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Mã này sẽ được chèn trước thẻ đóng &lt;/body&gt; (Chatbox, Tuyết rơi, v.v.)
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cột phải */}
                                <div className="col-lg-6">
                                    {/* Cài đặt hệ thống */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-secondary text-white border-0 py-2">
                                            <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                                                <i className="fas fa-sliders-h me-2"></i>
                                                Cài đặt hệ thống
                                            </h6>
                                        </div>
                                        <div className="card-body p-3">
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-terminal me-1 text-secondary"></i>
                                                    Cú pháp nạp tiền
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.cuphap}
                                                    onChange={(e) => setFormData({ ...formData, cuphap: e.target.value })}
                                                    placeholder="naptien, donate,..."
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-eye me-1 text-info"></i>
                                                    Hiển thị lượt bán
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.viewluotban ? "true" : "false"}
                                                    onChange={(e) => setFormData({ ...formData, viewluotban: e.target.value === "true" })}
                                                >
                                                    <option value="false">Ẩn</option>
                                                    <option value="true">Hiển thị</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-sync-alt me-1 text-success"></i>
                                                    Trạng thái dịch vụ tự động theo nguồn
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.autoactive ? "true" : "false"}
                                                    onChange={(e) => setFormData({ ...formData, autoactive: e.target.value === "true" })}
                                                >
                                                    <option value="false">Tắt</option>
                                                    <option value="true">Bật</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fab fa-telegram me-1"></i>
                                                    Link Bot Telegram
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.linktele}
                                                    onChange={(e) => setFormData({ ...formData, linktele: e.target.value })}
                                                    placeholder="https://t.me/xxxxxx_bot"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                    <i className="fas fa-trash-alt me-1 text-danger"></i>
                                                    Tự động xóa dữ liệu cũ
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.autoremove ? "true" : "false"}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value === "true";
                                                        if (newValue) {
                                                            // Hiển thị cảnh báo khi bật
                                                            Swal.fire({
                                                                title: 'Bạn có chắc chắn muốn bật tính năng xóa tự động?',
                                                                text: "Dữ liệu đã xóa sẽ KHÔNG THỂ KHÔI PHỤC!\n\nVui lòng cân nhắc kỹ trước khi bật tính năng này.",
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#d33',
                                                                cancelButtonColor: '#3085d6',
                                                                confirmButtonText: 'Có, tôi chắc chắn!'
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    setFormData({ ...formData, autoremove: true });
                                                                }
                                                            });
                                                        } else {
                                                            setFormData({ ...formData, autoremove: false });
                                                        }
                                                    }}
                                                >
                                                    <option value="false">Tắt</option>
                                                    <option value="true">Bật</option>
                                                </select>
                                                {formData.autoremove && (
                                                    <div className="alert alert-warning mt-2 mb-0 py-2 px-3" role="alert" style={{ fontSize: '0.75rem' }}>
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        <strong>Lưu ý:</strong> Dữ liệu đã xóa sẽ không thể khôi phục!
                                                    </div>
                                                )}
                                            </div>
                                            {formData.autoremove && (
                                                <div className="mb-0">
                                                    <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.875rem' }}>
                                                        <i className="fas fa-calendar-alt me-1 text-warning"></i>
                                                        Thời gian xóa tự động
                                                    </label>
                                                    <div className="input-group mb-2">
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={formData.autoDeleteMonths}
                                                            onChange={(e) => setFormData({ ...formData, autoDeleteMonths: e.target.value })}
                                                            placeholder="3"
                                                            min="1"
                                                            max="12"
                                                        />
                                                        <span className="input-group-text">Tháng</span>
                                                    </div>
                                                    <small className="text-muted d-block mb-3" style={{ fontSize: '0.75rem' }}>
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        Dữ liệu cũ hơn {formData.autoDeleteMonths || 3} tháng sẽ bị xóa tự động hằng ngày
                                                    </small>

                                                    {/* Tùy chọn xóa */}
                                                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                                                        <label className="form-label fw-semibold mb-2" style={{ fontSize: '0.875rem' }}>
                                                            <i className="fas fa-list-check me-1 text-primary"></i>
                                                            Chọn dữ liệu cần xóa
                                                        </label>

                                                        <div className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="deleteOrders"
                                                                checked={formData.deleteOrders}
                                                                onChange={(e) => setFormData({ ...formData, deleteOrders: e.target.checked })}
                                                            />
                                                            <label className="form-check-label" htmlFor="deleteOrders" style={{ fontSize: '0.85rem' }}>
                                                                <i className="fas fa-shopping-cart me-1 text-danger"></i>
                                                                Xóa đơn hàng cũ
                                                            </label>
                                                        </div>

                                                        <div className="form-check mb-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="deleteUsers"
                                                                checked={formData.deleteUsers}
                                                                onChange={(e) => setFormData({ ...formData, deleteUsers: e.target.checked })}
                                                            />
                                                            <label className="form-check-label" htmlFor="deleteUsers" style={{ fontSize: '0.85rem' }}>
                                                                <i className="fas fa-user-times me-1 text-warning"></i>
                                                                Xóa user không nạp tiền
                                                            </label>
                                                        </div>

                                                        <div className="form-check mb-0">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="deleteHistory"
                                                                checked={formData.deleteHistory}
                                                                onChange={(e) => setFormData({ ...formData, deleteHistory: e.target.checked })}
                                                            />
                                                            <label className="form-check-label" htmlFor="deleteHistory" style={{ fontSize: '0.85rem' }}>
                                                                <i className="fas fa-history me-1 text-info"></i>
                                                                Xóa lịch sử hoạt động
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Danh sách liên hệ */}
                                    <div className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-gradient-dark text-white border-0 py-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '0.95rem' }}>
                                                    <i className="fas fa-address-book me-2"></i>
                                                    Danh sách liên hệ ({formData.lienhe.length}/10)
                                                </h6>
                                                <button
                                                    type="button"
                                                    className="btn btn-light btn-sm"
                                                    onClick={addContact}
                                                    disabled={formData.lienhe.length >= 10}
                                                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                                                >
                                                    <i className="fas fa-plus me-1"></i>
                                                    Thêm
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body p-3" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            {formData.lienhe.length === 0 ? (
                                                <div className="text-center py-3">
                                                    <i className="fas fa-address-book fs-1 text-muted mb-2"></i>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>Chưa có liên hệ nào</p>
                                                </div>
                                            ) : (
                                                <div className="row g-2">
                                                    {formData.lienhe.map((contact, index) => (
                                                        <div key={index} className="col-12">
                                                            <div className="card border shadow-sm">
                                                                <div className="card-header bg-light border-0 py-2 d-flex justify-content-between align-items-center">
                                                                    <span className="fw-semibold" style={{ fontSize: '0.85rem', color: '#2c3e50' }}>
                                                                        <i className="fas fa-hashtag me-1" style={{ fontSize: '0.75rem' }}></i>{index + 1}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={() => removeContact(index)}
                                                                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                                                    >
                                                                        <i className="fas fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                                <div className="card-body p-2">
                                                                    <div className="mb-2">
                                                                        <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                                            <i className="fas fa-tag me-1 text-info" style={{ fontSize: '0.75rem' }}></i>
                                                                            Loại
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={contact.type}
                                                                            onChange={(e) => updateContact(index, "type", e.target.value)}
                                                                            placeholder="email, phone, facebook..."
                                                                            style={{ fontSize: '0.8rem' }}
                                                                        />
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                                            <i className="fas fa-link me-1 text-success" style={{ fontSize: '0.75rem' }}></i>
                                                                            Link
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={contact.value}
                                                                            onChange={(e) => updateContact(index, "value", e.target.value)}
                                                                            placeholder="https://..."
                                                                            style={{ fontSize: '0.8rem' }}
                                                                        />
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                                            <i className="fas fa-image me-1 text-warning" style={{ fontSize: '0.75rem' }}></i>
                                                                            Logo URL
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={contact.logolienhe}
                                                                            onChange={(e) => updateContact(index, "logolienhe", e.target.value)}
                                                                            placeholder="URL logo"
                                                                            style={{ fontSize: '0.8rem' }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="form-label mb-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                                                                            <i className="fas fa-images me-1 text-primary" style={{ fontSize: '0.75rem' }}></i>
                                                                            Chọn logo
                                                                        </label>
                                                                        <div className="border rounded p-2" style={{ maxHeight: 120, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                                                            <div className="d-flex flex-wrap gap-1">
                                                                                {Object.entries(platformLogos).map(([platform, url], idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        onClick={() => updateContact(index, "logolienhe", url)}
                                                                                        style={{
                                                                                            width: '40px',
                                                                                            height: '40px',
                                                                                            border: contact.logolienhe === url ? '2px solid #007bff' : '1px solid #dee2e6',
                                                                                            borderRadius: '6px',
                                                                                            padding: '4px',
                                                                                            cursor: 'pointer',
                                                                                            background: contact.logolienhe === url ? '#e3f2fd' : '#fff',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                            transition: 'all 0.2s'
                                                                                        }}
                                                                                    >
                                                                                        <img
                                                                                            src={url}
                                                                                            alt={platform}
                                                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        {contact.logolienhe && (
                                                                            <div className="mt-2 text-center">
                                                                                <img src={contact.logolienhe} alt="Preview" style={{ maxWidth: "30px" }} className="rounded" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="text-center mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-lg px-5 fw-bold"
                                    disabled={loading}
                                    style={{
                                        background: loading ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: 'white',
                                        transition: 'all 0.3s ease',
                                        boxShadow: loading ? '0 4px 15px rgba(108, 117, 125, 0.3)' : '0 6px 20px rgba(102, 126, 234, 0.4)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!loading) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!loading) {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Lưu cấu hình
                                        </>
                                    )}
                                </button>
                                <div className="mt-2">
                                    <small style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                        <i className="fas fa-info-circle me-1"></i>
                                        Các thay đổi sẽ được áp dụng ngay lập tức
                                    </small>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;