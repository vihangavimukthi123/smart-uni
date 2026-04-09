import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { MdSend, MdPerson, MdCheck, MdDoneAll } from 'react-icons/md';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState('admin'); // For standard user, it's just 'admin'. Admin swaps this to userId
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

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
    <div className="flex bg-surface" style={{ height: 'calc(100vh - 120px)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      
      {/* ── Admin Sidebar (WhatsApp Web Style) ── */}
      {isAdmin && (
        <div style={{ width: '320px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)' }}>
          <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Helpdesk Inbox</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <p style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No active conversations</p>
            ) : (
              conversations.map(c => (
                <div 
                  key={c.user._id} 
                  onClick={() => fetchChat(c.user._id)}
                  style={{ 
                    padding: 'var(--space-md)', 
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: activeChat === c.user._id ? 'var(--bg-glass)' : 'transparent',
                    borderLeft: activeChat === c.user._id ? '3px solid var(--indigo)' : '3px solid transparent'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold truncate">{c.user.name}</span>
                    <span className="text-xs text-muted">
                      {new Date(c.lastMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-muted truncate mt-1">
                    {c.lastMessage.sender === user?.id ? 'You: ' : ''}{c.lastMessage.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Chat Window ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
        
        {/* Chat Header */}
        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <MdPerson size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
              {!isAdmin ? 'System Admin (Support)' : conversations.find(c => c.user._id === activeChat)?.user.name || 'User'}
            </h3>
            <p className="text-xs text-emerald font-semibold">Online</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {loading ? (
            <p className="text-center text-muted">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <p>Say hello! Need help with your scheduling?</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMine = msg.sender._id === user?._id;
              return (
                <div key={msg._id || i} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ 
                    padding: '12px 18px', 
                    borderRadius: isMine ? '20px 20px 0 20px' : '20px 20px 20px 0',
                    background: isMine ? 'var(--indigo)' : 'var(--bg-glass)',
                    color: isMine ? '#fff' : 'var(--text-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    border: isMine ? 'none' : '1px solid var(--border)'
                  }}>
                    <p style={{ margin: 0, wordWrap: 'break-word', color: isMine ? '#fff' : 'var(--text-primary)' }}>
                      {msg.content}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: '4px', marginTop: '4px' }}>
                    <span className="text-xs text-muted">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {isMine && (msg.isRead ? <MdDoneAll className="text-indigo" size={14}/> : <MdCheck className="text-muted" size={14}/>)}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{ borderRadius: '24px', paddingLeft: '20px' }}
            />
            <button type="submit" disabled={!newMessage.trim()} className="btn btn-primary" style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, justifyContent: 'center' }}>
              <MdSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
