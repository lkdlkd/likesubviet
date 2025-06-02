import React, { useState, useEffect } from "react";
import { getConfigWeb, updateConfigWeb } from "@/Utils/api";
import { toast } from "react-toastify";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
const platformLogos = {
    Facebook:
        "https://media4.giphy.com/media/pejyg6fy1JpoQuLQQp/giphy.gif?cid=6c09b952jc5fjcbbzw5nsgw5fhpel13egpoh3jza1ala341a&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    TikTok: "https://i.pinimg.com/originals/77/97/19/7797190f0f3efd9d5b0b96963d97ed5a.gif",
    Instagram:
        "https://media2.giphy.com/media/QZOxRp5tZTemNQzpgc/giphy.gif?cid=6c09b952ja1qrjvvisx2jgbvrdj5ayheqlguw0cdayhndzo5&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    YouTube:
        "https://media0.giphy.com/media/SVTPWzQWPCUKfji4fp/giphy.gif?cid=6c09b9523af8s3o9dzscarda6feloua8n139hfndl2m3gbm3&ep=v1_stickers_search&rid=giphy.gif&ct=s",
    Twitter: "https://cliply.co/wp-content/uploads/2021/09/CLIPLY_372109260_TWITTER_LOGO_400.gif",
    Telegram:
        "https://moein.video/wp-content/uploads/2022/12/Telegram-Logo-GIF-Telegram-Icon-GIF-Royalty-Free-Animated-Icon-GIF-1080px-after-effects-project.gif",
    Shopee: "https://media4.giphy.com/media/4bjIfp3L4iCnare4iU/200w.gif",
    Thread:
        "https://media.baamboozle.com/uploads/images/1465982/582bed70-c7c4-457f-95c9-c39811ac085f.gif",
};

const Setting = () => {
    const [formData, setFormData] = useState({
        tieude: "",
        logo: "",
        favicon: "",
        lienhe: [
            { type: "", value: "", logolienhe: "" },
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
                    lienhe: Array.isArray(config.data.lienhe) ? config.data.lienhe : [], // Đảm bảo lienhe là mảng
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

            // Chuẩn hóa dữ liệu trước khi gửi
            const sanitizedData = {
                tieude: formData.tieude,
                logo: formData.logo,
                favicon: formData.favicon,
                lienhe: formData.lienhe.filter(
                    (contact) => contact.type || contact.value || contact.logolienhe // Loại bỏ liên hệ trống
                ),
            };

            // Gửi dữ liệu đến API
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
        <div className="config-form">
            <h2>Cấu hình Website</h2>
            <form onSubmit={handleSubmit}>
                {/* Tiêu đề */}
                <div className="mb-3">
                    <label className="form-label">TEXT GHIM</label>
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
                </div>

                {/* Logo */}
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


                {/* Favicon */}
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

                {/* Thông tin liên hệ */}
                {/* <div className="mb-3">
                    <label className="form-label">Thông tin liên hệ</label>
                    <textarea
                        className="form-control"
                        value={formData.lienhe}
                        onChange={(e) => setFormData({ ...formData, lienhe: e.target.value })}
                        placeholder="Nhập thông tin liên hệ"
                        rows="3"
                    ></textarea>
                </div> */}

                {/* Logo liên hệ
                <div className="mb-3">
                    <label className="form-label">Logo liên hệ (URL)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.logolienhe}
                        onChange={(e) => setFormData({ ...formData, logolienhe: e.target.value })}
                        placeholder="Nhập URL logo liên hệ"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Chọn logo liên hệ</label>
                    <select
                        className="form-select"
                        onChange={(e) => setFormData({ ...formData, logolienhe: platformLogos[e.target.value] })}
                        value={Object.keys(platformLogos).find((key) => platformLogos[key] === formData.logolienhe) || ""}
                    >
                        <option value="">-- Chọn nền tảng --</option>
                        {Object.keys(platformLogos).map((platform, index) => (
                            <option key={index} value={platform}>
                                {platform}
                            </option>
                        ))}
                    </select>
                </div>
                {formData.logolienhe && (
                    <div className="mt-2">
                        <img src={formData.logolienhe} alt="Logo Liên Hệ Preview" style={{ maxWidth: "100px", height: "auto" }} />
                    </div>
                )} */}

                {/* Danh sách liên hệ */}
                <div className="mb-3">
                    <label className="form-label">Danh sách liên hệ</label>
                    {formData.lienhe.map((contact, index) => (
                        <div key={index} className="mb-3 border p-3">
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
                                <label className="form-label">Chọn logo liên hệ</label>
                                <select
                                    className="form-select"
                                    onChange={(e) => updateContact(index, "logolienhe", platformLogos[e.target.value])}
                                    value={Object.keys(platformLogos).find((key) => platformLogos[key] === contact.logolienhe) || ""}
                                >
                                    <option value="">-- Chọn nền tảng --</option>
                                    {Object.keys(platformLogos).map((platform, i) => (
                                        <option key={i} value={platform}>
                                            {platform}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {contact.logolienhe && (
                                <div className="mt-2">
                                    <img src={contact.logolienhe} alt="Logo Liên Hệ Preview" style={{ maxWidth: "100px", height: "auto" }} />
                                </div>
                            )}
                            <button type="button" className="btn btn-danger mt-2" onClick={() => removeContact(index)}>
                                Xóa liên hệ
                            </button>
                        </div>
                    ))}
                    <button type="button" className="btn btn-primary mt-3" onClick={addContact}>
                        Thêm liên hệ
                    </button>
                </div>

                {/* Nút lưu */}
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </form>
        </div>
    );
};

export default Setting;