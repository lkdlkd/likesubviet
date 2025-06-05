import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/Components/Header";
import Menu from "@/Components/Menu";
import { ToastContainer } from "react-toastify";
import { Helmet } from "react-helmet";

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
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchData();
    }, [token]);
    const title = configWeb ? configWeb.title : "Hệ thống tăng tương tác MXH";
    const favicon = configWeb ? configWeb.favicon : "https://png.pngtree.com/png-clipart/20190520/original/pngtree-facebook-f-icon-png-image_3550243.jpg"; // Thay thế bằng URL favicon mặc định nếu không có
    return (
        <>
            <Header user={user} />
            <Helmet>
                <title>{title}</title>
                <meta name="description" content="Hệ thống tăng tương tác MXH uy tín, nhanh chóng, giá rẻ." />
                <link rel="icon" type="image/png" href={favicon} />
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
