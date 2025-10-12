"use client";

import React, { useState, useEffect } from "react";
import { getUsers, deleteUser } from "@/Utils/api";
import Swal from "sweetalert2";
import UserEdit from "@/Pages/Admin/Tai-khoan/UserEdit";
import AddBalanceForm from "@/Pages/Admin/Tai-khoan/AddBalanceForm";
import DeductBalanceForm from "@/Pages/Admin/Tai-khoan/DeductBalanceForm";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";

export default function TaikhoanPage() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Giá trị debounce
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [editingUser, setEditingUser] = useState(null);
  const [deductUser, setDeductUser] = useState(null);
  const [balanceUser, setBalanceUser] = useState(null);

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // Debounce logic: Cập nhật `debouncedSearchQuery` sau 3 giây
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedSearchQuery(searchQuery); // Cập nhật giá trị debounce sau 3 giây
  //   }, 3000);

  //   return () => {
  //     clearTimeout(handler); // Xóa timeout nếu `searchQuery` thay đổi trước khi hết 3 giây
  //   };
  // }, [searchQuery]);
  const fetchUsers = async () => {
    setLoading(true);
    loadingg("Đang tải...", true, 9999999);
    try {
      const userRes = await getUsers(token, page, limit, debouncedSearchQuery);
      setUsers(userRes.users || []);
      setTotalPages(userRes.totalPages || 1);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      loadingg("Đang tải...", false);
    }
  };
  // Gọi API để lấy danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, [token, page, limit, debouncedSearchQuery]);

  // Hàm cập nhật danh sách người dùng sau khi sửa
  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
    );
  };

  // Hàm xử lý tìm kiếm ngay lập tức khi ấn nút
  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedSearchQuery(searchQuery); // Cập nhật giá trị debounce ngay lập tức
    setPage(1); // Reset về trang đầu tiên
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Hàm xử lý thay đổi số lượng hiển thị (limit)
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
    setPage(1); // Reset về trang đầu tiên
  };

  // Hàm xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Hành động này sẽ xóa người dùng vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        loadingg("Đang xóa người dùng ", true, 9999999);
        try {
          await deleteUser(userId, token);
          Swal.fire("Đã xóa!", "Người dùng đã được xóa thành công.", "success");
          fetchUsers();
          setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa người dùng. Vui lòng thử lại.", "error");
        } finally {
          loadingg("Đang tải...", false);
        }
      }
    });
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (errorMessage) {
    return <div className="alert alert-danger">{errorMessage}</div>;
  }

  return (
    <>
      <style>
        {`
          /* Modern User Management Page Styles */
          .user-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .user-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .user-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .user-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .user-header-content {
            display: flex;
            align-items: center;
            position: relative;
            z-index: 1;
          }
          
          .user-icon-circle {
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
          
          .user-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .user-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .user-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
            padding: 1.5rem 2rem;
          }
          
          .user-search-form {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #e8ecef;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .user-search-input {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .user-search-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .user-search-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .user-search-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            color: white;
          }
          
          .user-limit-select {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 0.6rem;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .user-limit-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .user-action-dropdown .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .user-action-dropdown .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          
          .user-action-dropdown .dropdown-menu {
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border-radius: 8px;
            padding: 0.5rem 0;
          }
          
          .user-action-dropdown .dropdown-item {
            padding: 0.5rem 1rem;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .user-action-dropdown .dropdown-item:hover {
            background: #f8f9fa;
            transform: translateX(5px);
          }
          
          .user-balance {
            color: #28a745;
            font-weight: 600;
          }
          
          .user-total-deposit {
            color: #17a2b8;
            font-weight: 600;
          }
          
          .user-rank-badge {
            background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .user-pagination {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #e8ecef;
            border-radius: 12px;
            padding: 1rem 1.5rem;
            margin-top: 1.5rem;
          }
          
          .user-pagination .btn {
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .user-pagination .btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            color: white;
          }
          
          .user-pagination .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .user-pagination-info {
            font-weight: 600;
            color: #495057;
          }
          
          @media (max-width: 768px) {
            .user-container {
              font-size: 13px;
            }
            
            .user-main-title {
              font-size: 20px;
            }
            
            .user-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .user-content-card {
              padding: 1rem 1.5rem;
            }
            
            .user-search-form {
              padding: 1rem;
            }
            
            .user-pagination {
              padding: 1rem;
            }
          }
        `}
      </style>
      <div className="user-container">
        <div className="row">
          <div className="col-md-12">
            <div className="user-header-card card">
              <div className="card-header">
                <div className="user-header-content">
                  <div className="user-icon-circle">
                    <i className="fas fa-users"></i>
                  </div>
                  <h2 className="user-main-title">Quản lý người dùng</h2>
                </div>
              </div>
            </div>
            
            <div className="user-content-card">
            {/* Ô tìm kiếm */}
            <form onSubmit={handleSearch} className="user-search-form">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control user-search-input"
                    placeholder="Tìm kiếm theo username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn user-search-btn w-100">
                    <i className="fas fa-search"></i> Tìm kiếm
                  </button>
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select user-limit-select"
                    value={limit}
                    onChange={handleLimitChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </form>

            {/* Bảng danh sách người dùng */}
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Thao tác</th>
                    <th>Tài khoản</th>
                    <th>Số dư</th>
                    <th>Tổng nạp</th>
                    <th>Cấp bậc</th>
                    <th>Thời gian tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id}>
                      <td>{(page - 1) * limit + index + 1}</td>


                      <td>
                        <div className="user-action-dropdown dropdown">
                          <button
                            className="btn dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            Thao tác <i className="las la-angle-down ms-1"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item text-success"
                                onClick={() => setBalanceUser(user)}
                              >
                                <i className="fas fa-plus-circle me-2"></i>Cộng tiền
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => setDeductUser(user)}
                              >
                                <i className="fas fa-minus-circle me-2"></i>Trừ tiền
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-warning"
                                onClick={() => setEditingUser(user)}
                              >
                                <i className="fas fa-edit me-2"></i>Sửa
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <i className="fas fa-trash me-2"></i>Xóa
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                      <td>{user.username}</td>
                      <td>
                        <span className="user-balance">
                          {Math.floor(Number(user.balance) || 0).toLocaleString("en-US")} VNĐ
                        </span>
                      </td>
                      <td>
                        <span className="user-total-deposit">
                          {Math.floor(Number(user.tongnap) || 0).toLocaleString("en-US")} VNĐ
                        </span>
                      </td>
                      <td>
                        <span className="user-rank-badge">
                          {user.capbac}
                        </span>
                      </td>
                      {/* <td>
                      {user.role === "admin" ? (
                        <span className="badge bg-danger">Quản trị viên</span>
                      ) : (
                        <span className="badge bg-primary">Người dùng</span>
                      )}
                    </td>
                    <td>
                      {user.status === "active" ? (
                        <span className="badge bg-success">Hoạt động</span>
                      ) : (
                        <span className="badge bg-secondary">Không hoạt động</span>
                      )}
                    </td> */}
                      {/* <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => setEditingUser(user)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Xóa
                      </button>
                    </td> */}
                      <td>
                        {new Date(user.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Phân trang */}
            <div className="user-pagination d-flex justify-content-between align-items-center">
              <button
                className="btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <i className="fas fa-chevron-left me-2"></i>Trước
              </button>
              <span className="user-pagination-info">
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Tiếp<i className="fas fa-chevron-right ms-2"></i>
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Các modal chỉnh sửa */}
      {editingUser && (
        <UserEdit
          fetchUsers={fetchUsers}
          user={editingUser}
          token={token}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
      {deductUser && (
        <DeductBalanceForm
          fetchUsers={fetchUsers}
          token={token}
          user={deductUser}
          onClose={() => setDeductUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
      {balanceUser && (
        <AddBalanceForm
          fetchUsers={fetchUsers}
          token={token}
          user={balanceUser}
          onClose={() => setBalanceUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </>
  );
}