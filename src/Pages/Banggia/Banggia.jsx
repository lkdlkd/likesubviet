import React, { useEffect, useState, useMemo } from "react";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { getServer } from "@/Utils/api";
import { useNavigate } from "react-router-dom";
import { loadingg } from "@/JS/Loading";

const Banggia = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchService, setSearchService] = useState(null);
    const [activePlatform, setActivePlatform] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServers = async () => {
            setLoading(true);
            loadingg("Vui lòng chờ...", true, 9999999);
            try {
                const response = await getServer(token);
                setServers(response.data || []);
                setError(null);
            } catch (err) {
                setError("Không thể tải bảng giá.");
            } finally {
                setLoading(false);
                loadingg(false);
            }
        };
        fetchServers();
    }, [token]);

    // Lấy danh sách nền tảng duy nhất
    const platforms = useMemo(() => {
        return Array.from(new Set(servers.map((s) => s.type)));
    }, [servers]);

    // Tạo options cho react-select, thêm option "Tất cả" ở đầu, sắp xếp theo category (giữ nguyên thứ tự xuất hiện, không theo A-Z)
    const serviceOptions = useMemo(() => {
        // Lấy thứ tự category xuất hiện đầu tiên
        const categoryOrder = [];
        servers.forEach(s => {
            if (s.category && !categoryOrder.includes(s.category)) {
                categoryOrder.push(s.category);
            }
        });
        // Sắp xếp theo thứ tự category xuất hiện trong dữ liệu
        const sorted = [...servers].sort((a, b) => {
            const aIdx = categoryOrder.indexOf(a.category);
            const bIdx = categoryOrder.indexOf(b.category);
            return aIdx - bIdx;
        });
        return [
            { value: '', label: 'Tất cả' },
            ...sorted.map((s) => ({
                value: s.Magoi,
                label: `${s.Magoi} - ${s.maychu} ${s.name} - ${Number(s.rate).toLocaleString("en-US")}đ`,

                // label: `${s.category ? `[${s.category}] ` : ''}${s.Magoi} - ${s.name} - ${Number(s.rate).toLocaleString("en-US")}đ`,
                ...s
            }))
        ];
    }, [servers]);

    // Lọc servers theo searchService nếu có
    const filteredServers = useMemo(() => {
        if (!searchService || searchService.value === '') return servers;
        return servers.filter((s) => s.Magoi === searchService.value);
    }, [servers, searchService]);

    // Khi chọn dịch vụ, tự động set platform tương ứng
    useEffect(() => {
        if (searchService && searchService.value) {
            // Tìm server theo Magoi
            const found = servers.find(s => s.Magoi === searchService.value);
            if (found && found.type) {
                setActivePlatform(found.type);
            }
        }
    }, [searchService, servers]);

    // Khi load lần đầu, set tab đầu tiên
    useEffect(() => {
        if (!activePlatform && platforms.length > 0) {
            setActivePlatform(platforms[0]);
        }
    }, [platforms, activePlatform]);

    // if (loading) return <div>Đang tải bảng giá...</div>;
    // if (error) return <div className="alert alert-danger">{error}</div>;
    // if (!servers.length) return <div>Không có dữ liệu bảng giá.</div>;

    return (
        <div className="">
            <div className="card">
                <div className="card-body">
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
                            {platforms.map((platform, idx) => {
                                const safePlatformId = `services-${platform.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                                return (
                                    <li className="nav-item w-md-200px me-0" role="presentation" key={platform}>
                                        <a
                                            className={`nav-link${activePlatform === platform ? " active" : ""}`}
                                            data-bs-toggle="tab"
                                            href={`#${safePlatformId}`}
                                            aria-selected={activePlatform === platform ? "true" : "false"}
                                            role="tab"
                                            onClick={() => setActivePlatform(platform)}
                                        >
                                            {platform}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="tab-content w-100">
                            {platforms.map((platform, idx) => {
                                const safePlatformId = `services-${platform.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                                return (
                                    <div
                                        className={`tab-pane fade${activePlatform === platform ? " active show" : ""}`}
                                        id={safePlatformId}
                                        role="tabpanel"
                                        key={platform}
                                    >
                                        <div className="accordion accordion-flush" id={`accordion-${safePlatformId}`}>
                                            {/* Lấy các category của platform này */}
                                            {Array.from(new Set(filteredServers.filter(s => (s.type || '').trim() === platform.trim()).map(s => (s.category || '').trim()))).map((category, cidx) => {
                                                const safeCategoryId = `${platform}-${category}`.replace(/[^a-zA-Z0-9_-]/g, "_");
                                                return (
                                                    <div className="accordion-item" key={category}>
                                                        <h5 className="accordion-header m-0" id={`flush-heading-${safeCategoryId}`}>
                                                            <button
                                                                className="accordion-button fw-semibold collapsed bg-light"
                                                                type="button"
                                                                data-bs-toggle="collapse"
                                                                data-bs-target={`#flush-collapse-${safeCategoryId}`}
                                                                aria-expanded="false"
                                                                aria-controls={`flush-collapse-${safeCategoryId}`}
                                                            >
                                                                {category}
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
                                                                    <Table bordered hover className="mb-0 table-centered">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Id</th>
                                                                                <th>Tên máy chủ</th>
                                                                                <th>Giá</th>
                                                                                <th>Mua</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {filteredServers.filter(s => (s.type || '').trim() === platform.trim() && (s.category || '').trim() === category).map((server) => (
                                                                                <tr key={server.Magoi}>
                                                                                    <td>{server.Magoi}</td>
                                                                                    <td style={{
                                                                                        maxWidth: "250px",
                                                                                        whiteSpace: "normal",
                                                                                        wordWrap: "break-word",
                                                                                        overflowWrap: "break-word",
                                                                                    }}>{server.maychu} {server.name}</td>
                                                                                    <td>{Number(server.rate).toLocaleString("en-US")}</td>
                                                                                    <td>
                                                                                        <button
                                                                                            className="btn btn-sm btn-success"
                                                                                            onClick={() => {
                                                                                                window.location.href = `/order/${String(server.path).toLowerCase()}`;
                                                                                            }}
                                                                                        >
                                                                                            Mua
                                                                                        </button>
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
                            {!loading &&(
                                <div className="text-center mt-5">
                                    <p>Không có dữ liệu bảng giá.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banggia;
