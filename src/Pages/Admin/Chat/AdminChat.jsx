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
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-gradient rounded-circle p-3 shadow">
                            <i className="ti ti-messages fs-2 text-white"></i>
                        </div>
                        <div>
                            <h2 className="fw-bold mb-1">Quản lý Chat Hỗ Trợ</h2>
                            <p className="text-muted mb-0">Trò chuyện và hỗ trợ khách hàng</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4" style={{ minHeight: '85vh' }}>
                {/* Sidebar - Danh sách chat */}
                <div className="col-lg-4 col-md-5 col-12">
                    <div className="card shadow-sm border-0" style={{ height: '85vh' }}>
                        <div className="card-header bg-gradient-primary text-white border-0 py-3" style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold">
                                    <i className="ti ti-inbox me-2"></i>
                                    Tin nhắn ({chatList.length})
                                </h5>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select form-select-sm bg-white bg-opacity-25  border-0"
                                        value={limit}
                                        onChange={(e) => setLimit(Number(e.target.value))}
                                        style={{ width: '80px' }}
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <button
                                        onClick={loadChatList}
                                        className="btn btn-sm btn-light bg-white bg-opacity-25 border-0 text-white"
                                        title="Làm mới"
                                    >
                                        <i className="ti ti-refresh"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search và Filter */}
                        <div className="card-body p-2 d-flex flex-column">
                            <div className="mb-2">
                                <form className="mb-2" onSubmit={handleSearch}>
                                    <div className="input-group shadow-sm">
                                        <span className="input-group-text bg-light border-0">
                                            <i className="ti ti-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-0"
                                            placeholder="Tìm kiếm người dùng..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                className="btn btn-light border-0"
                                                onClick={() => { setSearchQuery(''); loadChatList(); }}
                                            >
                                                <i className="ti ti-x"></i>
                                            </button>
                                        )}
                                    </div>
                                </form>
                                <div className="btn-group w-100 shadow-sm" role="group">
                                    <button
                                        type="button"
                                        className={`btn ${!filterUnread ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setFilterUnread(false)}
                                    >
                                        <i className="ti ti-inbox me-1"></i>
                                        Tất cả
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${filterUnread ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setFilterUnread(true)}
                                    >
                                        <i className="ti ti-mail-opened me-1"></i>
                                        Chưa đọc
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-auto flex-grow-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                                {chatList.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <i className="ti ti-inbox-off display-1 mb-3 d-block"></i>
                                        <p className="mb-0">{searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có tin nhắn nào'}</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {chatList.map((chat) => (
                                            <button
                                                key={chat._id}
                                                className={`list-group-item list-group-item-action border-0 mb-1 rounded-3 py-2 ${selectedChat?._id === chat._id
                                                    ? 'bg-primary bg-opacity-10 border-start border-primary border-3'
                                                    : 'hover-shadow'
                                                    }`}
                                                onClick={() => handleSelectChat(chat)}
                                            >
                                                <div className="d-flex align-items-start gap-2">
                                                    <div className="position-relative">
                                                        <div className="avatar rounded-circle bg-primary bg-gradient text-white d-flex align-items-center justify-content-center"
                                                            style={{ width: '42px', height: '42px', minWidth: '42px' }}>
                                                            <strong className="fs-5">{chat.username.charAt(0).toUpperCase()}</strong>
                                                        </div>
                                                        {chat.unreadAdminCount > 0 && (
                                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                                {chat.unreadAdminCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow-1 text-start overflow-hidden">
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <strong className="text-truncate">{chat.username}</strong>
                                                                <span className={`badge ${chat.userInfo?.capbac === 'vip' ? 'bg-warning' :
                                                                    chat.userInfo?.capbac === 'distributor' ? 'bg-info' :
                                                                        'bg-secondary'
                                                                    } text-uppercase`} style={{ fontSize: '0.65rem' }}>
                                                                    {chat.userInfo?.capbac || 'member'}
                                                                </span>
                                                            </div>
                                                            <small className="text-muted text-nowrap ms-2">
                                                                {formatTimeShort(chat.lastMessageTime)}
                                                            </small>
                                                        </div>
                                                        <small className="text-muted text-truncate d-block">
                                                            {chat.lastMessage}
                                                        </small>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main - Chi tiết chat */}
                <div className="col-lg-8 col-md-7 col-12">
                    <div className="card shadow-sm border-0" style={{ height: '85vh' }}>
                        {!selectedChat ? (
                            <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">
                                <div className="mb-4">
                                    <i className="ti ti-messages display-1 text-primary opacity-25"></i>
                                </div>
                                <h4 className="fw-bold mb-2">Chào mừng bạn đến với Chat hỗ trợ</h4>
                                <p className="text-center">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column h-100">
                                <div className="card-header bg-white border-bottom py-3">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="avatar bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                                style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                                                <strong className="fs-4">{selectedChat.username.charAt(0).toUpperCase()}</strong>
                                            </div>
                                            <div>
                                                <h5 className="mb-1 fw-bold">{selectedChat.username}</h5>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className={`badge ${selectedChat.userInfo?.capbac === 'vip' ? 'bg-warning' :
                                                        selectedChat.userInfo?.capbac === 'distributor' ? 'bg-info' :
                                                            'bg-secondary'
                                                        } text-uppercase`}>
                                                        <i className="ti ti-crown me-1"></i>
                                                        {selectedChat.userInfo?.capbac || 'member'}
                                                    </span>
                                                    <span className="badge bg-success">
                                                        <i className="ti ti-circle-filled me-1" style={{ fontSize: '0.5rem' }}></i>
                                                        Online
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-danger shadow-sm"
                                            onClick={handleDeleteChat}
                                            title="Xóa toàn bộ chat"
                                        >
                                            <i className="ti ti-trash me-1"></i>
                                            Xóa chat
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body overflow-auto p-4 flex-grow-1" style={{
                                    background: 'linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%)',
                                    backgroundAttachment: 'fixed'
                                }}>
                                    {loading ? (
                                        <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                                <span className="visually-hidden">Đang tải...</span>
                                            </div>
                                            <p className="text-muted">Đang tải tin nhắn...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-muted py-5">
                                            <i className="ti ti-message-off display-1 mb-3 d-block opacity-25"></i>
                                            <p>Chưa có tin nhắn</p>
                                        </div>
                                    ) : (
                                        <>
                                            {hasMore && (
                                                <div className="text-center mb-4">
                                                    <button
                                                        className="btn btn-sm btn-light shadow-sm"
                                                        onClick={loadMoreMessages}
                                                        disabled={loadingMore}
                                                    >
                                                        {loadingMore ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                Đang tải...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="ti ti-arrow-up me-2"></i>
                                                                Xem thêm ({totalMessages - messages.length} tin)
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                            {messages.map((msg, index) => (
                                                <div
                                                    key={msg._id || index}
                                                    className={`d-flex mb-3 ${msg.senderRole === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}
                                                >
                                                    {msg.senderRole !== 'admin' && (
                                                        <div className="avatar bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm"
                                                            style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                            <i className="ti ti-user"></i>
                                                        </div>
                                                    )}
                                                    <div className={`p-3 rounded-3 shadow-sm position-relative ${msg.senderRole === 'admin'
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white'
                                                        }`} style={{
                                                            maxWidth: '70%',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span className="fw-bold small">
                                                                {msg.senderRole === 'admin' ? (
                                                                    <>
                                                                        <i className="ti ti-shield-check me-1"></i>
                                                                        Admin
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="ti ti-user me-1"></i>
                                                                        {msg.sender}
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2" style={{ fontSize: '0.95rem' }}>{msg.message}</div>
                                                        <div className={`small d-flex align-items-center gap-1 ${msg.senderRole === 'admin' ? 'text-white-50' : 'text-muted'
                                                            }`} style={{ fontSize: '0.7rem' }}>
                                                            <i className="ti ti-clock" style={{ fontSize: '0.8rem' }}></i>
                                                            {formatTime(msg.createdAt)}
                                                        </div>
                                                    </div>
                                                    {msg.senderRole === 'admin' && (
                                                        <div className="avatar bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center ms-2 shadow-sm"
                                                            style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                                                            <i className="ti ti-shield-check"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="card-footer bg-white border-top py-3">
                                    <form onSubmit={handleSendMessage}>
                                        <div className="input-group shadow-sm">
                                            <input
                                                type="text"
                                                className="form-control border-0 py-3"
                                                placeholder="Nhập tin nhắn của bạn..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                disabled={isSending}
                                                style={{ fontSize: '0.95rem' }}
                                            />
                                            <button
                                                className="btn btn-primary px-4 d-flex align-items-center gap-2"
                                                type="submit"
                                                disabled={isSending || !newMessage.trim()}
                                            >
                                                {isSending ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                        <span>Đang gửi...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="ti ti-send"></i>
                                                        <span>Gửi</span>
                                                    </>
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
