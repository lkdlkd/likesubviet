import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Adddoitac from "@/Pages/Admin/Doi-tac/Adddoitac";
import { deleteSmmPartner, getAllSmmPartners, getBalanceFromSmm } from "@/Utils/api";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";

export default function Doitacpage() {
  const [smmPartners, setSmmPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token") || "";

  const fetchBalancesForPartners = async (partners) => {
    loadingg("Đang tải số dư đối tác...");
    const updatedPartners = await Promise.all(
      partners.map(async (partner) => {
        const balance = await getBalanceFromSmm(partner._id, token); // Sử dụng hàm mới
        const convertedBalance = balance.data.balance * (partner.tigia || 1); // Nhân balance với tigia (mặc định là 1 nếu không có)
        return { ...partner, balance: convertedBalance };
      })
    );
    setSmmPartners(updatedPartners);
    loadingg("", false);
  };

  useEffect(() => {
    const fetchSmmPartners = async () => {
      try {
        loadingg("Đang tải danh sách đối tác...");
        const partners = await getAllSmmPartners(token);
        setSmmPartners(partners);
        await fetchBalancesForPartners(partners);
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể tải danh sách đối tác. Vui lòng thử lại.", "error");
      } finally {
        loadingg("", false);
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
        loadingg("Đang xóa đối tác...");
        await deleteSmmPartner(id, token);
        setSmmPartners((prev) => prev.filter((partner) => partner._id !== id));
        Swal.fire("Đã xóa!", "Đối tác đã được xóa thành công.", "success");
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể xóa đối tác. Vui lòng thử lại.", "error");
      } finally {
        loadingg("", false);
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
    <div className="row">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 className="card-title">Danh Sách Đối Tác SMM</h2>
            <button
              className="btn btn-info"
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
                  <Table striped bordered hover>
                    <thead className="table-primary">
                      <tr>
                        <th>#</th>
                        <th>Thao tác</th>
                        <th>Tên</th>
                        <th>URL API</th>
                        <th>Số dư</th>
                        <th>Giá Cập Nhật</th>
                        <th>Tỉ Giá</th>
                        <th>Trạng Thái</th>
                        <th>Cập Nhật Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {smmPartners.map((partner, index) => (
                        <tr key={partner._id || index}>
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
                                      setIsAdding(false);
                                      setEditingPartner(partner);
                                    }}
                                  >
                                    Sửa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => {
                                      if (partner._id) {
                                        handleDelete(partner._id);
                                      } else {
                                   //     console.error("Không thể xóa đối tác: `_id` không tồn tại.");
                                      }
                                    }}
                                  >
                                    Xóa
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                          <td>{partner.name}</td>
                          <td>{partner.url_api}</td>
                          <td>{partner.balance !== undefined ? partner.balance : "Đang tải..."}</td>
                          <td>{partner.price_update}</td>
                          <td>{partner.tigia}</td>
                          <td>{partner.status === "on" ? "Bật" : "Tắt"}</td>
                          <td>{partner.update_price === "on" ? "Bật" : "Tắt"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}