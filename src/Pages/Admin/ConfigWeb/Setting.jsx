import React, { useState, useEffect } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { loadingg } from "@/JS/Loading";

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
const images = require.context('@/assets/img', false, /\.(png|jpe?g|gif)$/);
const platformLogos = {};
images.keys().forEach((key) => {
  // Lấy tên file không có đuôi mở rộng, viết hoa chữ cái đầu
  const name = key.replace('./', '').replace(/\.[^/.]+$/, '');
  platformLogos[name.charAt(0).toUpperCase() + name.slice(1)] = images(key);
});
// Danh sách favicon có sẵn
const faviconList = [
    { url: "/img/favicon.ico", label: "Favicon mặc định" },
    { url: "/img/logo192.png", label: "Logo 192x192" },
    { url: "/img/logo512.png", label: "Logo 512x512" },
    // Thêm favicon khác nếu muốn
];

const Setting = () => {
    const [formData, setFormData] = useState({
        tieude: "",
        title: "",
        logo: "",
        favicon: "",
        lienhe: [
            { type: "", value: "", logolienhe: "" },
        ],
        cuphap: "", // Thêm trường cuphap
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                loadingg("Đang tải cấu hình website...");
                const token = localStorage.getItem("token");
                const config = await getConfigWeb(token);
                setFormData({
                    ...config.data,
                    lienhe: Array.isArray(config.data.lienhe) ? config.data.lienhe : [],
                    cuphap: config.data.cuphap || "", // Lấy giá trị cuphap từ API
                });
            } catch (error) {
                toast.error("Không thể tải cấu hình website!");
            } finally {
                loadingg("", false);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        loadingg("Đang lưu cấu hình website...");
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
            };

            await updateConfigWeb(sanitizedData, token);
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
                <div className=" card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h2 className="card-title">Cấu hình Website</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Tiêu đề */}
                            <fieldset className="mb-4">
                                <legend className="text-primary">Thông báo GHIM</legend>
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={formData.tieude}
                                    onReady={(editor) => {
                                        editor.ui.view.editable.element.style.height = "300px";
                                    }}
                                    onChange={(event, editor) => {
                                        const data = editor.getData();
                                        setFormData((prev) => ({ ...prev, tieude: data }));
                                    }}
                                />
                            </fieldset>

                            {/* Logo và Favicon */}
                            <fieldset className="mb-4">
                                <legend className="text-primary">Logo và Favicon</legend>
                                <div className="mb-3">
                                    <label className="form-label">Logo website (URL)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        placeholder="Nhập URL logo"
                                    />
                                </div>
                                <fieldset className="mb-4">
                                    <legend className="text-primary">Tiêu đề Website SEO</legend>
                                    <div className="mb-3">
                                        <label className="form-label">Tiêu đề (title)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Nhập tiêu đề website"
                                        />
                                    </div>
                                </fieldset>
                                <div className="mb-3">
                                    <label className="form-label">Favicon (URL)</label>
                                    <input
                                        type="text"
                                        className="form-control"
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
                                            <img src={formData.favicon} alt="Favicon Preview" style={{ maxWidth: "50px", height: "auto" }} />
                                        </div>
                                    )}
                                </div>
                            </fieldset>

                            {/* Cú pháp */}
                            <fieldset className="mb-4">
                                <legend className="text-primary">Cú pháp nạp tiền</legend>
                                <div className="mb-3">
                                    <label className="form-label">Cú pháp ( naptien , donate,...)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.cuphap}
                                        onChange={(e) => setFormData({ ...formData, cuphap: e.target.value })}
                                        placeholder="Nhập cú pháp"
                                    />
                                </div>
                            </fieldset>

                            {/* Danh sách liên hệ */}
                            <fieldset className="mb-4">
                                <legend className="text-primary">Danh sách liên hệ</legend>
                                {formData.lienhe.map((contact, index) => (
                                    <div key={index} className="mb-3 border p-3 rounded">
                                        <div className="mb-2">
                                            <label className="form-label">Loại liên hệ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={contact.type}
                                                onChange={(e) => updateContact(index, "type", e.target.value)}
                                                placeholder="Nhập loại liên hệ (ví dụ: email, phone)"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Giá trị liên hệ</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={contact.value}
                                                onChange={(e) => updateContact(index, "value", e.target.value)}
                                                placeholder="Nhập giá trị liên hệ (ví dụ: địa chỉ email, số điện thoại)"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Logo liên hệ (URL)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={contact.logolienhe}
                                                onChange={(e) => updateContact(index, "logolienhe", e.target.value)}
                                                placeholder="Nhập URL logo liên hệ"
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="form-label">Logo liên hệ</label>
                                            <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 6, padding: 8 }}>
                                              <div className="row g-2">
                                                {Object.entries(platformLogos).map(([platform, url], idx) => (
                                                  <div className="col-4 col-md-3" key={idx}>
                                                    <div
                                                      onClick={() => updateContact(index, "logolienhe", url)}
                                                      style={{
                                                        border: contact.logolienhe === url ? '2px solid #007bff' : '1px solid #ccc',
                                                        borderRadius: 8,
                                                        padding: 6,
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        background: contact.logolienhe === url ? '#eaf4ff' : '#fff',
                                                        boxShadow: contact.logolienhe === url ? '0 0 4px #007bff55' : 'none',
                                                      }}
                                                    >
                                                      <img src={url} alt={platform} style={{ maxWidth: 32, maxHeight: 32, objectFit: 'contain', marginBottom: 4 }} />
                                                      <div style={{ fontSize: 12 }}>{platform}</div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                            {contact.logolienhe && (
                                                <div className="mt-2">
                                                    <img src={contact.logolienhe} alt="Logo Preview" style={{ maxWidth: "50px", height: "auto" }} />
                                                </div>
                                            )}
                                        </div>
                                        <button type="button" className="btn btn-danger mt-2" onClick={() => removeContact(index)}>
                                            Xóa liên hệ
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-primary mt-3" onClick={addContact}>
                                    Thêm liên hệ
                                </button>
                            </fieldset>

                            {/* Nút lưu */}
                            <div className="text-center">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;