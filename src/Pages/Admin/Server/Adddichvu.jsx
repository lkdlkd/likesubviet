'use client';
import { useState, useEffect, useCallback } from "react";
import { createServer, getAllSmmPartners, getServicesFromSmm } from "@/Utils/api";
import { toast } from "react-toastify";
import Table from "react-bootstrap/Table";
import Select from "react-select";

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
    min: "",
    max: "",
    rate: "",
    originalRate: "",
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
  const [quickAddMode, setQuickAddMode] = useState(false); // <--- ADD THIS

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "min" || name === "max" || name === "rate" ? (value === "" ? "" : Number(value)) : value,
    });
  };

  const handleDomainChange = async (e) => {
    const domain = e.target.value;
    setFormData({
      ...formData,
      DomainSmm: domain,
      serviceId: "",
      serviceName: "",
      originalRate: "",
      min: "",
      max: "",
      rate: "",
    });
    setServices([]);
    const partner = smmPartners.find((p) => p.name === domain);
    if (!partner) return;

    try {
      setLoadingServices(true);
      const servicesData = await getServicesFromSmm(partner._id, token);
      setServices(servicesData.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ backend:", error);
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
        min: svc.min || "",
        max: svc.max || "",
        rate: svc.rate * tigia || "",
        originalRate: svc.rate * tigia || "",
        // Update the main category field as well
        category: svc.category || "",
      });
      setSelectedCategory(svc.category || "");
    } else {
      setFormData({
        ...formData,
        serviceId: id,
        serviceName: "",
        min: "",
        max: "",
        rate: "",
        originalRate: "",
        category: "",
      });
      setSelectedCategory("");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra giá trị hợp lệ
    if (formData.min < 0 || formData.max < 0 || formData.rate < 0) {
      toast.error("Giá trị Min, Max và Giá không được âm!");
      return;
    }

    if (formData.min > formData.max) {
      toast.error("Giá trị Min không được lớn hơn Max!");
      return;
    }

    setLoading(true);
    try {
      if (selectedServices.length > 0) {
        await Promise.all(
          selectedServices.map(async (service) => {
            const partner = smmPartners.find((p) => p.name === formData.DomainSmm);
            const tigia = partner?.tigia || 1;
            const ptgia = partner?.price_update || 0;
            const baseRate = service.rate * tigia;
            const finalRate = Math.ceil(baseRate * 10000 + (baseRate * ptgia) / 100 * 10000) / 10000;

            const payload = {
              ...formData,
              serviceId: service.service,
              serviceName: service.name,
              name: service.name,
              min: service.min || 0,
              max: service.max || 0,
              rate: finalRate,
              originalRate: service.rate * tigia,
            };
            await createServer(payload, token);
          })
        );
      } else {
        await createServer(formData, token);
      }

      toast.success("Dịch vụ đã được thêm thành công!");
      setFormData({
        type: "",
        category: "",
        maychu: "",
        name: "",
        description: "",
        DomainSmm: "",
        serviceId: "",
        serviceName: "",
        min: "",
        max: "",
        rate: "",
        originalRate: "",
        getid: "off",
        comment: "off",
        reaction: "off",
        matlive: "off",
        isActive: true,
      });
      setSelectedPlatform("");
      setSelectedCategory("");
      setSelectedServices([]);
      setQuickAddMode(false);
      setServices([]);
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

  // Helper: get unique platforms from categories
  const uniquePlatforms = categories
    .map((category) => category.platforms_id)
    .filter(
      (platform, index, self) =>
        platform && index === self.findIndex((p) => p._id === platform._id)
    );

  // react-select options
  const platformOptions = uniquePlatforms.map((platform) => ({
    value: platform._id,
    label: platform.name,
    platform,
  }));

  const categoryOptions = filteredCategories.map((category) => ({
    value: category._id,
    label: category.name,
    category,
  }));

  const getidOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];

  const commentOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];

  const reactionOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];

  const matliveOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];

  const isActiveOptions = [
    { value: true, label: "Hiển thị" },
    { value: false, label: "Ẩn" },
  ];

  const domainOptions = smmPartners.map((partner) => ({
    value: partner.name,
    label: partner.name,
    partner,
  }));

  const doanhmucOptions = uniqueCategories.map((category) => ({
    value: category,
    label: category || "Không có danh mục",
  }));

  const serviceOptions = filteredServices.map((service) => ({
    value: service.service,
    label: service.name,
    service,
  }));

  // Find selected option objects for controlled Selects
  const selectedPlatformOption = platformOptions.find(
    (opt) => opt.value === selectedPlatform
  ) || null;

  const selectedCategoryOption = categoryOptions.find(
    (opt) => opt.value === formData.category
  ) || null;

  const selectedGetidOption = getidOptions.find(
    (opt) => opt.value === formData.getid
  ) || null;

  const selectedCommentOption = commentOptions.find(
    (opt) => opt.value === formData.comment
  ) || null;

  const selectedReactionOption = reactionOptions.find(
    (opt) => opt.value === formData.reaction
  ) || null;

  const selectedMatliveOption = matliveOptions.find(
    (opt) => opt.value === formData.matlive
  ) || null;

  const selectedIsActiveOption = isActiveOptions.find(
    (opt) => opt.value === formData.isActive
  ) || null;

  const selectedDomainOption = domainOptions.find(
    (opt) => opt.value === formData.DomainSmm
  ) || null;

  const selectedDoanhmucOption = doanhmucOptions.find(
    (opt) => opt.value === selectedCategory
  ) || null;

  const selectedServiceOption = serviceOptions.find(
    (opt) => String(opt.value) === String(formData.serviceId)
  ) || null;

  return (
    <div className="form-group mb-3">
      <form className="smmdv-form" onSubmit={handleAddSubmit}>
        <div className="row mb-4">
          <h3 className="text-primary">
            Thêm mới dịch vụ
          </h3>
          <div className="mb-3">
            <button
              type="button"
              className={`btn btn-${quickAddMode ? "secondary" : "warning"} me-2`}
              onClick={() => setQuickAddMode((prev) => !prev)}
            >
              {quickAddMode ? "Thoát thêm server nhanh" : "Thêm server nhanh"}
            </button>
            {quickAddMode && (
              <span className="text-danger ms-2">
                Đang ở chế độ thêm server nhanh. Các trường chi tiết đã được ẩn.
              </span>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Nền tảng:</label>
            <Select
              name="platform"
              value={selectedPlatformOption}
              onChange={(option) => {
                setSelectedPlatform(option ? option.value : "");
                if (option && option.platform) {
                  setFormData((prev) => ({
                    ...prev,
                    type: option.platform.name,
                  }));
                }
              }}
              options={platformOptions}
              placeholder="Chọn nền tảng"
              isClearable
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Danh mục:</label>
            <Select
              name="category"
              value={selectedCategoryOption}
              onChange={(option) =>
                setFormData({ ...formData, category: option ? option.value : "" })
              }
              options={categoryOptions}
              placeholder="Chọn danh mục"
              isClearable
              required
            />
          </div>
          {!quickAddMode && (

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
          )}
          {!quickAddMode && (
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
          {!quickAddMode && (
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
          )}
        </div>
        <div className="row mb-4">
          <h3 className="text-primary">Các chức năng</h3>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Get ID:</label>
            <Select
              name="getid"
              value={selectedGetidOption}
              onChange={(option) =>
                setFormData({ ...formData, getid: option ? option.value : "off" })
              }
              options={getidOptions}
              placeholder="Chọn trạng thái"
              isClearable={false}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Comment:</label>
            <Select
              name="comment"
              value={selectedCommentOption}
              onChange={(option) =>
                setFormData({ ...formData, comment: option ? option.value : "off" })
              }
              options={commentOptions}
              placeholder="Chọn trạng thái"
              isClearable={false}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Reaction:</label>
            <Select
              name="reaction"
              value={selectedReactionOption}
              onChange={(option) =>
                setFormData({ ...formData, reaction: option ? option.value : "off" })
              }
              options={reactionOptions}
              placeholder="Chọn trạng thái"
              isClearable={false}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Chức năng Matlive:</label>
            <Select
              name="matlive"
              value={selectedMatliveOption}
              onChange={(option) =>
                setFormData({ ...formData, matlive: option ? option.value : "off" })
              }
              options={matliveOptions}
              placeholder="Chọn trạng thái"
              isClearable={false}
            />
          </div>
        </div>

        <div className="row mb-4">
          <h3 className="text-primary">Thông tin SMM</h3>
          <div className="col-md-6 mb-3">
            <label className="form-label">Domain SMM:</label>
            <Select
              name="DomainSmm"
              value={selectedDomainOption}
              onChange={async (option) => {
                const domain = option ? option.value : "";
                setFormData({
                  ...formData,
                  DomainSmm: domain,
                  serviceId: "",
                  serviceName: "",
                  originalRate: "",
                  min: "",
                  max: "",
                  rate: "",
                });
                setServices([]);
                setSelectedCategory("");
                if (!option) return;
                const partner = smmPartners.find((p) => p.name === domain);
                if (!partner) return;
                try {
                  setLoadingServices(true);
                  const servicesData = await getServicesFromSmm(partner._id, token);
                  setServices(servicesData.data);
                } catch (error) {
                  console.error("Lỗi khi lấy dữ liệu từ backend:", error);
                  toast.error("Không thể lấy danh sách dịch vụ từ đối tác. Vui lòng thử lại!");
                } finally {
                  setLoadingServices(false);
                }
              }}
              options={domainOptions}
              placeholder="Chọn domain"
              isClearable
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Doanh mục :</label>
            {loadingServices ? (
              <p>Đang tải danh sách dịch vụ...</p>
            ) : (
              <Select
                name="Doanhmuc"
                value={selectedDoanhmucOption}
                onChange={(option) => setSelectedCategory(option ? option.value : "")}
                options={doanhmucOptions}
                placeholder="Chọn Doanh mục"
                isClearable
                required
              />
            )}
          </div>
          {!quickAddMode && (

            <div className="col-md-6 mb-3">
              <label className="form-label">Tên dịch vụ bên SMM ( thêm server nhanh bỏ trống ):</label>
              {loadingServices ? (
                <p>Đang tải danh sách dịch vụ...</p>
              ) : (
                <Select
                  name="serviceId"
                  value={selectedServiceOption}
                  onChange={(option) => {
                    if (!option) {
                      setFormData({
                        ...formData,
                        serviceId: "",
                        serviceName: "",
                        min: "",
                        max: "",
                        rate: "",
                        originalRate: "",
                        category: "",
                      });
                      setSelectedCategory("");
                      return;
                    }
                    const svc = services.find((s) => String(s.service) === String(option.value));
                    const partner = smmPartners.find((p) => p.name === formData.DomainSmm);
                    const tigia = partner?.tigia || 1;
                    if (svc) {
                      setFormData({
                        ...formData,
                        serviceId: svc.service,
                        serviceName: svc.name,
                        min: svc.min || "",
                        max: svc.max || "",
                        rate: svc.rate * tigia || "",
                        originalRate: svc.rate * tigia || "",
                        category: svc.category || "",
                      });
                      setSelectedCategory(svc.category || "");
                    } else {
                      setFormData({
                        ...formData,
                        serviceId: option.value,
                        serviceName: "",
                        min: "",
                        max: "",
                        rate: "",
                        originalRate: "",
                        category: "",
                      });
                      setSelectedCategory("");
                    }
                  }}
                  options={serviceOptions}
                  placeholder="Chọn Dịch Vụ"
                  isClearable
                />
              )}
            </div>
          )}
          {!quickAddMode && (
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
          )}
          {!quickAddMode && (

            <div className="col-md-6 mb-3">
              <label className="form-label">Giới hạn Min( thêm server nhanh bỏ trống ): </label>
              <input
                type="number"
                name="min"
                value={formData.min}
                onChange={handleChange}
                className="form-control"

              />
            </div>
          )}
          {!quickAddMode && (

            <div className="col-md-6 mb-3">
              <label className="form-label">Giới hạn Max ( thêm server nhanh bỏ trống ):</label>
              <input
                type="number"
                name="max"
                value={formData.max}
                onChange={handleChange}
                className="form-control"

              />
            </div>
          )}
          {!quickAddMode && (

            <div className="col-md-6 mb-3">
              <label className="form-label">Giá (đã tính) ( thêm server nhanh bỏ trống ):</label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          )}
          {!quickAddMode && (
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
          )}
          {!quickAddMode && (
            <div className="col-md-6 mb-3">
              <label className="form-label">Trạng thái:</label>
              <Select
                name="isActive"
                value={selectedIsActiveOption}
                onChange={(option) =>
                  setFormData({ ...formData, isActive: option ? option.value : true })
                }
                options={isActiveOptions}
                placeholder="Chọn trạng thái"
                isClearable={false}
              />
            </div>
          )}
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
                  const ptgia = partner.price_update; // Tính giá đã quy đổi

                  return (
                    <tr key={index}>
                      <td>{service.service}</td>
                      <td style={{
                        maxWidth: "450px",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                      }}>{service.name}
                      </td>
                      <td>{(service.rate * tigia).toFixed(4)} + {ptgia} % = {Math.ceil((service.rate * tigia).toFixed(4) * 10000 + ((service.rate * tigia).toFixed(4) * ptgia) / 100 * 10000) / 10000}</td>
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