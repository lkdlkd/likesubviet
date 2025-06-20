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
    <div className="col-md-12">
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Nạp thẻ cào</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleRechargeCard}>
            <div className="row">
              {/* Loại thẻ */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Loại thẻ</label>
                  <select
                    name="card_type"
                    id="card_type"
                    className="form-control"
                    value={cardInfo.card_type}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="">Chọn loại thẻ</option>
                    {telcoOptions.map(([telco, fees], index) => (
                      <option key={index} value={telco}>
                        {telco} (Chiết khấu {fees}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mệnh giá */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Mệnh giá</label>
                  <select
                    name="card_value"
                    id="card_value"
                    className="form-control"
                    value={cardInfo.card_value}
                    onChange={handleInputChange}
                    disabled={loading || !cardInfo.card_type}
                  >
                    <option value="">Chọn mệnh giá</option>
                    {valueOptions.map((value, index) => (
                      <option key={index} value={value}>
                        {value.toLocaleString("en-US")} VNĐ
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seri */}
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Seri</label>
                  <input
                    type="text"
                    name="card_seri"
                    id="card_seri"
                    className="form-control"
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
                <div className="form-group">
                  <label className="form-label">Mã thẻ</label>
                  <input
                    type="text"
                    name="card_code"
                    id="card_code"
                    className="form-control"
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
                <button type="submit" className="btn btn-primary col-12" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Nạp thẻ cào"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}