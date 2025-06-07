import React, { useState, useEffect } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const platformLogos = {
    Facebook: "https://media4.giphy.com/media/pejyg6fy1JpoQuLQQp/giphy.gif",
    TikTok: "https://i.pinimg.com/originals/77/97/19/7797190f0f3efd9d5b0b96963d97ed5a.gif",
    Instagram: "https://media2.giphy.com/media/QZOxRp5tZTemNQzpgc/giphy.gif",
    YouTube: "https://media0.giphy.com/media/SVTPWzQWPCUKfji4fp/giphy.gif",
    Twitter: "https://cliply.co/wp-content/uploads/2021/09/CLIPLY_372109260_TWITTER_LOGO_400.gif",
    Telegram: "https://moein.video/wp-content/uploads/2022/12/Telegram-Logo-GIF.gif",
    Shopee: "https://media4.giphy.com/media/4bjIfp3L4iCnare4iU/200w.gif",
    Thread: "https://media.baamboozle.com/uploads/images/1465982/582bed70-c7c4-457f-95c9-c39811ac085f.gif",
};

const Setting = () => {
    const [formData, setFormData] = useState({
        tieude: "",
        title: "", // Thêm trường title
        logo: "",
        favicon: "",
        lienhe: [
            { type: "", value: "", logolienhe: "" },
        ],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = await getConfigWeb(token);
                setFormData({
                    ...config.data,
                    lienhe: Array.isArray(config.data.lienhe) ? config.data.lienhe : [],
                });
            } catch (error) {
                console.error("Lỗi khi lấy cấu hình website:", error.message);
                toast.error("Không thể tải cấu hình website!");
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const sanitizedData = {
                tieude: formData.tieude,
                title: formData.title, // Thêm trường title
                logo: formData.logo,
                favicon: formData.favicon,
                lienhe: formData.lienhe.filter(
                    (contact) => contact.type || contact.value || contact.logolienhe
                ),
            };

            await updateConfigWeb(sanitizedData, token);
            toast.success("Cập nhật cấu hình thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật cấu hình website:", error.message);
            toast.error("Cập nhật cấu hình thất bại!");
        } finally {
            setLoading(false);
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
                                        placeholder="Nhập URL favicon"
                                    />
                                    {formData.favicon && (
                                        <div className="mt-2">
                                            <img src={formData.favicon} alt="Favicon Preview" style={{ maxWidth: "50px", height: "auto" }} />
                                        </div>
                                    )}
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
                                            <label className="form-label">Logo liên hệ (URL)</label>
                                            <select
                                                className="form-select"
                                                value={contact.logolienhe}
                                                onChange={(e) => updateContact(index, "logolienhe", e.target.value)}
                                            >
                                                <option value="">Chọn logo liên hệ</option>
                                                {Object.entries(platformLogos).map(([platform, logoUrl]) => (
                                                    <option key={platform} value={logoUrl}>
                                                        {platform}
                                                    </option>
                                                ))}
                                            </select>
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