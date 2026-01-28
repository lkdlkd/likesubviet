import { loadingg } from "@/JS/Loading";
import { getServer } from "@/Utils/api";
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import Table from "react-bootstrap/Table";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import Select from "react-select";
const Banggia = () => {
    const [servers, setServers] = useState([]); // Dữ liệu hierarchical từ API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchService, setSearchService] = useState(null);
    const [activePlatform, setActivePlatform] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { configWeb } = useOutletContext();
    const daily = configWeb && configWeb.daily ? configWeb.daily : 1000000;
    const npp = configWeb && configWeb.distributor ? configWeb.distributor : 10000000;

    useEffect(() => {
        const fetchServers = async () => {
            setLoading(true);
            loadingg("Vui lòng chờ...", true, 9999999);
            try {
                const response = await getServer(token);
                setServers(response.data || []); // Dữ liệu hierarchical: platforms → categories → services
                setError(null);
            } catch (err) {
                setError("Không thể tải bảng giá.");
            } finally {
                setLoading(false);
                loadingg("Đang tải...", false);
            }
        };
        fetchServers();
    }, [token]);

    // ===== TỐI ƯU: TẠO MAP ĐỂ TRUY CẬP O(1) =====
    const platformMap = useMemo(() => {
        if (!Array.isArray(servers)) return new Map();
        const map = new Map();
        servers.forEach(platform => {
            map.set(platform.platform_name, platform);
        });
        return map;
    }, [servers]);

    // Lấy platform đang active - O(1) lookup
    const activePlatformData = useMemo(() => {
        return platformMap.get(activePlatform) || null;
    }, [platformMap, activePlatform]);

    // ===== FLATTEN CHỈ CHO TÌM KIẾM TOÀN CỤC (serviceOptions) =====
    const flattenedServers = useMemo(() => {
        if (!Array.isArray(servers)) return [];
        const result = [];
        servers.forEach(platform => {
            if (!platform.categories) return;
            platform.categories.forEach(category => {
                if (!category.services) return;
                category.services.forEach(service => {
                    result.push({
                        ...service,
                        type: platform.platform_name,
                        category: category.category_name,
                        category_path: category.category_path,
                        logo: platform.platform_logo,
                    });
                });
            });
        });
        return result;
    }, [servers]);

    // Tạo Map cho tìm kiếm nhanh service theo Magoi - O(1)
    const serviceMap = useMemo(() => {
        const map = new Map();
        flattenedServers.forEach(s => map.set(s.Magoi, s));
        return map;
    }, [flattenedServers]);

    // Tạo options cho react-select
    const serviceOptions = useMemo(() => {
        return [
            { value: '', label: 'Tất cả' },
            ...flattenedServers.map((s) => ({
                value: s.Magoi,
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="font-semibold"> {s.logo && (
                            <img src={s.logo} alt={s.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        )} <strong className="badge bg-info">[{s.Magoi}]</strong> - {s.maychu} <span style={{ lineHeight: "1.2", verticalAlign: "middle" }} dangerouslySetInnerHTML={{ __html: s.name }} /> <span className="badge bg-primary">{String(s.rate)}đ</span>
                            <span className={`badge ms-1 ${s.isActive ? 'bg-success' : 'bg-danger'}`}>{s.isActive ? " Hoạt động" : " Bảo trì"}</span>
                            {s.refil === "on" && (<span className="badge bg-success ms-1"> Bảo hành</span>)}
                            {s.cancel === "on" && (<span className="badge bg-warning ms-1"> Có hủy hoàn</span>)}
                        </span>
                    </div>
                ),
                ...s
            }))
        ];
    }, [flattenedServers]);

    // ===== TỐI ƯU: FILTER DATA DỰA TRÊN SEARCH - O(1) nếu có search =====
    const displayData = useMemo(() => {
        // Nếu có tìm kiếm cụ thể -> trả về service đó trong format phù hợp
        if (searchService && searchService.value) {
            const found = serviceMap.get(searchService.value);
            if (found) {
                // Trả về cấu trúc hierarchical với chỉ 1 service
                return [{
                    platform_name: found.type,
                    platform_logo: found.logo,
                    categories: [{
                        category_name: found.category,
                        category_path: found.category_path,
                        services: [found]
                    }]
                }];
            }
            return [];
        }
        // Không tìm kiếm -> trả về platform đang active
        if (activePlatformData) {
            return [activePlatformData];
        }
        return servers;
    }, [searchService, serviceMap, activePlatformData, servers]);

    // Khi chọn dịch vụ, tự động set platform tương ứng - O(1)
    useEffect(() => {
        if (searchService && searchService.value) {
            const found = serviceMap.get(searchService.value);
            if (found && found.type) {
                setActivePlatform(found.type);
            }
        }
    }, [searchService, serviceMap]);

    // Khi load lần đầu, set tab đầu tiên
    useEffect(() => {
        if (!activePlatform && servers.length > 0) {
            setActivePlatform(servers[0]?.platform_name || "");
        }
    }, [servers, activePlatform]);

    // if (loading) return <div>Đang tải bảng giá...</div>;
    // if (error) return <div className="alert alert-danger">{error}</div>;
    // if (!servers.length) return <div>Không có dữ liệu bảng giá.</div>;

    return (
        <>
            <div>
                <style>{`
            .card-pricing {
                border: 1px solid #e3ebf6;
                border-radius: 8px;
                transition: all 0.3s ease;
                position: relative;
            }

            .card-pricing:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(74, 137, 220, 0.15);
            }

            .card-pricing-recommended {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                transform: scale(1.02);
            }

            .card-pricing-recommended .card-pricing-plan-name {
                color: white !important;
            }

            .card-pricing-plan-name {
                font-size: 1rem;
                letter-spacing: 0.5px;
                margin-bottom: 1rem;
                color: #6c757d;
                font-weight: 700;
            }

            .card-pricing-icon {
                font-size: 2.5rem;
                margin-bottom: 1.2rem;
                opacity: 0.9;
            }

         
            .card-pricing-features {
                list-style: none;
                padding: 0;
                margin: 1rem 0;
                font-size: 0.95rem;
                text-align: left;
                line-height: 1.6;
            }

            .card-pricing-features li {
                padding: 0.4rem 0;
                position: relative;
                padding-left: 1.4rem;
                font-weight: 500;
            }

            .card-pricing-features li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
                font-size: 1rem;
            }

            .card-pricing-recommended .card-pricing-features li:before {
                color: #ffd700;
            }

            .width-sm {
                min-width: 130px;
                font-size: 0.9rem;
                padding: 0.6rem 1.2rem;
                font-weight: 600;
                border-radius: 6px;
            }

            @media (max-width: 1200px) {
                .card-pricing {
                    margin-bottom: 1rem;
                }
                
                .card-pricing-recommended {
                    transform: none;
                }
            }
                  .card-pricing {
                        border: 2px solid #e3f2fd;
                        border-radius: 10px;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    }
                    
                    .card-pricing:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.12);
                        border-color: #2196f3;
                    }
                    
                    .card-pricing-recommended {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border-color: #667eea;
                        color: white;
                    }
                    
                    .card-pricing-recommended:hover {
                        transform: translateY(-3px);
                    }
                    
                    .card-pricing-recommended .card-pricing-plan-name,
                    .card-pricing-recommended h3,
                    .card-pricing-recommended .card-pricing-features {
                        color: white;
                    }
                    
                    .card-pricing-plan-name {
                        font-size: 14px;
                        margin-bottom: 15px;
                        color: #2c3e50;
                        letter-spacing: 0.5px;
                    }
                    
                    .card-pricing-icon {
                        display: inline-block;
                        width: 50px;
                        height: 50px;
                        line-height: 50px;
                        border-radius: 50%;
                        background: rgba(102, 126, 234, 0.1);
                        margin-bottom: 15px;
                        font-size: 24px;
                    }
                    
                    .card-pricing-recommended .card-pricing-icon {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .card-pricing-price {
                        color: #667eea;
                        font-weight: bold;
                        font-size: 25px;
                    }
                    
                    .card-pricing-recommended .card-pricing-price {
                        color: #fff;
                    }
                    
                    .card-pricing-features {
                        list-style: none;
                        padding: 0;
                        margin: 15px 0;
                        text-align: left;
                    }
                    
                    .card-pricing-features li {
                        padding: 4px 0;
                        border-bottom: 1px solid rgba(0,0,0,0.08);
                        position: relative;
                        padding-left: 20px;
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    
                    .card-pricing-recommended .card-pricing-features li {
                        border-bottom-color: rgba(255,255,255,0.15);
                    }
                    
                    .card-pricing-features li:before {
                        content: "✓";
                        position: absolute;
                        left: 0;
                        color: #28a745;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    
                    .card-pricing-recommended .card-pricing-features li:before {
                        color: #fff;
                    }
                    
                    .card-pricing-features li:last-child {
                        border-bottom: none;
                    }
                    
                    .width-sm {
                        min-width: 100px;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 500;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                        transition: all 0.3s ease;
                    }
                    
                    .card-pricing-recommended::before {
                        content: "PHỔ BIẾN";
                        position: absolute;
                        top: 15px;
                        right: -25px;
                        background: #ff6b6b;
                        color: white;
                        padding: 3px 30px;
                        font-size: 10px;
                        font-weight: bold;
                        transform: rotate(45deg);
                        letter-spacing: 0.5px;
                    }
                    
                    @media (max-width: 1200px) {
                        .card-pricing-recommended::before {
                            display: none;
                        }
                        
                        .table-responsive {
                            font-size: 0.75rem;
                        }
                        
                        .table-responsive .btn {
                            font-size: 0.7rem;
                            padding: 0.2rem 0.4rem;
                        }
                        
                        .table th, .table td {
                            padding: 0.5rem 0.25rem;
                            vertical-align: middle;
                        }
                        
                        .table th {
                            font-size: 0.8rem;
                            font-weight: 600;
                        }
                    }
            `}</style>
                {/* Service Price List Section - Main Content */}
                <div className="card mb-4">
                    <div className="card-body">
                        <div className="mb-4">
                            <h3 className="fw-bold text-primary mb-3">
                                <i className="fas fa-list-ul me-2"></i>
                                Bảng Giá Dịch Vụ
                            </h3>
                            <p className="text-muted mb-3">Tìm kiếm và xem giá các dịch vụ có sẵn</p>
                        </div>

                        <label className="form-label text-dark">Tìm dịch vụ:</label>
                        <Select
                            className="mb-3"
                            options={serviceOptions}
                            value={searchService}
                            onChange={setSearchService}
                            placeholder="---Tìm dịch vụ---"
                            isClearable
                        />
                        <div className="d-flex flex-column flex-md-row mt-3">
                            <ul style={{ width: 300 }} className="nav nav-tabs nav-pills border-0 flex-row flex-md-column me-5 mb-3 mb-md-0 fs-6" role="tablist">
                                {/* ===== TỐI ƯU: TRUY CẬP TRỰC TIẾP TỪ servers HIERARCHICAL ===== */}
                                {servers.map((platform) => {
                                    const safePlatformId = `services-${platform.platform_name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                                    return (
                                        <li className="nav-item w-md-200px me-0" role="presentation" key={platform.platform_id}>
                                            <a
                                                className={`nav-link${activePlatform === platform.platform_name ? " active" : ""}`}
                                                data-bs-toggle="tab"
                                                href={`#${safePlatformId}`}
                                                aria-selected={activePlatform === platform.platform_name ? "true" : "false"}
                                                role="tab"
                                                onClick={() => setActivePlatform(platform.platform_name)}
                                            >
                                                {platform.platform_logo && (
                                                    <img src={platform.platform_logo} alt={platform.platform_name} 
                                                        style={{ width: 20, height: 20, objectFit: 'contain', marginRight: 8 }} />
                                                )}
                                                {platform.platform_name}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="tab-content w-100">
                                {/* ===== TỐI ƯU: RENDER TRỰC TIẾP TỪ displayData - KHÔNG FILTER LẠI ===== */}
                                {displayData.map((platform) => {
                                    const safePlatformId = `services-${platform.platform_name.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                                    return (
                                        <div
                                            className={`tab-pane fade${activePlatform === platform.platform_name ? " active show" : ""}`}
                                            id={safePlatformId}
                                            role="tabpanel"
                                            key={platform.platform_name}
                                        >
                                            <div className="accordion accordion-flush" id={`accordion-${safePlatformId}`}>
                                                {/* ===== TỐI ƯU: TRUY CẬP TRỰC TIẾP platform.categories - O(1) ===== */}
                                                {(platform.categories || []).map((category, cidx) => {
                                                    const safeCategoryId = `${platform.platform_name}-${category.category_name}`.replace(/[^a-zA-Z0-9_-]/g, "_");
                                                    return (
                                                        <div className="accordion-item" key={category.category_id || category.category_name}>
                                                            <h5 className="accordion-header m-0" id={`flush-heading-${safeCategoryId}`}>
                                                                <button
                                                                    className="accordion-button fw-semibold collapsed bg-light"
                                                                    type="button"
                                                                    data-bs-toggle="collapse"
                                                                    data-bs-target={`#flush-collapse-${safeCategoryId}`}
                                                                    aria-expanded="false"
                                                                    aria-controls={`flush-collapse-${safeCategoryId}`}
                                                                >
                                                                    {category.category_name}
                                                                </button>
                                                            </h5>
                                                            <div
                                                                id={`flush-collapse-${safeCategoryId}`}
                                                                className={`accordion-collapse collapse${cidx === 0 ? " show" : ""}`}
                                                                aria-labelledby={`flush-heading-${safeCategoryId}`}
                                                                data-bs-parent={`#accordion-${safePlatformId}`}
                                                            >
                                                                <div className="accordion-body">
                                                                    <div className="table-responsive">
                                                                        <Table bordered hover responsive className="mb-0 table-centered table-sm">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th style={{ minWidth: "50px", width: "8%" }}>Id</th>
                                                                                    <th style={{ minWidth: "180px", width: "30%" }}>Tên máy chủ</th>
                                                                                    <th style={{ minWidth: "80px", width: "15%" }}>Thành Viên</th>
                                                                                    <th style={{ minWidth: "80px", width: "15%" }}>Đại Lý</th>
                                                                                    <th style={{ minWidth: "80px", width: "15%" }}>Nhà Phân Phối</th>
                                                                                    <th style={{ minWidth: "70px", width: "10%" }}>Tốc độ</th>
                                                                                    <th style={{ minWidth: "60px", width: "7%" }}>Mua</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {/* ===== TỐI ƯU: TRUY CẬP TRỰC TIẾP category.services - O(1) ===== */}
                                                                                {(category.services || []).map((server) => (
                                                                                    <tr key={server.Magoi}>
                                                                                        <td className="text-center">{server.Magoi}</td>
                                                                                        <td style={{
                                                                                            maxWidth: "200px",
                                                                                            whiteSpace: "normal",
                                                                                            wordWrap: "break-word",
                                                                                            overflowWrap: "break-word",
                                                                                            fontSize: "0.85rem"
                                                                                        }}>{server.maychu} <span dangerouslySetInnerHTML={{ __html: server.name }} /></td>
                                                                                        <td className="text-end" style={{ fontSize: "0.85rem" }}>
                                                                                            {server.rate}đ
                                                                                        </td>
                                                                                        <td className="text-end" style={{ fontSize: "0.85rem" }}>
                                                                                            {server.ratevip}đ
                                                                                        </td>
                                                                                        <td className="text-end" style={{ fontSize: "0.85rem" }}>
                                                                                            {server.rateDistributor}đ
                                                                                        </td>
                                                                                        <td className="text-center" style={{ fontSize: "0.8rem" }}>{server.tocdodukien}</td>
                                                                                        <td className="text-center">
                                                                                            <Link
                                                                                                className="btn btn-sm btn-success"
                                                                                                to={`/order/${category.category_path || 'default'}?magoi=${server.Magoi}`}
                                                                                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                                                                            >
                                                                                                Mua
                                                                                            </Link>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* {!loading &&(
                                <div className="text-center mt-5">
                                    <p>Không có dữ liệu bảng giá.</p>
                                </div>
                            )} */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Tiers Section - Compact and below the price list */}
                <div className="card mt-4">
                    <div className="card-body">
                        <div className="text-center mb-4">
                            <h3 className="fw-bold text-primary mb-2" style={{ fontSize: '1.8rem' }}>
                                <div>
                                    <i className="fas fa-crown me-2" style={{ marginRight: '20px' }}></i>
                                </div>
                                Bảng Cấp Bậc Thành Viên
                            </h3>
                            <p className="text-muted fs-5">Nâng cấp tài khoản để nhận được nhiều ưu đãi hơn</p>
                        </div>

                        <div className="row">
                            <div className="col-lg-4 mb-3">
                                <div className="card card-pricing h-100">
                                    <div className="card-body text-center d-flex flex-column p-4">
                                        <p className="card-pricing-plan-name fw-bold text-uppercase fs-6">Cấp: Khách hàng</p>
                                        <span className="card-pricing-icon text-primary">
                                            <i className="fas fa-user" style={{ fontSize: '2.5rem' }}></i>
                                        </span>
                                        <h3 className="mb-3 fw-bold">Tổng nạp đủ <span className="card-pricing-price">Mặc định</span></h3>
                                        <ul className="card-pricing-features flex-grow-1">
                                            <li>Cấp độ mặc định khi đăng ký</li>
                                            <li>Hỗ trợ khách hàng 24/7</li>

                                        </ul>
                                        <Link to="/nap-tien" className="mt-auto">
                                            <button className="btn btn-primary waves-effect waves-light mt-2 mb-1 width-sm">
                                                <i className="fas fa-credit-card me-1"></i>
                                                Nạp ngay
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 mb-3">
                                <div className="card card-pricing card-pricing-recommended h-100">
                                    <div className="card-body text-center d-flex flex-column p-4">
                                        <p className="card-pricing-plan-name fw-bold text-uppercase fs-6">Cấp: Đại lý</p>
                                        <span className="card-pricing-icon text-white">
                                            <i className="fas fa-award" style={{ fontSize: '2.5rem' }}></i>
                                        </span>
                                        <h3 className="mb-3 fw-bold">Tổng nạp đủ <span className="card-pricing-price">{Number(daily).toLocaleString("vi-VN")}đ</span></h3>
                                        <ul className="card-pricing-features flex-grow-1">
                                            <li>Nạp đủ và thăng cấp tự động</li>
                                            <li>Giảm giá tất cả dịch vụ</li>
                                            <li>Được tạo website riêng</li>
                                            <li>Hỗ trợ 24/7</li>
                                            <li>Chương trình khuyến mãi riêng</li>
                                        </ul>
                                        <Link to="/nap-tien" className="mt-auto">
                                            <button className="btn btn-light waves-effect mt-2 mb-1 width-sm">
                                                <i className="fas fa-rocket me-1"></i>
                                                Nâng cấp
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 mb-3">
                                <div className="card card-pricing h-100">
                                    <div className="card-body text-center d-flex flex-column p-4">
                                        <p className="card-pricing-plan-name fw-bold text-uppercase fs-6">Cấp: Nhà phân phối</p>
                                        <span className="card-pricing-icon text-primary">
                                            <i className="fas fa-building" style={{ fontSize: '2.5rem' }}></i>
                                        </span>
                                        <h3 className="mb-3 fw-bold">Tổng nạp đủ <span className="card-pricing-price">{Number(npp).toLocaleString("vi-VN")}đ</span></h3>
                                        <ul className="card-pricing-features flex-grow-1">
                                            <li>Thăng cấp tự động khi đủ điều kiện</li>
                                            <li>Giảm giá thấp nhất cho tất cả dịch vụ</li>
                                            <li>Nhân viên hỗ trợ riêng 24/7</li>
                                            <li>Được tạo website riêng - Hỗ trợ riêng</li>
                                            <li>Khuyến mãi và ưu đãi độc quyền</li>
                                        </ul>
                                        <Link to="/nap-tien" className="mt-auto">
                                            <button className="btn btn-primary waves-effect waves-light mt-2 mb-1 width-sm">
                                                <i className="fas fa-rocket me-1"></i>
                                                VIP ngay
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Banggia;
