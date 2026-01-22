import React from "react";
import { Route, BrowserRouter as Router, Routes, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "@/Context/AuthContext";
import { ThemeProvider } from "@/Context/ThemeContext";
import Login from "@/Pages/Dang-nhap/Login";
import Register from "@/Pages/Dang-Ky/Register";
import Langding from "@/Pages/Landing";
import Home from "@/Pages/Home";
import Layout from "@/Components/Layout";
import ProfilePage from "@/Pages/Profile/ProfilePage";
import NaptienPage from "@/Pages/Nap-tien/NaptienPage";
import HistoryPage from "@/Pages/Lich-su-hoat-dong/HistoryPage";
import Ordernhanh from "./Pages/Order/Ordernhanh";
import Danhsachdon from "./Pages/Danh-sach-don/Danhsachdon";
import Order from "./Pages/Muadon/Order";
import ThongkePage from "./Pages/Admin/Thong-ke/ThongkePage";
import TaikhoanPage from "./Pages/Admin/Tai-khoan/TaikhoanPage";
import Taothongbaopage from "./Pages/Admin/Thong-bao/Taothongbaopage";
import BankingAdmin from "./Pages/Admin/Bank-king/BankingAdmin";
import Doitacpage from "./Pages/Admin/Doi-tac/Doitacpage";
import PlatformsPage from "./Pages/Admin/Nen-tang/PlatformsPage";
import CategoriesPage from "./Pages/Admin/Dich-vu/CategoriesPage";
import Dichvupage from "./Pages/Admin/Server/Dichvupage";
import Setting from "./Pages/Admin/ConfigWeb/Setting";
// import ConfigCard from "./Pages/Admin/ConfigCard/ConfigCard";
import Tailieuapi from "./Pages/Tailieu/Tailieuapi";
import NotFoundPage from "./Pages/404";
import Khuyenmai from "./Pages/Admin/Khuyenmai/khuyenmai";
import Naptientudong from "./Pages/Admin/Naptientudong/Naptientudong";
import Banggia from "./Pages/Banggia/Banggia";
import ConfigTelePage from "./Pages/Admin/Config-tele/ConfigTelePage";
import Refund from "./Pages/Admin/Hoantien/Refund";
import OrderAdmin from "./Pages/Admin/Donhang/OrderAdmin";
import Webrieng from "./Pages/Webrieng/Webrieng";
import ScheduledOrders from "./Pages/Muadon/ScheduledOrders";
import AdminChat from "./Pages/Admin/Chat/AdminChat";
import AffiliateAdmin from "./Pages/Admin/Affiliate/AffiliateAdmin";
import AffiliateCommissions from "./Pages/Admin/Affiliate/AffiliateCommissions";
import AffiliatePanel from "./Pages/Profile/AffiliatePanel";
import WithdrawalRequests from "./Pages/Admin/Affiliate/WithdrawalRequests";
function App() {
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page - hiển thị khi chưa có token */}
            <Route
              path="/"
              element={
                <AuthContext.Consumer>
                  {({ auth }) =>
                    auth.token ? <Navigate to="/home" replace /> : <Langding />
                  }
                </AuthContext.Consumer>
              }
            />
            {/* <Route path="/landing" element={<Langding />} /> */}

            {/* Routes không có Layout */}
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/dang-ky" element={<Register />} />

            {/* Routes cho User Layout */}
            <Route
              path="/home"
              element={
                <AuthContext.Consumer>
                  {({ auth }) =>
                    auth.token ? <Layout /> : <Navigate to="/" />
                  }
                </AuthContext.Consumer>
              }
            >
              <Route index element={<Home />} />
            </Route>

            {/* User routes with Layout */}
            <Route
              path="/"
              element={
                <AuthContext.Consumer>
                  {({ auth }) =>
                    auth.token ? <Layout /> : <Navigate to="/" />
                  }
                </AuthContext.Consumer>
              }
            >
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/nap-tien" element={<NaptienPage />} />
              <Route path="/lich-su-hoat-dong" element={<HistoryPage />} />
              <Route path="/order" element={<Ordernhanh />} />
              <Route path="/danh-sach-don" element={<Danhsachdon />} />
              <Route path="/scheduled" element={<ScheduledOrders />} />
              <Route path="/order/:path" element={<Order />} />
              <Route path="/tai-lieu-api" element={<Tailieuapi />} />
              <Route path="/bang-gia" element={<Banggia />} />
              <Route path="/tao-web-rieng" element={<Webrieng />} />
              <Route path="/affiliate" element={<AffiliatePanel />} />
            </Route>

            {/* Routes cho Admin Layout */}
            <Route
              path="/admin"
              element={
                <AuthContext.Consumer>
                  {({ auth }) =>
                    auth.token && auth.role === "admin" ? (
                      <Layout />
                    ) : (
                      <Navigate to="/404" />
                    )
                  }
                </AuthContext.Consumer>
              }
            >
              <Route path="/admin/thongke" element={<ThongkePage />} />
              <Route index element={<Navigate to="/admin/thongke" replace />} />
              <Route path="/admin/tai-khoan" element={<TaikhoanPage />} />
              <Route path="/admin/taothongbao" element={<Taothongbaopage />} />
              <Route path="/admin/bank-king" element={<BankingAdmin />} />
              <Route path="/admin/doitac" element={<Doitacpage />} />
              <Route path="/admin/nen-tang" element={<PlatformsPage />} />
              {!isAllowedApiUrl && (
                <Route path="/admin/dich-vu" element={<CategoriesPage />} />
              )}
              <Route path="/admin/server" element={<Dichvupage />} />
              <Route path="/admin/setting" element={<Setting />} />
              {/* <Route path="/admin/setting-thecao" element={<ConfigCard />} /> */}
              <Route path="/admin/khuyen-mai" element={<Khuyenmai />} />
              <Route path="/admin/nap-tien-tu-dong" element={<Naptientudong />} />
              <Route path="/admin/config-tele" element={<ConfigTelePage />} />
              <Route path="/admin/refund" element={<Refund />} />
              <Route path="/admin/orders" element={<OrderAdmin />} />
              <Route path="/admin/chat" element={<AdminChat />} />
              <Route path="/admin/affiliate" element={<AffiliateAdmin />} />
              <Route path="/admin/affiliate-commissions" element={<AffiliateCommissions />} />
              <Route path="/admin/withdrawal-requests" element={<WithdrawalRequests />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
export default App;
