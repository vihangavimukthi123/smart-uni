import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { IoSend, IoClose, IoChatbubbleEllipses } from 'react-icons/io5';
import { useTheme } from '../../../context/ThemeContext';

export default function OrderChatModal({ orderId, supplierEmail, onClose }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { darkMode } = useTheme();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [orderId, supplierEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data.chatId === chat?._id) {
        setChat(prev => ({
          ...prev,
          messages: [...prev.messages, data.message]
        }));
      }
    };

    socket.on('order_chat_message', handleMessage);
    return () => socket.off('order_chat_message', handleMessage);
  }, [socket, chat?._id]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rental/orders/chat/order/${orderId}`);
      // Find the specific chat with this supplier if student, or the chat for this order if supplier
      let foundChat;
      if (user.role === 'supplier') {
        foundChat = res.data.find(c => c.supplierEmail === user.email);
      } else {
        foundChat = res.data.find(c => c.supplierEmail === supplierEmail);
      }

      if (foundChat) {
        setChat(foundChat);
      } else {
        // If not found and student, try to initialize it
        if (user.role === 'student') {
            await api.post('/rental/orders/chat/initialize', { orderId });
            const retryRes = await api.get(`/rental/orders/chat/order/${orderId}`);
            foundChat = retryRes.data.find(c => c.supplierEmail === supplierEmail);
            setChat(foundChat);
        }
      }
    } catch (err) {
      console.error("Fetch chat error", err);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    try {
      const msgText = message;
      setMessage('');
      const res = await api.post('/rental/orders/chat/send-message', {
        chatId: chat._id,
        message: msgText
      });
      
      // Update local state directly so it works even if socket is down
      if (res.data.success) {
        setChat(res.data.chat);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message";
      toast.error(errMsg);
    }
  };




  const textPrimary = darkMode ? '#f8fafc' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const modalBg = darkMode ? '#1e293b' : '#ffffff';
  const chatBg = darkMode ? '#0f172a' : '#f8fafc';
  const border = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ backgroundColor: modalBg, padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '30px', height: '30px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 15px' }}></div>
            <p style={{ color: textPrimary, fontWeight: '600' }}>Opening Logistics Channel...</p>
        </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: 'blur(4px)', zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: modalBg, borderRadius: "24px", width: "100%", maxWidth: "500px", height: "600px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: `1px solid ${border}` }}>
        
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: darkMode ? 'rgba(99, 102, 241, 0.1)' : '#f5f7ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <IoChatbubbleEllipses size={22} />
            </div>
            <div>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: textPrimary, margin: 0 }}>
                    {user.role === 'supplier' ? 'Customer Support' : 'Logistics Provider'}
                </h3>
                <p style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>Order: #{orderId.slice(-6)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: textSecondary, padding: '8px' }}><IoClose size={24} /></button>
        </div>

        {/* Messages area */}
        <div 
          ref={scrollRef}
          style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: chatBg }}
        >
          {chat?.messages?.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, textAlign: 'center' }}>
                <IoChatbubbleEllipses size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                <p style={{ color: textPrimary, fontSize: '14px', fontWeight: '600' }}>No messages yet.</p>
                <p style={{ color: textSecondary, fontSize: '12px' }}>Start a conversation regarding order logistics.</p>
            </div>
          ) : (
            chat?.messages?.map((msg, i) => {
              const isMine = msg.senderId === user._id || (msg.senderRole === user.role && (user.role === 'supplier' ? chat.supplierEmail === user.email : chat.studentEmail === user.email));
              // Note: the senderId check is safer if we have it, but for legacy compatibility we check role+email
              
              return (
                <div key={i} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                  <div style={{ 
                    padding: "12px 16px", 
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", 
                    backgroundColor: isMine ? "#2563eb" : (darkMode ? '#334155' : "#fff"), 
                    color: isMine ? "#ffffff" : textPrimary,
                    boxShadow: isMine ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                    border: isMine ? 'none' : `1px solid ${border}`
                  }}>
                    <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", fontWeight: '600', color: 'inherit' }}>{msg.message}</p>
                  </div>

                  <span style={{ fontSize: "10px", color: textSecondary, marginTop: "4px", display: "block", textAlign: isMine ? "right" : "left", fontWeight: '600' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} style={{ padding: "20px 24px", borderTop: `1px solid ${border}`, display: "flex", gap: "12px", background: modalBg }}>
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ 
                flex: 1, padding: "12px 20px", borderRadius: "100px", border: `1px solid ${border}`, 
                outline: "none", fontSize: "14px", background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                color: textPrimary, fontWeight: '500'
            }}
          />
          <button 
            type="submit" 
            disabled={!message.trim()}
            style={{ 
                width: "44px", height: "44px", borderRadius: "50%", background: "#6366f1", border: "none", 
                color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: 'all 0.2s', opacity: message.trim() ? 1 : 0.5
            }}
          >
            <IoSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
