import React from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const Webrieng = () => {
    const {configWeb} = useOutletContext();
    const lienhe = configWeb?.lienhe;

    const steps = [
        {
            id: 1,
            title: "Mua Domain",
            icon: "fa-shopping-cart",
            color: "#667eea",
            description: "Đăng ký tên miền từ nhà cung cấp uy tín"
        },
        {
            id: 2,
            title: "Trỏ Nameserver",
            icon: "fa-server",
            color: "#764ba2",
            description: "Cấu hình nameserver cho domain của bạn"
        },
        {
            id: 3,
            title: "Liên hệ Admin",
            icon: "fa-headset",
            color: "#f093fb",
            description: "Gửi thông tin domain cho admin để setup"
        },
        {
            id: 4,
            title: "Hoàn thành",
            icon: "fa-check-circle",
            color: "#4facfe",
            description: "Admin setup và bàn giao website"
        }
    ];

    const domainProviders = [
        {
            name: "Tenten",
            logo: "🌐",
            url: "https://tenten.vn",
            color: "#FF6B6B"
        },
        {
            name: "Mat Bao",
            logo: "🔒",
            url: "https://matbao.net",
            color: "#4ECDC4"
        },
        {
            name: "GoDaddy",
            logo: "🚀",
            url: "https://godaddy.com",
            color: "#95E1D3"
        },
        {
            name: "Namecheap",
            logo: "💎",
            url: "https://namecheap.com",
            color: "#F38181"
        }
    ];

    const handleContactAdmin = () => {
        // Tìm liên hệ admin từ configWeb
        const adminContact = lienhe?.find(contact => 
            contact.type?.toLowerCase().includes('zalo') || 
            contact.type?.toLowerCase().includes('admin')
        );
        
        if (adminContact?.value) {
            window.open(adminContact.value, '_blank');
            toast.info("Đang mở link liên hệ admin...");
        } else {
            toast.warning("Vui lòng liên hệ admin để tạo web riêng!");
        }
    };

    return (
        <div className="container-fluid py-3 py-md-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-4 mb-md-5"
            >
                <h1 className="display-5 display-md-4 fw-bold mb-2 mb-md-3" style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                }}>
                    Tạo Child Panel SMM
                </h1>
                <p className="lead text-muted mb-3 px-2">
                    Sở hữu website SMM Panel riêng với tên miền và giao diện đẹp mắt
                </p>
                <div className="d-inline-block px-3 px-md-4 py-2 rounded-pill" style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontSize: "0.9rem"
                }}>
                    <i className="fas fa-tag me-2"></i>
                    <strong>Phí tạo:</strong> 100.000đ/1 Tháng
                </div>
            </motion.div>

            {/* Process Steps */}
            <div className="row justify-content-center mb-4 mb-md-5">
                <div className="col-12">
                    <div className="row g-3 g-md-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="col-6 col-md-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card border-0 shadow-sm h-100 text-center"
                                    style={{
                                        background: `linear-gradient(135deg, ${step.color}15 0%, ${step.color}30 100%)`
                                    }}
                                >
                                    <div className="card-body p-3 p-md-4">
                                        <div 
                                            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2 mb-md-3"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                background: step.color,
                                                color: "white"
                                            }}
                                        >
                                            <i className={`fas ${step.icon} fs-5 fs-md-4`}></i>
                                        </div>
                                        <h6 className="fw-bold mb-1 mb-md-2 small">{step.title}</h6>
                                        <p className="text-muted d-none d-md-block" style={{ fontSize: "0.8rem" }}>{step.description}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="row g-3 g-md-4">
                        {/* Mua Domain */}
                        <div className="col-12 col-lg-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="card border-0 shadow-lg h-100">
                                    <div className="card-header text-white border-0 py-2 py-md-3" style={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                    }}>
                                        <h5 className="mb-0 fs-6 fs-md-5">
                                            <i className="fas fa-shopping-cart me-2"></i>
                                            Bước 1: Mua Domain
                                        </h5>
                                    </div>
                                    <div className="card-body p-3 p-md-4">
                                        <div className="alert alert-info border-0 mb-3 mb-md-4 py-2 py-md-3">
                                            <h6 className="alert-heading mb-2 fs-6">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Yêu cầu domain:
                                            </h6>
                                            <ul className="mb-0 ps-3 ps-md-4 small">
                                                <li>✅ Đã được đăng ký và kích hoạt</li>
                                                <li>✅ Có thể trỏ Nameserver</li>
                                                <li>✅ Không phải domain miễn phí</li>
                                                <li>✅ Không vi phạm bản quyền</li>
                                            </ul>
                                        </div>

                                        <h6 className="fw-semibold mb-2 mb-md-3 fs-6">
                                            <i className="fas fa-store me-2 text-success"></i>
                                            Nhà cung cấp gợi ý:
                                        </h6>
                                        <div className="row g-2 g-md-3">
                                            {domainProviders.map((provider, index) => (
                                                <div key={index} className="col-6">
                                                    <span
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="card h-100 border-0 shadow-sm text-decoration-none hover-lift"
                                                        style={{ transition: "all 0.3s" }}
                                                    >
                                                        <div className="card-body text-center p-2 p-md-3">
                                                            <div className="fs-3 fs-md-1 mb-1 mb-md-2">{provider.logo}</div>
                                                            <h6 className="mb-0 small" style={{ color: provider.color }}>
                                                                {provider.name}
                                                            </h6>
                                                        </div>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Trỏ Nameserver */}
                        <div className="col-12 col-lg-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="card border-0 shadow-lg h-100">
                                    <div className="card-header text-white border-0 py-2 py-md-3" style={{
                                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                                    }}>
                                        <h5 className="mb-0 fs-6 fs-md-5">
                                            <i className="fas fa-server me-2"></i>
                                            Bước 2: Trỏ Nameserver
                                        </h5>
                                    </div>
                                    <div className="card-body p-3 p-md-4">
                                        <div className="alert alert-primary border-0 mb-3 mb-md-4 py-2 py-md-3">
                                            <h6 className="alert-heading mb-2 fs-6">
                                                <i className="fas fa-server me-2"></i>
                                                Hướng dẫn cấu hình:
                                            </h6>
                                            <p className="mb-2 small">Truy cập trang quản lý domain và thay đổi Nameserver thành:</p>
                                            <div className="bg-white rounded p-2 p-md-3 mb-2">
                                                <code className="text-dark d-block mb-1 small">
                                                    <strong>NS1:</strong> carter.ns.cloudflare.com
                                                </code>
                                                <code className="text-dark d-block small">
                                                    <strong>NS2:</strong> ophelia.ns.cloudflare.com
                                                </code>
                                            </div>
                                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                <i className="fas fa-clock me-1"></i>
                                                Cập nhật mất 1-24 giờ
                                            </small>
                                        </div>

                                        <div className="alert alert-warning border-0 mb-2 mb-md-3 py-2">
                                            <h6 className="mb-1 mb-md-2 fs-6">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                Lưu ý:
                                            </h6>
                                            <ul className="mb-0 ps-3 ps-md-4" style={{ fontSize: "0.85rem" }}>
                                                <li>Đợi nameserver cập nhật hoàn tất</li>
                                                <li>Kiểm tra bằng DNS Checker</li>
                                                <li>Liên hệ admin nếu cần hỗ trợ</li>
                                            </ul>
                                        </div>

                                        <div className="alert alert-danger border-0 mb-0 py-2">
                                            <h6 className="mb-1 mb-md-2 fs-6">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Quan trọng:
                                            </h6>
                                            <ul className="mb-0 ps-3 ps-md-4" style={{ fontSize: "0.85rem" }}>
                                                <li>⚠️ Website cần tự thêm tất cả dịch vụ</li>
                                                <li>⚠️ Admin chỉ setup Website, phần còn lại tự quản lý</li>
                                                <li>⚠️ Chuẩn bị domain và liên hệ admin</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Liên hệ Admin */}
                        <div className="col-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="card border-0 shadow-lg">
                                    <div className="card-header text-white border-0 py-2 py-md-3" style={{
                                        background: "linear-gradient(135deg, #f093fb 0%, #4facfe 100%)"
                                    }}>
                                        <h5 className="mb-0 fs-6 fs-md-5">
                                            <i className="fas fa-headset me-2"></i>
                                            Bước 3: Liên hệ Admin
                                        </h5>
                                    </div>
                                    <div className="card-body p-3 p-md-4 text-center">
                                        <div className="mb-3 mb-md-4">
                                            <i className="fas fa-comments text-primary mb-2 mb-md-3" style={{ fontSize: "40px" }}></i>
                                            <h5 className="fw-bold mb-2 fs-6 fs-md-5">Gửi thông tin cho Admin</h5>
                                            <p className="text-muted small mb-0">
                                                Vui lòng chuẩn bị các thông tin sau và liên hệ admin:
                                            </p>
                                        </div>

                                        <div className="row g-2 g-md-3 mb-3 mb-md-4">
                                            <div className="col-6 col-md-3">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body p-2 p-md-3">
                                                        <i className="fas fa-globe text-primary mb-1 mb-md-2 fs-5 fs-md-4"></i>
                                                        <h6 className="mb-0" style={{ fontSize: "0.8rem" }}>Tên miền</h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body p-2 p-md-3">
                                                        <i className="fas fa-server text-info mb-1 mb-md-2 fs-5 fs-md-4"></i>
                                                        <h6 className="mb-0" style={{ fontSize: "0.8rem" }}>Nameserver</h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body p-2 p-md-3">
                                                        <i className="fas fa-signature text-success mb-1 mb-md-2 fs-5 fs-md-4"></i>
                                                        <h6 className="mb-0" style={{ fontSize: "0.8rem" }}>Tên website</h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <div className="card bg-light border-0 h-100">
                                                    <div className="card-body p-2 p-md-3">
                                                        <i className="fas fa-phone text-warning mb-1 mb-md-2 fs-5 fs-md-4"></i>
                                                        <h6 className="mb-0" style={{ fontSize: "0.8rem" }}>Liên hệ</h6>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {lienhe && lienhe.length > 0 && (
                                            <div>
                                                <h6 className="mb-2 mb-md-3 fw-bold fs-6">
                                                    <i className="fas fa-phone-alt me-2 text-success"></i>
                                                    Liên hệ qua:
                                                </h6>
                                                <div className="d-flex justify-content-center gap-2 gap-md-3 flex-wrap mb-3 mb-md-4">
                                                    {lienhe.map((contact, index) => (
                                                        <a
                                                            key={index}
                                                            href={contact.value}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-md btn-lg-lg"
                                                            style={{
                                                                minWidth: "140px",
                                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                                color: "white",
                                                                border: "none",
                                                                fontSize: "0.85rem",
                                                                padding: "8px 16px"
                                                            }}
                                                        >
                                                            {contact.logolienhe && (
                                                                <img 
                                                                    src={contact.logolienhe} 
                                                                    alt={contact.type}
                                                                    style={{ width: "20px", height: "20px", marginRight: "8px" }}
                                                                />
                                                            )}
                                                            <span className="small">{contact.type || "Liên hệ"}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="alert alert-success border-0 mb-0 py-2">
                                            <i className="fas fa-check-circle me-2"></i>
                                            <small><strong>Lưu ý:</strong> Admin sẽ hỗ trợ setup trong vòng 24h sau khi nhận thông tin</small>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Webrieng;
