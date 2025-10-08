import React, { useState } from "react";
import Swal from "sweetalert2";
import { rechargeCard } from "@/Utils/api";
import { loadingg } from "@/JS/Loading"; // Giả sử bạn đã định nghĩa hàm loading trong file này
export default function Napthecao({ cardData = [], token }) {

  const [cardInfo, setCardInfo] = useState({
    card_type: "",
    card_value: "",
    card_seri: "",
    card_code: "",
  });
  const [loading, setLoading] = useState(false);

  // Tính toán danh sách telco và fees cao nhất
  const telcoOptions = Array.from(
    (cardData || [])
      .filter((card) => card.telco && card.fees !== undefined) // Lọc các đối tượng hợp lệ
      .reduce((map, card) => {
        if (!map.has(card.telco) || map.get(card.telco) < card.fees) {
          map.set(card.telco, card.fees);
        }
        return map;
      }, new Map())
  );

  // Lấy danh sách mệnh giá dựa trên loại thẻ đã chọn
  const valueOptions = (cardData || [])
    .filter((card) => card.telco === cardInfo.card_type)
    .map((card) => card.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim(); // Loại bỏ khoảng trắng ở đầu và cuối
    setCardInfo((prev) => ({ ...prev, [name]: trimmedValue }));
  };

  const handleRechargeCard = async (e) => {
    e.preventDefault();

    if (!cardInfo.card_seri || !cardInfo.card_code || !cardInfo.card_type || !cardInfo.card_value) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng nhập đầy đủ thông tin thẻ cào!",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
      return;
    }

    try {
      setLoading(true);
      loadingg("Vui lòng chờ..."); // Hiển thị thông báo đang tìm kiếm
      const response = await rechargeCard(cardInfo, token); // Gọi API rechargeCard
      loadingg("", false); // Ẩn thông báo sau khi gọi API xong

      Swal.fire({
        title: "Thành công",
        text: response.message || "Nạp thẻ thành công!",
        icon: "success",
        confirmButtonText: "Xác nhận",
      });

      // Reset form sau khi nạp thành công
      setCardInfo({
        card_type: "",
        card_value: "",
        card_seri: "",
        card_code: "",
      });
    } catch (error) {
      loadingg("", false); // Ẩn thông báo khi có lỗi
      Swal.fire({
        title: "Lỗi",
        text: error.message || "Có lỗi xảy ra. Vui lòng thử lại!",
        icon: "error",
        confirmButtonText: "Xác nhận",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cardData || cardData.length === 0) {
    return <p>Không có dữ liệu thẻ cào.</p>;
  }

  return (
    <>
      {/* Enhanced Napthecao Styles */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .card-enhanced {
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideInUp 0.5s ease both;
          position: relative;
          overflow: hidden;
        }
        .card-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #007bff, #28a745, #ffc107);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .card-enhanced:hover::before {
          opacity: 1;
        }
        .card-enhanced:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.12);
        }
        
        .card-header-enhanced {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px 16px 0 0;
          position: relative;
          overflow: hidden;
        }
        .card-header-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s infinite;
        }
        
        .card-title-enhanced {
          color: #495057;
          font-weight: 600;
          margin-bottom: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-title-enhanced::before {
          content: '💳';
          font-size: 1.2em;
          animation: pulse 2s infinite;
        }
        
        .form-group-enhanced {
          animation: slideInUp 0.4s ease both;
          margin-bottom: 24px;
        }
        .form-group-enhanced:nth-child(1) { animation-delay: 0s; }
        .form-group-enhanced:nth-child(2) { animation-delay: 0.1s; }
        .form-group-enhanced:nth-child(3) { animation-delay: 0.2s; }
        .form-group-enhanced:nth-child(4) { animation-delay: 0.3s; }
        .form-group-enhanced:nth-child(5) { animation-delay: 0.4s; }
        
        .form-label-enhanced {
          font-weight: 600;
          color: #495057;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .form-control-enhanced {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.12);
          transition: all 0.3s ease;
          padding: 12px 16px;
          font-size: 0.95rem;
        }
        .form-control-enhanced:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.15);
          transform: translateY(-1px);
        }
        .form-control-enhanced:hover {
          border-color: rgba(0,123,255,0.3);
        }
        
        .btn-enhanced {
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          padding: 14px 24px;
          font-size: 1rem;
        }
        .btn-enhanced::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-enhanced:hover::before {
          left: 100%;
        }
        .btn-enhanced:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.25);
        }
        .btn-enhanced:active {
          transform: translateY(0);
        }
        .btn-enhanced:disabled {
          opacity: 0.6;
          transform: none;
          cursor: not-allowed;
        }
        
        .btn-primary-enhanced {
          background: linear-gradient(135deg, #007bff, #0056b3);
          border: none;
          color: white;
        }
        .btn-primary-enhanced:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #003d82);
          color: white;
        }
        
        .discount-badge {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 8px;
          animation: pulse 2s infinite;
        }
        
        .telco-option {
          transition: all 0.25s ease;
          position: relative;
        }
        .telco-option:hover {
          background: linear-gradient(135deg, rgba(0,123,255,0.02), rgba(255,255,255,1));
        }
        
        // .value-option {
        //   transition: all 0.25s ease;
        //   color: #28a745;
        //   font-weight: 600;
        // }
        
        /* Form validation states */
        .form-control-enhanced.is-valid {
          border-color: #28a745;
          box-shadow: 0 0 0 0.2rem rgba(40,167,69,0.15);
        }
        .form-control-enhanced.is-invalid {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220,53,69,0.15);
        }
        
        /* Loading state */
        .loading-form {
          opacity: 0.7;
          pointer-events: none;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .form-group-enhanced {
            margin-bottom: 16px;
          }
          .form-control-enhanced {
            padding: 10px 12px;
            font-size: 0.9rem;
          }
          .btn-enhanced {
            padding: 12px 20px;
            font-size: 0.95rem;
          }
        }
      `}</style>
      
      <div className="col-md-12">
        <div className="card card-enhanced">
          <div className="card-header card-header-enhanced">
            <h5 className="card-title card-title-enhanced">Nạp thẻ cào</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleRechargeCard} className={loading ? 'loading-form' : ''}>
              <div className="row">
                {/* Loại thẻ */}
                <div className="col-md-3">
                  <div className="form-group form-group-enhanced">
                    <label className="form-label form-label-enhanced">
                      <i className="fas fa-mobile-alt text-primary"></i>
                      Loại thẻ
                    </label>
                    <select
                      name="card_type"
                      id="card_type"
                      className="form-control form-control-enhanced"
                      value={cardInfo.card_type}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Chọn loại thẻ</option>
                      {telcoOptions.map(([telco, fees], index) => (
                        <option key={index} value={telco} className="telco-option">
                          {telco}
                          <span className="discount-badge"> Chiết khấu {fees}%</span>
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mệnh giá */}
                <div className="col-md-3">
                  <div className="form-group form-group-enhanced">
                    <label className="form-label form-label-enhanced">
                      <i className="fas fa-coins text-warning"></i>
                      Mệnh giá
                    </label>
                    <select
                      name="card_value"
                      id="card_value"
                      className="form-control form-control-enhanced"
                      value={cardInfo.card_value}
                      onChange={handleInputChange}
                      disabled={loading || !cardInfo.card_type}
                    >
                      <option value="">Chọn mệnh giá</option>
                      {valueOptions.map((value, index) => (
                        <option key={index} value={value} className="value-option">
                          {value.toLocaleString("en-US")} đ - thực nhận {(value * (1 - telcoOptions.find(([telco]) => telco === cardInfo.card_type)[1] / 100)).toLocaleString("en-US")} đ
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seri */}
                <div className="col-md-3">
                  <div className="form-group form-group-enhanced">
                    <label className="form-label form-label-enhanced">
                      <i className="fas fa-barcode text-info"></i>
                      Seri
                    </label>
                    <input
                      type="text"
                      name="card_seri"
                      id="card_seri"
                      className="form-control form-control-enhanced"
                      placeholder="Nhập số seri"
                      value={cardInfo.card_seri}
                      onChange={handleInputChange}
                      onBlur={(e) => {
                        const trimmedValue = e.target.value.trim();
                        setCardInfo((prev) => ({ ...prev, card_seri: trimmedValue }));
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Mã thẻ */}
                <div className="col-md-3">
                  <div className="form-group form-group-enhanced">
                    <label className="form-label form-label-enhanced">
                      <i className="fas fa-key text-success"></i>
                      Mã thẻ
                    </label>
                    <input
                      type="text"
                      name="card_code"
                      id="card_code"
                      className="form-control form-control-enhanced"
                      placeholder="Nhập mã thẻ"
                      value={cardInfo.card_code}
                      onChange={handleInputChange}
                      onBlur={(e) => {
                        const trimmedValue = e.target.value.trim();
                        setCardInfo((prev) => ({ ...prev, card_code: trimmedValue }));
                      }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Nút nạp thẻ */}
                <div className="col-md-12">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-enhanced btn-primary-enhanced col-12" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card me-2"></i>
                        Nạp thẻ cào
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}