import Header from "@/Components/Header";
import Menu from "@/Components/Menu";
import { getCategories, getConfigWeb, getMe, getNotifications } from "@/Utils/api";
import { useEffect, useState } from "react";
import { Helmet } from 'react-helmet-async';
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// import Widget from "./Widget";
import Widget from "./Wingets";
import DynamicHtml from "@/JS/DynamicHtml";
// import MobileBottom from "./MobileBottom";
import { loadingg } from "@/JS/Loading";
const Layout = () => {
    const [categories, setCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [configWeb, setConfigWeb] = useState(null);
    const [headerJs, setHeaderJs] = useState("");
    const [footerJs, setFooterJs] = useState("");
    const token = localStorage.getItem("token") || null;

    useEffect(() => {
        const fetchData = async () => {
            loadingg("Vui lòng chờ...", true, 9999999); // Hiển thị loading khi bắt đầu fetch
            try {
                const [categoriesData, userData, notificationData, configwebdata] = await Promise.all([
                    getCategories(token),
                    getMe(token),
                    getNotifications(token),
                    getConfigWeb(token),
                ]);
                let allCategories = [];
                if (Array.isArray(categoriesData.platforms)) {
                    allCategories = categoriesData.platforms.flatMap(p => p.categories || []);
                } else if (Array.isArray(categoriesData.data)) {
                    allCategories = categoriesData.data;
                }
                setCategories(allCategories);
                // setCategories(categoriesData.data);
                setUser(userData);
                setNotifications(notificationData);
                setConfigWeb(configwebdata.data);
                setHeaderJs(configwebdata.data.headerJs || "");
                setFooterJs(configwebdata.data.footerJs || "");
            } catch (error) {
                if (
                    error.message === "Người dùng không tồn tại" ||
                    error.message === "401" ||
                    error.status === 401 ||
                    error.message === "Token không hợp lệ hoặc đã hết hạn"
                ) {
                    localStorage.clear();
                    sessionStorage.clear();
                    // Nếu người dùng không tồn tại, trả về 401, hoặc token không hợp lệ/hết hạn thì đăng xuất
                    localStorage.removeItem("token");
                    window.location.href = "/dang-nhap";
                }
            }
            finally {
                loadingg("", false, 0); // Ẩn loading sau khi fetch xong
            }
        };
        fetchData();
    }, [token]);


    // useEffect(() => {
    //     if (headerJs) {
    //         // Tạo một div container để chứa HTML
    //         const container = document.createElement("div");
    //         container.innerHTML = headerJs;

    //         // Xử lý các thẻ script
    //         const scripts = container.querySelectorAll("script");
    //         scripts.forEach((oldScript) => {
    //             const newScript = document.createElement("script");
    //             newScript.type = "text/javascript";
    //             if (oldScript.src) {
    //                 newScript.src = oldScript.src;
    //             } else {
    //                 newScript.text = oldScript.textContent;
    //             }
    //             oldScript.parentNode.replaceChild(newScript, oldScript);
    //         });

    //         // Append toàn bộ nội dung vào head
    //         document.head.appendChild(container);

    //         return () => {
    //             // Cleanup khi component unmount
    //             document.head.removeChild(container);
    //         };
    //     }
    // }, [headerJs]);

    // useEffect(() => {
    //     if (footerJs) {
    //         // Tạo một div container để chứa HTML
    //         const container = document.createElement("div");
    //         container.innerHTML = footerJs;

    //         // Xử lý các thẻ script
    //         const scripts = container.querySelectorAll("script");
    //         scripts.forEach((oldScript) => {
    //             const newScript = document.createElement("script");
    //             newScript.type = "text/javascript";
    //             if (oldScript.src) {
    //                 newScript.src = oldScript.src;
    //             } else {
    //                 newScript.text = oldScript.textContent;
    //             }
    //             oldScript.parentNode.replaceChild(newScript, oldScript);
    //         });

    //         // Append toàn bộ nội dung vào body
    //         document.body.appendChild(container);

    //         return () => {
    //             // Cleanup khi component unmount
    //             document.body.removeChild(container);
    //         };
    //     }
    // }, [footerJs]);


    const title = configWeb ? configWeb.title : "Hệ thống tăng tương tác MXH";
    const favicon = configWeb ? configWeb.favicon : "https://png.pngtree.com/png-clipart/20190520/original/pngtree-facebook-f-icon-png-image_3550243.jpg"; // Thay thế bằng URL favicon mặc định nếu không có
    const API_DOMAIN = window.location.origin; // Lấy tên miền hiện tại và thêm đường dẫn API
    const Domain = API_DOMAIN.replace(/^https?:\/\//, ""); // Bỏ https:// hoặc http://

    return (
        <>
            <Header user={user} />
            <Helmet>
                {/* Tối ưu tiêu đề */}
                <title>{title}</title>
                <meta name="description" content="Hệ thống tăng tương tác MXH uy tín, nhanh chóng, giá rẻ." />
                <meta name="keywords" content="tăng tương tác, MXH, uy tín, giá rẻ, nhanh chóng, Facebook, Instagram, TikTok" />
                <link rel="icon" type="image/png" href={favicon} />

                {/* Thẻ Open Graph */}
                <meta property="og:title" content={`${title} - Tăng Tương Tác MXH Uy Tín`} />
                <meta property="og:description" content="Hệ thống tăng tương tác MXH uy tín, nhanh chóng, giá rẻ." />
                <meta property="og:image" content={favicon} />
                <meta property="og:url" content={API_DOMAIN} />
                <meta property="og:type" content="website" />

                {/* Thẻ Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${title} - Tăng Tương Tác MXH Uy Tín`} />
                <meta name="twitter:description" content="Hệ thống tăng tương tác MXH uy tín, nhanh chóng, giá rẻ." />
                <meta name="twitter:image" content={favicon} />

                {/* Thẻ Canonical */}
                <link rel="canonical" href={API_DOMAIN} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": title,
                        "url": API_DOMAIN,
                        "description": "Hệ thống tăng tương tác MXH uy tín, nhanh chóng, giá rẻ.",
                        "image": { favicon },
                    })}
                </script>

            </Helmet>
            <Menu categories={categories} user={user} configWeb={configWeb} />
            <DynamicHtml htmlString={headerJs} />

            <div className="pc-container">
                <div className="pc-content">
                    {/* Truyền dữ liệu qua Outlet */}
                    <Outlet context={{ configWeb, categories, token, user, notifications }} />
                </div>
            </div>
            <DynamicHtml htmlString={footerJs} />

            <footer className="pc-footer">
                <div className="footer-wrapper container-fluid">
                    <div className="row">
                        <div className="col-sm-6 my-1">
                            <strong>
                                <p className="m-0 text-muted">
                                    Copyright © {new Date().getFullYear()}. <span target="_blank">{Domain} - Hệ Thống Dịch Vụ MXH Số 1 Việt Nam</span> - Social Media Marketing.
                                </p>
                            </strong>
                        </div>
                    </div>
                </div>
            </footer>
            <Widget configWeb={configWeb} />
            <ToastContainer style={{ maxWidth: '70%', marginLeft: 'auto', marginRight: '0px' }} />
            {/* <MobileBottom /> */}
        </>
    );
};

export default Layout;
