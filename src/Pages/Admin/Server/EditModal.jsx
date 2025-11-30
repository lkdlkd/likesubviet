import { loadingg } from "@/JS/Loading";
import { updateServer } from "@/Utils/api";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Select from "react-select";
export default function EditModal({ show, fetchServers, onClose, initialData, token, categories, datasmm }) {
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    description: "",
    maychu: "",
    serviceId: "",
    min: "",
    max: "",
    rate: "",
    ratevip: "",
    rateDistributor: "",
    getid: "off",
    comment: "off",
    reaction: "off",
    matlive: "off",
    refil: "off",
    cancel: "off",
    isActive: true,
    ischeck: false,
    status: true,
    originalRate: "",
    thutu: "",
    category: "",
    type: "",
    DomainSmm: "",
    ordertay: false,
    chietkhau: "",
  });
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

  const [form, setForm] = useState({
    type: "",
    Magoi: "",
    category: "",
    DomainSmm: "",
    serviceName: "",
    serviceId: "",
    isActive: true,
    status: true,
    thutu: "",
    ordertay: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);

      // Use direct IDs from API response (typeId, categoryId, DomainSmmId)
      // Convert \n string to actual newlines for textarea display
      const processedData = {
        ...initialData,
        type: initialData.typeId || "",
        category: initialData.categoryId || "",
        DomainSmm: initialData.DomainSmmId || "",
        description: initialData.description ? initialData.description.replace(/\\n/g, '\n') : "",
      };
      setFormData(processedData);
    }
  }, [initialData, categories, datasmm]);

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

  // Get unique platforms from categories
  const uniquePlatforms = categories
    .map((category) => category.platforms_id)
    .filter(
      (platform, index, self) =>
        platform && index === self.findIndex((p) => p._id === platform._id)
    );

  // Filter categories based on selected type
  const filteredCategories = categories.filter(
    (category) => category.platforms_id?._id === formData.type
  );

  // Preserve category if still valid when changing platform
  const handlePlatformChange = (option) => {
    const newType = option ? option.value : "";
    // Check if current category is still valid for new platform
    const newFilteredCategories = categories.filter(
      (category) => category.platforms_id?._id === newType
    );
    const validCategory = newFilteredCategories.some(cat => cat._id === formData.category);
    setFormData({
      ...formData,
      type: newType,
      category: validCategory ? formData.category : "",
    });
  };

  // Create options for react-select
  const platformOptions = uniquePlatforms.map((platform) => ({
    value: platform._id,
    label: platform.name,
  }));

  const categoryOptions = filteredCategories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

  const domainOptions = datasmm
    .filter(partner => !partner.ordertay)   // ⬅ Chỉ lấy partner không có ordertay = true
    .map(partner => ({
      value: partner._id,
      label: partner.name,
    }));

  // Find selected options
  const selectedPlatformOption = platformOptions.find(
    (opt) => opt.value === formData.type
  ) || null;

  const selectedCategoryOption = categoryOptions.find(
    (opt) => opt.value === formData.category
  ) || null;

  const selectedDomainOption = domainOptions.find(
    (opt) => String(opt.value) === String(formData.DomainSmm)
  ) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra giá trị hợp lệ
    if (formData.min < 0 || formData.max < 0 || formData.rate < 0 || formData.ratevip < 0 || formData.rateDistributor < 0) {
      toast.error("Giá trị Min, Max, Giá, Giá VIP và Giá Đại lý không được âm!");
      return;
    }

    if (formData.min > formData.max) {
      toast.error("Giá trị Min không được lớn hơn Max!");
      return;
    }

    const updatedData = {
      name: formData.name,
      description: formData.description ? formData.description.replace(/\n/g, '\\n') : "",
      maychu: formData.maychu,
      min: formData.min || 0,
      max: formData.max || 0,
      rate: formData.rate || 0,
      ratevip: formData.ratevip || 0,
      rateDistributor: formData.rateDistributor || 0,
      getid: formData.getid,
      comment: formData.comment,
      reaction: formData.reaction,
      matlive: formData.matlive,
      refil: formData.refil,
      cancel: formData.cancel,
      isActive: formData.isActive,
      status: formData.status,
      thutu: formData.thutu,
      ischeck: formData.ischeck,
      originalRate: formData.originalRate,
      type: formData.type,
      category: formData.category,
      DomainSmm: formData.DomainSmm,
      serviceId: formData.serviceId,
      chietkhau: formData.chietkhau,
    };

    loadingg("Đang cập nhật dịch vụ...", true, 99999999);
    try {
      await updateServer(formData._id, updatedData, token);
      toast.success("Dịch vụ đã được cập nhật thành công!");
      fetchServers(); // Tải lại danh sách dịch vụ sau khi cập nhật
      onClose();
    } catch (error) {
      toast.error("Lỗi khi cập nhật dịch vụ. Vui lòng thử lại!");
    } finally {
      loadingg("Đang tải...", false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false} centered size="xl" className="modern-modal">
      <Modal.Header closeButton className="bg-gradient-warning text-white border-0">
        <Modal.Title className="d-flex align-items-center">
          <i className="fas fa-edit me-2"></i>
          Chỉnh sửa dịch vụ
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <form onSubmit={handleSubmit}>
          <div className="container-fluid">
            {/* Platform and Service Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-layer-group me-2"></i>
                  Nền tảng và dịch vụ
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6" style={{ zIndex: 20 }}>
                    <label className="form-label fw-bold">
                      <i className="fas fa-layer-group me-1 text-primary"></i>
                      Nền tảng <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={platformOptions}
                      value={selectedPlatformOption}
                      onChange={handlePlatformChange}
                      placeholder="Chọn nền tảng"
                      isClearable
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      isDisabled={isAllowedApiUrl}
                    />
                  </div>
                  <div className="col-md-6" style={{ zIndex: 19 }}>
                    <label className="form-label fw-bold">
                      <i className="fas fa-tags me-1 text-primary"></i>
                      Danh mục <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={categoryOptions}
                      value={selectedCategoryOption}
                      onChange={(option) => {
                        setFormData({
                          ...formData,
                          category: option ? option.value : "",
                        });
                      }}
                      placeholder="Chọn danh mục"
                      isClearable
                      // isDisabled={!formData.type}
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9998 }) }}
                      isDisabled={isAllowedApiUrl || !formData.type}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Source Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-network-wired me-2"></i>
                  Nguồn
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6" style={{ zIndex: 18 }}>
                    <label className="form-label fw-bold">
                      <i className="fas fa-globe me-1 text-success"></i>
                      Nguồn <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={
                        formData.ordertay
                          ? [{ value: form.DomainSmm, label: form.DomainSmm }]  // cố định domain cũ
                          : domainOptions                                        // danh sách domain bình thường
                      }
                      value={
                        formData.ordertay
                          ? { value: form.DomainSmm, label: form.DomainSmm }     // hiển thị domain cũ
                          : selectedDomainOption                                 // hoặc domain đã chọn
                      }
                      onChange={(option) => {
                        if (!formData.ordertay) {                                // khi ordertay=true thì KHÔNG cho chọn
                          setFormData({
                            ...formData,
                            DomainSmm: option ? option.value : "",
                          });
                        }
                      }}
                      placeholder="Chọn nguồn"
                      isClearable={!formData.ordertay}                           // không cho clear nếu bị khóa
                      classNamePrefix="react-select"
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9997 }) }}
                      isDisabled={isAllowedApiUrl || formData.ordertay}          // Disable nếu ordertay=true
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-hashtag me-1 text-success"></i>
                      Service ID
                    </label>
                    <input
                      type="text"
                      value={formData.serviceId}
                      className="form-control form-control-lg bg-light"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          serviceId: e.target.value,
                        })
                      }
                      disabled={isAllowedApiUrl || formData.ordertay}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Service Information */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-cog me-2"></i>
                  Thông tin dịch vụ
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-hashtag me-1 text-info"></i>
                      Mã gói<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="Magoi"
                      value={form.Magoi}
                      className="form-control form-control-lg"
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-sort-numeric-up me-1 text-warning"></i>
                      Thứ tự
                    </label>
                    <input
                      type="text"
                      name="thutu"
                      value={formData.thutu}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Nhập thứ tự hiển thị"
                    />
                  </div>
                  {/* <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-toggle-on me-1 text-primary"></i>
                      Trạng thái
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === "true",
                        })
                      }
                      className="form-select form-select-lg"
                    >
                      <option value="true">🟢 Hoạt động</option>
                      <option value="false">🔴 Đóng</option>
                    </select>
                  </div> */}
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-12">
                    <label className="form-label fw-bold">
                      <i className="fas fa-tag me-1 text-info"></i>
                      Tên dịch vụ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Nhập tên dịch vụ"
                      required
                      disabled={isAllowedApiUrl}
                    />
                  </div>
                  {/* <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-hashtag me-1 text-info"></i>
                      Service ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Nhập Service ID"
                      required
                      disabled={isAllowedApiUrl}
                    />
                  </div> */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-server me-1 text-info"></i>
                      Máy chủ
                    </label>
                    <input
                      type="text"
                      name="maychu"
                      value={formData.maychu}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Sv1, Sv2,..."
                      disabled={isAllowedApiUrl}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">
                      <i className="fas fa-align-left me-1 text-info"></i>
                      Mô tả
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Nhập mô tả dịch vụ..."
                    />
                  </div>
                </div>

                {/* Limits and Pricing */}
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-arrow-down me-1 text-warning"></i>
                      Min <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="min"
                      value={formData.min}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="0"
                      required
                      disabled={isAllowedApiUrl}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-arrow-up me-1 text-warning"></i>
                      Max <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="max"
                      value={formData.max}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="0"
                      required
                      disabled={isAllowedApiUrl}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-dollar-sign me-1 text-success"></i>
                      Giá Thành Viên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-gem me-1 text-warning"></i>
                      Giá Đại Lý
                    </label>
                    <input
                      type="number"
                      name="ratevip"
                      value={formData.ratevip}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-handshake me-1 text-secondary"></i>
                      Giá Nhà Phân Phối
                    </label>
                    <input
                      type="number"
                      name="rateDistributor"
                      value={formData.rateDistributor}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="fas fa-coins me-1 text-muted"></i>
                      Giá gốc
                    </label>
                    <input
                      type="number"
                      name="originalRate"
                      value={formData.originalRate}
                      onChange={handleChange}
                      className="form-control form-control-lg bg-light"
                      placeholder="0.00"
                      disabled={!formData.ordertay || isAllowedApiUrl} // nếu ordertay = false thì disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Functions */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-secondary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-tools me-2"></i>
                  Các chức năng
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3 mb-3">
                  {!isAllowedApiUrl && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-toggle-on me-1 text-primary"></i>
                        Trạng thái
                      </label>
                      <select
                        name="isActive"
                        value={formData.isActive ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.value === "true",
                          })
                        }
                        className="form-select form-select-lg"
                      >
                        <option value="true">🟢 Hoạt động</option>
                        <option value="false">🔴 Bảo trì</option>
                      </select>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="fas fa-toggle-on me-1 text-primary"></i>
                      Trạng thái hiển thị
                    </label>
                    <select
                      name="status"
                      value={formData.status ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value === "true",
                        })
                      }
                      className="form-select form-select-lg"
                    >
                      <option value="true">Hiện</option>
                      <option value="false">Ẩn</option>
                    </select>
                  </div>
                  {!isAllowedApiUrl && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-money-bill-wave me-1 text-primary"></i>
                        Mua không check giá (<b style={{ fontSize: 15, color: 'red' }}> có thể bán lỗ </b>)
                      </label>
                      <select
                        name="ischeck"
                        value={formData.ischeck ? "true" : "false"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ischeck: e.target.value === "true",
                          })
                        }
                        className="form-select form-select-lg"
                      >
                        <option value="true">🟢 Bật</option>
                        <option value="false">🔴 Tắt</option>
                      </select>
                    </div>
                  )}
                  {!isAllowedApiUrl && (
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        <i className="fas fa-percentage me-1 text-primary"></i>
                        Chiết khấu (%): 10 ⇒ đơn 1000 gửi nguồn 900; -10 ⇒ đơn 1000 gửi 1100.
                      </label>
                      <input
                        type="number"
                        name="chietkhau"
                        value={formData.chietkhau}
                        onChange={handleChange}
                        className="form-control form-control-lg"
                        placeholder="Nhập chiết khấu"
                        disabled={formData.ordertay}
                      />
                    </div>
                  )}
                </div>
                {!isAllowedApiUrl && (
                  <div className="row g-3">
                    {[
                      { key: 'getid', label: 'Get UID', icon: 'fas fa-user-tag', color: 'text-primary' },
                      { key: 'comment', label: 'Comment', icon: 'fas fa-comment', color: 'text-info' },
                      { key: 'refil', label: 'Bảo hành', icon: 'fas fa-shield-alt', color: 'text-success' },
                      { key: 'cancel', label: 'Hủy đơn', icon: 'fas fa-times-circle', color: 'text-danger' }
                    ].map((item) => (
                      <div className="col-6 col-md-3" key={item.key}>
                        <label className="form-label fw-bold">
                          <i className={`${item.icon} me-1 ${item.color}`}></i>
                          {item.label}
                        </label>
                        <select
                          name={item.key}
                          value={formData[item.key]}
                          onChange={handleChange}
                          className="form-select form-select-lg"
                        >
                          <option value="on">🟢 Bật</option>
                          <option value="off">🔴 Tắt</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className="border-0 bg-light px-4 py-3">
        <div className="d-flex gap-2 w-100 justify-content-end">
          <Button
            variant="outline-secondary"
            onClick={onClose}
            className="px-4 fw-bold"
          >
            <i className="fas fa-times me-2"></i>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="px-4 fw-bold"
          >
            <i className="fas fa-save me-2"></i>
            Lưu thay đổi
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}