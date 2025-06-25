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

  const fetchPlatforms = async () => {
    try {
      loadingg("Đang tải danh sách nền tảng...");
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
      loadingg("Đang thêm nền tảng...");
      const response = await addPlatform(platform, token);
      setPlatforms([...platforms, response.data]);
      Swal.fire({
        title: "Thành công",
        text: "Nền tảng đã được thêm thành công!",
        icon: "success",
        confirmButtonText: "Xác nhận",
      });
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
      loadingg("Đang cập nhật nền tảng...");
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
        loadingg("Đang xóa nền tảng...");
        await deletePlatform(platformId, token);
        Swal.fire("Đã xóa!", "Nền tảng đã được xóa.", "success");
        setPlatforms((prev) => prev.filter((platform) => platform._id !== platformId));
      } catch (error) {
        Swal.fire("Lỗi", "Không thể xóa nền tảng!", "error");
      } finally {
        loadingg("", false);
      }
    }
  };

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 className="card-title">Quản lý nền tảng</h2>
            <button className="btn btn-info mb-3" onClick={() => setIsModalOpen(true)}>
              Thêm Nền tảng
            </button>
          </div>
          <div className="card-body">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
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
                        <td>{index + 1}</td>
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
                    <td colSpan={3} className="text-center">
                      Không có nền tảng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {isModalOpen && (
              <PlatformModal
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
  );
}