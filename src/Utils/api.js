// ...existing code...

// Get bank list from vietqr API
export async function getBankList() {
  const res = await fetch("https://api.vietqr.io/v2/banks");
  if (!res.ok) throw new Error("Failed to fetch bank list");
  return await res.json();
}
const API_BASE = `${process.env.REACT_APP_API_BASE}/api`;
export const Home = async (token) => {
  const response = await fetch(`${API_BASE}/home`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Refund APIs
export const getRefunds = async (token, status) => {
  const response = await fetch(`${API_BASE}/refund?status=${status}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const adminApproveRefund = async (data, token) => {
  const response = await fetch(`${API_BASE}/refund/approve`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export async function Dongbo(token) {
  const response = await fetch(`${API_BASE}/admin/sync-services`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    cache: "no-store",
  });
  return handleResponse(response);
}

export const adminDeleteRefunds = async (data, token) => {
  const response = await fetch(`${API_BASE}/refund`, {
    method: "DELETE",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Refill đơn hàng
export const refillOrder = async (madon, token) => {
  const response = await fetch(`${API_BASE}/refill`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({ madon }),
    cache: "no-store",
  });
  return handleResponse(response);
};
export const cancelOrder = async (madon, token) => {
  const response = await fetch(`${API_BASE}/cancel`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({ madon }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Helper để thêm header Cache-Control
const withNoStore = (headers = {}) => ({
  ...headers,
  "Cache-Control": "no-store",
  'X-Client-Domain': window.location.host, // Gửi domain của frontend

});
// Helper để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "Có lỗi xảy ra";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
    } catch (e) {
      //  console.error("Error parsing API response:", e);
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

// Auth
export const login = async (data) => {
  // Lấy IP của người dùng (hỗ trợ cả IPv4 và IPv6)
  let userIP = "";
  try {
    // Thử lấy IPv6 trước
    const ipv6Response = await fetch("https://api64.ipify.org?format=json");
    const ipv6Data = await ipv6Response.json();
    userIP = ipv6Data.ip;
  } catch (error) {
    try {
      // Nếu IPv6 thất bại, thử IPv4
      const ipv4Response = await fetch("https://api.ipify.org?format=json");
      const ipv4Data = await ipv4Response.json();
      userIP = ipv4Data.ip;
    } catch (fallbackError) {
      userIP = "Unknown";
    }
  }

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      "X-User-IP": userIP // Gửi IP thật của người dùng
    }),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const register = async (data) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: withNoStore({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Banking
export const getBanking = async (token) => {
  const response = await fetch(`${API_BASE}/banking`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updateBanking = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/banking/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteBanking = async (id, token) => {
  const response = await fetch(`${API_BASE}/banking/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const createBanking = async (data, token) => {
  const response = await fetch(`${API_BASE}/banking/create`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thẻ cào
export const rechargeCard = async (data, token) => {
  const response = await fetch(`${API_BASE}/thecao/recharge`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getCard = async (token) => {
  const response = await fetch(`${API_BASE}/thecao`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getCardHistory = async (token) => {
  const response = await fetch(`${API_BASE}/thecao/history`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// User
export const getMe = async (token) => {
  const response = await fetch(`${API_BASE}/user`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const changePassword = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/user/changePassword/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// 2FA (Two-Factor Authentication)
// Step 1: Setup - backend should return { otpauthUrl, qrImageDataUrl?, tempSecret }
export const setup2FA = async (token) => {
  const response = await fetch(`${API_BASE}/2fa/setup`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Step 2: Verify - send the code user enters (and optionally the tempSecret if backend requires)
// Expected backend body fields example: { code }
export const verify2FA = async (data, token) => {
  const response = await fetch(`${API_BASE}/2fa/verify`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Disable 2FA
export const disable2FA = async (data = {}, token) => {
  const response = await fetch(`${API_BASE}/2fa/disable`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getUserHistory = async (token, page = 1, limit = 10, orderId, search, action) => {
  // Xây dựng query string thủ công
  let queryString = `?page=${page}&limit=${limit}`;
  if (search) queryString += `&search=${encodeURIComponent(search)}`;
  if (orderId) queryString += `&orderId=${encodeURIComponent(orderId)}`;
  if (action) queryString += `&action=${encodeURIComponent(action)}`; // Thêm action nếu có
  const response = await fetch(`${API_BASE}/user/history${queryString}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Server
export const getServer = async (token, page, limit, search = "") => {
  // Xây dựng query string
  let queryString = "";
  if (page && limit) {
    queryString = `page=${page}&limit=${limit}`;
  }
  if (search) queryString += `&search=${encodeURIComponent(search)}`;

  const response = await fetch(`${API_BASE}/server?${queryString}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};
// Thêm mới máy chủ
export const createServer = async (data, token) => {
  const response = await fetch(`${API_BASE}/server/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa máy chủ
export const deleteServer = async (id, token) => {
  const response = await fetch(`${API_BASE}/server/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật thông tin máy chủ
export const updateServer = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/server/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// SMM (Admin)
export const createSmmPartner = async (data, token) => {
  const response = await fetch(`${API_BASE}/smm/create`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getAllSmmPartners = async (token) => {
  const response = await fetch(`${API_BASE}/smm`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updatePartnerPrices = async (data, id, token) => {
  const response = await fetch(`${API_BASE}/smm/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updateSmmPartner = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/smm/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteSmmPartner = async (id, token) => {
  const response = await fetch(`${API_BASE}/smm/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Order
export const addOrder = async (data, token) => {
  const response = await fetch(`${API_BASE}/order/add`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getOrders = async (token, page = 1, limit = 10, category = "", search = "", status = "" , orderTay = "") => {
  // Xây dựng query string thủ công
  let queryString = `?page=${page}&limit=${limit}`;
  if (category) queryString += `&category=${encodeURIComponent(category)}`;
  if (search) queryString += `&search=${encodeURIComponent(search)}`;
  if (status) queryString += `&status=${encodeURIComponent(status)}`;
  if (orderTay) queryString += `&orderTay=${encodeURIComponent(orderTay)}`;

  const response = await fetch(`${API_BASE}/order${queryString}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};

export const deleteOrder = async (orderId, token) => {
  const response = await fetch(`${API_BASE}/order/delete/${orderId}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật trạng thái đơn hàng (admin)
export const updateOrderStatus = async (Madon, data, token) => {
  const response = await fetch(`${API_BASE}/order/update/${Madon}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// User (Admin)
export const updateUser = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/user/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const addBalance = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/user/addbalance/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deductBalance = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/user/deductbalance/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteUser = async (id, token) => {
  const response = await fetch(`${API_BASE}/user/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getUsers = async (token, page = 1, limit = 10, search = "") => {
  // Xây dựng query string thủ công
  let queryString = `?page=${page}&limit=${limit}`;
  if (search) queryString += `&username=${encodeURIComponent(search)}`;

  const response = await fetch(`${API_BASE}/users${queryString}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};
// Thống kê (Admin)
export const getStatistics = async (token, doanhthuRange = "today", customStart, customEnd) => {
  const queryParams = new URLSearchParams();
  if (doanhthuRange) queryParams.append("doanhthuRange", doanhthuRange);
  if (customStart) queryParams.append("customStart", customStart);
  if (customEnd) queryParams.append("customEnd", customEnd);

  const response = await fetch(`${API_BASE}/thongke?${queryParams.toString()}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};
export const getUid = async (data) => {
  const response = await fetch(`${API_BASE}/getUid`, {
    method: "POST", // Sử dụng phương thức POST
    headers: {
      "Content-Type": "application/json", // Đặt Content-Type là application/json
    },
    body: JSON.stringify(data), // Gửi dữ liệu trong body dưới dạng JSON
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};
// Notification (Thông báo)
export const getNotifications = async (token) => {
  const response = await fetch(`${API_BASE}/noti`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Thêm thông báo (Chỉ Admin)
export const addNotification = async (data, token) => {
  const response = await fetch(`${API_BASE}/noti/add`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Sửa thông báo (Chỉ Admin)
export const editNotification = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/noti/edit/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Xóa thông báo (Chỉ Admin)
export const deleteNotification = async (id, token) => {
  const response = await fetch(`${API_BASE}/noti/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({
      Authorization: `Bearer ${token}`,
    }),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Lấy danh sách categories
export const getCategories = async (token) => {
  const response = await fetch(`${API_BASE}/categories`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thêm mới category (chỉ admin)
export const addCategory = async (data, token) => {
  const response = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật category (chỉ admin)
export const updateCategory = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa category (chỉ admin)
export const deleteCategory = async (id, token) => {
  const response = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Lấy danh sách platforms
export const getPlatforms = async (token) => {
  const response = await fetch(`${API_BASE}/platforms`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thêm mới platform (chỉ admin)
export const addPlatform = async (data, token) => {
  const response = await fetch(`${API_BASE}/platforms`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật platform (chỉ admin)
export const updatePlatform = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/platforms/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa platform (chỉ admin)
export const deletePlatform = async (id, token) => {
  const response = await fetch(`${API_BASE}/platforms/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};
export const getServerByTypeAndCategory = async (category = "", token) => {
  // Xây dựng query string
  let queryString = "";
  // if (type) queryString += `type=${encodeURIComponent(type)}&`;
  if (category) queryString += `path=${encodeURIComponent(category)}`;

  const response = await fetch(`${API_BASE}/servers?${queryString}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};


export const getConfigWeb = async (token) => {
  const response = await fetch(`${API_BASE}/configweb`, {
    method: "GET",
    headers: withNoStore({
      Authorization: `Bearer ${token}`, // Token để xác thực
    }),
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

export const updateConfigWeb = async (data, token) => {
  const response = await fetch(`${API_BASE}/configweb`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json", // Đặt Content-Type là application/json
      Authorization: `Bearer ${token}`, // Token để xác thực
    }),
    body: JSON.stringify(data), // Gửi dữ liệu trong body dưới dạng JSON
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

// Lấy cấu hình thẻ nạp
export const getConfigCard = async (token) => {
  const response = await fetch(`${API_BASE}/config-card`, {
    method: "GET",
    headers: withNoStore({
      Authorization: `Bearer ${token}`, // Token để xác thực
    }),
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

// Cập nhật cấu hình thẻ nạp
export const updateConfigCard = async (data, token) => {
  const response = await fetch(`${API_BASE}/config-card`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json", // Đặt Content-Type là application/json
      Authorization: `Bearer ${token}`, // Token để xác thực
    }),
    body: JSON.stringify(data), // Gửi dữ liệu trong body dưới dạng JSON
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};
// // Lấy số dư từ SMM
// export const getBalanceFromSmm = async (id, token) => {
//   const response = await fetch(`${API_BASE}/getbalance/${id}`, {
//     method: "GET",
//     headers: withNoStore({ Authorization: `Bearer ${token}` }),
//     cache: "no-store",
//   });
//   return handleResponse(response);
// };

// Lấy danh sách dịch vụ từ SMM
export const getServicesFromSmm = async (id, token) => {
  const response = await fetch(`${API_BASE}/getservices/${id}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Lấy danh sách chương trình khuyến mãi
export const getPromotions = async (token) => {
  const response = await fetch(`${API_BASE}/promotions`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Tạo mới chương trình khuyến mãi
export const createPromotion = async (data, token) => {
  const response = await fetch(`${API_BASE}/promotions`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật chương trình khuyến mãi
export const updatePromotion = async (id, data, token) => {
  const response = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa chương trình khuyến mãi
export const deletePromotion = async (id, token) => {
  const response = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "DELETE",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });
  return handleResponse(response);
};
export const getTransactions = async (token, page = 1, limit = 10, username = "", transactionID = "") => {
  // Xây dựng query string
  const queryParams = new URLSearchParams({
    page,
    limit,
  });

  if (username) {
    queryParams.append("username", username);
  }

  if (transactionID) {
    queryParams.append("transactionID", transactionID);
  }

  const response = await fetch(`${API_BASE}/transactions?${queryParams.toString()}`, {
    method: "GET",
    headers: withNoStore({ Authorization: `Bearer ${token}` }),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Lấy cấu hình Telegram
export const getConfigTele = async (token) => {
  const response = await fetch(`${API_BASE}/configtele`, {
    method: "GET",
    headers: withNoStore({
      Authorization: `Bearer ${token}`,
    }),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật cấu hình Telegram
export const updateConfigTele = async (data, token) => {
  const response = await fetch(`${API_BASE}/configtele`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};