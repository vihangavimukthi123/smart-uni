import React, { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("momentum_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, []);

  // Poll for global system announcements
  useEffect(() => {
    const fetchGlobalNotifications = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE_URL}/api/notifications/public`);
        
        if (res.ok) {
          const payload = await res.json();
          const globalNotifs = payload.data || [];
          
          const readIds = JSON.parse(localStorage.getItem("momentum_read_global_notifications") || "[]");
          let newNotifs = [];

          globalNotifs.forEach(gn => {
            if (!readIds.includes(gn._id)) {
              newNotifs.push({
                id: "global-" + gn._id,
                serverId: gn._id,
                title: gn.title,
                message: gn.message,
                type: gn.type || "info",
                read: false,
                date: gn.createdAt,
              });
              readIds.push(gn._id); // Mark as processed
            }
          });

          if (newNotifs.length > 0) {
             localStorage.setItem("momentum_read_global_notifications", JSON.stringify(readIds));
             setNotifications(prev => [...newNotifs, ...prev]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch global notifications:", err);
      }
    };

    fetchGlobalNotifications();
    const interval = setInterval(fetchGlobalNotifications, 30000); // 30 sec sync
    return () => clearInterval(interval);
  }, []);

  // Save changes to local storage whenever notifications update
  useEffect(() => {
    try {
      localStorage.setItem("momentum_notifications", JSON.stringify(notifications));
    } catch (err) {
      console.error("Failed to save notifications:", err);
    }
  }, [notifications]);

  // Handle auto-generation of motivational notifications
  useEffect(() => {
    const lastMotivationStr = localStorage.getItem("last_motivation_date");
    const today = new Date().toDateString();

    if (lastMotivationStr !== today) {
      // It's a new day! Add a motivational trigger.
      const motivations = [
        "Keep up the great momentum! Have you added a task today?",
        "Don't break the chain! Complete a study session today.",
        "A clear workplan is half the battle won. Check your planner!",
        "Learning Journal is a great place to reflect. Jot down your thoughts!",
      ];
      const randomPrompt = motivations[Math.floor(Math.random() * motivations.length)];

      setTimeout(() => {
        addNotification("Daily Momentum", randomPrompt, "motivation");
        localStorage.setItem("last_motivation_date", today);
      }, 5000); // Wait 5 seconds after app load
    }
  }, []);

  const addNotification = (title, message, type = "info") => {
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title,
      message,
      type, // 'info', 'success', 'warning', 'motivation', etc.
      read: false,
      date: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
