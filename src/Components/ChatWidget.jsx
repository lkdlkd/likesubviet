import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatDetail, sendChatMessage, markChatAsRead, getUnreadChatCount } from '../Utils/chatApi';
import { onNewChatMessage } from '../Utils/socketService';
import Modal from 'react-bootstrap/Modal';
import './ChatWidget.css';

const ChatWidget = ({ username, externalOpen, onExternalToggle }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sync with external control if provided
    useEffect(() => {
        if (externalOpen !== undefined) {
            setIsOpen(externalOpen);
        }
    }, [externalOpen]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [isSending, setIsSending] = useState(false);
    const prevMessageLengthRef = useRef(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalMessages, setTotalMessages] = useState(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Scroll xuống khi:
        // 1. Load lần đầu và có tin nhắn (prevMessageLength = 0)
        // 2. Có tin nhắn mới (length tăng)
        if (messages.length > 0 &&
            (prevMessageLengthRef.current === 0 || messages.length > prevMessageLengthRef.current)) {
            setTimeout(() => scrollToBottom(), 100);
        }
        prevMessageLengthRef.current = messages.length;
    }, [messages]);

    // Scroll xuống khi vừa load xong chat
    useEffect(() => {
        if (!loading && messages.length > 0 && isOpen) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [loading, isOpen]);

    // Lấy số tin nhắn chưa đọc
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await getUnreadChatCount();
            if (response.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    useEffect(() => {
        if (username) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // 30s check once
            return () => clearInterval(interval);
        }
    }, [username, fetchUnreadCount]);

    // Lắng nghe tin nhắn mới từ socket
    useEffect(() => {
        if (username) {
            onNewChatMessage((data) => {
                if (data.username === username) {
                    setMessages(prev => [...prev, data]);

                    // Nếu chat đang mở, đánh dấu đã đọc
                    if (isOpen && data.senderRole === 'admin') {
                        markChatAsRead(username).catch(console.error);
                        setUnreadCount(0);
                    } else if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            });
        }
    }, [username, isOpen]);

    // Load chat khi mở widget lần đầu
    useEffect(() => {
        if (isOpen && username) {
            loadChat();
        }
    }, [isOpen, username]);

    const loadChat = async () => {
        setLoading(true);
        try {
            const response = await getChatDetail(username, 20, 0);
            if (response.success) {
                setMessages(response.data.messages || []);
                setHasMore(response.data.hasMore || false);
                setTotalMessages(response.data.totalMessages || 0);
                // Đánh dấu đã đọc
                await markChatAsRead(username);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMessages = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const response = await getChatDetail(username, 20, messages.length);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await sendChatMessage(username, newMessage.trim());
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

    const toggleChat = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        // Notify parent if external control is used
        if (onExternalToggle) {
            onExternalToggle(newState);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Chat Button */}
            <div className="chat-widget">
                <button style={{
                    marginRight: "20px",
                    marginBottom: "50px"
                }} className="chat-widget-button btn btn-primary rounded-circle shadow-lg position-relative" onClick={toggleChat}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 13.75 2.51 15.38 3.39 16.79L2.21 20.79C2.07 21.24 2.23 21.73 2.6 22L2.72 22.08C3.09 22.28 3.55 22.26 3.89 22L7.89 20.61C9.3 21.49 10.93 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Modal */}
            <Modal
                show={isOpen}
                onHide={toggleChat}
                centered
                size="lg"
                backdrop="static"
                keyboard={true}
            >
                <Modal.Header
                    closeButton
                    closeVariant="white"
                    className="text-white border-0"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                    <Modal.Title className="fw-bold">💬 Hỗ trợ trực tuyến</Modal.Title>
                </Modal.Header>

                <Modal.Body
                    className="p-4"
                    style={{
                        height: '60vh',
                        overflowY: 'auto',
                        background: '#f8f9fa'
                    }}
                >
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                            <p className="mb-0 fs-5">👋 Xin chào! Tôi có thể giúp gì cho bạn?</p>
                        </div>
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
                                    className={`d-flex mb-3 ${msg.senderRole === 'admin' ? 'justify-content-start' : 'justify-content-end'}`}
                                    style={{ animation: 'messageSlide 0.3s ease-out' }}
                                >
                                    <div
                                        className={`p-3 rounded shadow-sm ${msg.senderRole === 'admin' ? 'bg-white' : 'text-white'}`}
                                        style={{
                                            maxWidth: '70%',
                                            background: msg.senderRole === 'admin' ? '#fff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        }}
                                    >
                                        <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{msg.message}</div>
                                        <div className={`small mt-1 ${msg.senderRole === 'admin' ? 'text-muted' : 'text-white-50'}`} style={{ fontSize: '12px' }}>
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </Modal.Body>

                <Modal.Footer className="bg-white border-top" style={{ padding: '1rem' }}>
                    <form className="w-100" onSubmit={handleSendMessage}>
                        <div className="input-group input-group-lg">
                            <input
                                type="text"
                                className="form-control border-0 shadow-sm"
                                placeholder="Nhập tin nhắn..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isSending}
                                style={{ fontSize: '15px' }}
                            />
                            <button
                                className="btn btn-primary px-4"
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                            >
                                {isSending ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ChatWidget;
