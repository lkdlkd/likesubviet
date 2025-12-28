import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatList, getChatDetail, sendChatMessage, markChatAsRead, deleteEntireChat } from '../../../Utils/chatApi';
import { onAdminNewChatMessage } from '../../../Utils/socketService';

const AdminChat = () => {
    const [chatList, setChatList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [filterUnread, setFilterUnread] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [limit, setLimit] = useState(20);
    const messagesEndRef = useRef(null);
    const prevSelectedChatRef = useRef(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalMessages, setTotalMessages] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Scroll khi loading hoàn thành
    useEffect(() => {
        if (!loading && messages.length > 0 && selectedChat) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [loading, selectedChat]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load danh sách chat
    const loadChatList = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filterUnread) params.append('unreadOnly', 'true');
            params.append('limit', limit);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const response = await getChatList(params.toString() ? `?${params.toString()}` : '');
            if (response.success) {
                setChatList(response.data);
            }
        } catch (error) {

        }
    }, [filterUnread, limit, searchQuery]);

    useEffect(() => {
        loadChatList();
    }, [filterUnread, limit]); // eslint-disable-line react-hooks/exhaustive-deps

    // Lắng nghe tin nhắn mới
    useEffect(() => {
        onAdminNewChatMessage((data) => {
            // Cập nhật messages nếu đang xem chat đó
            if (selectedChat && data.username === selectedChat.username) {
                setMessages(prev => [...prev, data]);
            }

            // Reload chat list
            loadChatList();
        });
    }, [selectedChat, loadChatList]);

    // Load chi tiết chat khi chọn
    const handleSelectChat = async (chat) => {
        // Nếu đang xem chat này rồi thì không cần load lại
        if (prevSelectedChatRef.current?.username === chat.username) {
            return;
        }

        prevSelectedChatRef.current = chat;
        setSelectedChat(chat);
        setLoading(true);
        try {
            const response = await getChatDetail(chat.username, 20, 0);
            if (response.success) {
                setMessages(response.data.messages || []);
                setHasMore(response.data.hasMore || false);
                setTotalMessages(response.data.totalMessages || 0);
                await markChatAsRead(chat.username);
                // Reload chat list để cập nhật unread count
                loadChatList();
            }
        } catch (error) {
            console.error('Error loading chat detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load thêm tin nhắn cũ
    const loadMoreMessages = async () => {
        if (loadingMore || !hasMore || !selectedChat) return;
        setLoadingMore(true);
        try {
            const response = await getChatDetail(selectedChat.username, 20, messages.length);
            if (response.success) {
                setMessages(prev => [...(response.data.messages || []), ...prev]);
                setHasMore(response.data.hasMore || false);
                setTotalMessages(response.data.totalMessages || 0);
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Gửi tin nhắn
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || isSending) return;

        setIsSending(true);
        try {
            const response = await sendChatMessage(selectedChat.username, newMessage.trim());
            if (response.success) {
                // Không cần thêm message ở đây vì socket listener sẽ tự động cập nhật
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
        } finally {
            setIsSending(false);
        }
    };

    // Xử lý search
    const handleSearch = (e) => {
        if (e) e.preventDefault();
        loadChatList();
    };


    // Xóa toàn bộ chat
    const handleDeleteChat = async () => {
        if (!window.confirm(`Bạn có chắc muốn xóa toàn bộ cuộc trò chuyện với ${selectedChat.username}?`)) return;

        try {
            const response = await deleteEntireChat(selectedChat.username);
            if (response.success) {
                setSelectedChat(null);
                setMessages([]);
                loadChatList();
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Không thể xóa chat. Vui lòng thử lại.');
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeShort = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container-fluid py-4">
            <div className="row mb-3">
                <div className="col-12">
                    <h2 className="fw-bold">💬 Quản lý Chat Hỗ Trợ</h2>
                </div>
            </div>

            <div className="row g-3" style={{ minHeight: '600px' }}>
                {/* Sidebar - Danh sách chat */}
                <div className="col-lg-4 col-md-5 col-12">
                    <div className="card shadow-sm" style={{ height: '600px' }}>
                        <div className="card-header bg-gradient bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Tin nhắn ({chatList.length})</h5>
                            <div className="d-flex gap-2">
                                <select
                                    className="form-select form-select-sm"
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    style={{ width: '70px' }}
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <button onClick={loadChatList} className="btn btn-sm btn-light" title="Làm mới">
                                    🔄
                                </button>
                            </div>
                        </div>

                        {/* Search và Filter */}
                        <div className="card-body p-3">
                            <div className="mb-3">
                                <form className="mb-2" onSubmit={handleSearch}>
                                    <div className="input-group input-group-sm">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm user..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-outline-primary" title="Tìm kiếm">
                                            🔍
                                        </button>
                                    </div>
                                </form>
                                <button
                                    className={`btn btn-sm w-100 ${filterUnread ? 'btn-success' : 'btn-outline-secondary'}`}
                                    onClick={() => setFilterUnread(!filterUnread)}
                                >
                                    {filterUnread ? '✅ Chưa đọc' : '📋 Tất cả'}
                                </button>
                            </div>
                            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: 'calc(100% - 160px)' }}>
                                {chatList.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có tin nhắn nào'}
                                    </div>
                                ) : (
                                    chatList.map((chat) => (
                                        <button
                                            key={chat._id}
                                            className={`list-group-item list-group-item-action ${selectedChat?._id === chat._id ? 'active' : ''}`}
                                            onClick={() => handleSelectChat(chat)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                                    <strong className="text-break">{chat.username}</strong>
                                                    <span className={`badge bg-${chat.userInfo?.capbac === 'vip' ? 'warning' : chat.userInfo?.capbac === 'distributor' ? 'info' : 'secondary'} text-uppercase`} style={{ fontSize: '0.7rem' }}>
                                                        {chat.userInfo?.capbac || 'member'}
                                                    </span>
                                                </div>
                                                {chat.unreadAdminCount > 0 && (
                                                    <span className="badge bg-danger rounded-pill">{chat.unreadAdminCount}</span>
                                                )}
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-truncate me-2" style={{ maxWidth: '70%' }}>
                                                    {chat.lastMessage}
                                                </small>
                                                <small className="text-muted text-nowrap">{formatTimeShort(chat.lastMessageTime)}</small>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                        </div>


                    </div>
                </div>

                {/* Main - Chi tiết chat */}
                <div className="col-lg-8 col-md-7 col-12">
                    <div className="card shadow-sm" style={{ height: '600px' }}>
                        {!selectedChat ? (
                            <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">
                                <div className="display-1 mb-3">💬</div>
                                <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column h-100">
                                <div className="card-header bg-light d-flex justify-content-between align-items-center flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                                            <strong>{selectedChat.username.charAt(0).toUpperCase()}</strong>
                                        </div>
                                        <div>
                                            <h5 className="mb-0">{selectedChat.username}</h5>
                                            {selectedChat.userInfo?.email && (
                                                <small className="text-muted">{selectedChat.userInfo.email}</small>
                                            )}
                                        </div>
                                        <span className={`badge bg-${selectedChat.userInfo?.capbac === 'vip' ? 'warning' : selectedChat.userInfo?.capbac === 'distributor' ? 'info' : 'secondary'} text-uppercase`}>
                                            {selectedChat.userInfo?.capbac || 'member'}
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={handleDeleteChat}
                                        title="Xóa toàn bộ chat"
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>

                                <div className="card-body overflow-auto p-3 flex-grow-1" style={{ background: '#f8f9fa' }}>
                                    {loading ? (
                                        <div className="d-flex justify-content-center align-items-center h-100">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Đang tải...</span>
                                            </div>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-muted py-5">Chưa có tin nhắn</div>
                                    ) : (
                                        <>
                                            {hasMore && (
                                                <button
                                                    className="btn btn-sm btn-outline-primary w-100 mb-3"
                                                    onClick={loadMoreMessages}
                                                    disabled={loadingMore}
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        `📜 Xem thêm (${totalMessages - messages.length} tin)`
                                                    )}
                                                </button>
                                            )}
                                            {messages.map((msg, index) => (
                                                <div
                                                    key={msg._id || index}
                                                    className={`d-flex mb-3 ${msg.senderRole === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
                                                >
                                                    <div className={`p-3 rounded shadow-sm ${msg.senderRole === 'admin' ? 'bg-primary text-white' : 'bg-white'}`} style={{ maxWidth: '75%' }}>
                                                        <div className="fw-bold small mb-1">
                                                            {msg.senderRole === 'admin' ? '🛡️ Admin' : '👤 ' + msg.sender}
                                                        </div>
                                                        <div className="mb-1">{msg.message}</div>
                                                        <div className={`small ${msg.senderRole === 'admin' ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                            {formatTime(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="card-footer bg-white border-top">
                                    <form onSubmit={handleSendMessage}>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Nhập tin nhắn..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                disabled={isSending}
                                            />
                                            <button
                                                className="btn btn-primary px-4"
                                                type="submit"
                                                disabled={isSending || !newMessage.trim()}
                                            >
                                                {isSending ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    'Gửi'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChat;
