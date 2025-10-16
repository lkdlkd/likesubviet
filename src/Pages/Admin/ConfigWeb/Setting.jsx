import React, { useState, useEffect, useRef } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { loadingg } from "@/JS/Loading";

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
        cuphap: "", // Thêm trường cuphap
        daily: "", // Thêm trường daily (đại lý)
        distributor: "", // Thêm trường distributor (nhà phân phối)
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
                    <div className="card-header bg-gradient-primary text-white border-0 py-4">
                        <div className="d-flex align-items-center">
                            <div className="icon-circle bg-white bg-opacity-20 me-3">
                                <i className="fas fa-cogs text-white fs-4"></i>
                            </div>
                            <div>
                                <h2 className="mb-0 fw-bold">Cấu hình Website</h2>
                                <p className="mb-0 opacity-75">Thiết lập thông tin và giao diện website</p>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                            {/* Thông báo GHIM */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-warning text-white border-0">
                                    <h6 className="mb-0 fw-bold">
                                        <i className="fas fa-thumbtack me-2"></i>
                                        Thông báo GHIM
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={formData.tieude}
                                        onReady={(editor) => {
                                            editorRef.current = editor;
                                            // Set height with a slight delay to prevent ResizeObserver issues
                                            setTimeout(() => {
                                                if (editor && editor.ui && editor.ui.view && editor.ui.view.editable && editor.ui.view.editable.element) {
                                                    editor.ui.view.editable.element.style.height = "300px";
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
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-gradient-warning text-white border-0">
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="fas fa-level-up-alt me-2"></i>
                                        Tự động nâng cấp bậc nhập số tiền level đại lý|nhà phân phối
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                <i className="fas fa-user-tie me-1 text-warning"></i>
                                                Số tiền nâng cấp Đại lý
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg"
                                                    value={formData.daily}
                                                    onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                                                    placeholder="0"
                                                />
                                                <span className="input-group-text">VNĐ</span>
                                            </div>
                                            <small className="text-muted mt-1 d-block">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Số tiền tối thiểu để tự động nâng cấp lên bậc Đại lý
                                            </small>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                <i className="fas fa-industry me-1 text-dark"></i>
                                                Số tiền nâng cấp Nhà phân phối
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg"
                                                    value={formData.distributor}
                                                    onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
                                                    placeholder="0"
                                                />
                                                <span className="input-group-text">VNĐ</span>
                                            </div>
                                            <small className="text-muted mt-1 d-block">
                                                <i className="fas fa-info-circle me-1"></i>
                                                Số tiền tối thiểu để tự động nâng cấp lên bậc Nhà phân phối
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo và Favicon */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-info text-white border-0">
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="fas fa-image me-2"></i>
                                        Logo và Favicon
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold">
                                                <i className="fas fa-image me-1 text-info"></i>
                                                Logo website (URL)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.logo}
                                                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                                placeholder="Nhập URL logo"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-bold ">
                                                <i className="fas fa-star me-1 text-warning"></i>
                                                Favicon (URL)
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                value={formData.favicon}
                                                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                                                placeholder="Nhập URL favicon hoặc chọn bên dưới"
                                                list="favicon-list"
                                            />
                                            <datalist id="favicon-list">
                                                {faviconList.map(f => (
                                                    <option value={f.url} key={f.url}>{f.label}</option>
                                                ))}
                                            </datalist>
                                            <select
                                                className="form-select mt-2"
                                                value={formData.favicon}
                                                onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                                            >
                                                <option value="">Chọn favicon có sẵn</option>
                                                {faviconList.map(f => (
                                                    <option value={f.url} key={f.url}>{f.label}</option>
                                                ))}
                                            </select>
                                            {formData.favicon && (
                                                <div className="mt-2">
                                                    <img src={formData.favicon} alt="Favicon Preview" className="border rounded" style={{ maxWidth: "50px", height: "auto" }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tiêu đề Website SEO */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-success text-white border-0">
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="fas fa-search me-2"></i>
                                        Tiêu đề Website SEO
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-heading me-1 text-success"></i>
                                        Tiêu đề (title)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Nhập tiêu đề website"
                                    />
                                </div>
                            </div>

                            {/* Cú pháp nạp tiền */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-secondary text-white border-0">
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="fas fa-code me-2"></i>
                                        Cú pháp nạp tiền
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-terminal me-1 text-secondary"></i>
                                        Cú pháp (naptien, donate,...)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={formData.cuphap}
                                        onChange={(e) => setFormData({ ...formData, cuphap: e.target.value })}
                                        placeholder="Nhập cú pháp"
                                    />
                                </div>
                            </div>

                            {/* Tự động nâng cấp bậc */}


                            {/* Link bot Telegram */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-primary text-white border-0">
                                    <h6 className="mb-0 fw-bold text-white">
                                        <i className="fab fa-telegram me-2"></i>
                                        Link bot Telegram
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-robot me-1 text-primary"></i>
                                        Link bot Telegram
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={formData.linktele}
                                        onChange={(e) => setFormData({ ...formData, linktele: e.target.value })}
                                        placeholder="https://t.me/xxxxxx_bot"
                                    />
                                </div>
                            </div>

                            {/* Danh sách liên hệ */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-gradient-dark text-white border-0">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 fw-bold text-white">
                                            <i className="fas fa-address-book me-2"></i>
                                            Danh sách liên hệ
                                        </h6>
                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm fw-bold"
                                            onClick={addContact}
                                        >
                                            <i className="fas fa-plus me-1"></i>
                                            Thêm liên hệ
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {formData.lienhe.length === 0 ? (
                                        <div className="text-center py-4">
                                            <i className="fas fa-address-book fs-1 text-muted mb-3"></i>
                                            <h6 className="text-muted" style={{ fontSize: '16px', color: '#6c757d' }}>Chưa có liên hệ nào</h6>
                                            <p className="text-muted mb-0" style={{ fontSize: '14px', color: '#6c757d' }}>Nhấn "Thêm liên hệ" để bắt đầu</p>
                                        </div>
                                    ) : (
                                        <div className="row g-3">
                                            {formData.lienhe.map((contact, index) => (
                                                <div key={index} className="col-lg-6">
                                                    <div className="card border-2 border-light contact-card">
                                                        <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                                                            <h6 className="mb-0 fw-bold" style={{ color: '#2c3e50', fontSize: '14px' }}>
                                                                <i className="fas fa-contact-card me-2 text-primary"></i>
                                                                Liên hệ #{index + 1}
                                                            </h6>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeContact(index)}
                                                                title="Xóa liên hệ"
                                                                style={{ fontSize: '13px' }}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        <div className="card-body" style={{ padding: '1.25rem' }}>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-bold" style={{ color: '#2c3e50', fontSize: '14px' }}>
                                                                    <i className="fas fa-tag me-1 text-info"></i>
                                                                    Loại liên hệ
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={contact.type}
                                                                    onChange={(e) => updateContact(index, "type", e.target.value)}
                                                                    placeholder="email, phone, facebook, telegram..."
                                                                    style={{ fontSize: '14px', color: '#2c3e50' }}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-bold" style={{ color: '#2c3e50', fontSize: '14px' }}>
                                                                    <i className="fas fa-link me-1 text-success"></i>
                                                                    Giá trị liên hệ
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={contact.value}
                                                                    onChange={(e) => updateContact(index, "value", e.target.value)}
                                                                    placeholder="https://www.facebook.com/username"
                                                                    style={{ fontSize: '14px', color: '#2c3e50' }}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-bold" style={{ color: '#2c3e50', fontSize: '14px' }}>
                                                                    <i className="fas fa-image me-1 text-warning"></i>
                                                                    Logo liên hệ (URL)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={contact.logolienhe}
                                                                    onChange={(e) => updateContact(index, "logolienhe", e.target.value)}
                                                                    placeholder="Nhập URL logo hoặc chọn bên dưới"
                                                                    style={{ fontSize: '14px', color: '#2c3e50' }}
                                                                />
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="form-label fw-bold" style={{ color: '#2c3e50', fontSize: '14px' }}>
                                                                    <i className="fas fa-images me-1 text-primary"></i>
                                                                    Chọn logo có sẵn
                                                                </label>
                                                                <div className="border rounded-3 p-3" style={{ maxHeight: 200, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                                                                    <div className="row g-2">
                                                                        {Object.entries(platformLogos).map(([platform, url], idx) => (
                                                                            <div className="col-4 col-sm-3 col-md-2" key={idx}>
                                                                                <div
                                                                                    onClick={() => updateContact(index, "logolienhe", url)}
                                                                                    className="logo-option"
                                                                                    style={{
                                                                                        border: contact.logolienhe === url ? '3px solid #007bff' : '2px solid #dee2e6',
                                                                                        borderRadius: 8,
                                                                                        padding: 8,
                                                                                        cursor: 'pointer',
                                                                                        textAlign: 'center',
                                                                                        background: contact.logolienhe === url ? '#e3f2fd' : '#fff',
                                                                                        boxShadow: contact.logolienhe === url ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                                                                                        transition: 'all 0.3s ease',
                                                                                        transform: contact.logolienhe === url ? 'scale(1.05)' : 'scale(1)'
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={url}
                                                                                        alt={platform}
                                                                                        style={{
                                                                                            maxWidth: 32,
                                                                                            maxHeight: 32,
                                                                                            objectFit: 'contain',
                                                                                            filter: contact.logolienhe === url ? 'brightness(1.1)' : 'none'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {contact.logolienhe && (
                                                                    <div className="mt-3 text-center">
                                                                        <div className="d-inline-block p-2 border rounded bg-light">
                                                                            <img
                                                                                src={contact.logolienhe}
                                                                                alt="Logo Preview"
                                                                                style={{ maxWidth: "50px", height: "auto" }}
                                                                                className="rounded"
                                                                            />
                                                                            <div className="mt-1">
                                                                                <small className="text-muted" style={{ fontSize: '12px', color: '#6c757d' }}>Preview</small>
                                                                            </div>
                                                                        </div>
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

                            {/* Submit Button */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <button
                                        type="submit"
                                        className="btn btn-gradient-primary btn-lg px-5 fw-bold"
                                        disabled={loading}
                                        style={{
                                            background: loading ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                            boxShadow: loading ? '0 4px 15px rgba(108, 117, 125, 0.3)' : '0 8px 25px rgba(102, 126, 234, 0.4)',
                                            cursor: loading ? 'not-allowed' : 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Lưu cấu hình
                                            </>
                                        )}
                                    </button>
                                    <div className="mt-3">
                                        <small style={{ fontSize: '13px', color: '#6c757d' }}>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Các thay đổi sẽ được áp dụng ngay lập tức
                                        </small>
                                    </div>
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