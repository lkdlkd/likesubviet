'use client';
import { useState, useEffect } from "react";
import { getBanking, createBanking, updateBanking, deleteBanking } from "@/Utils/api";
import ModalBanking from "./ModalBanking";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";
import ConfigCard from "../ConfigCard/ConfigCard";
export default function BankingAdmin() {
  const [bankList, setBankList] = useState([]);
  const [editingBank, setEditingBank] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("banking");

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
        // toast.error("Vui lòng thêm ngân hàng!");
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
      {/* Nút chuyển đổi hiển thị ConfigCard */}
      <div className="col-md-12 mb-4">
        <div className="row">
          <div className="col-6 d-grid gap-2">
            <button
              className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "banking" ? "btn-primary" : "btn-outline-primary"
                }`}
              onClick={() => setActiveTab("banking")}
            >
              <i className="fa fa-history"></i> Cấu hình ngân hàng
            </button>
          </div>
          <div className="col-6 d-grid gap-2">
            <button
              className={`btn rounded-pill shadow-sm fw-bold ${activeTab === "configcard" ? "btn-primary" : "btn-outline-primary"
                }`}
              onClick={() => setActiveTab("configcard")}
            >
              <i className="fa fa-shopping-cart"></i> Cấu hình thẻ nạp
            </button>
          </div>

        </div>
      </div>
      {showModal && (
        <ModalBanking
          editing={!!editingBank}
          formData={{
            bank_name: editingBank?.bank_name || "",
            account_name: editingBank?.account_name || "",
            account_number: editingBank?.account_number || "",
            url_api: editingBank?.url_api || "",
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

      {activeTab === "banking" && (
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
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Thao tác</th>
                    <th>Ngân Hàng</th>
                    <th>Tên chủ tài khoản</th>
                    <th>Số tài khoản</th>
                    <th>URL API</th>
                    <th>Tài khoản ngân hàng</th>
                    <th>Số tiền nạp tối thiểu</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center">
                      <div>
                        <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(24 31.67)"><ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                        <p className="font-semibold" >Không có dữ liệu</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-primary">
                    <tr>
                      <th>Thao tác</th>
                      <th>Ngân Hàng</th>
                      <th>Tên chủ tài khoản</th>
                      <th>Số tài khoản</th>
                      <th>url_api</th>
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
                        <td>{bank.url_api || "không có"}</td>
                        <td>{bank.bank_account || "không có"}</td>
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
      )}
      {activeTab === "configcard" && (
        <ConfigCard />
      )}
    </div>
  );
}