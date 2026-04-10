import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => setUser(data.data.user))
        .catch(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, type = 'user') => {
    const endpoint = type === 'supplier' ? '/rental/suppliers/login' : '/auth/login';
    const { data } = await api.post(endpoint, { email, password });
    
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('role', data.data.user.role); // Helpful for persistent role checks
    
    setUser(data.data.user);
    return data.data.user;
  }, []);


  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const updatePassword = useCallback(async (payload) => {
    const { data } = await api.put('/auth/password', payload);
    return data.data;
  }, []);

  const updateSettings = useCallback(async (payload) => {
    const { data } = await api.put('/auth/settings', payload);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const isAdmin     = user?.role === 'admin';
  const isScheduler = user?.role === 'scheduler';
  const isStudent   = user?.role === 'student' || user?.role === 'user';
  const isSupplier  = user?.role === 'supplier';
  const isAdminOrScheduler = isAdmin || isScheduler;

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, register, logout, 
      updateProfile, updatePassword, updateSettings,
      isAdmin, isScheduler, isStudent, isSupplier, isAdminOrScheduler 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
