'use client';
import { loadingg } from "@/JS/Loading";
import { createServer, getServicesFromSmm, getAllSmmPartners } from "@/Utils/api";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Select from "react-select";
import { toast } from "react-toastify";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Adddichvu() {
  const navigate = useNavigate();
  const { categories: cate } = useOutletContext();
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token") || "";
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
    ratevip: "",
    rateDistributor: "",
    originalRate: "",
    getid: "off",
    comment: "off",
    reaction: "off",
    matlive: "off",
    refil: "off",
    cancel: "off",
    ordertay: false,
    isActive: true,
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

  // Helpers to manage selection without duplicates
  const dedupeByServiceId = (list) => {
    const map = new Map();
    for (const s of list) map.set(s.service, s);
    return Array.from(map.values());
  };

  const toggleServiceSelection = (svc) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.service === svc.service);
      return exists ? prev.filter((s) => s.service !== svc.service) : [...prev, svc];
    });
  };

  const setServiceChecked = (svc, checked) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.service === svc.service);
      if (checked && !exists) return [...prev, svc];
      if (!checked && exists) return prev.filter((s) => s.service !== svc.service);
      return prev;
    });
  };

  // const loadSmmPartners = useCallback(async () => {
  //   setLoading(true);
  //   loadingg("Đang tải danh sách đối tác...", true, 9999999);
  //   try {
  //     const data = await getAllSmmPartners(token);
  //     setSmmPartners(data);
  //   } catch (error) {
  //     toast.error("Không thể tải danh sách đối tác. Vui lòng thử lại!");
  //   } finally {
  //     setLoading(false);
  //     loadingg("Đang tải...", false);
  //   }
  // }, [token]);

  // Load categories from outlet context
  useEffect(() => {
    if (cate && Array.isArray(cate)) {
      setCategories(cate);
    } else {
      setCategories([]);
    }
  }, [cate]);

  // Load SMM partners
  useEffect(() => {
    const fetchSmmPartners = async () => {
      try {
        loadingg("Đang tải đối tác SMM...", true, 9999999);
        const partners = await getAllSmmPartners(token);
        setSmmPartners(Array.isArray(partners) ? partners : partners?.data || []);
      } catch (error) {
        toast.error("Không thể tải danh sách đối tác SMM!");
      } finally {
        loadingg("Đang tải...", false);
      }
    };
    fetchSmmPartners();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "min" || name === "max" || name === "rate" || name === "ratevip" || name === "rateDistributor"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
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
        ratevip: svc.rate * tigia || "",
        rateDistributor: svc.rate * tigia || "",
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
        ratevip: "",
        rateDistributor: "",
        originalRate: "",
        category: "",
      });
      setSelectedCategory("");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // ===== VALIDATION PHASE =====

    // 1. Always required fields
    if (!formData.type) {
      toast.error("Vui lòng chọn Nền tảng!");
      return;
    }
    if (!formData.category) {
      toast.error("Vui lòng chọn Danh mục!");
      return;
    }

    // 2. Required fields for SMM Orders (when not Order Tay)
    if (!formData.ordertay) {
      if (!formData.DomainSmm) {
        toast.error("Vui lòng chọn Domain SMM!");
        return;
      }
      // For normal mode (not quick add), require service selection
      if (!quickAddMode && !formData.serviceId) {
        toast.error("Vui lòng chọn dịch vụ từ danh sách!");
        return;
      }
    }

    // 3. Required fields for Order Tay + Quick Add Mode
    if (formData.ordertay && quickAddMode) {
      if (!formData.name || formData.name.trim() === "") {
        toast.error("Vui lòng nhập Tên dịch vụ!");
        return;
      }
      if (!formData.min && formData.min !== 0) {
        toast.error("Vui lòng nhập giá trị Min!");
        return;
      }
      if (!formData.max && formData.max !== 0) {
        toast.error("Vui lòng nhập giá trị Max!");
        return;
      }
      if (!formData.rate && formData.rate !== 0) {
        toast.error("Vui lòng nhập Giá Thành Viên!");
        return;
      }
      if (!formData.ratevip && formData.ratevip !== 0) {
        toast.error("Vui lòng nhập Giá Đại Lý!");
        return;
      }
      if (!formData.rateDistributor && formData.rateDistributor !== 0) {
        toast.error("Vui lòng nhập Giá Nhà Phân Phối!");
        return;
      }
    }

    // 4. Numeric validation (when values are provided)
    if (formData.min < 0) {
      toast.error("Giá trị Min không được âm!");
      return;
    }
    if (formData.max < 0) {
      toast.error("Giá trị Max không được âm!");
      return;
    }
    if (formData.rate < 0) {
      toast.error("Giá Thành Viên không được âm!");
      return;
    }
    if (formData.ratevip < 0) {
      toast.error("Giá Đại Lý không được âm!");
      return;
    }
    if (formData.rateDistributor < 0) {
      toast.error("Giá Nhà Phân Phối không được âm!");
      return;
    }

    // 5. Range validation
    if (formData.min > formData.max) {
      toast.error("Giá trị Min không được lớn hơn Max!");
      return;
    }

    // ===== PREPARATION PHASE =====

    // Auto-fill for Order Tay + Quick Add Mode
    let finalFormData = { ...formData };
    if (formData.ordertay && quickAddMode) {
      // Backend will automatically handle:
      // - serviceId generation using Magoi counter
      // - DomainSmm assignment to "Đơn tay" SmmSv
      finalFormData = {
        ...formData,
        serviceName: formData.name,
        originalRate: formData.rateDistributor, // Set original rate to distributor price
      };
    }

    // ===== SUBMISSION PHASE =====

    setLoading(true);
    loadingg("Đang thêm dịch vụ...", true, 9999999);
    try {
      if (selectedServices.length > 0) {
        // Quick Add Mode with multiple service selection
        const uniqueSelected = dedupeByServiceId(selectedServices);
        await Promise.all(
          uniqueSelected.map(async (service) => {
            const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
            const tigia = partner?.tigia || 1;
            const ptgia = partner?.price_update || 0;
            const baseRate = service.rate * tigia;
            const finalRate = Math.ceil(baseRate * 10000 + (baseRate * ptgia) / 100 * 10000) / 10000;

            const VipRate = Math.ceil(baseRate * 10000 + (baseRate * partner.price_updateVip) / 100 * 10000) / 10000;
            const DistributorRate = Math.ceil(baseRate * 10000 + (baseRate * partner.price_updateDistributor) / 100 * 10000) / 10000;
            const payload = {
              ...finalFormData,
              serviceId: service.service,
              serviceName: service.name,
              name: service.name,
              min: service.min || 0,
              max: service.max || 0,
              rate: finalRate,
              ratevip: VipRate,
              rateDistributor: DistributorRate,
              originalRate: service.rate * tigia,
              description: finalFormData.description ? finalFormData.description.replace(/\n/g, '\\n') : "",
            };
            await createServer(payload, token);
          })
        );
      } else {
        // Single service creation
        const payloadData = {
          ...finalFormData,
          description: finalFormData.description ? finalFormData.description.replace(/\n/g, '\\n') : "",
        };
        await createServer(payloadData, token);
      }
      toast.success("Dịch vụ đã được thêm thành công!");
      // Navigate back to server list
      navigate('/admin/server');
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

  const isActiveOptions = [
    { value: true, label: "Hiển thị" },
    { value: false, label: "Ẩn" },
  ];

  const ordertayOptions = [
    { value: true, label: "Bật Order Tay" },
    { value: false, label: "Order SMM" },
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

  const selectedIsActiveOption = isActiveOptions.find(
    (opt) => opt.value === formData.isActive
  ) || null;

  const selectedOrdertayOption = ordertayOptions.find(
    (opt) => opt.value === formData.ordertay
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
    <div className="">
      <div className="row">
        <div className="col-12">
          {/* Back Button */}
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/admin/server')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại danh sách
            </button>
          </div>

          <div className="card border">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-plus-circle me-2 text-secondary"></i>
                  Thêm mới dịch vụ
                </h5>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate('/admin/server')}
                >
                  <i className="fas fa-times me-1"></i>
                  Đóng
                </button>
              </div>
            </div>
            <div className="card-body p-3">
              <div className="form-group">
                <form className="smmdv-form" onSubmit={handleAddSubmit}>
                  {/* Quick Add Mode Toggle */}
                  <div className="card border mb-3">
                    <div className="card-header bg-light border-bottom py-2">
                      <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-bolt me-2 text-secondary"></i>
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
                  <div className="card border mb-3">
                    <div className="card-header bg-light border-bottom py-2">
                      <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-info-circle me-2 text-secondary"></i>
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
                  <div className="card border mb-3">
                    <div className="card-header bg-light border-bottom py-2">
                      <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-cogs me-2 text-secondary"></i>
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
                  <div className="card border mb-3">
                    <div className="card-header bg-light border-bottom py-2">
                      <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                        <i className="fas fa-network-wired me-2 text-secondary"></i>
                        Thông tin SMM
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            <i className="fas fa-hand-paper me-1 text-warning"></i>
                            Loại đơn hàng <span className="text-danger">*</span>
                          </label>
                          <Select
                            name="ordertay"
                            value={selectedOrdertayOption}
                            onChange={(option) => {
                              const isOrderTay = option ? option.value : false;
                              setFormData({
                                ...formData,
                                ordertay: isOrderTay,
                                // Reset SMM fields when switching to order tay
                                ...(isOrderTay ? {
                                  DomainSmm: "",
                                  serviceId: "",
                                  serviceName: "",
                                  originalRate: "",
                                } : {})
                              });
                              // Clear services and categories when switching
                              if (isOrderTay) {
                                setServices([]);
                                setSelectedCategory("");
                              }
                            }}
                            options={ordertayOptions}
                            placeholder="Chọn loại đơn hàng"
                            isClearable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 })
                            }}
                          />
                          {formData.ordertay && (
                            <small className="text-warning d-block mt-1">
                              <i className="fas fa-info-circle me-1"></i>
                              Đơn hàng sẽ được xử lý thủ công bởi admin
                            </small>
                          )}
                        </div>

                        {/* Order Tay Fields - Only show in Quick Add Mode */}
                        {formData.ordertay && quickAddMode && (
                          <>
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-tag me-1 text-primary"></i>
                                Tên dịch vụ <span className="text-danger">*</span>
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({ ...formData, name: e.target.value })
                                }
                                className="form-control form-control-lg"
                                placeholder="VD: Like post VN"
                                required
                              />
                              <small className="text-danger">
                                <i className="fas fa-exclamation-circle me-1"></i>
                                Bắt buộc nhập để tạo dịch vụ
                              </small>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-server me-1 text-primary"></i>
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

                            </div>
                            <div className="col-12 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-align-left me-1 text-primary"></i>
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

                        {!formData.ordertay && (
                          <>
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
                                    ratevip: "",
                                    rateDistributor: "",
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
                                required={!formData.ordertay}
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
                                  required={!formData.ordertay}
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                  }}
                                />
                              )}
                              {serviceError && (
                                <div className="alert alert-danger mt-2 py-2">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  <small>Lỗi SMM: {serviceError}</small>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Price Fields - Show for: (Not Quick Add) OR (Quick Add + Order Tay) */}
                        {(!quickAddMode || (quickAddMode && formData.ordertay)) && (
                          <>
                            {!formData.ordertay && !quickAddMode && (
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
                                            ratevip: "",
                                            rateDistributor: "",
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
                                        const ptvip = partner?.price_updateVip || 0;
                                        const ptdistributor = partner?.price_updateDistributor || 0;
                                        const baseRate = svc.rate * tigia;
                                        const finalRate = Math.ceil(baseRate * 10000 + (baseRate * ptgia) / 100 * 10000) / 10000;
                                        const VipRate = Math.ceil(baseRate * 10000 + (baseRate * ptvip) / 100 * 10000) / 10000;
                                        const DistributorRate = Math.ceil(baseRate * 10000 + (baseRate * ptdistributor) / 100 * 10000) / 10000;
                                        if (svc) {
                                          setFormData({
                                            ...formData,
                                            serviceId: svc.service,
                                            serviceName: svc.name,
                                            min: svc.min || "",
                                            max: svc.max || "",
                                            rate: finalRate || "",
                                            ratevip: VipRate || "",
                                            rateDistributor: DistributorRate || "",
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
                              </>
                            )}

                            {/* Price Fields Section */}
                            {quickAddMode && formData.ordertay && (
                              <div className="col-12 mb-2">
                                <hr className="my-3" />
                                <h6 className="text-primary mb-3">
                                  <i className="fas fa-dollar-sign me-2"></i>
                                  Thông tin giá dịch vụ
                                </h6>
                              </div>
                            )}

                            <div className="col-md-4 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-arrow-down me-1 text-warning"></i>
                                Giới hạn Min {quickAddMode && formData.ordertay && <span className="text-danger">*</span>}
                              </label>
                              <input
                                type="number"
                                name="min"
                                value={formData.min}
                                onChange={handleChange}
                                className="form-control form-control-lg"
                                placeholder="10"
                                required={quickAddMode && formData.ordertay}
                              />
                              {quickAddMode && formData.ordertay && (
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Bắt buộc nhập
                                </small>
                              )}
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-arrow-up me-1 text-warning"></i>
                                Giới hạn Max {quickAddMode && formData.ordertay && <span className="text-danger">*</span>}
                              </label>
                              <input
                                type="number"
                                name="max"
                                value={formData.max}
                                onChange={handleChange}
                                className="form-control form-control-lg"
                                placeholder="100000"
                                required={quickAddMode && formData.ordertay}
                              />
                              {quickAddMode && formData.ordertay && (
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Bắt buộc nhập
                                </small>
                              )}
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-dollar-sign me-1 text-success"></i>
                                Giá Thành Viên {quickAddMode && formData.ordertay && <span className="text-danger">*</span>}
                              </label>
                              <input
                                type="number"
                                name="rate"
                                value={formData.rate}
                                onChange={handleChange}
                                className="form-control form-control-lg"
                                placeholder="0.00"
                                step="0.0001"
                                required={quickAddMode && formData.ordertay}
                              />
                              {quickAddMode && formData.ordertay && (
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Bắt buộc nhập
                                </small>
                              )}
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-gem me-1 text-warning"></i>
                                Giá Đại Lý {quickAddMode && formData.ordertay && <span className="text-danger">*</span>}
                              </label>
                              <input
                                type="number"
                                name="ratevip"
                                value={formData.ratevip}
                                onChange={handleChange}
                                className="form-control form-control-lg"
                                placeholder="0.00"
                                step="0.0001"
                                required={quickAddMode && formData.ordertay}
                              />
                              {quickAddMode && formData.ordertay && (
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Bắt buộc nhập
                                </small>
                              )}
                            </div>
                            <div className="col-md-4 mb-3">
                              <label className="form-label fw-bold">
                                <i className="fas fa-handshake me-1 text-secondary"></i>
                                Giá Nhà Phân Phối {quickAddMode && formData.ordertay && <span className="text-danger">*</span>}
                              </label>
                              <input
                                type="number"
                                name="rateDistributor"
                                value={formData.rateDistributor}
                                onChange={handleChange}
                                className="form-control form-control-lg"
                                placeholder="0.00"
                                step="0.0001"
                                required={quickAddMode && formData.ordertay}
                              />
                              {quickAddMode && formData.ordertay && (
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Bắt buộc nhập
                                </small>
                              )}
                            </div>
                            {!formData.ordertay && (
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
                            )}
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
                    <div className="card border mb-3">
                      <div className="card-header bg-light border-bottom py-2">
                        <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                          <i className="fas fa-rocket me-2 text-secondary"></i>
                          {formData.ordertay ? "Thêm nhanh dịch vụ Order Tay" : "Chọn nhanh dịch vụ theo danh mục"}
                        </h6>
                      </div>
                      <div className="card-body">
                        {formData.ordertay ? (
                          <div className="alert alert-info border-0">
                            <div className="d-flex align-items-start">
                              <div className="w-100">
                                <h6 className="alert-heading mb-3">
                                  <i className="fas fa-hand-paper me-2"></i>
                                  Chế độ thêm nhanh Order Tay - Tự động điền thông tin
                                </h6>

                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <div className="card bg-light border-0 mb-2">
                                      <div className="card-body p-2">
                                        <small className="text-muted d-block mb-1">
                                          <i className="fas fa-pencil-alt me-1"></i>
                                          Bạn cần nhập:
                                        </small>
                                        <ul className="mb-0 ps-3" style={{ fontSize: '0.9rem' }}>
                                          <li><strong>Nền tảng & Danh mục</strong></li>
                                          <li><strong>Tên dịch vụ</strong></li>
                                          <li><strong>Min & Max</strong></li>
                                          <li><strong>Giá Thành Viên</strong></li>
                                          <li><strong>Giá Đại Lý</strong></li>
                                          <li><strong>Giá Nhà Phân Phối</strong></li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="card  bg-opacity-10 border-success border-opacity-25 mb-2">
                                      <div className="card-body">
                                        <small className="text-success d-block mb-1">
                                          <i className="fas fa-check-circle me-1"></i>
                                          Hệ thống tự động điền:
                                        </small>
                                        <ul className="mb-0 ps-3 text-success" style={{ fontSize: '0.9rem' }}>
                                          <li><strong>Service ID:</strong> <code>manual_XXXXXX</code></li>
                                          <li><strong>Domain SMM:</strong> Server mặc định</li>
                                          <li><strong>Giá gốc:</strong> = Giá Nhà Phân Phối</li>
                                          <li><strong>Service Name:</strong> = Tên dịch vụ</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="alert alert-warning border-0 mb-0 ">
                                  <i className="fas fa-bolt me-2"></i>
                                  <small>
                                    <strong>Cách sử dụng:</strong>
                                    Nhập đầy đủ thông tin ở phần "Thông tin cơ bản" và "SMM Information",
                                    sau đó nhấn "Thêm dịch vụ". Hệ thống sẽ tự động tạo Service ID và điền các thông tin còn lại!
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
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
                                        const isSelected = selectedServices.some(
                                          (selected) => selected.service === service.service
                                        );
                                        return (
                                          <tr
                                            key={service.service}
                                            className={isSelected ? 'table-success' : ''}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => toggleServiceSelection(service)}
                                          >
                                            <td>
                                              <div className="form-check">
                                                <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  checked={isSelected}
                                                  onChange={(e) => { e.stopPropagation(); setServiceChecked(service, e.target.checked); }}
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
                                        <th style={{ width: '100px', fontSize: '14px', fontWeight: '600' }}>
                                          <i className="fas fa-trash-alt me-1"></i>Hành động
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedServices.map((service, index) => {
                                        const partner = smmPartners.find((p) => String(p._id) === String(formData.DomainSmm));
                                        const tigia = partner?.tigia || 1;
                                        const ptgia = partner?.price_update || 0;
                                        const ptvip = partner?.price_updateVip || 0;
                                        const ptdistributor = partner?.price_updateDistributor || 0;
                                        const basePrice = (service.rate * tigia).toFixed(4);

                                        const finalPrice = Math.ceil(basePrice * 10000 + (basePrice * ptgia) / 100 * 10000) / 10000;
                                        const ratevip = Math.ceil(basePrice * 10000 + (basePrice * ptvip) / 100 * 10000) / 10000; // Giá VIP bằng giá cuối cùng
                                        const rateDistributor = Math.ceil(basePrice * 10000 + (basePrice * ptdistributor) / 100 * 10000) / 10000; // Giá Nhà Phân Phối bằng giá cuối cùng

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
                                                <span style={{ color: '#6c757d', fontWeight: '500' }}>Giá gốc : {basePrice}</span>
                                                {/* <span style={{ color: '#17a2b8', fontWeight: '600' }}> + {ptgia}% = </span> */}
                                                <div>
                                                  <span style={{ color: '#6c757d', fontWeight: '700' }}>Nhà Phân Phối ({partner.price_updateDistributor}%): {rateDistributor}</span><br />
                                                  <span style={{ color: '#ffc107', fontWeight: '700' }}>Đại Lý ({partner.price_updateVip}%): {ratevip}</span> <br />
                                                  <span style={{ color: '#28a745', fontWeight: '700' }}>Thành Viên ({partner.price_update}%): {finalPrice}</span>
                                                </div>
                                              </div>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                              {service.min}
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                                              {service.max}
                                            </td>
                                            <td>
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => toggleServiceSelection(service)}
                                                title="Xóa khỏi danh sách chọn"
                                              >
                                                <i className="fas fa-trash"></i>
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="card border">
                    <div className="card-body text-center">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="px-4"
                      >
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus me-2"></i>
                            Thêm dịch vụ
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
