import axios from 'axios';
import { getStoredToken, isTokenExpired, getSessionKey } from './api';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// ==================== SIGNATURE GENERATION ====================
// Tạo random nonce để chống replay attack
function generateNonce() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Tạo HMAC signature sử dụng Web Crypto API
async function createSignature(payload, sessionKey) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(sessionKey);
    const messageData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
// ==================== END SIGNATURE GENERATION ====================

// Tạo axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Gửi cookie
});

// Request interceptor - thêm token và signature vào mỗi request
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = getStoredToken();

        // Kiểm tra token hết hạn thì redirect đến login
        if (token && isTokenExpired(token)) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/dang-nhap';
            return Promise.reject(new Error('Session expired'));
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Thêm signature headers nếu có sessionKey
        const sessionKey = getSessionKey();
        if (sessionKey) {
            const timestamp = Date.now().toString();
            const nonce = generateNonce();

            const urlPath = config.url.replace('/api', '').split('?')[0];
            const method = config.method?.toUpperCase() || 'GET';

            const payload = `${timestamp}:${method}:${urlPath}:${nonce}`;
            const signature = await createSignature(payload, sessionKey);

            config.headers['X-Timestamp'] = timestamp;
            config.headers['X-Signature'] = signature;
            config.headers['X-Nonce'] = nonce;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý 401 error
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Nếu 401 thì logout
        if (error.response?.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/dang-nhap';
        }
        return Promise.reject(error);
    }
);

// Lấy danh sách chat
export const getChatList = async (params = '') => {
    const response = await axiosInstance.get(`/api/chat/list${params}`);
    return response.data;
};

// Lấy chi tiết chat
export const getChatDetail = async (username, limit = 20, skip = 0) => {
    const response = await axiosInstance.get(`/api/chat/${username}?limit=${limit}&skip=${skip}`);
    return response.data;
};

// Gửi tin nhắn
export const sendChatMessage = async (username, message) => {
    const response = await axiosInstance.post('/api/chat/send', { username, message });
    return response.data;
};

// Đánh dấu đã đọc
export const markChatAsRead = async (username) => {
    const response = await axiosInstance.put(`/api/chat/${username}/read`, {});
    return response.data;
};

// Lấy số tin nhắn chưa đọc
export const getUnreadChatCount = async () => {
    const response = await axiosInstance.get('/api/chat/unread/count');
    return response.data;
};


// Xóa toàn bộ chat
export const deleteEntireChat = async (username) => {
    const response = await axiosInstance.delete(`/api/chat/${username}`);
    return response.data;
};
