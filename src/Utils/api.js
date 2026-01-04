// ...existing code...

// Get bank list from vietqr API
export async function getBankList() {
  const res = await fetch("https://api.vietqr.io/v2/banks");
  if (!res.ok) throw new Error("Failed to fetch bank list");
  return await res.json();
}
const API_BASE = `${process.env.REACT_APP_API_BASE}/api`;

// ==================== TOKEN MANAGEMENT ====================
let isRefreshing = false;
let refreshSubscribers = [];

// Thêm subscriber để đợi refresh token hoàn thành
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Thông báo cho tất cả subscribers khi có token mới
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Thông báo lỗi cho tất cả subscribers
const onRefreshError = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

// Lấy token từ localStorage
export const getStoredToken = () => localStorage.getItem("token");

// Lưu token vào localStorage
export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// Kiểm tra token có hết hạn không (với buffer 1 phút)
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp - 60000; // Hết hạn trước 1 phút
  } catch {
    return true;
  }
};

// Refresh access token
export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Gửi cookie
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });

    if (!response.ok) {
      throw new Error("Refresh token failed");
    }

    const data = await response.json();
    setStoredToken(data.token);
    return data.token;
  } catch (error) {
    // Xóa token và chuyển về trang login
    setStoredToken(null);
    throw error;
  }
};

// Wrapper cho fetch với auto refresh token
const fetchWithAuth = async (url, options = {}) => {
  let token = getStoredToken();
  
  // Kiểm tra và refresh token nếu cần
  if (token && isTokenExpired(token)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        token = await refreshAccessToken();
        onTokenRefreshed(token);
      } catch (error) {
        onRefreshError(error);
        isRefreshing = false;
        throw error;
      }
      isRefreshing = false;
    } else {
      // Đợi refresh token hoàn thành
      token = await new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken, error) => {
          if (error) reject(error);
          else resolve(newToken);
        });
      });
    }
  }

  // Thực hiện request với token mới
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Gửi cookie
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  });

  // Nếu nhận 401, thử refresh token một lần nữa
  if (response.status === 401 && token) {
    try {
      const newToken = await refreshAccessToken();
      setStoredToken(newToken);
      
      // Retry request với token mới
      return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch {
      // Refresh thất bại, redirect to login
      window.location.href = "/dang-nhap";
      throw new Error("Session expired");
    }
  }

  return response;
};

// ==================== END TOKEN MANAGEMENT ====================

