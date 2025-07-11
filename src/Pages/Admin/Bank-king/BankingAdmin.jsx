'use client';
import { useState, useEffect } from "react";
import { getBanking, createBanking, updateBanking, deleteBanking } from "@/Utils/api";
import ModalBanking from "./ModalBanking";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";

export default function BankingAdmin() {
  const [bankList, setBankList] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token") || "";

  // Gọi API để lấy danh sách ngân hàng
  useEffect(() => {
    const fetchBanking = async () => {
      try {
        loadingg("Đang tải dữ liệu ngân hàng...");
        const banks = await getBanking(token);
        setBankList(banks);
      } catch (error) {
        toast.error("Vui lòng thêm ngân hàng!");
      } finally {
        setLoading(false);
        loadingg("", false); // Chỉ gọi loadingg một lần ở đây
      }
    };

    fetchBanking();
  }, [token]);

  const handleCreate = async (data) => {
    try {
      loadingg("Đang tạo ngân hàng...");
      const newBank = await createBanking(data, token);
      setBankList((prev) => [...prev, newBank]);
      toast.success("Ngân hàng mới được tạo thành công!");
      setShowModal(false);
    } catch (error) {
      toast.error("Lỗi khi tạo ngân hàng. Vui lòng thử lại!");
    } finally {
      loadingg("", false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      loadingg("Đang cập nhật ngân hàng...");
      const updatedBank = await updateBanking(id, data, token);
      setBankList((prev) =>
        prev.map((bank) => (bank._id === id ? updatedBank : bank))
      );
      toast.success("Ngân hàng đã được cập nhật thành công!");
      setShowModal(false);
    } catch (error) {
      toast.error("Lỗi khi cập nhật ngân hàng. Vui lòng thử lại!");
    } finally {
      loadingg("", false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Hành động này sẽ xóa ngân hàng vĩnh viễn!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        loadingg("Đang xóa ngân hàng...");
        await deleteBanking(id, token);
        setBankList((prev) => prev.filter((bank) => bank._id !== id));
        toast.success("Ngân hàng đã bị xóa thành công!");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa ngân hàng. Vui lòng thử lại!");
    } finally {
      loadingg("", false);
    }
  };

  const handleEditClick = (bank) => {
    setEditingBank(bank);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingBank(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingBank((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : name === "account_name"
          ? value
          : value.trim(),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBank?._id) {
      handleUpdate(editingBank._id, editingBank);
    } else {
      handleCreate(editingBank);
    }
  };

  return (
    <div className="container mt-5">
      {showModal && (
        <ModalBanking
          editing={!!editingBank}
          formData={{
            bank_name: editingBank?.bank_name || "",
            account_name: editingBank?.account_name || "",
            account_number: editingBank?.account_number || "",
            logo: editingBank?.logo || "",
            bank_account: editingBank?.bank_account || "",
            bank_password: editingBank?.bank_password || "",
            min_recharge: editingBank?.min_recharge || "",
            token: editingBank?.token || "",
            status: editingBank?.status || false,
          }}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          show={showModal}
          onHide={() => setShowModal(false)}
        />
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Danh sách ngân hàng</h4>
          <button className="btn btn-light btn-sm" onClick={handleAddClick}>
            Thêm ngân hàng
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <p className="text-center">Đang tải dữ liệu...</p>
          ) : bankList.length === 0 ? (
            <p className="text-center">Không có ngân hàng nào trong danh sách.</p>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-primary">
                  <tr>
                    <th>Thao tác</th>
                    <th>Ngân Hàng</th>
                    <th>Tên chủ tài khoản</th>
                    <th>Số tài khoản</th>
                    <th>Logo</th>
                    <th>Tài khoản ngân hàng</th>
                    <th>Số tiền nạp tối thiểu</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {bankList.map((bank) => (
                    <tr key={bank._id}>
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
                                className="dropdown-item text-primary "
                                onClick={() => handleEditClick(bank)}
                              >
                                Sửa
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(bank._id)}
                              >
                                Xóa
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td>{bank.bank_name}</td>
                      <td>{bank.account_name}</td>
                      <td>{bank.account_number}</td>
                      <td>
                        {bank.logo ? (
                          <img
                            src={bank.logo}
                            alt="Logo"
                            width={50}
                            height={50}
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <span>Không có logo</span>
                        )}
                      </td>
                      <td>{bank.bank_account}</td>
                      <td>{bank.min_recharge.toLocaleString("en-US")}</td>
                      <td>{bank.status ? "Hoạt động" : "Ngưng hoạt động"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}