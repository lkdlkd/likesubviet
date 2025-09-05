import React from "react";
import { Link } from "react-router-dom";
export default function MobileBottom() {

    return (
        <div className="mobile-bottom-nav">
            <div className="nav-item ">
                <Link to="/home">
                    <div className="nav-icon">
                        <i className="ri-home-4-line"></i>
                    </div>
                    <span className="nav-text">Trang chủ</span>
                </Link>
            </div>
            <div className="nav-item ">
                <Link to="nap-tien">
                    <div className="nav-icon">
                        <i className="ri-wallet-3-line"></i>
                    </div>
                    <span className="nav-text">Nạp tiền</span>
                </Link>
            </div>
            <div className="nav-item nav-item-center ">
                <Link to="/order">
                    <div className="nav-icon-center">
                        <i className="ri-shopping-cart-line"></i>
                    </div>
                    <span className="nav-text">Tạo đơn hàng</span>
                </Link>
            </div>
            <div className="nav-item ">
                <Link to="/danh-sach-don">
                    <div className="nav-icon">
                        <i className="ri-file-list-3-line"></i>
                    </div>
                    <span className="nav-text">Đơn hàng</span>
                </Link>
            </div>
            <div className="nav-item ">
                <Link to="/profile">
                    <div className="nav-icon">
                        <i className="ri-user-line"></i>
                    </div>
                    <span className="nav-text">Tài khoản</span>
                </Link>
            </div>
        </div>
    );
}