export const Home = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/home`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Refund APIs
export const getRefunds = async (token, status, page = 1, limit = 20, search = "", searchType = "madon") => {
  const params = new URLSearchParams({
    status: status,
    page: page,
    limit: limit,
  });
  if (search) {
    if (searchType === "username") {
      params.append("username", search);
    } else {
      params.append("madon", search);
    }
  }

  const response = await fetchWithAuth(`${API_BASE}/refund?${params.toString()}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const adminApproveRefund = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/refund/approve`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export async function Dongbo(token) {
  const response = await fetchWithAuth(`${API_BASE}/admin/sync-services`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    cache: "no-store",
  });
  return handleResponse(response);
}

export const adminDeleteRefunds = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/refund`, {
    method: "DELETE",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Refill đơn hàng
export const refillOrder = async (madon, token) => {
  const response = await fetchWithAuth(`${API_BASE}/refill`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ madon }),
    cache: "no-store",
  });
  return handleResponse(response);
};
export const cancelOrder = async (madon, token) => {
  const response = await fetchWithAuth(`${API_BASE}/cancel`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ madon }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getScheduledOrders = async (
  token,
  { page = 1, limit = 10, status } = {}
) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (status) params.append("status", status);

  const queryString = params.toString();
  const response = await fetchWithAuth(
    `${API_BASE}/scheduled-orders${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      headers: withNoStore({}),
      cache: "no-store",
    }
  );
  return handleResponse(response);
};

export const rescheduleScheduledOrder = async (id, scheduleTime, token) => {
  const response = await fetchWithAuth(`${API_BASE}/scheduled-orders/${id}/reschedule`, {
    method: "PATCH",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ scheduleTime }),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const cancelScheduledOrder = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/scheduled-orders/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
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
    credentials: "include", // Nhận cookie từ server
    headers: withNoStore({
      "Content-Type": "application/json",
      "X-User-IP": userIP // Gửi IP thật của người dùng
    }),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Logout - gọi API để xóa refresh token
export const logout = async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include", // Gửi cookie
      headers: withNoStore({}),
    });
  } catch (e) {
    // Ignore error
  }
  setStoredToken(null);
  localStorage.removeItem("notiModalLastClosed");
  localStorage.clear();
  sessionStorage.clear();
};

// Logout tất cả thiết bị
export const logoutAll = async () => {
  const response = await fetchWithAuth(`${API_BASE}/auth/logout-all`, {
    method: "POST",
    headers: withNoStore({}),
  });
  setStoredToken(null);
  localStorage.clear();
  sessionStorage.clear();
  return handleResponse(response);
};

// Lấy reCAPTCHA site key
export const getRecaptchaSiteKey = async () => {
  const response = await fetch(`${API_BASE}/recaptcha-site-key`, {
    method: "GET",
    headers: withNoStore({}),
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
  const response = await fetchWithAuth(`${API_BASE}/banking`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updateBanking = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/banking/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteBanking = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/banking/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const createBanking = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/banking/create`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thẻ cào
export const rechargeCard = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/thecao/recharge`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getCard = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/thecao`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getCardHistory = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/thecao/history`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// User
export const getMe = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/user`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const changePassword = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/user/changePassword/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// 2FA (Two-Factor Authentication)
// Step 1: Setup - backend should return { otpauthUrl, qrImageDataUrl?, tempSecret }
export const setup2FA = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/2fa/setup`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Step 2: Verify - send the code user enters (and optionally the tempSecret if backend requires)
// Expected backend body fields example: { code }
export const verify2FA = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/2fa/verify`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Disable 2FA
export const disable2FA = async (data = {}, token) => {
  const response = await fetchWithAuth(`${API_BASE}/2fa/disable`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
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
  const response = await fetchWithAuth(`${API_BASE}/user/history${queryString}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Server
export const getServer = async (token, page, limit, search = "", filters = {}) => {
  // Xây dựng query string
  const params = new URLSearchParams();
  if (page && limit) {
    params.append("page", page);
    params.append("limit", limit);
  }
  if (search) params.append("search", search);

  // Thêm các bộ lọc
  if (filters.DomainSmm) params.append("DomainSmm", filters.DomainSmm);
  if (filters.category) params.append("category", filters.category);
  if (filters.isActive !== undefined && filters.isActive !== "") params.append("isActive", filters.isActive);
  if (filters.status !== undefined && filters.status !== "") params.append("status", filters.status);

  const response = await fetchWithAuth(`${API_BASE}/server?${params.toString()}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};
// Thêm mới máy chủ
export const createServer = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/server/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa máy chủ
export const deleteServer = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/server/delete/${id}`, {
    method: "DELETE",
    headers: {},
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật thông tin máy chủ
export const updateServer = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/server/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// SMM (Admin)
export const createSmmPartner = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/smm/create`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getAllSmmPartners = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/smm`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updatePartnerPrices = async (data, id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/smm/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const updateSmmPartner = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/smm/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteSmmPartner = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/smm/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Order
export const addOrder = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/order/add`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getOrders = async (token, page = 1, limit = 10, category = "", search = "", status = "", orderTay = "") => {
  // Xây dựng query string thủ công
  let queryString = `?page=${page}&limit=${limit}`;
  if (category) queryString += `&category=${encodeURIComponent(category)}`;
  if (search) queryString += `&search=${encodeURIComponent(search)}`;
  if (status) queryString += `&status=${encodeURIComponent(status)}`;
  if (orderTay) queryString += `&ordertay=${encodeURIComponent(orderTay)}`;

  const response = await fetchWithAuth(`${API_BASE}/order${queryString}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};

export const deleteOrder = async (orderId, token) => {
  const response = await fetchWithAuth(`${API_BASE}/order/delete/${orderId}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật trạng thái đơn hàng (admin)
export const updateOrderStatus = async (Madon, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/order/update/${Madon}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// User (Admin)
export const updateUser = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/user/update/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const addBalance = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/user/addbalance/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deductBalance = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/user/deductbalance/${id}`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const deleteUser = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/user/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

export const getUsers = async (token, page = 1, limit = 10, search = "") => {
  // Xây dựng query string thủ công
  let queryString = `?page=${page}&limit=${limit}`;
  if (search) queryString += `&username=${encodeURIComponent(search)}`;

  const response = await fetchWithAuth(`${API_BASE}/users${queryString}`, {
    method: "GET",
    headers: withNoStore({}),
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

  const response = await fetchWithAuth(`${API_BASE}/thongke?${queryParams.toString()}`, {
    method: "GET",
    headers: withNoStore({}),
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
  const response = await fetchWithAuth(`${API_BASE}/noti`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Thêm thông báo (Chỉ Admin)
export const addNotification = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/noti/add`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Sửa thông báo (Chỉ Admin)
export const editNotification = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/noti/edit/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Xóa thông báo (Chỉ Admin)
export const deleteNotification = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/noti/delete/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Lấy danh sách categories
export const getCategories = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/categories`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thêm mới category (chỉ admin)
export const addCategory = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/categories`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật category (chỉ admin)
export const updateCategory = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa category (chỉ admin)
export const deleteCategory = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Lấy danh sách platforms
export const getPlatforms = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/platforms`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Thêm mới platform (chỉ admin)
export const addPlatform = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/platforms`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật platform (chỉ admin)
export const updatePlatform = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/platforms/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa platform (chỉ admin)
export const deletePlatform = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/platforms/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};
export const getServerByTypeAndCategory = async (category = "", token) => {
  // Xây dựng query string
  let queryString = "";
  // if (type) queryString += `type=${encodeURIComponent(type)}&`;
  if (category) queryString += `path=${encodeURIComponent(category)}`;

  const response = await fetchWithAuth(`${API_BASE}/servers?${queryString}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};

export const getConfigWebLogo = async () => {
  const response = await fetch(`${API_BASE}/configweblogo`, {
    method: "GET",
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
}
export const getConfigWeb = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/configweb`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

export const updateConfigWeb = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/configweb`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

// Lấy cấu hình thẻ nạp
export const getConfigCard = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/config-card`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response); // Xử lý phản hồi từ API
};

// Cập nhật cấu hình thẻ nạp
export const updateConfigCard = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/config-card`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
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
  const response = await fetchWithAuth(`${API_BASE}/getservices/${id}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};
// Lấy danh sách chương trình khuyến mãi
export const getPromotions = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/promotions`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Tạo mới chương trình khuyến mãi
export const createPromotion = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/promotions`, {
    method: "POST",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật chương trình khuyến mãi
export const updatePromotion = async (id, data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/promotions/${id}`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Xóa chương trình khuyến mãi
export const deletePromotion = async (id, token) => {
  const response = await fetchWithAuth(`${API_BASE}/promotions/${id}`, {
    method: "DELETE",
    headers: withNoStore({}),
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

  const response = await fetchWithAuth(`${API_BASE}/transactions?${queryParams.toString()}`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });

  return handleResponse(response);
};

// Lấy cấu hình Telegram
export const getConfigTele = async (token) => {
  const response = await fetchWithAuth(`${API_BASE}/configtele`, {
    method: "GET",
    headers: withNoStore({}),
    cache: "no-store",
  });
  return handleResponse(response);
};

// Cập nhật cấu hình Telegram
export const updateConfigTele = async (data, token) => {
  const response = await fetchWithAuth(`${API_BASE}/configtele`, {
    method: "PUT",
    headers: withNoStore({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
    cache: "no-store",
  });
  return handleResponse(response);
};