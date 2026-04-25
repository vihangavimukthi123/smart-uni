import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => {
      setConnected(true);
      if (user) {
        socketRef.current.emit('join_user_room', user._id);
        if (user.role === 'admin' || user.role === 'scheduler') {
          socketRef.current.emit('join_admin');
        }
      }
    });

    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('scheduleUpdated', (data) => setLastEvent({ type: 'scheduleUpdated', data, ts: Date.now() }));
    socketRef.current.on('roomStatusChanged', (data) => setLastEvent({ type: 'roomStatusChanged', data, ts: Date.now() }));
    socketRef.current.on('newNotification', (data) => setLastEvent({ type: 'newNotification', data, ts: Date.now() }));

    return () => { socketRef.current?.disconnect(); };
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, lastEvent, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
