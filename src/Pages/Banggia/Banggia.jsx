import React, { useEffect, useState, useMemo } from "react";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { getServer } from "@/Utils/api";
import { useNavigate } from "react-router-dom";

const Banggia = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchService, setSearchService] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServers = async () => {
            setLoading(true);
            try {
                const response = await getServer(token);
                setServers(response.data || []);
                setError(null);
            } catch (err) {
                setError("Không thể tải bảng giá.");
            } finally {
                setLoading(false);
            }
        };
        fetchServers();
    }, [token]);

    // Lấy danh sách nền tảng duy nhất
    const platforms = useMemo(() => {
        return Array.from(new Set(servers.map((s) => s.type)));
    }, [servers]);

    // Tạo options cho react-select, thêm option "Tất cả" ở đầu
    const serviceOptions = useMemo(() => [
        { value: '', label: 'Tất cả' },
        ...servers.map((s) => ({
            value: s.Magoi,
            label: `${s.Magoi} - ${s.name} - ${Number(s.rate).toLocaleString("en-US")}đ`,
            ...s
        }))

    ], [servers]);

    // Lọc servers theo searchService nếu có
    const filteredServers = useMemo(() => {
        if (!searchService || searchService.value === '') return servers;
        return servers.filter((s) => s.Magoi === searchService.value);
    }, [servers, searchService]);

    if (loading) return <div>Đang tải bảng giá...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!servers.length) return <div>Không có dữ liệu bảng giá.</div>;

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
                            {platforms.map((platform, idx) => (
                                <li className="nav-item w-md-200px me-0" role="presentation" key={platform}>
                                    <a
                                        className={`nav-link${idx === 0 ? " active" : ""}`}
                                        data-bs-toggle="tab"
                                        href={`#services-${platform}`}
                                        aria-selected={idx === 0 ? "true" : "false"}
                                        role="tab"
                                    >
                                        {platform}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="tab-content w-100">
                            {platforms.map((platform, idx) => (
                                <div
                                    className={`tab-pane fade${idx === 0 ? " active show" : ""}`}
                                    id={`services-${platform}`}
                                    role="tabpanel"
                                    key={platform}
                                >
                                    <div className="accordion accordion-flush" id={`accordion-${platform}`}>
                                        {/* Lấy các category của platform này */}
                                        {Array.from(new Set(filteredServers.filter(s => s.type === platform).map(s => s.category))).map((category, cidx) => (
                                            <div className="accordion-item" key={category}>
                                                <h5 className="accordion-header m-0" id={`flush-heading-${platform}-${category}`}>
                                                    <button
                                                        className="accordion-button fw-semibold collapsed bg-light"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target={`#flush-collapse-${platform}-${category}`}
                                                        aria-expanded="false"
                                                        aria-controls={`flush-collapse-${platform}-${category}`}
                                                    >
                                                        {category}
                                                    </button>
                                                </h5>
                                                <div
                                                    id={`flush-collapse-${platform}-${category}`}
                                                    className={`accordion-collapse collapse${cidx === 0 ? " show" : ""}`}
                                                    aria-labelledby={`flush-heading-${platform}-${category}`}
                                                    data-bs-parent={`#accordion-${platform}`}
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
                                                                    {filteredServers.filter(s => s.type === platform && s.category === category).map((server) => (
                                                                        <tr key={server.Magoi}>
                                                                            <td>{server.Magoi}</td>
                                                                            <td style={{
                                                                                maxWidth: "250px",
                                                                                whiteSpace: "normal",
                                                                                wordWrap: "break-word",
                                                                                overflowWrap: "break-word",
                                                                            }}>{server.name}</td>
                                                                            <td>{Number(server.rate).toLocaleString("en-US")}</td>
                                                                            <td>
                                                                                <button
                                                                                    className="btn btn-sm btn-success"
                                                                                    onClick={() => {
                                                                                        window.location.href = `/order?id=${server.Magoi}`;
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
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banggia;
