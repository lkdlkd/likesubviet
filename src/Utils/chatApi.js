import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const getHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

// Lấy danh sách chat
export const getChatList = async (params = '') => {
    const response = await axios.get(`${API_URL}/api/chat/list${params}`, getHeaders());
    return response.data;
};

// Lấy chi tiết chat
export const getChatDetail = async (username, limit = 20, skip = 0) => {
    const response = await axios.get(`${API_URL}/api/chat/${username}?limit=${limit}&skip=${skip}`, getHeaders());
    return response.data;
};

// Gửi tin nhắn
export const sendChatMessage = async (username, message) => {
    const response = await axios.post(
        `${API_URL}/api/chat/send`,
        { username, message },
        getHeaders()
    );
    return response.data;
};

// Đánh dấu đã đọc
export const markChatAsRead = async (username) => {
    const response = await axios.put(
        `${API_URL}/api/chat/${username}/read`,
        {},
        getHeaders()
    );
    return response.data;
};

// Lấy số tin nhắn chưa đọc
export const getUnreadChatCount = async () => {
    const response = await axios.get(`${API_URL}/api/chat/unread/count`, getHeaders());
    return response.data;
};


// Xóa toàn bộ chat
export const deleteEntireChat = async (username) => {
    const response = await axios.delete(`${API_URL}/api/chat/${username}`, getHeaders());
    return response.data;
};
