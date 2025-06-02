'use client';

import { useState, useEffect } from "react";
import { addPlatform, updatePlatform, deletePlatform, getPlatforms } from "@/Utils/api";
import Swal from "sweetalert2";
import PlatformModal from "./PlatformModal";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const token = localStorage.getItem("token") || "";

  const fetchPlatforms = async () => {
    try {
      const response = await getPlatforms(token);
      // Lọc bỏ các phần tử không hợp lệ
      const validPlatforms = response.platforms?.filter((p) => p && p._id) || [];
      setPlatforms(validPlatforms);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nền tảng:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể lấy danh sách nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleAddPlatform = async (platform) => {
    try {
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
      console.error("Lỗi khi thêm nền tảng:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể thêm nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    }
  };

  const handleUpdatePlatform = async (platformId, platformData) => {
    if (!platformId) {
      console.error("Không thể cập nhật nền tảng: `_id` không tồn tại.");
      return;
    }

    try {
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
      console.error("Lỗi khi cập nhật nền tảng:", error);
      Swal.fire({
        title: "Lỗi",
        text: "Không thể cập nhật nền tảng.",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    }
  };

  const handleDeletePlatform = async (platformId) => {
    if (!platformId) {
      console.error("Không thể xóa nền tảng: `_id` không tồn tại.");
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
        await deletePlatform(platformId, token);
        Swal.fire("Đã xóa!", "Nền tảng đã được xóa.", "success");
        setPlatforms((prev) => prev.filter((platform) => platform._id !== platformId));
      } catch (error) {
        console.error("Lỗi khi xóa nền tảng:", error);
        Swal.fire("Lỗi", "Không thể xóa nền tảng!", "error");
      }
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">Quản lý Nền tảng</h1>
      <button className="btn btn-primary mb-3" onClick={() => setIsModalOpen(true)}>
        Thêm Nền tảng
      </button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Hành động</th>
            <th>Tên</th>
            <th>Logo</th>
          </tr>
        </thead>
        <tbody>
          {platforms.length > 0 ? (
            platforms.map((platform) =>
              platform && platform._id ? (
                <tr key={platform._id}>
                  <td>
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => {
                        if (platform && platform._id) {
                          setSelectedPlatform(platform); // Đảm bảo platform có _id
                          setIsModalOpen(true);
                        } else {
                          console.error("Không thể sửa nền tảng: `_id` không tồn tại.");
                        }
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (platform && platform._id) {
                          handleDeletePlatform(platform._id);
                        } else {
                          console.error("Không thể xóa nền tảng: `_id` không tồn tại.");
                        }
                      }}
                    >
                      Xóa
                    </button>
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
      </table>

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
  );
}