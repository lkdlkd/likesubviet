import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Adddoitac from "@/Pages/Admin/Doi-tac/Adddoitac";
import { deleteSmmPartner, getAllSmmPartners } from "@/Utils/api";
import Table from "react-bootstrap/Table";
import { loadingg } from "@/JS/Loading";

export default function Doitacpage() {
  const [smmPartners, setSmmPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAllowedApiUrl = !!process.env.REACT_APP_ALLOWED_API_URL;

  const token = localStorage.getItem("token") || "";

  // const fetchBalancesForPartners = async (partners) => {
  //   loadingg("Đang tải số dư đối tác...", true, 9999999);
  //   const updatedPartners = await Promise.all(
  //     partners.map(async (partner) => {
  //       const balance = await getBalanceFromSmm(partner._id, token); // Sử dụng hàm mới
  //       const convertedBalance = balance.data.balance * (partner.tigia || 1); // Nhân balance với tigia (mặc định là 1 nếu không có)
  //       return { ...partner, balance: convertedBalance };
  //     })
  //   );
  //   setSmmPartners(updatedPartners);
  //   loadingg("", false);
  // };
  const fetchSmmPartners = async () => {
    try {
      loadingg("Đang tải danh sách đối tác...", true, 9999999);
      setLoading(true);
      const partners = await getAllSmmPartners(token);
      setSmmPartners(partners);
      // await fetchBalancesForPartners(partners);
    } catch (error) {
      Swal.fire("Lỗi!", "Không thể tải danh sách đối tác. Vui lòng thử lại.", "error");
    } finally {
      loadingg("", false);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSmmPartners();
  }, [token]);
  const WEBCON = !isAllowedApiUrl || (isAllowedApiUrl && smmPartners?.length === 0);
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa đối tác?",
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:8px;font-weight: bold;font-size: 18px">Thao tác này sẽ:</p>
          <ul style="padding-left:18px; margin:0 0 8px">
            <li><b style="color:#dc3545">Đóng toàn bộ máy chủ</b> liên kết với đối tác này (Bảo trì).</li>
            <li><b style="color:#dc3545">Đơn hàng thuộc đối tác này sẽ không còn cập nhật trạng thái</b></li>
            <li>Hành động <b style="color:#dc3545">không thể hoàn tác</b>.</li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      allowOutsideClick: false,
      focusCancel: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Tôi hiểu, vẫn xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        loadingg("Đang xóa đối tác...", true, 9999999);
        await deleteSmmPartner(id, token);
        setSmmPartners((prev) => prev.filter((partner) => partner._id !== id));
        fetchSmmPartners(); // Tải lại danh sách đối tác sau khi xóa
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
    <>
      <style>
        {`
          /* Modern Partner Page Styles */
          .partner-container {
            font-size: 14px;
            color: #2c3e50;
          }
          
          .partner-header-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            margin-bottom: 1.5rem;
            overflow: hidden;
          }
          
          .partner-header-card .card-header {
            background: transparent;
            border: none;
            padding: 1.5rem 2rem;
            position: relative;
          }
          
          .partner-header-card .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            pointer-events: none;
          }
          
          .partner-header-content {
            display: flex;
            align-items: center;
            justify-content: between;
            position: relative;
            z-index: 1;
          }
          
          .partner-icon-circle {
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
          
          .partner-icon-circle i {
            font-size: 24px;
            color: white;
          }
          
          .partner-main-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            color: white;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .partner-add-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            margin-left: auto;
          }
          
          .partner-add-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
            color: white;
          }
          
          .partner-content-card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
            overflow: hidden;
            margin-bottom: 1.5rem;
          }
          
          .partner-content-card .card-body {
            padding: 1.5rem 2rem;
          }
          
          .partner-loading-state {
            text-align: center;
            padding: 3rem 2rem;
            color: #6c757d;
            font-size: 16px;
          }
          
          .partner-loading-state i {
            font-size: 48px;
            margin-bottom: 1rem;
            color: #667eea;
            display: block;
          }
          
          .partner-empty-state {
            text-align: center;
            padding: 3rem 2rem;
            color: #6c757d;
            font-size: 16px;
          }
          
          .partner-empty-state i {
            font-size: 48px;
            margin-bottom: 1rem;
            color: #adb5bd;
            display: block;
          }
          
          .partner-table-wrapper {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          }
          
          @media (max-width: 768px) {
            .partner-container {
              font-size: 13px;
            }
            
            .partner-main-title {
              font-size: 20px;
            }
            
            .partner-header-card .card-header {
              padding: 1rem 1.5rem;
            }
            
            .partner-content-card .card-body {
              padding: 1rem 1.5rem;
            }
            
            .partner-header-content {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }
            
            .partner-add-btn {
              margin-left: 0;
            }
          }
        `}
      </style>

      <div className="partner-container">
        <div className="row">
          <div className="col-md-12">
            <div className="card partner-header-card">
              <div className="card-header">
                <div className="partner-header-content">
                  <div className="partner-icon-circle">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h2 className="partner-main-title">Danh Sách Đối Tác SMM</h2>
                  {WEBCON && (
                    <button
                      className="btn partner-add-btn"
                      onClick={() => {
                        setIsAdding(true);
                        setEditingPartner(null);
                      }}
                      disabled={loading || !WEBCON}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Thêm Đối Tác
                    </button>
                  )}
                </div>
              </div>
            </div>
            {(isAdding || editingPartner !== null) && (
              <Adddoitac
                fetchSmmPartners={fetchSmmPartners}
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

            <div className="partner-content-card">
              <div className="card-body">
                {loading ? (
                  <tr className="d-flex flex-column align-items-center justify-content-center">
                    <td colSpan={12} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <div className="spinner-border text-primary mb-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span className="mt-2">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : smmPartners.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center">
                      <div>
                        <svg width="184" height="152" viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><g transform="translate(24 31.67)"><ellipse fillOpacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"></ellipse><path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"></path><path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"></path><path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"></path><path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z" fill="#DCE0E6"></path></g><path d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z" fill="#DCE0E6"></path><g transform="translate(149.65 15.383)" fill="#FFF"><ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815"></ellipse><path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"></path></g></g></svg>
                        <p className="font-semibold" >Không có dữ liệu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <div className="partner-table-wrapper">
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-primary">
                          <tr>
                            <th>#</th>
                            <th>Thao tác</th>
                            <th>Tên</th>
                            <th>URL API</th>
                            <th>Số dư</th>
                            <th>Số dư thấp nhất để cảnh báo</th>
                            <th>Phí hoàn</th>
                            <th>Giá cập nhật</th>
                            <th>Tỉ Giá</th>
                            <th>Tự động hoàn</th>
                            <th>Cập Nhật Giá</th>
                            <th>Trạng Thái</th>
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
                                    {!isAllowedApiUrl && (
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
                                    )}
                                  </ul>
                                </div>
                              </td>
                              <td>{partner.name}</td>
                              <td>{partner.url_api}</td>
                              {partner.balanceStatus !== "Ok" && partner.balance !== undefined && partner.balanceError !== null ? (
                                <td>{partner.balanceError}</td>
                              ) : (
                                <td>{Math.floor(Number(partner.balance)).toLocaleString("en-US") || "Đang tải..."}</td>
                              )}
                              <td>{Math.floor(Number(partner.minbalance)).toLocaleString("en-US") || "Đang tải..."}</td>
                              <td>{partner.phihoan}</td>
                              <td>
                                <ul>
                                  <li>
                                    <b>Giá Nhà Phân Phối</b> : {partner.price_updateDistributor}
                                  </li>
                                  <li>
                                    <b>Giá Đại Lý</b> : {partner.price_updateVip}
                                  </li>
                                  <li>
                                    <b>Giá Thành Viên</b> : {partner.price_update}
                                  </li>
                                </ul>
                              </td>
                              <td>{partner.tigia}</td>
                              <td>{partner.autohoan === "on" ? "Bật" : "Tắt"}</td>
                              <td>{partner.update_price === "on" ? "Bật" : "Tắt"}</td>
                              <td>{partner.status === "on" ? "Bật" : "Tắt"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}