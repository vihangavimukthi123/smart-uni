import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdSend, MdPerson, MdCheck, MdDoneAll, MdChat } from 'react-icons/md';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState('admin'); // For standard user, it's just 'admin'. Admin swaps this to userId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const notificationSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));

  const isAdmin = user?.role === 'admin' || user?.role === 'scheduler';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminConversations();
    } else {
      fetchChat('admin');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!socket) return;
    const handleReceive = (msg) => {
      // If it belongs to the active chat
      if (
        (isAdmin && (msg.sender._id === activeChat || msg.receiver._id === activeChat)) ||
        (!isAdmin && msg.sender.role === 'admin') ||
        msg.sender._id === user?._id
      ) {
        setMessages((prev) => [...prev, msg].filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i));
        // Mark as read immediately if it's open
        if (msg.sender._id !== user?._id) {
          api.put(`/messages/${msg.sender._id}/read`).catch(()=>{});
        }
      }
      
      // Play sound if message is from someone else
      if (msg.sender._id !== user?._id) {
        notificationSound.current.play().catch(e => console.log("Sound play failed:", e));
      }

      if (isAdmin && msg.sender._id !== user?._id) {
        fetchAdminConversations(); // refresh sidebar ordering
      }
    };

    socket.on('receiveMessage', handleReceive);
    return () => socket.off('receiveMessage', handleReceive);
  }, [socket, activeChat, isAdmin, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAdminConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.data);
      if (data.data.length > 0 && activeChat === 'admin') {
        fetchChat(data.data[0].user._id);
      }
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchChat = async (userId) => {
    if (!userId || userId === 'admin' && isAdmin) return;
    try {
      setActiveChat(userId);
      const { data } = await api.get(`/messages/conversation/${userId}`);
      setMessages(data.data);
      setLoading(false);
      // Mark read
      api.put(`/messages/${userId}/read`).catch(()=>{});
    } catch (err) {
      toast.error('Failed to load chat');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setNewMessage('');
      await api.post('/messages', {
        receiverId: isAdmin ? activeChat : null, // Backend handles defaulting to admin
        content: newMessage
      });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex bg-surface" style={{ height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
      
      {/* ── Admin Sidebar (WhatsApp Web Style) ── */}
      {isAdmin && (
        <div style={{ width: '350px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)' }}>
          <div style={{ padding: 'var(--space-md)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Messages</h2>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MdChat size={18} className="text-secondary" />
            </div>
          </div>
          <div style={{ padding: '10px 15px' }}>
            <div className="input-wrapper">
              <input type="text" className="form-input" placeholder="Search or start new chat" style={{ borderRadius: '20px', padding: '8px 15px', fontSize: '0.8rem' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active conversations</p>
              </div>
            ) : (
              conversations.map(c => (
                <div 
                  key={c.user._id} 
                  onClick={() => fetchChat(c.user._id)}
                  style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: activeChat === c.user._id ? 'var(--bg-glass)' : 'transparent',
                    display: 'flex',
                    gap: '12px',
                    transition: 'var(--transition-fast)'
                  }}
                  className="hover-bg-glass"
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <MdPerson size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold truncate" style={{ fontSize: '0.95rem' }}>{c.user.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <p className="text-sm text-muted truncate mt-1" style={{ fontSize: '0.85rem' }}>
                      {c.lastMessage.sender === user?.id ? 'You: ' : ''}{c.lastMessage.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Chat Window ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', position: 'relative' }}>
        
        {/* Chat Background Pattern (Subtle Gradient/Overlay) */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', background: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />

        {/* Chat Header */}
        <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <MdPerson size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>
                {!isAdmin ? 'MATRIX CORP Support' : conversations.find(c => c.user._id === activeChat)?.user.name || 'Select a chat'}
              </h3>
              <p className="text-xs text-emerald" style={{ fontWeight: 500 }}>Online</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <span className="spinner indigo" />
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
              <h3>Welcome to MATRIX CORP Support</h3>
              <p>Type below to chat with the administrator about your requests or schedules.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender._id === user?._id;
              return (
                <div key={msg._id || i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '65%', position: 'relative' }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px',
                    background: isMine ? 'var(--indigo)' : 'var(--bg-elevated)',
                    color: isMine ? '#fff' : 'var(--text-primary)',
                    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                    border: isMine ? 'none' : '1px solid var(--border)',
                    position: 'relative'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4', wordWrap: 'break-word' }}>
                      {msg.content}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {isMine && (msg.isRead ? <MdDoneAll size={14} style={{ color: '#4fc3f7' }}/> : <MdCheck size={14} style={{ opacity: 0.7 }}/>)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', zIndex: 10 }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
               <input 
                type="text" 
                className="form-input" 
                placeholder="Type a message" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ borderRadius: '24px', padding: '12px 20px', background: 'var(--bg-surface)', border: 'none' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={!newMessage.trim()} 
              className="btn btn-primary" 
              style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, justifyContent: 'center', flexShrink: 0 }}
            >
              <MdSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
