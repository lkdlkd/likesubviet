'use client';
import { useState, useEffect, useCallback } from "react";
import { createServer, getAllSmmPartners } from "@/Utils/api";
import axios from "axios";
import { toast } from "react-toastify";
import Table from "react-bootstrap/Table";

export default function Adddichvu({
  token,
  categories,
  editMode = false,
  initialData = {},
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    maychu: "",
    name: "",
    description: "",
    DomainSmm: "",
    serviceId: "",
    serviceName: "",
    min: 0,
    max: 0,
    rate: 0,
    originalRate: 0,
    getid: "off",
    comment: "off",
    reaction: "off",
    matlive: "off",
    isActive: true,
    ...initialData,
  });
  const [smmPartners, setSmmPartners] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  // const handleQuickAddService = (e) => {
  //   const selectedServiceIds = Array.from(e.target.selectedOptions).map(
  //     (option) => option.value
  //   );

  //   const selected = services.filter((service) =>
  //     selectedServiceIds.includes(String(service.service))
  //   );

  //   setSelectedServices(selected);
  // };
  const loadSmmPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSmmPartners(token);
      setSmmPartners(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tác:", error);
      toast.error("Không thể tải danh sách đối tác. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSmmPartners();
  }, [loadSmmPartners]);

  useEffect(() => {
    if (editMode && initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [editMode, initialData]);

  const handleDomainChange = async (e) => {
    const domain = e.target.value;
    setFormData({
      ...formData,
      DomainSmm: domain,
      serviceId: "",
      serviceName: "",
      originalRate: 0,
      min: 0,
      max: 0,
      rate: 0,
    });
    setServices([]);
    const partner = smmPartners.find((p) => p.name === domain);
    if (!partner) return;

    try {
      setLoadingServices(true);
      const res = await axios.post(partner.url_api, {
        key: partner.api_token,
        action: "services",
      });
      const servicesData = res.data;
      setServices(servicesData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ bên thứ 3:", error);
      toast.error("Không thể lấy danh sách dịch vụ từ đối tác. Vui lòng thử lại!");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleServiceChange = (e) => {
    const id = e.target.value;
    const svc = services.find((s) => String(s.service) === id);
    const partner = smmPartners.find((p) => p.name === formData.DomainSmm);
    const tigia = partner?.tigia || 1;

    if (svc) {
      setFormData({
        ...formData,
        serviceId: svc.service,
        serviceName: svc.name,
        min: svc.min || 0,
        max: svc.max || 0,
        rate: svc.rate * tigia,
        originalRate: svc.rate * tigia || 0,
      });
    } else {
      setFormData({
        ...formData,
        serviceId: id,
        serviceName: "",
        min: 0,
        max: 0,
        rate: 0,
        originalRate: 0,
      });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const partner = smmPartners.find((p) => p.name === formData.DomainSmm);
      const tigia = partner?.tigia || 1; // Lấy tỷ giá từ partner

      if (selectedServices.length > 0) {
        // Gọi API cho từng dịch vụ trong danh sách đã chọn
        await Promise.all(
          selectedServices.map(async (service) => {
            const payload = {
              ...formData,
              serviceId: service.service,
              serviceName: service.name, // Lấy tên từ dịch vụ bên thứ 3
              name: service.name, // Lấy tên từ dịch vụ bên thứ 3
              min: service.min || 0,
              max: service.max || 0,
              rate: service.rate * tigia, // Sử dụng partner.tigia
              originalRate: service.rate * tigia,
            };
            await createServer(payload, token);
          })
        );
      } else {

        await createServer(formData, token);
      }

      toast.success("Dịch vụ đã được thêm thành công!");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      toast.error("Lỗi khi thêm dịch vụ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };
  const filteredCategories = categories.filter(
    (category) => category.platforms_id?._id === selectedPlatform
  );
  const uniqueCategories = Array.from(
    new Set(services.map((service) => service.category))
  ).filter((category) => category);

  const filteredServices = services.filter(
    (service) => service.category === selectedCategory
  );



  return (
    <div className="form-group mb-3">
      <form className="smmdv-form" onSubmit={handleAddSubmit}>
        <div className="row mb-4">
          <h3 className="text-primary">
            Thêm mới dịch vụ
          </h3>
          <div className="col-md-6 mb-3">
            <label className="form-label">Nền tảng:</label>
            <select
              name="platform"
              value={selectedPlatform}
              onChange={(e) => {
                const platformId = e.target.value;
                setSelectedPlatform(platformId);

                // Tìm platform theo ID
                const platform = categories
                  .map((category) => category.platforms_id)
                  .find((p) => p._id === platformId);
                if (platform) {
                  // Cập nhật type bằng platform.name
                  setFormData((prev) => ({
                    ...prev,
                    type: platform.name,
                  }));
                }
              }}
              className="form-select"
              required
            >
              <option value="">Chọn nền tảng</option>
              {categories
                .map((category) => category.platforms_id)
                .filter(
                  (platform, index, self) =>
                    platform && index === self.findIndex((p) => p._id === platform._id)
                ) // Loại bỏ các nền tảng trùng lặp
                .map((platform) => (
                  <option key={platform._id} value={platform._id}>
                    {platform.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Danh mục:</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="form-select"
              required
            >
              <option value="">Chọn danh mục</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Máy chủ ( thêm server nhanh bỏ trống ):</label>
            <input
              type="text"
              name="maychu"
              value={formData.maychu}
              onChange={(e) =>
                setFormData({ ...formData, maychu: e.target.value })
              }
              list="maychu"
              placeholder="Sv1, Sv2,..."
              className="form-control"
            />
            <datalist id="maychu">
              <option value="Sv1" />
              <option value="Sv2" />
              <option value="Sv3" />
              <option value="Sv4" />
              <option value="Sv5" />
              <option value="Sv6" />
              <option value="Sv7" />
            </datalist>
          </div>
          {selectedServices.length === 0 && (
            <div className="col-md-6 mb-3">
              <label className="form-label">Tên dịch vụ ( thêm server nhanh bỏ trống ): </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-control"
                placeholder="Like post VN"
              />
            </div>
          )}
          <div className="col-12 mb-3">
            <label className="form-label">Mô tả:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-control"
              placeholder="Mô tả dịch vụ..."
            />
          </div>
        </div>
        <div className="row mb-4">
          <h3 className="text-primary">Các chức năng</h3>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Get ID:</label>
            <select
              name="getid"
              value={formData.getid}
              onChange={(e) =>
                setFormData({ ...formData, getid: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Comment:</label>
            <select
              name="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Reaction:</label>
            <select
              name="reaction"
              value={formData.reaction}
              onChange={(e) =>
                setFormData({ ...formData, reaction: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Matlive:</label>
            <select
              name="matlive"
              value={formData.matlive}
              onChange={(e) =>
                setFormData({ ...formData, matlive: e.target.value })
              }
              className="form-select"
            >
              <option value="on">Bật</option>
              <option value="off">Tắt</option>
            </select>
          </div>
        </div>

        <div className="row mb-4">
          <h3 className="text-primary">Thông tin SMM</h3>
          <div className="col-md-6 mb-3">
            <label className="form-label">Domain SMM:</label>
            <select
              name="DomainSmm"
              value={formData.DomainSmm}
              onChange={handleDomainChange} // Gọi hàm handleDomainChange
              className="form-select"
              required
            >
              <option value="">Chọn domain</option>
              {smmPartners.map((partner) => (
                <option key={partner.id} value={partner.name}>
                  {partner.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Doanh mục :</label>
            {loadingServices ? (
              <p>Đang tải danh sách dịch vụ...</p>
            ) : (
              <select
                name="Doanhmuc"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Chọn Doanh mục</option>
                {uniqueCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category || "Không có danh mục"}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Tên dịch vụ bên SMM ( thêm server nhanh bỏ trống ):</label>
            {loadingServices ? (
              <p>Đang tải danh sách dịch vụ...</p>
            ) : (
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceChange}
                className="form-select"

              >
                <option value="">Chọn Dịch Vụ</option>
                {filteredServices.map((service) => (
                  <option key={service.service} value={service.service}>
                    {service.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Service ID (nhập trực tiếp) ( thêm server nhanh bỏ trống ):</label>
            <input
              type="text"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleServiceChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Giới hạn Min( thêm server nhanh bỏ trống ): </label>
            <input
              type="number"
              name="min"
              value={formData.min}
              onChange={(e) =>
                setFormData({ ...formData, min: Number(e.target.value) })
              }
              className="form-control"

            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Giới hạn Max ( thêm server nhanh bỏ trống ):</label>
            <input
              type="number"
              name="max"
              value={formData.max}
              onChange={(e) =>
                setFormData({ ...formData, max: Number(e.target.value) })
              }
              className="form-control"

            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Giá (đã tính) ( thêm server nhanh bỏ trống ):</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: Number(e.target.value) })
              }
              className="form-control"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Giá gốc (bên thứ 3) ( thêm server nhanh bỏ trống ):</label>
            <input
              type="number"
              name="originalRate"
              value={formData.originalRate}
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Trạng thái:</label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.value === "true" })
              }
              className="form-select"
            >
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-md-12 mb-3">
            <label className="form-label">Chọn nhanh dịch vụ theo danh mục:</label>
            {loadingServices ? (
              <p>Đang tải danh sách dịch vụ...</p>
            ) : (
              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices(filteredServices); // Chọn tất cả
                          } else {
                            setSelectedServices([]); // Bỏ chọn tất cả
                          }
                        }}
                        checked={
                          selectedServices.length === filteredServices.length &&
                          filteredServices.length > 0
                        }
                      />
                    </th>
                    <th>MÃ</th>
                    <th>Tên dịch vụ</th>
                    <th>Giá</th>
                    <th>Min</th>
                    <th>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => {
                    const partner = smmPartners.find((p) => p.name === formData.DomainSmm); // Tìm đối tác hiện tại
                    const tigia = partner?.tigia || 1; // Lấy tỷ giá, mặc định là 1 nếu không có

                    return (
                      <tr key={service.service}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedServices.some(
                              (selected) => selected.service === service.service
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServices((prev) => [...prev, service]); // Thêm vào danh sách đã chọn
                              } else {
                                setSelectedServices((prev) =>
                                  prev.filter(
                                    (selected) => selected.service !== service.service
                                  )
                                ); // Loại bỏ khỏi danh sách đã chọn
                              }
                            }}
                          />
                        </td>
                        <td>{service.service}</td>
                        <td style={{
                          maxWidth: "450px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}>{service.name}</td>
                        <td>{service.rate * tigia}</td>
                        <td>{service.min}</td>
                        <td>{service.max}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
          <div className="col-md-12 mb-3">
            <label className="form-label">Danh sách dịch vụ đã chọn:</label>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>MÃ</th>
                  <th>Tên dịch vụ</th>
                  <th>Giá</th>
                  <th>Min</th>
                  <th>Max</th>
                </tr>
              </thead>
              <tbody>
                {selectedServices.map((service, index) => {
                  const partner = smmPartners.find((p) => p.name === formData.DomainSmm); // Tìm đối tác hiện tại
                  const tigia = partner?.tigia || 1; // Lấy tỷ giá, mặc định là 1 nếu không có

                  return (
                    <tr key={index}>
                      <td>{service.service}</td>
                      <td style={{
                        maxWidth: "450px",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}>{service.name}</td>
                      <td>{service.rate * tigia}</td>
                      <td>{service.min}</td>
                      <td>{service.max}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : editMode ? "Sửa Dịch Vụ" : "Thêm Dịch Vụ"}
          </button>
        </div>
      </form>
    </div>
  );
}