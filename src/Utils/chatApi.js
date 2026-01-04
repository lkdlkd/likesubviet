import axios from 'axios';
import { getStoredToken, isTokenExpired, refreshAccessToken } from './api';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Tạo axios instance với interceptor cho auto refresh token
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Gửi cookie
});

// Request interceptor - thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    async (config) => {
        let token = getStoredToken();
        
        // Kiểm tra và refresh token nếu cần
        if (token && isTokenExpired(token)) {
            try {
                token = await refreshAccessToken();
            } catch {
                // Redirect to login if refresh fails
                window.location.href = '/dang-nhap';
                return Promise.reject(new Error('Session expired'));
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý 401 error
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const token = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosInstance(originalRequest);
            } catch {
                window.location.href = '/dang-nhap';
                return Promise.reject(error);
            }
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
