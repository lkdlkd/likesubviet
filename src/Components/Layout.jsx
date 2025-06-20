import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/Components/Header";
import Menu from "@/Components/Menu";
import { ToastContainer } from "react-toastify";
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { getCategories, getMe, getNotifications, getConfigWeb } from "@/Utils/api";
import Widget from "./Widget";

const Layout = () => {
    const [categories, setCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const [configWeb, setConfigWeb] = useState(null);

    const token = localStorage.getItem("token") || null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, userData, notificationData, configwebdata] = await Promise.all([
                    getCategories(token),
                    getMe(token),
                    getNotifications(token),
                    getConfigWeb(token),
                ]);
                setCategories(categoriesData.data);
                setUser(userData);
                setNotifications(notificationData);
                setConfigWeb(configwebdata.data);
            } catch (error) {
                // console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchData();
    }, [token]);
    const title = configWeb ? configWeb.title : "Hệ thống tăng tương tác MXH";
    const favicon = configWeb ? configWeb.favicon : "https://png.pngtree.com/png-clipart/20190520/original/pngtree-facebook-f-icon-png-image_3550243.jpg"; // Thay thế bằng URL favicon mặc định nếu không có
    const API_DOMAIN = window.location.origin; // Lấy tên miền hiện tại và thêm đường dẫn API
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
                        "image": favicon,
                    })}
                </script>
            </Helmet>
            <Menu categories={categories} user={user} configWeb={configWeb} />
            <div className="pc-container">
                <div className="pc-content">
                    {/* Truyền dữ liệu qua Outlet */}
                    <Outlet context={{ configWeb, categories, token, user, notifications }} />
                </div>
            </div>
            <Widget configWeb={configWeb} />
            <ToastContainer />

        </>
    );
};

export default Layout;
