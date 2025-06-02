'use client';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Adddoitac from "@/Pages/Admin/Doi-tac/Adddoitac";
import { deleteSmmPartner, getAllSmmPartners } from "@/Utils/api";

export default function Doitacpage() {
  const [smmPartners, setSmmPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token") || "";

  // Gọi API để lấy danh sách đối tác
  useEffect(() => {
    const fetchSmmPartners = async () => {
      try {
        const partners = await getAllSmmPartners(token);
        setSmmPartners(partners);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đối tác:", error);
        Swal.fire("Lỗi!", "Không thể tải danh sách đối tác. Vui lòng thử lại.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSmmPartners();
  }, [token]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Hành động này sẽ xóa đối tác vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteSmmPartner(id, token);
        setSmmPartners((prev) => prev.filter((partner) => partner._id !== id));
        Swal.fire("Đã xóa!", "Đối tác đã được xóa thành công.", "success");
      } catch (error) {
        console.error("Lỗi khi xóa đối tác:", error);
        Swal.fire("Lỗi!", "Không thể xóa đối tác. Vui lòng thử lại.", "error");
      }
    }
  };

  const handleUpdate = (updatedPartner) => {
    setSmmPartners((prev) =>
      prev.map((partner) => (partner._id === updatedPartner._id ? updatedPartner : partner))
    );
    setEditingPartner(null);
    setIsAdding(false);
  };

  const handleAdd = (newPartner) => {
    setSmmPartners((prev) => [newPartner, ...prev]);
    setIsAdding(false);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Danh Sách Đối Tác SMM</h4>
        <button
          className="btn btn-primary"
          onClick={() => {
            setIsAdding(true);
            setEditingPartner(null);
          }}
        >
          Thêm Đối Tác
        </button>
      </div>

      {(isAdding || editingPartner !== null) && (
        <Adddoitac
          token={token}
          onAdd={handleAdd}
          editingPartner={editingPartner}
          onUpdate={handleUpdate}
          onClose={() => {
            setIsAdding(false);
            setEditingPartner(null);
          }}
        />
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p className="text-center">Đang tải dữ liệu...</p>
          ) : smmPartners.length === 0 ? (
            <p className="text-center">Không có đối tác nào trong danh sách.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Hành Động</th>
                    <th>#</th>
                    <th>Tên</th>
                    <th>URL API</th>
                    <th>API Token</th>
                    <th>Giá Cập Nhật</th>
                    <th>Tỉ Giá</th>
                    <th>Trạng Thái</th>
                    <th>Cập Nhật Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {smmPartners.map((partner, index) => (
                    <tr key={partner._id || index}>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => {
                            setIsAdding(false);
                            setEditingPartner(partner);
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (partner._id) {
                              handleDelete(partner._id);
                            } else {
                              console.error("Không thể xóa đối tác: `_id` không tồn tại.");
                            }
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                      <td>{index + 1}</td>
                      <td>{partner.name}</td>
                      <td>{partner.url_api}</td>
                      <td
                        style={{
                          maxWidth: "250px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {partner.api_token}
                      </td>
                      <td>{partner.price_update}</td>
                      <td>{partner.tigia}</td>
                      <td>{partner.status === "on" ? "Bật" : "Tắt"}</td>
                      <td>{partner.update_price === "on" ? "Bật" : "Tắt"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}