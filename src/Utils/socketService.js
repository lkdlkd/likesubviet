import { io } from 'socket.io-client';

let socket = null;

// Khởi tạo kết nối Socket.IO
export const initSocketConnection = (username) => {
  // Lấy URL backend từ env hoặc config
  const SOCKET_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      
      // Join room theo username để nhận notification riêng
      if (username) {
        socket.emit('join-user-room', username);
      }
    });

    socket.on('disconnect', () => {
    });

    socket.on('connect_error', (error) => {
    });
  }

  return socket;
};

// Lắng nghe event nạp tiền thành công cho user hiện tại
export const onDepositSuccess = (callback) => {
  if (!socket) {
    return;
  }
  
  // Remove old listener trước khi add new
  socket.off('deposit-success');
  socket.on('deposit-success', (data) => {
    callback(data);
  });
};

// Lắng nghe event mua đơn thành công cho user hiện tại
export const onOrderSuccess = (callback) => {
  if (!socket) {
    return;
  }
  
  // Remove old listener trước khi add new
  socket.off('order-success');
  socket.on('order-success', (data) => {
    callback(data);
  });
};

// Lắng nghe tin nhắn chat mới
export const onNewChatMessage = (callback) => {
  if (!socket) {
    return;
  }
  
  // Remove old listener trước khi add new
  socket.off('new-chat-message');
  socket.on('new-chat-message', (data) => {
    callback(data);
  });
};

// Lắng nghe tin nhắn chat mới cho admin
export const onAdminNewChatMessage = (callback) => {
  if (!socket) {
    return;
  }
  
  // Remove old listener trước khi add new
  socket.off('admin-new-chat-message');
  socket.on('admin-new-chat-message', (data) => {
    callback(data);
  });
};


// Ngắt kết nối socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Export socket instance để sử dụng trực tiếp nếu cần
export const getSocket = () => socket;
