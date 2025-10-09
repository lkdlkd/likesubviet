'use client';
import { useState, useEffect, useCallback } from "react";
import { createServer, getAllSmmPartners, getServicesFromSmm } from "@/Utils/api";
import { toast } from "react-toastify";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loadingg } from "@/JS/Loading";

export default function Adddichvu({
  token,
  categories,
  fetchServers,
  editMode = false,
  initialData = {},
  onSuccess,
  show = false,
  onClose = () => { },
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
    refil: "off",
    cancel: "off",
    isActive: true,
    ...initialData,
  });
  const refilOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];
  const cancelOptions = [
    { value: "on", label: "Bật" },
    { value: "off", label: "Tắt" },
  ];

  const selectedRefilOption = refilOptions.find(
    (opt) => opt.value === formData.refil
  ) || null;
  const selectedCancelOption = cancelOptions.find(
    (opt) => opt.value === formData.cancel
  ) || null;
  const [smmPartners, setSmmPartners] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceError, setServiceError] = useState(""); // Lỗi khi lấy dịch vụ SMM (ví dụ Invalid key)
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [quickAddMode, setQuickAddMode] = useState(false); // <--- ADD THIS

  const loadSmmPartners = useCallback(async () => {
    setLoading(true);
    loadingg("Đang tải danh sách đối tác...", true, 9999999);
    try {
      const data = await getAllSmmPartners(token);
      setSmmPartners(data);
    } catch (error) {
      toast.error("Không thể tải danh sách đối tác. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("Đang tải...", false);
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
    setServiceError("");
    const partner = smmPartners.find((p) => String(p._id) === String(domain));
    if (!partner) return;

    try {
      setLoadingServices(true);
      loadingg("Đang tải danh sách dịch vụ...", true, 9999999);
      const servicesData = await getServicesFromSmm(partner._id, token);
      // Trường hợp API trả về { success: true, data: { error: "Invalid key" } }
      if (servicesData && servicesData.data) {
        if (Array.isArray(servicesData.data)) {
          setServices(servicesData.data);
          setServiceError("");
        } else if (servicesData.data.error) {
          setServices([]);
            setServiceError(servicesData.data.error);
        }
      } else {
        setServices([]);
      }
    } catch (error) {
      toast.error("Không thể lấy danh sách dịch vụ từ đối tác. Vui lòng thử lại!");
    } finally {
      setLoadingServices(false);
      loadingg("Đang tải...", false);
    }
  };

  const handleServiceChange = (e) => {
    const id = e.target.value;
    const svc = services.find((s) => String(s.service) === id);
    const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
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
    loadingg("Đang thêm dịch vụ...", true, 9999999);
    try {
      if (selectedServices.length > 0) {
        await Promise.all(
          selectedServices.map(async (service) => {
            const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
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
      fetchServers(); // Tải lại danh sách dịch vụ sau khi thêm
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
      toast.error("Lỗi khi thêm dịch vụ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      loadingg("Đang tải...", false);
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
    value: partner._id,
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
    (opt) => String(opt.value) === String(formData.DomainSmm)
  ) || null;

  const selectedDoanhmucOption = doanhmucOptions.find(
    (opt) => opt.value === selectedCategory
  ) || null;

  const selectedServiceOption = serviceOptions.find(
    (opt) => String(opt.value) === String(formData.serviceId)
  ) || null;

  return (
    <Modal show={show} onHide={onClose}  backdrop="static" keyboard={false} centered size="xl" className="modern-modal">
      <Modal.Header closeButton className="bg-gradient-primary text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <i className={`fas ${editMode ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
          {editMode ? "Chỉnh sửa dịch vụ" : "Thêm mới dịch vụ"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <div className="form-group">
          <form className="smmdv-form" onSubmit={handleAddSubmit}>
            {/* Quick Add Mode Toggle */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-warning text-white">
                <h6 className="mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Chế độ thêm nhanh
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <button
                      type="button"
                      className={`btn btn-${quickAddMode ? "success" : "outline-warning"} me-3`}
                      onClick={() => setQuickAddMode((prev) => !prev)}
                    >
                      <i className={`fas ${quickAddMode ? 'fa-check' : 'fa-rocket'} me-2`}></i>
                      {quickAddMode ? "Đang ở chế độ thêm nhanh" : "Bật chế độ thêm nhanh"}
                    </button>
                    {quickAddMode && (
                      <span className="badge bg-success ">
                        <i className="fas fa-info-circle me-1"></i>
                        Tự động điền tất cả thông tin dịch vụ từ SMM
                      </span>
                    )}
                  </div>
                  {/* {quickAddMode && (
                    <div className="text-muted">
                      <i className="fas fa-lightning"></i>
                      <small className="ms-1">Chế độ tối ưu hiệu suất</small>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Thông tin cơ bản
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-layer-group me-1 text-primary"></i>
                      Nền tảng <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="platform"
                      value={selectedPlatformOption}
                      onChange={(option) => {
                        setSelectedPlatform(option ? option.value : "");
                        if (option && option.platform) {
                          setFormData((prev) => ({
                            ...prev,
                            type: option.platform._id,
                          }));
                        }
                      }}
                      options={platformOptions}
                      placeholder="Chọn nền tảng"
                      isClearable
                      required
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tags me-1 text-primary"></i>
                      Danh mục <span className="text-danger">*</span>
                    </label>
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
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  {!quickAddMode && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-server me-1 text-success"></i>
                          Máy chủ
                        </label>
                        <input
                          type="text"
                          name="maychu"
                          value={formData.maychu}
                          onChange={(e) =>
                            setFormData({ ...formData, maychu: e.target.value })
                          }
                          list="maychu"
                          placeholder="Sv1, Sv2,..."
                          className="form-control form-control-lg"
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
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Để trống nếu sử dụng chế độ thêm nhanh
                        </small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-tag me-1 text-success"></i>
                          Tên dịch vụ
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="form-control form-control-lg"
                          placeholder="Like post VN"
                        />
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Để trống nếu sử dụng chế độ thêm nhanh
                        </small>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-align-left me-1 text-success"></i>
                          Mô tả
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          className="form-control"
                          placeholder="Mô tả dịch vụ..."
                          rows="3"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Functions Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-cogs me-2"></i>
                  Các chức năng
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-user-tag me-1 text-info"></i>
                      Chức năng Get uid
                    </label>
                    <Select
                      name="getid"
                      value={selectedGetidOption}
                      onChange={(option) =>
                        setFormData({ ...formData, getid: option ? option.value : "off" })
                      }
                      options={getidOptions}
                      placeholder="Chọn trạng thái"
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-comments me-1 text-info"></i>
                      Chức năng Comment
                    </label>
                    <Select
                      name="comment"
                      value={selectedCommentOption}
                      onChange={(option) =>
                        setFormData({ ...formData, comment: option ? option.value : "off" })
                      }
                      options={commentOptions}
                      placeholder="Chọn trạng thái"
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-shield-alt me-1 text-warning"></i>
                      Chức năng Bảo hành
                    </label>
                    <Select
                      name="refil"
                      value={selectedRefilOption}
                      onChange={(option) =>
                        setFormData({ ...formData, refil: option ? option.value : "off" })
                      }
                      options={refilOptions}
                      placeholder="Chọn trạng thái"
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-ban me-1 text-danger"></i>
                      Chức năng Hủy đơn
                    </label>
                    <Select
                      name="cancel"
                      value={selectedCancelOption}
                      onChange={(option) =>
                        setFormData({ ...formData, cancel: option ? option.value : "off" })
                      }
                      options={cancelOptions}
                      placeholder="Chọn trạng thái"
                      isClearable={false}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SMM Information Section */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-network-wired me-2"></i>
                  Thông tin SMM
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-globe me-1 text-primary"></i>
                      Domain SMM <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="DomainSmm"
                      value={selectedDomainOption}
                      onChange={async (option) => {
                        const domainId = option ? option.value : "";
                        setFormData({
                          ...formData,
                          DomainSmm: domainId,
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
                        const partner = smmPartners.find((p) => String(p._id) === String(domainId));
                        if (!partner) return;
                        try {
                          setLoadingServices(true);
                          setServiceError("");
                          const servicesData = await getServicesFromSmm(partner._id, token);
                          if (servicesData && servicesData.data) {
                            if (Array.isArray(servicesData.data)) {
                              setServices(servicesData.data);
                              setServiceError("");
                            } else if (servicesData.data.error) {
                              setServices([]);
                              setServiceError(servicesData.data.error);
                            }
                          } else {
                            setServices([]);
                          }
                        } catch (error) {
                          toast.error(`${error.message}`);
                          setServiceError(error.message)
                        } finally {
                          setLoadingServices(false);
                        }
                      }}
                      options={domainOptions}
                      placeholder="Chọn domain"
                      isClearable
                      required
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-list me-1 text-primary"></i>
                      Doanh mục <span className="text-danger">*</span>
                    </label>
                    {loadingServices ? (
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        <span className="text-muted">Đang tải danh sách dịch vụ...</span>
                      </div>
                    ) : (
                      <Select
                        name="Doanhmuc"
                        value={selectedDoanhmucOption}
                        onChange={(option) => setSelectedCategory(option ? option.value : "")}
                        options={doanhmucOptions}
                        placeholder="Chọn Doanh mục"
                        isClearable
                        required
                        className="react-select-container"
                        classNamePrefix="react-select"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    )}
                    {serviceError  && (
                      <div className="alert alert-danger mt-2 py-2">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        <small>Lỗi SMM: {serviceError}</small>
                      </div>
                    )}
                  </div>
                  {!quickAddMode && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-list-alt me-1 text-success"></i>
                          Tên dịch vụ bên SMM
                        </label>
                        {loadingServices ? (
                          <div className="d-flex align-items-center">
                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            <span className="text-muted">Đang tải danh sách dịch vụ...</span>
                          </div>
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
                              const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
                              const tigia = partner?.tigia || 1;
                              const ptgia = partner?.price_update || 0;
                              const baseRate = svc.rate * tigia;
                              const finalRate = Math.ceil(baseRate * 10000 + (baseRate * ptgia) / 100 * 10000) / 10000;
                              if (svc) {
                                setFormData({
                                  ...formData,
                                  serviceId: svc.service,
                                  serviceName: svc.name,
                                  min: svc.min || "",
                                  max: svc.max || "",
                                  rate: finalRate || "",
                                  originalRate: svc.rate * tigia || "",
                                  category: svc.category || "",
                                });
                                setSelectedCategory(svc.category || "");
                              }
                            }}
                            options={serviceOptions}
                            placeholder="Chọn Dịch Vụ"
                            isClearable
                            className="react-select-container"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 })
                            }}
                          />
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-hashtag me-1 text-success"></i>
                          Service ID (nhập trực tiếp)
                        </label>
                        <input
                          type="text"
                          name="serviceId"
                          value={formData.serviceId}
                          onChange={handleServiceChange}
                          className="form-control form-control-lg"
                          placeholder="Nhập Service ID"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-arrow-down me-1 text-warning"></i>
                          Giới hạn Min
                        </label>
                        <input
                          type="number"
                          name="min"
                          value={formData.min}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-arrow-up me-1 text-warning"></i>
                          Giới hạn Max
                        </label>
                        <input
                          type="number"
                          name="max"
                          value={formData.max}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-dollar-sign me-1 text-success"></i>
                          Giá (đã tính)
                        </label>
                        <input
                          type="number"
                          name="rate"
                          value={formData.rate}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-coins me-1 text-info"></i>
                          Giá gốc (bên thứ 3)
                        </label>
                        <input
                          type="number"
                          name="originalRate"
                          value={formData.originalRate}
                          className="form-control form-control-lg bg-light"
                          readOnly
                          placeholder="Tự động tính"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">
                          <i className="fas fa-eye me-1 text-primary"></i>
                          Trạng thái
                        </label>
                        <Select
                          name="isActive"
                          value={selectedIsActiveOption}
                          onChange={(option) =>
                            setFormData({ ...formData, isActive: option ? option.value : true })
                          }
                          options={isActiveOptions}
                          placeholder="Chọn trạng thái"
                          isClearable={false}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          menuPortalTarget={document.body}
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {quickAddMode && (
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-warning text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-rocket me-2"></i>
                    Chọn nhanh dịch vụ theo danh mục
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-list-check me-1 text-primary"></i>
                      Danh sách dịch vụ có sẵn
                    </label>
                    {loadingServices ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary me-2" role="status"></div>
                        <span className="text-muted">Đang tải danh sách dịch vụ...</span>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table bordered hover className="mb-0 modern-table">
                          <thead className="table-primary sticky-top">
                            <tr>
                              <th style={{ width: '50px', fontSize: '14px' }}>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedServices(filteredServices);
                                      } else {
                                        setSelectedServices([]);
                                      }
                                    }}
                                    checked={
                                      selectedServices.length === filteredServices.length &&
                                      filteredServices.length > 0
                                    }
                                  />
                                </div>
                              </th>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-hashtag me-1"></i>MÃ
                              </th>
                              <th style={{ fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-tag me-1"></i>Tên dịch vụ
                              </th>
                              <th style={{ width: '100px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-dollar-sign me-1"></i>Giá
                              </th>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-arrow-down me-1"></i>Min
                              </th>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-arrow-up me-1"></i>Max
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredServices.map((service) => {
                              const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
                              const tigia = partner?.tigia || 1;
                              const ptgia = partner?.price_update || 0;
                              const isSelected = selectedServices.some(
                                (selected) => selected.service === service.service
                              );
                              return (
                                <tr 
                                  key={service.service} 
                                  className={isSelected ? 'table-success' : ''}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedServices((prev) =>
                                        prev.filter(
                                          (selected) => selected.service !== service.service
                                        )
                                      );
                                    } else {
                                      setSelectedServices((prev) => [...prev, service]);
                                    }
                                  }}
                                >
                                  <td>
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          if (e.target.checked) {
                                            setSelectedServices((prev) => [...prev, service]);
                                          } else {
                                            setSelectedServices((prev) =>
                                              prev.filter(
                                                (selected) => selected.service !== service.service
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-info text-dark fw-bold" style={{ fontSize: '12px' }}>
                                      {service.service}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{
                                      maxWidth: "300px",
                                      fontSize: "13px",
                                      lineHeight: "1.4",
                                      color: "#2c3e50",
                                      fontWeight: "400",
                                      whiteSpace: "normal",
                                      wordWrap: "break-word",
                                      overflowWrap: "break-word",
                                    }}>
                                      {service.name}
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge bg-success" style={{ fontSize: '11px', fontWeight: '600' }}>
                                      {(service.rate * tigia).toFixed(4)}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                    {service.min}
                                  </td>
                                  <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                    {service.max}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                  
                  {selectedServices.length > 0 && (
                    <div className="mt-4">
                      <label className="form-label fw-bold">
                        <i className="fas fa-check-circle me-1 text-success"></i>
                        Danh sách dịch vụ đã chọn ({selectedServices.length})
                      </label>
                      <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Table bordered hover className="mb-0 modern-table">
                          <thead className="table-success sticky-top">
                            <tr>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-hashtag me-1"></i>MÃ
                              </th>
                              <th style={{ fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-tag me-1"></i>Tên dịch vụ
                              </th>
                              <th style={{ width: '150px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-calculator me-1"></i>Giá tính toán
                              </th>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-arrow-down me-1"></i>Min
                              </th>
                              <th style={{ width: '80px', fontSize: '14px', fontWeight: '600' }}>
                                <i className="fas fa-arrow-up me-1"></i>Max
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedServices.map((service, index) => {
                              const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
                              const tigia = partner?.tigia || 1;
                              const ptgia = partner?.price_update || 0;
                              const basePrice = (service.rate * tigia).toFixed(4);
                              const finalPrice = Math.ceil(basePrice * 10000 + (basePrice * ptgia) / 100 * 10000) / 10000;

                              return (
                                <tr key={index}>
                                  <td>
                                    <span className="badge bg-info text-dark fw-bold" style={{ fontSize: '12px' }}>
                                      {service.service}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{
                                      maxWidth: "300px",
                                      fontSize: "13px",
                                      lineHeight: "1.4",
                                      color: "#2c3e50",
                                      fontWeight: "400",
                                      whiteSpace: "normal",
                                      wordWrap: "break-word",
                                      overflowWrap: "break-word",
                                    }}>
                                      {service.name}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '12px', lineHeight: '1.3' }}>
                                      <span style={{ color: '#6c757d', fontWeight: '500' }}>{basePrice}</span>
                                      <span style={{ color: '#17a2b8', fontWeight: '600' }}> + {ptgia}% = </span>
                                      <span style={{ color: '#28a745', fontWeight: '700' }}>{finalPrice}</span>
                                    </div>
                                  </td>
                                  <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                    {service.min}
                                  </td>
                                  <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                    {service.max}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <Button 
                  type="submit" 
                  variant={editMode ? "warning" : "success"}
                  disabled={loading}
                  className="px-5 py-2 fw-bold"
                  style={{ minWidth: '200px' }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
                      {editMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-white border-0">
        <Button 
          variant="outline-secondary" 
          onClick={onClose}
          className="px-4 py-2 fw-bold"
        >
          <i className="fas fa-times me-2"></i>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}