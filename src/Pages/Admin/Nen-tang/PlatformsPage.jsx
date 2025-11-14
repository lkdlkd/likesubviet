'use client';

import React, { useState, useEffect } from "react";
import { addPlatform, updatePlatform, deletePlatform, getPlatforms } from "@/Utils/api";
import Swal from "sweetalert2";
import PlatformModal from "./PlatformModal";
import Table from "react-bootstrap/Table"; // Import Table từ react-bootstrap
import { loadingg } from "@/JS/Loading";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const token = localStorage.getItem("token") || "";
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

  const fetchPlatforms = async () => {
    try {
      loadingg("Đang tải danh sách nền tảng...", true, 9999999);
      const response = await getPlatforms(token);
      // Lọc bỏ các phần tử không hợp lệ
      const validPlatforms = response.platforms?.filter((p) => p && p._id) || [];
      setPlatforms(validPlatforms);
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lấy danh sách nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      loadingg("", false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleAddPlatform = async (platform) => {
    try {
      loadingg("Đang thêm nền tảng...", true, 9999999);
      const response = await addPlatform(platform, token);
      setPlatforms([...platforms, response.data]);
      Swal.fire({
        title: "Thành công",
        text: "Nền tảng đã được thêm thành công!",
        icon: "success",
        confirmButtonText: "Xác nhận",
      });
      fetchPlatforms();
      // Reset form state after add
      setSelectedPlatform(null);
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể thêm nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      loadingg("", false);
    }
  };

  const handleUpdatePlatform = async (platformId, platformData) => {
    if (!platformId) {
      return;
    }

    try {
      loadingg("Đang cập nhật nền tảng...", true, 9999999);
      const response = await updatePlatform(platformId, platformData, token);
      setPlatforms((prev) =>
        prev.map((p) => (p._id === platformId ? response.data : p))
      );
      Swal.fire({
        title: "Thành công",
        text: "Nền tảng đã được cập nhật thành công!",
        icon: "success",
        confirmButtonText: "Xác nhận",
      });
      fetchPlatforms();
      // Reset form state after update
      setSelectedPlatform(null);
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: "Không thể cập nhật nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      loadingg("", false);
    }
  };

  const handleDeletePlatform = async (platformId) => {
    if (!platformId) {
      return;
    }

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
        loadingg("Đang xóa nền tảng...", true, 9999999);
        await deletePlatform(platformId, token);
        Swal.fire("Đã xóa!", "Nền tảng đã được xóa.", "success");
        setPlatforms((prev) => prev.filter((platform) => platform._id !== platformId));
        // If deleting the currently selected platform, reset and close modal
        if (selectedPlatform && selectedPlatform._id === platformId) {
          setSelectedPlatform(null);
          setIsModalOpen(false);
        }
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: `${error.message || "Không thể xóa nền tảng."}`,
          icon: "error",
          confirmButtonText: "Xác nhận",
        });
      } finally {
        loadingg("", false);
      }
    }
  };

  return (
    <>
      <style>
        {`
          /* Modern Platforms Page Styles */
          .platforms-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .platforms-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .platforms-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .platforms-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .platforms-header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 1;
          }
          
          .platforms-title-group {
            display: flex;
            align-items: center;
          }
          
          .platforms-icon-circle {
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
          
          .platforms-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .platforms-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .platforms-add-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .platforms-add-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
            color: white;
          }
          
          .platforms-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
            padding: 1.5rem 2rem;
          }
          
          @media (max-width: 768px) {
            .platforms-container {
              font-size: 13px;
            }
            
            .platforms-main-title {
              font-size: 20px;
            }
            
            .platforms-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .platforms-header-content {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }
            
            .platforms-add-btn {
              align-self: center;
            }
            
            .platforms-content-card {
              padding: 1rem 1.5rem;
            }
          }
        `}
      </style>

      <div className="platforms-container">
        <div className="row">
          <div className="col-md-12">
            <div className="platforms-header-card">
              <div className="card-header">
                <div className="platforms-header-content">
                  <div className="platforms-title-group">
                    <div className="platforms-icon-circle">
                      <i className="fas fa-server"></i>
                    </div>
                    <h2 className="platforms-main-title">Quản lý nền tảng</h2>
                  </div>
                  {!isAllowedApiUrl && (
                    <button
                      className="btn platforms-add-btn"
                      onClick={() => {
                        // Ensure opening a fresh, empty form for adding
                        setSelectedPlatform(null);
                        setIsModalOpen(true);
                      }}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Thêm Nền tảng
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="platforms-content-card">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Thứ tự hiển thị</th>
                    <th>Hành động</th>
                    <th>Tên</th>
                    <th>Logo</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.length > 0 ? (
                    platforms.map((platform, index) =>
                      platform && platform._id ? (
                        <tr key={platform._id}>
                          <td>{platform.thutu}</td>
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
                                    className="dropdown-item text-primary"
                                    onClick={() => {
                                      if (platform && platform._id) {
                                        setSelectedPlatform(platform);
                                        setIsModalOpen(true);
                                      } else {
                                        //   console.error("Không thể sửa nền tảng: `_id` không tồn tại.");
                                      }
                                    }}
                                  >
                                    Sửa
                                  </button>
                                </li>
                                {!isAllowedApiUrl && (
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => {
                                        if (platform && platform._id) {
                                          handleDeletePlatform(platform._id);
                                        } else {
                                          //    console.error("Không thể xóa nền tảng: `_id` không tồn tại.");
                                        }
                                      }}
                                    >
                                      Xóa
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </td>
                          <td>{platform.name}</td>
                          <td>
                            <img
                              src={platform.logo}
                              alt={platform.name}
                              width={50}
                              height={50}
                              style={{ objectFit: "cover" }}
                            />
                          </td>
                        </tr>
                      ) : null
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Không có nền tảng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {isModalOpen && (
                <PlatformModal
                  key={selectedPlatform?._id || 'new'}
                  platform={selectedPlatform || undefined}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPlatform(null);
                  }}
                  onSave={(platformData) => {
                    if (selectedPlatform && selectedPlatform._id) {
                      handleUpdatePlatform(selectedPlatform._id, platformData);
                    } else {
                      handleAddPlatform(platformData);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}