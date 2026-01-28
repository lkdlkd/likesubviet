'use client';
import { loadingg } from "@/JS/Loading";
import { deleteServer, getAllSmmPartners, getServer, updatePartnerPrices, Dongbo, syncServicesFromSmm, updateServersOrder } from "@/Utils/api";
import { useEffect, useState, useMemo } from "react";
import Table from "react-bootstrap/Table";
import { useOutletContext, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import EditModal from "./EditModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Component cho mỗi row server có thể kéo thả
function SortableServerRow({ serverItem, idx2, selectedServers, setSelectedServers, handleEdit, handleDelete, selectedPlatform, category, isAllowedApiUrl, isDragEnabled = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: serverItem._id, disabled: !isDragEnabled });

  const style = isDragEnabled ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? '#f0f8ff' : undefined,
  } : {};

  // Fallback cho trường hợp không có selectedPlatform/category (chế độ phân trang)
  const platformName = selectedPlatform?.name || serverItem.type || '';
  const platformId = selectedPlatform?.id || serverItem.typeId || '';
  const categoryName = category?.category_name || serverItem.category || '';
  const categoryId = category?.category_id || serverItem.categoryId || '';

  return (
    <tr ref={isDragEnabled ? setNodeRef : undefined} style={style}>
      <td>
        <input
          type="checkbox"
          checked={selectedServers.includes(serverItem._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedServers((prev) => [...prev, serverItem._id]);
            } else {
              setSelectedServers((prev) =>
                prev.filter((id) => id !== serverItem._id)
              );
            }
          }}
        />
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          {isDragEnabled && (
            <span
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', padding: '0 8px' }}
              title="Kéo để sắp xếp"
            >
              <i className="fas fa-grip-vertical text-secondary"></i>
            </span>
          )}
          {serverItem.thutu}
        </div>
      </td>
      <td>
        <div className="dropdown">
          <button
            className="btn btn-primary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Thao tác <i className="las la-angle-right ms-1"></i>
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item text-warning"
                onClick={() => handleEdit({
                  ...serverItem,
                  typeId: platformId,
                  categoryId: categoryId,
                  type: platformName,
                  category: categoryName
                })}
              >
                Sửa
              </button>
            </li>
            {!isAllowedApiUrl && (
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => handleDelete(serverItem._id || "")}
                >
                  Xóa
                </button>
              </li>
            )}
          </ul>
        </div>
      </td>
      <td style={{
        maxWidth: "350px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}>
        <ul>
          <li><b>Mã gói</b> : {serverItem.Magoi}</li>
          <li><b>Tên</b> : {serverItem.maychu} <span dangerouslySetInnerHTML={{ __html: serverItem.name }} /></li>
          <li><b>Nền tảng</b> : {platformName}</li>
          <li><b>Dịch vụ</b> : {categoryName}</li>
          <li><b>Min-Max</b> : {serverItem.min} - {serverItem.max}</li>
          <li>
            <b>Trạng thái</b> :{" "}
            {serverItem.isActive ? <span className="badge bg-success">Hoạt động</span> : <span className="badge bg-danger">Bảo trì</span>}
            <br />
            {serverItem.status ? <span className="badge bg-success ms-1">Hiện</span> : <span className="badge bg-danger ms-1">Ẩn</span>}
          </li>
        </ul>
      </td>
      <td>
        <ul>
          <li><b>Giá gốc</b> : {serverItem.originalRate}</li>
          <li><b>Giá Nhà Phân Phối</b> : {serverItem.rateDistributor}</li>
          <li><b>Giá Đại Lý</b> : {serverItem.ratevip}</li>
          <li><b>Giá Thành Viên</b> : {serverItem.rate}</li>
        </ul>
      </td>
      <td>
        <ul>
          <li><b>Get uid (Dành cho FB )</b>: {serverItem.getid === 'on' ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Bình luận</b>: {serverItem.comment === 'on' ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Hủy đơn</b>: {serverItem.cancel === 'on' ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Bảo hành</b>: {serverItem.refil === 'on' ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Mua không check giá</b>: {serverItem.ischeck === true ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Đơn tay</b>: {serverItem.ordertay === true ? <span className="badge bg-success ms-1">ON</span> : <span className="badge bg-secondary ms-1">OFF</span>}</li>
          <li><b>Chiết khấu (%)</b>: {serverItem.chietkhau}</li>
        </ul>
      </td>
      <td style={{
        maxWidth: "350px",
        whiteSpace: "normal",
        wordWrap: "break-word",
        overflowWrap: "break-word",
      }}>
        <ul>
          <li><b>Nguồn</b>: {serverItem.DomainSmm}</li>
          <li><b>ID server</b>: {serverItem.serviceId}</li>
          <li><b>Tên server</b>: {serverItem.serviceName}</li>
        </ul>
      </td>
      <td>{new Date(serverItem.createdAt).toLocaleString()}</td>
    </tr>
  );
}

export default function Dichvupage() {
  const { categories: cate } = useOutletContext();
  const [rawServers, setRawServers] = useState([]); // Dữ liệu hierarchical từ API
  const [categories, setCategories] = useState([]); // Sử dụng categories từ Outlet context
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedServers, setSelectedServers] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 20,
  });
  const [showEditModal, setShowEditModal] = useState(false); // Trạng thái hiển thị modal chỉnh sửa
  const [selectedService, setSelectedService] = useState(null); // Dịch vụ được chọn để chỉnh sửa
  const [quickAddMode, setQuickAddMode] = useState(true); // <--- ADD THIS
  const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm
  const navigate = useNavigate(); // Navigation hook

  // ===== FLATTEN DỮ LIỆU HIERARCHICAL TỪ API =====
  const servers = useMemo(() => {
    if (!Array.isArray(rawServers)) return [];
    const result = [];
    rawServers.forEach(platform => {
      if (!platform.categories) return;
      platform.categories.forEach(category => {
        if (!category.services) return;
        category.services.forEach(service => {
          result.push({
            ...service,
            type: platform.platform_name,
            category: category.category_name,
            logo: platform.platform_logo,
          });
        });
      });
    });
    return result;
  }, [rawServers]);

  // Lấy danh sách nền tảng từ hierarchical data (quickAddMode) hoặc từ flattened servers
  const platforms = useMemo(() => {
    if (Array.isArray(rawServers) && rawServers.length > 0) {
      return rawServers.map(p => ({
        id: p.platform_id,
        name: p.platform_name,
        logo: p.platform_logo,
        thutu: p.platform_thutu,
        categories: p.categories || []
      }));
    }
    return [];
  }, [rawServers]);

  const [selectedType, setSelectedType] = useState("");
  
  // Lấy platform được chọn từ hierarchical data
  const selectedPlatform = useMemo(() => {
    return platforms.find(p => p.name === selectedType) || null;
  }, [platforms, selectedType]);
  // SMM partners & update price state
  const [smmPartners, setSmmPartners] = useState([]);
  const [selectedSmm, setSelectedSmm] = useState("");
  const [updatingPrices, setUpdatingPrices] = useState(false);
  // Price adjustment percents for member, agent, distributor
  const [adjustMemberPct, setAdjustMemberPct] = useState(0);
  const [adjustAgentPct, setAdjustAgentPct] = useState(0);
  const [adjustDistributorPct, setAdjustDistributorPct] = useState(0);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [selectedSyncSmm, setSelectedSyncSmm] = useState("");

  // Filter states (pending - chưa áp dụng)
  const [filterSource, setFilterSource] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Applied filter states (đã áp dụng - dùng để gọi API)
  const [appliedFilters, setAppliedFilters] = useState({
    DomainSmm: "",
    category: "",
    isActive: "",
    status: "",
  });

  const token = localStorage.getItem("token") || "";
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

  const fetchServers = async () => {
    try {
      loadingg("Đang tải...", true, 9999999);
      if (!quickAddMode) {
        const response = await getServer(token, currentPage, limit, debouncedSearch, appliedFilters);
        setRawServers(response.data || []); // Lưu dữ liệu hierarchical
        setPagination(response.pagination || {
          totalItems: 0,
          currentPage: 1,
          totalPages: 1,
          pageSize: limit,
        });
      } else {
        const response = await getServer(token, undefined, undefined, debouncedSearch, appliedFilters);
        setRawServers(response.data || []); // Lưu dữ liệu hierarchical
      }
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lấy danh sách server.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      loadingg("Đang tải...", false);
    }
  };

  // Load SMM partners for update price action
  const fetchSmmPartners = async () => {
    try {
      const partners = await getAllSmmPartners(token);
      setSmmPartners(Array.isArray(partners) ? partners : partners?.data || []);
    } catch (error) {
      // silent fail; dropdown will be empty
    }
  };

  // Sync services from selected SMM partner
  const handleSync = async () => {
    if (!selectedSyncSmm) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng chọn nguồn SMM!",
        icon: "warning",
        confirmButtonText: "Xác nhận",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận đồng bộ?",
      text: " Hệ thống sẽ tự động đồng bộ tất cả dịch vụ từ API vào website của bạn (phù hợp cho website chỉ kết nối duy nhất 1 API) ( Nếu bạn có nhiều hơn 1 API thì không nên sử dụng tránh xung đột)",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng bộ",
      cancelButtonText: "Hủy",
    });

    if (!result.isConfirmed) return;

    setSyncing(true);
    loadingg("Đang đồng bộ d\u1ecbch v\u1ee5...", true, 999999);

    try {
      await syncServicesFromSmm(selectedSyncSmm, token);
      Swal.fire({
        title: "Thành công",
        text: "Đồng bộ dịch vụ thành công!",
        icon: "success",
        confirmButtonText: "Xác nhận",
      });
      fetchServers(); // Refresh service list
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: error.message || "Lỗi khi đồng bộ dịch vụ!",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      setSyncing(false);
      loadingg("Đang tải...", false);
    }
  };

  useEffect(() => {
    if (cate && Array.isArray(cate)) {
      setCategories(cate);
    } else {
      setCategories([]); // Đặt về mảng rỗng nếu cate không hợp lệ
    }
  }, [cate]);
  useEffect(() => {
    fetchServers();
    // fetchCategories();
  }, [currentPage, limit, debouncedSearch, quickAddMode, appliedFilters]);

  useEffect(() => {
    fetchSmmPartners();
  }, []);

  // Auto-fill adjustment percentages when SMM partner is selected
  useEffect(() => {
    if (selectedSmm && smmPartners.length > 0) {
      const partner = smmPartners.find((p) => String(p._id) === String(selectedSmm));
      if (partner) {
        // Auto-fill from partner's default values
        setAdjustMemberPct(Number(partner.price_update) || 0);
        setAdjustAgentPct(Number(partner.price_updateVip) || 0);
        setAdjustDistributorPct(Number(partner.price_updateDistributor) || 0);
      }
    } else {
      // Reset when no SMM is selected
      setAdjustMemberPct(0);
      setAdjustAgentPct(0);
      setAdjustDistributorPct(0);
    }
  }, [selectedSmm, smmPartners]);

  // Áp dụng tìm kiếm và bộ lọc - gọi API
  const handleSearchAndFilter = () => {
    setIsSearching(true);
    setDebouncedSearch(searchQuery);
    setAppliedFilters({
      DomainSmm: filterSource,
      category: filterCategory,
      isActive: filterIsActive,
      status: filterStatus,
    });
    setCurrentPage(1);
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1); // Đặt lại về trang đầu tiên
  };

  const handleEdit = (server) => {
    setSelectedService(server); // Lưu dịch vụ được chọn
    setShowEditModal(true); // Hiển thị modal
  };

  const handleDelete = async (serverId) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        loadingg("Đang xóa server...", true, 9999999);
        await deleteServer(serverId, token);
        Swal.fire("Đã xóa!", "Server đã được xóa thành công.", "success");
        fetchServers();
      } catch (error) {
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa server.", "error");
      } finally {
        loadingg("Đang tải...", false);
      }
    }
  };

  const handleDongbo = async () => {
    const result = await Swal.fire({
      title: "Đồng bộ dịch vụ",
      text: "Bạn có muốn đồng bộ dịch vụ từ nguồn?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Đồng bộ",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        loadingg("Đang đồng bộ dịch vụ...", true, 9999999);
        await Dongbo(token);
        Swal.fire("Thành công!", "Đồng bộ dịch vụ thành công.", "success");
        fetchServers();
      } catch (error) {
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi đồng bộ dịch vụ.", "error");
      } finally {
        loadingg("Đang tải...", false);
      }
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for servers reordering within a category
  const handleServerDragEnd = (categoryServices, categoryId) => async (event) => {
    const { active, over } = event;
    
    if (!over) return; // Không có vị trí thả hợp lệ
    
    if (active.id !== over.id) {
      // Tìm index trong danh sách servers của category hiện tại
      const oldIndex = categoryServices.findIndex((s) => s._id === active.id);
      const newIndex = categoryServices.findIndex((s) => s._id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return; // Server không thuộc category này
      
      const reorderedServices = arrayMove(categoryServices, oldIndex, newIndex);
      
      // Cập nhật thutu hiển thị local (không gọi API load lại)
      const updatedServices = reorderedServices.map((s, idx) => ({
        ...s,
        thutu: idx + 1
      }));
      
      // Cập nhật rawServers state với thứ tự mới
      setRawServers(prevRawServers => {
        return prevRawServers.map(platform => ({
          ...platform,
          categories: platform.categories.map(cat => {
            if (cat.category_id === categoryId) {
              return {
                ...cat,
                services: updatedServices
              };
            }
            return cat;
          })
        }));
      });
      
      // Gửi orderedIds của category này để cập nhật thứ tự lên server (background)
      const orderedIds = reorderedServices.map((s) => s._id);
      try {
        await updateServersOrder(orderedIds, token);
      } catch (error) {
        console.error("Error updating servers order:", error);
        Swal.fire("Lỗi!", "Có lỗi xảy ra khi cập nhật thứ tự.", "error");
        // Rollback: load lại data nếu lỗi
        fetchServers();
      }
    }
  };

  // Khi ở chế độ hiện tất cả, lọc servers theo search nếu có
  const filteredServers = servers;
  
  // Lấy categories từ selectedPlatform (hierarchical data) - O(1) thay vì O(n) filter
  const categoriesByType = useMemo(() => {
    if (!selectedPlatform || !selectedPlatform.categories) return [];
    return selectedPlatform.categories;
  }, [selectedPlatform]);

  // Lấy danh sách nguồn từ smmPartners và category từ categories (giữ _id và name)
  const uniqueSources = smmPartners.filter(p => p._id && p.name);
  const uniqueCategories = categories.filter(c => c._id && c.name);

  // Xóa tất cả bộ lọc và tìm kiếm
  const handleClearAll = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterSource("");
    setFilterCategory("");
    setFilterIsActive("");
    setFilterStatus("");
    setAppliedFilters({
      DomainSmm: "",
      category: "",
      isActive: "",
      status: "",
    });
    setCurrentPage(1);
  };

  // Kiểm tra có thay đổi nào chưa áp dụng không (bao gồm cả search và filter)
  const hasPendingChanges = searchQuery !== debouncedSearch ||
    filterSource !== appliedFilters.DomainSmm ||
    filterCategory !== appliedFilters.category ||
    filterIsActive !== appliedFilters.isActive ||
    filterStatus !== appliedFilters.status;

  // Kiểm tra có filter/search nào đang active (đã áp dụng) không
  const hasActiveFilters = debouncedSearch || appliedFilters.DomainSmm || appliedFilters.category || appliedFilters.isActive !== "" || appliedFilters.status !== "";

  return (
    <>
      <style>
        {`
          /* Modern Service Page Styles */
          .service-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .service-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .service-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .service-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .service-header-content {
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .service-icon-circle {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            backdrop-filter: blur(10px);
          }
          
          .service-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .service-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .service-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
            padding: 1.5rem 2rem;
          }
          
          .service-controls-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #e8ecef;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .service-controls-title {
            font-size: 16px;
            font-weight: 600;
            color: #495057;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .service-btn-primary {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            border: 1px solid #28a745;
            color: white;
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .service-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            color: white;
          }

          /* Smaller variant for compact buttons */
          .service-btn-primary.btn-sm {
            padding: 0.35rem 0.75rem;
            font-size: 12px;
            border-radius: 6px;
          }
          
          .service-btn-toggle {
            background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
            border: 1px solid #ffc107;
            color: white;
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .service-btn-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
            color: white;
          }
          
          .service-btn-danger {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            border: 1px solid #dc3545;
            color: white;
            padding: 0.7rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            margin-bottom: 0.5rem;
          }
          
          .service-btn-danger:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
            color: white;
          }
          /* Subtle inline note */
          .smm-note {
            font-size: 12px;
            color: #6c757d;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .smm-note .pill {
            color: #495057;

          }
          
          .service-warning-text {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            color: #856404;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid #ffeaa7;
            margin-left: 0.5rem;
          }
          
          .service-form-control {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .service-form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .service-search-group {
            display: flex;
            gap: 0;
          }
          
          .service-search-group .form-control {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          
          .service-search-group .btn {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            border-left: none;
          }
          
          .service-search-group .btn:not(:last-child) {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
          
          .service-tabs-section {
            margin-bottom: 1.5rem;
          }
          
          .service-nav-tabs {
            border: none;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 0.5rem;
            width: 300px;
          }
          
          .service-nav-item {
            margin-bottom: 0.25rem;
          }
          
          .service-nav-link {
            background: transparent;
            border: none;
            color: #6c757d;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: block;
          }
          
          .service-nav-link:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
          }
          
          .service-nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          
          .service-accordion {
            border: none;
          }
          
          .service-accordion-item {
            border: none;
            border-bottom: 1px solid #e8ecef;
            background: white;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .service-accordion-item:last-child {
            border-bottom: none;
          }
          
          .service-accordion-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: none;
            padding: 0;
          }
          
          .service-accordion-button {
            background: transparent;
            border: none;
            color: #495057;
            font-weight: 600;
            font-size: 15px;
            padding: 1rem 1.5rem;
            border-radius: 0;
            position: relative;
            transition: all 0.3s ease;
          }
          
          .service-accordion-button:not(.collapsed) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: none;
          }
          
          .service-accordion-button:focus {
            box-shadow: none;
            border-color: transparent;
          }
          
          .service-accordion-button::after {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23495057'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
            transition: transform 0.3s ease;
          }
          
          .service-accordion-button:not(.collapsed)::after {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3e%3cpath fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
            transform: rotate(180deg);
          }
          
          .service-pagination {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-top: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .service-pagination .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .service-pagination .btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
          }
          
          .service-pagination .btn:disabled {
            background: #6c757d;
            opacity: 0.6;
          }
          
          @media (max-width: 768px) {
            .service-container {
              font-size: 13px;
            }
            
            .service-main-title {
              font-size: 20px;
            }
            
            .service-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .service-content-card {
              padding: 1rem 1.5rem;
            }
            
            .service-controls-section {
              padding: 1rem;
            }
            
            .service-nav-tabs {
              width: 100%;
            }
            
            .service-tabs-section .d-flex {
              flex-direction: column;
            }

            /* Mobile-friendly layout for SMM actions */
            .smm-actions {
              width: 100%;
              margin-top: 10px;
              justify-content: flex-start !important;
              gap: 8px;
            }
            .smm-actions .service-form-control {
              min-width: 0 !important;
              width: 100%;
            }
            .smm-actions .btn {
              padding: 0.45rem 0.8rem;
              font-size: 12px;
              border-radius: 6px;
            }
            .smm-note {
              width: 100%;
              margin-top: 6px;
            }
          }
        `}
      </style>

      <div className="service-container">
        <div className="main-content">
          <div className="col-md-12">
            <div className="service-header-card">
              <div className="card-header">
                <div className="service-header-content">
                  <div className="service-icon-circle">
                    <i className="fas fa-server"></i>
                  </div>
                  <h2 className="service-main-title">Danh Sách Server</h2>
                </div>
              </div>
            </div>

            <div className="service-content-card">
              <div className="service-controls-section">
                <div className="service-controls-title">
                  <i className="fas fa-cogs"></i>
                  Điều khiển và cài đặt
                </div>

                {/* Primary Actions Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex flex-wrap align-items-center" style={{ gap: "12px" }}>
                      {isAllowedApiUrl ? (
                        <button
                          type="button"
                          className="btn service-btn-primary"
                          onClick={handleDongbo}
                        >
                          <i className="fas fa-sync-alt me-2"></i>
                          Đồng bộ
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn service-btn-primary"
                            onClick={() => navigate('/admin/server/add')}
                          >
                            <i className="fas fa-plus me-2"></i>
                            Thêm dịch vụ
                          </button>
                          {/* Manual Sync from specific SMM partner */}
                          <select
                            className="form-select"
                            style={{ width: "auto", minWidth: "200px" }}
                            value={selectedSyncSmm}
                            onChange={(e) => setSelectedSyncSmm(e.target.value)}
                            disabled={syncing}
                          >
                            <option value="">Chọn nguồn SMM...</option>
                            {smmPartners.filter(p => p.status === "on" && !p.ordertay).map((partner) => (
                              <option key={partner._id} value={partner._id}>
                                {partner.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            className="btn btn-info"
                            onClick={handleSync}
                            disabled={syncing || !selectedSyncSmm}
                          >
                            <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
                            {syncing ? "Đang đồng bộ..." : "Đồng bộ theo nguồn"}
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className={`btn service-btn-toggle`}
                        onClick={() => setQuickAddMode((prev) => !prev)}
                      >
                        <i className={`fas ${quickAddMode ? "fa-table" : "fa-th-list"} me-2`}></i>
                        {quickAddMode ? "Hiển thị theo phân trang" : "Hiển thị theo dịch vụ"}
                      </button>
                      {quickAddMode && (
                        <span className="service-warning-text">
                          <i className="fas fa-info-circle me-2"></i>
                          Đang ở chế độ hiển thị theo dịch vụ, vui lòng tắt để sử dụng phân trang.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SMM Price Update Section */}
                <div className="row">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm bg-light">
                      <div className="card-header bg-gradient-info text-white py-2">
                        <h6 className="mb-0">
                          <i className="fas fa-sync-alt me-2"></i>
                          Cập nhật giá từ đối tác SMM
                        </h6>
                      </div>
                      <div className="card-body p-3 bg-white">
                        <div className="row align-items-center">
                          {/* SMM Partner Selection */}
                          <div className="col-lg-3 col-md-6 mb-3 mb-lg-0">
                            <label className="form-label fw-semibold mb-1">Đối tác SMM</label>
                            <select
                              id="smmSelect"
                              className="form-select service-form-control"
                              value={selectedSmm}
                              onChange={(e) => setSelectedSmm(e.target.value)}
                            >
                              <option value="">Chọn đối tác SMM...</option>
                              {smmPartners
                                .slice()
                                .sort((a, b) => (a?.name || "").localeCompare(b?.name || "", "vi", { sensitivity: "base" }))
                                .map((p) => (
                                  <option key={p._id} value={p._id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Percentage Adjustments */}
                          <div className="col-lg-6 col-md-6 mb-3 mb-lg-0">
                            <label className="form-label fw-semibold mb-1">Điều chỉnh phần trăm (%)</label>
                            <div className="row g-2">
                              <div className="col-lg-4 col-md-4 col-12">
                                <div className="input-group input-group-sm">
                                  <input
                                    type="number"
                                    className="form-control service-form-control"
                                    placeholder="0"
                                    value={adjustDistributorPct === 0 ? "" : adjustDistributorPct}
                                    onChange={(e) => setAdjustDistributorPct(e.target.value === "" ? 0 : Number(e.target.value))}
                                    title="% muốn tăng Nhà phân phối"
                                  />
                                  <span className="input-group-text">Nhà Phân Phối</span>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-12">
                                <div className="input-group input-group-sm">
                                  <input
                                    type="number"
                                    className="form-control service-form-control"
                                    placeholder="0"
                                    value={adjustAgentPct === 0 ? "" : adjustAgentPct}
                                    onChange={(e) => setAdjustAgentPct(e.target.value === "" ? 0 : Number(e.target.value))}
                                    title="% muốn tăng Đại lý"
                                  />
                                  <span className="input-group-text">Đại Lý</span>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-12">
                                <div className="input-group input-group-sm">
                                  <input
                                    type="number"
                                    className="form-control service-form-control"
                                    placeholder="0"
                                    value={adjustMemberPct === 0 ? "" : adjustMemberPct}
                                    onChange={(e) => setAdjustMemberPct(e.target.value === "" ? 0 : Number(e.target.value))}
                                    title="% muốn tăng Thành Viên"
                                  />
                                  <span className="input-group-text">Thành Viên</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Update Button */}
                          <div className="col-lg-3 col-md-12">
                            <label className="form-label fw-semibold mb-1 d-none d-lg-block">&nbsp;</label>
                            <button
                              type="button"
                              className="btn service-btn-primary w-100"
                              disabled={!selectedSmm || updatingPrices}
                              onClick={async () => {
                                if (!selectedSmm) {
                                  Swal.fire("Thông báo", "Vui lòng chọn một đối tác SMM.", "info");
                                  return;
                                }
                                const partner = smmPartners.find((p) => String(p._id) === String(selectedSmm));
                                const confirm = await Swal.fire({
                                  title: "Cập nhật giá dịch vụ?",
                                  html: `Hệ thống sẽ đồng bộ giá dịch vụ từ đối tác <b>${partner?.name || selectedSmm}</b>.<br/>`
                                    + `Tăng thêm: <b>${adjustMemberPct}%</b> (Thành viên), <b>${adjustAgentPct}%</b> (Đại lý), <b>${adjustDistributorPct}%</b> (Nhà phân phối).`
                                    + `<br/>Thao tác có thể mất vài phút, vui lòng không đóng trang.`,
                                  icon: "question",
                                  showCancelButton: true,
                                  confirmButtonText: "Xác nhận",
                                  cancelButtonText: "Hủy",
                                });
                                if (!confirm.isConfirmed) return;
                                try {
                                  setUpdatingPrices(true);
                                  loadingg("Đang cập nhật giá từ SMM...", true, 9999999);
                                  const payload = {
                                    adjustMemberPct,
                                    adjustAgentPct,
                                    adjustDistributorPct,
                                  };
                                  const res = await updatePartnerPrices(payload, selectedSmm, token);
                                  if (res && res.success) {
                                    const partnerName = res.partner?.name || partner?.name || selectedSmm;
                                    const applied = res.applied || {};
                                    const mem = applied.adjustMemberPct ?? adjustMemberPct ?? 0;
                                    const ag = applied.adjustAgentPct ?? adjustAgentPct ?? 0;
                                    const dist = applied.adjustDistributorPct ?? adjustDistributorPct ?? 0;
                                    const total = Number(res.totalServices ?? 0);
                                    const updatedMember = Number(res.updatedRate ?? 0);
                                    const updatedVip = Number(res.updatedRateVip ?? 0);
                                    const updatedDistributor = Number(res.updatedRateDistributor ?? 0);
                                    const details = `
                                      <div style="text-align:left">
                                        <b>${res.message || "Đã cập nhật giá theo phần trăm yêu cầu."}</b>
                                        <ul style="padding-left:18px; margin:0">
                                          <li>Đối tác: <b>${partnerName}</b></li>
                                          <li>Phần trăm áp dụng: Thành viên <b>${mem}%</b>, Đại lý <b>${ag}%</b>, Nhà phân phối <b>${dist}%</b></li>
                                          <li>Tổng dịch vụ: <b>${total}</b></li>
                                          <li>Cập nhật Thành viên: <b>${updatedMember}</b></li>
                                          <li>Cập nhật Đại lý: <b>${updatedVip}</b></li>
                                          <li>Cập nhật Nhà phân phối: <b>${updatedDistributor}</b></li>
                                        </ul>
                                      </div>`;
                                    loadingg("Đang tải...", false);
                                    await Swal.fire({
                                      title: "Cập nhật thành công",
                                      html: details,
                                      icon: "success",
                                      confirmButtonText: "Đóng",
                                    });
                                    fetchServers();
                                  } else {
                                    const updatedMember = Number(res?.updatedRate ?? 0);
                                    const updatedVip = Number(res?.updatedRateVip ?? 0);
                                    const updatedDistributor = Number(res?.updatedRateDistributor ?? 0);
                                    const totalUpdated = updatedMember + updatedVip + updatedDistributor;
                                    loadingg("Đang tải...", false);
                                    await Swal.fire({
                                      title: "Không có thay đổi",
                                      html: `<div style='text-align:left'>
                                        <b>${res?.message || "Không có dịch vụ nào để cập nhật."}</b>
                                        <ul style='padding-left:18px; margin:0'>
                                          <li>Cập nhật Thành viên: <b>${updatedMember}</b></li>
                                          <li>Cập nhật Đại lý: <b>${updatedVip}</b></li>
                                          <li>Cập nhật Nhà phân phối: <b>${updatedDistributor}</b></li>
                                          <li>Tổng cập nhật: <b>${totalUpdated}</b></li>
                                        </ul>
                                      </div>`,
                                      icon: "warning",
                                      confirmButtonText: "Đóng",
                                    });
                                  }
                                  loadingg("Đang tải...", false);
                                } catch (err) {
                                  Swal.fire("Lỗi", "Không thể cập nhật giá. Vui lòng thử lại.", "error");
                                  loadingg("Đang tải...", false);
                                } finally {
                                  setUpdatingPrices(false);
                                  loadingg("Đang tải...", false);
                                }
                              }}
                            >
                              {updatingPrices ? (
                                <>
                                  <i className="fas fa-spinner fa-spin me-2"></i>
                                  Đang cập nhật...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-sync-alt me-2"></i>
                                  Cập nhật giá
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* SMM Note */}
                        <div className="row mt-3">
                          <div className="col-12">
                            <div className="alert alert-info py-2 mb-0">
                              <small className="d-flex align-items-center">
                                <i className="fas fa-info-circle me-2"></i>
                                {(() => {
                                  const partner = smmPartners.find((p) => String(p._id) === String(selectedSmm));
                                  if (partner) {
                                    return (
                                      <span>
                                        Sẽ cập nhật từ đối tác <b className="text-primary">{partner.name}</b> với điều chỉnh:
                                        <span className="badge bg-primary ms-1">{adjustMemberPct}% Thành Viên</span>
                                        <span className="badge bg-warning ms-1">{adjustAgentPct}% Đại Lý</span>
                                        <span className="badge bg-secondary ms-1">{adjustDistributorPct}% Nhà Phân Phối</span>
                                      </span>
                                    );
                                  }
                                  return <span>Chọn đối tác để cập nhật giá. Thao tác có thể mất vài phút.</span>;
                                })()}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tìm kiếm và Bộ lọc gộp chung */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-light py-2">
                  <h6 className="mb-0">
                    <i className="fas fa-search me-2"></i>
                    Tìm kiếm và Lọc dữ liệu
                    {hasPendingChanges && (
                      <span className="badge bg-warning ms-2">Có thay đổi chưa áp dụng</span>
                    )}
                  </h6>
                </div>
                <div className="card-body py-3">
                  <div className="row g-3">
                    {/* Tìm kiếm */}
                    <div className="col-lg-4 col-md-6 col-sm-12">
                      <label className="form-label fw-semibold text-muted mb-1">Tìm kiếm</label>
                      <input
                        className="form-control service-form-control"
                        type="text"
                        placeholder="Tìm theo Mã gói hoặc Service ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchAndFilter();
                          }
                        }}
                      />
                    </div>

                    {/* Nguồn */}
                    <div className="col-lg-2 col-md-3 col-sm-6">
                      <label className="form-label fw-semibold text-muted mb-1">Nguồn</label>
                      <select
                        className="form-select service-form-control"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                      >
                        <option value="">-- Tất cả --</option>
                        {uniqueSources.map((src) => (
                          <option key={src._id} value={src._id}>{src.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Category */}
                    <div className="col-lg-2 col-md-3 col-sm-6">
                      <label className="form-label fw-semibold text-muted mb-1">Danh mục</label>
                      <select
                        className="form-select service-form-control"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="">-- Tất cả --</option>
                        {uniqueCategories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* isActive */}
                    <div className="col-lg-2 col-md-3 col-sm-6">
                      <label className="form-label fw-semibold text-muted mb-1">Trạng thái</label>
                      <select
                        className="form-select service-form-control"
                        value={filterIsActive}
                        onChange={(e) => setFilterIsActive(e.target.value)}
                      >
                        <option value="">-- Tất cả --</option>
                        <option value="true">Hoạt động</option>
                        <option value="false">Bảo trì</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-lg-2 col-md-3 col-sm-6">
                      <label className="form-label fw-semibold text-muted mb-1">Hiện/Ẩn</label>
                      <select
                        className="form-select service-form-control"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">-- Tất cả --</option>
                        <option value="true">Hiển thị</option>
                        <option value="false">Ẩn</option>
                      </select>
                    </div>
                  </div>

                  {/* Hàng nút và hiển thị */}
                  <div className="row g-3 mt-2">
                    {quickAddMode ? null : (
                      <div className="col-lg-2 col-md-3 col-sm-6">
                        <label className="form-label fw-semibold text-muted mb-1">Hiển thị</label>
                        <select className="form-select service-form-control" value={limit} onChange={handleLimitChange}>
                          <option value={20}>20 dòng</option>
                          <option value={50}>50 dòng</option>
                          <option value={100}>100 dòng</option>
                          <option value={500}>500 dòng</option>
                          <option value={1000}>1000 dòng</option>
                          <option value={2000}>2000 dòng</option>
                        </select>
                      </div>
                    )}

                    <div className="col-lg-2 col-md-3 col-sm-6 d-flex align-items-end">
                      <button
                        className="btn service-btn-primary w-100"
                        onClick={handleSearchAndFilter}
                        disabled={isSearching}
                        style={{ marginBottom: 0 }}
                      >
                        {isSearching ? (
                          <><i className="fas fa-spinner fa-spin me-1"></i> Đang tìm...</>
                        ) : (
                          <><i className="fas fa-search me-1"></i> Tìm kiếm</>)}
                      </button>
                    </div>

                    <div className="col-lg-2 col-md-3 col-sm-6 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={handleClearAll}
                        disabled={!hasActiveFilters && !hasPendingChanges}
                      >
                        <i className="fas fa-times me-1"></i>
                        Xóa tất cả
                      </button>
                    </div>
                  </div>

                  {/* Hiển thị thông tin đang lọc */}
                  {hasActiveFilters && (
                    <div className="mt-3">
                      <div className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        <strong>Đang áp dụng:</strong>
                        {debouncedSearch && <span className="badge bg-primary ms-1">Tìm: "{debouncedSearch}"</span>}
                        {appliedFilters.DomainSmm && <span className="badge bg-info ms-1">Nguồn: {uniqueSources.find(s => s._id === appliedFilters.DomainSmm)?.name || appliedFilters.DomainSmm}</span>}
                        {appliedFilters.category && <span className="badge bg-info ms-1">Danh mục: {uniqueCategories.find(c => c._id === appliedFilters.category)?.name || appliedFilters.category}</span>}
                        {appliedFilters.isActive !== "" && <span className="badge bg-info ms-1">Trạng thái: {appliedFilters.isActive === "true" ? "Hoạt động" : "Bảo trì"}</span>}
                        {appliedFilters.status !== "" && <span className="badge bg-info ms-1">Hiện/Ẩn: {appliedFilters.status === "true" ? "Hiển thị" : "Ẩn"}</span>}
                        <span className="badge bg-success ms-2">{servers.length} kết quả</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isAllowedApiUrl && (
                <div className="d-flex justify-content-left mb-3">
                  <button
                    className="btn service-btn-danger"
                    onClick={async () => {
                      if (selectedServers.length === 0) {
                        Swal.fire("Thông báo", "Vui lòng chọn ít nhất một server để xóa.", "info");
                        return;
                      }

                      const result = await Swal.fire({
                        title: `Bạn có chắc chắn muốn xóa ${selectedServers.length} server đã chọn?`,
                        text: "Hành động này không thể hoàn tác!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#d33",
                        cancelButtonColor: "#3085d6",
                        confirmButtonText: "Xóa",
                        cancelButtonText: "Hủy",
                      });

                      if (result.isConfirmed) {
                        try {
                          loadingg("Đang xóa server đã chọn...", true, 9999999);
                          await Promise.all(
                            selectedServers.map((serverId) => deleteServer(serverId, token))
                          );
                          Swal.fire("Đã xóa!", "Các server đã được xóa thành công.", "success");
                          setSelectedServers([]); // Xóa danh sách đã chọn
                          fetchServers(); // Tải lại danh sách server
                        } catch (error) {
                          Swal.fire("Lỗi!", "Có lỗi xảy ra khi xóa server.", "error");
                        } finally {
                          loadingg("Đang tải...", false);
                        }
                      }
                    }}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Xóa server đã chọn
                  </button>
                </div>
              )}
              {/* Hiển thị dạng chọn nền tảng và accordion category khi ở chế độ hiện tất cả, dưới bảng tổng */}
              {quickAddMode && (
                <div className="service-tabs-section">
                  <div className="d-flex flex-column flex-md-row mt-3">
                    {/* Nền tảng tab navigation */}
                    <ul className="nav nav-tabs service-nav-tabs nav-pills border-0 flex-row flex-md-column me-5 mb-3 mb-md-0 fs-6" role="tablist">
                      {platforms.map((platform) => (
                        <li className="nav-item service-nav-item w-md-200px me-0" role="presentation" key={platform.id}>
                          <a
                            className={`nav-link service-nav-link${selectedType === platform.name ? " active" : ""}`}
                            data-bs-toggle="tab"
                            href={`#services-${platform.id}`}
                            aria-selected={selectedType === platform.name ? "true" : "false"}
                            role="tab"
                            onClick={e => {
                              e.preventDefault();
                              setSelectedType(platform.name);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {platform.logo && <img src={platform.logo} alt="" style={{ width: 20, height: 20, marginRight: 8, objectFit: "contain" }} />}
                            {platform.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {/* End Nền tảng tab navigation */}

                    <div className="tab-content w-100">
                      {selectedType && selectedPlatform && (
                        <div className="accordion accordion-flush service-accordion" id="accordion-category">
                          <div className="accordion accordion-flush service-accordion" id="accordion-category">
                            {categoriesByType.map((category, cidx) => {
                              const safeCategoryId = `cat-${category.category_id}`;
                              const categoryServices = category.services || [];
                              return (
                                <div className="accordion-item service-accordion-item" key={category.category_id}>
                                  <h5 className="accordion-header service-accordion-header m-0" id={`flush-heading-${safeCategoryId}`}>
                                    <button
                                      className="accordion-button service-accordion-button fw-semibold collapsed"
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target={`#flush-collapse-${safeCategoryId}`}
                                      aria-expanded="false"
                                      aria-controls={`flush-collapse-${safeCategoryId}`}
                                    >
                                      <i className="fas fa-layer-group me-2"></i>
                                      {category.category_name}
                                      <span className="badge bg-secondary ms-2">{categoryServices.length}</span>
                                    </button>
                                  </h5>
                                  <div
                                    id={`flush-collapse-${safeCategoryId}`}
                                    className={`accordion-collapse collapse${cidx === 0 ? " show" : ""}`}
                                    aria-labelledby={`flush-heading-${safeCategoryId}`}
                                    data-bs-parent="#accordion-category"
                                  >
                                    <div className="table-responsive p-3">
                                      <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleServerDragEnd(categoryServices, category.category_id)}
                                      >
                                        <Table striped bordered hover responsive>
                                          <thead>
                                            <tr>
                                              <th>
                                                <input
                                                  type="checkbox"
                                                  onChange={(e) => {
                                                    const visibleServerIds = categoryServices.map(s => s._id);
                                                    if (e.target.checked) {
                                                      setSelectedServers(prev => Array.from(new Set([...prev, ...visibleServerIds])));
                                                    } else {
                                                      setSelectedServers(prev => prev.filter(id => !visibleServerIds.includes(id)));
                                                    }
                                                  }}
                                                  checked={
                                                    categoryServices.length > 0 &&
                                                    categoryServices.every(s => selectedServers.includes(s._id))
                                                  }
                                                />
                                              </th>
                                              <th>THỨ TỰ</th>
                                              <th>THAO TÁC</th>
                                              <th>TÊN</th>
                                              <th>GIÁ</th>
                                              <th>CHỨC NĂNG</th>
                                              <th>NGUỒN</th>
                                              <th>THỜI GIAN THÊM</th>
                                            </tr>
                                          </thead>
                                          <SortableContext
                                            items={categoryServices.map((s) => s._id)}
                                            strategy={verticalListSortingStrategy}
                                          >
                                            <tbody>
                                              {categoryServices.length > 0 ? (
                                                categoryServices.map((serverItem, idx2) => (
                                                  <SortableServerRow
                                                    key={serverItem._id}
                                                    serverItem={serverItem}
                                                    idx2={idx2}
                                                    selectedServers={selectedServers}
                                                    setSelectedServers={setSelectedServers}
                                                    handleEdit={handleEdit}
                                                    handleDelete={handleDelete}
                                                    selectedPlatform={selectedPlatform}
                                                    category={category}
                                                    isAllowedApiUrl={isAllowedApiUrl}
                                                    isDragEnabled={true}
                                                  />
                                                ))
                                              ) : (
                                                <tr>
                                                  <td colSpan={8} style={{ textAlign: "center" }}>
                                                    Không có server nào được tìm thấy.
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </SortableContext>
                                        </Table>
                                      </DndContext>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!quickAddMode && (
                <div className="rsp-table">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleServerDragEnd(servers, null)}
                  >
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedServers(servers.map((server) => server._id)); // Chọn tất cả
                                } else {
                                  setSelectedServers([]); // Bỏ chọn tất cả
                                }
                              }}
                              checked={
                                selectedServers.length === servers.length && servers.length > 0
                              }
                            />
                          </th>
                          <th>#</th>
                          <th>THAO TÁC</th>
                          <th>TÊN</th>
                          <th>GIÁ</th>
                          <th>CHỨC NĂNG</th>
                          <th>NGUỒN</th>
                          <th>THỜI GIAN THÊM</th>
                        </tr>
                      </thead>
                      <SortableContext
                        items={servers.map((s) => s._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody>
                          {servers.length > 0 ? (
                            servers.map((serverItem, index) => (
                              <SortableServerRow
                                key={serverItem._id}
                                serverItem={serverItem}
                                index={index}
                                pagination={pagination}
                                limit={limit}
                                selectedServers={selectedServers}
                                setSelectedServers={setSelectedServers}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                isAllowedApiUrl={isAllowedApiUrl}
                                isDragEnabled={false}
                              />
                            ))
                          ) : (
                            <tr>
                              <td colSpan={15} className="text-center">
                                <div>
                                  <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                                  <p className="font-semibold" >Không có dữ liệu</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </SortableContext>
                    </Table>
                  </DndContext>
                </div>
              )}
              {!quickAddMode &&
                pagination.totalItems > 0 && pagination.totalPages > 1 && (
                  <div className="service-pagination">
                    <button
                      className="btn"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left me-2"></i>
                      Trước
                    </button>
                    <span className="fw-semibold">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      className="btn"
                      onClick={handleNextPage}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Sau
                      <i className="fas fa-chevron-right ms-2"></i>
                    </button>
                  </div>
                )
              }
            </div>
          </div>

          <EditModal
            fetchServers={fetchServers}
            show={showEditModal} // Hiển thị modal khi true
            onClose={() => setShowEditModal(false)} // Đóng modal
            initialData={selectedService} // Dữ liệu ban đầu của dịch vụ
            token={token} // Token để gọi API
            categories={categories}
            datasmm={smmPartners}

          />
        </div>
      </div>

    </>
  );
}