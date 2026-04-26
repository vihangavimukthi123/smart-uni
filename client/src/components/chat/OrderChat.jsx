import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function OrderChat({ orderId, supplierEmail, studentEmail }) {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000); // Polling every 5 seconds for updates
    return () => clearInterval(interval);
  }, [orderId, supplierEmail]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  async function fetchChat() {
    try {
      const res = await api.get(`/rental/orders/chat/order/${orderId}`);
      // Find the specific chat for this supplier
      const targetChat = res.data.find(c => c.supplierEmail === supplierEmail);
      if (targetChat) {
        setChat(targetChat);
      }
    } catch (err) {
      console.error("Fetch chat error", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    setSending(true);
    try {
      const res = await api.post("/rental/orders/chat/send-message", {
        chatId: chat._id,
        message: message.trim()
      });
      setChat(res.data.chat);
      setMessage("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading && !chat) return <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>Loading chat...</div>;

  if (!chat) return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#F9FAFB", borderRadius: "12px", border: "1px dashed #D1D5DB" }}>
      <p style={{ color: "#6B7280", margin: 0 }}>Initializing chat...</p>
    </div>
  );

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "500px", 
      backgroundColor: "#fff", 
      borderRadius: "16px", 
      border: "1px solid #E5E7EB",
      overflow: "hidden",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    }}>
      {/* Header */}
      <div style={{ 
        padding: "16px 20px", 
        borderBottom: "1px solid #F3F4F6", 
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{ 
          width: "36px", 
          height: "36px", 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "700"
        }}>
          {user.role === 'student' ? 'S' : 'C'}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
            {user.role === 'student' ? `Chat with Supplier` : `Chat with Student`}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }}></span>
            Active Order Support
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          overflowY: "auto", 
          padding: "20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "12px",
          backgroundColor: "#F8FAFC"
        }}
      >
        {chat.messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: "13px", color: "#94A3B8", margin: 0 }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chat.messages.map((msg, idx) => {
            const isMe = msg.senderId === user.email;
            return (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start"
                }}
              >
                <div style={{ 
                  padding: "10px 14px", 
                  borderRadius: isMe ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                  backgroundColor: isMe ? "#1E40AF" : "#fff",
                  color: isMe ? "#fff" : "#1F2937",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: isMe ? "0 4px 6px -1px rgba(30, 64, 175, 0.2)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  border: isMe ? "none" : "1px solid #E2E8F0"
                }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px" }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSendMessage}
        style={{ 
          padding: "16px 20px", 
          borderTop: "1px solid #F3F4F6", 
          backgroundColor: "#fff",
          display: "flex",
          gap: "12px"
        }}
      >
        <input 
          type="text" 
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ 
            flex: 1, 
            padding: "10px 16px", 
            borderRadius: "12px", 
            border: "1px solid #E2E8F0", 
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#F9FAFB",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#1E40AF"}
          onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
        />
        <button 
          type="submit"
          disabled={sending || !message.trim()}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#1E40AF", 
            color: "#fff", 
            border: "none", 
            borderRadius: "12px", 
            fontWeight: "700", 
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: (sending || !message.trim()) ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
