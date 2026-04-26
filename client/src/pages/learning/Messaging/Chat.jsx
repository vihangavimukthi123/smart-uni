import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import './Chat.css';

const Chat = ({ peerId, requestId, peerName, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (peerId) {
            fetchMessages();
            markAsRead();

            const interval = setInterval(() => {
                fetchMessages(true);
                markAsRead();
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [peerId]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await api.get(`/messages/conversation/${peerId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await api.put(`/messages/${peerId}/read`);
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await api.post('/messages', {
                receiverId: peerId,
                content: newMessage,
                requestId: requestId
            });

            if (res.data.success) {
                setMessages([...messages, res.data.data]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="smart-chat-container">
            <div className="smart-chat-header">
                <div className="peer-info">
                    <div className="peer-avatar-sm">
                        {peerName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div>
                        <h3>{peerName || 'Peer'}</h3>
                        <span className="online-status">Active conversation</span>
                    </div>
                </div>
                <button className="close-chat" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="messages-area">
                {loading ? (
                    <div className="chat-loading">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-chat">
                        <span className="material-symbols-outlined">chat_bubble</span>
                        <p>No messages yet. Say hi!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender._id === user?._id || msg.sender === user?._id;
                        return (
                            <div key={msg._id || index} className={`message-row ${isMe ? 'me' : 'them'}`}>
                                <div className="message-bubble">
                                    <p>{msg.content}</p>
                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                    <span className="material-symbols-outlined">send</span>
                </button>
            </form>
        </div>
    );
};

export default Chat;
