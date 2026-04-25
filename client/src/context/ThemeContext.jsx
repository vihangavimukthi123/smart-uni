import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [userTheme, setUserTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const location = useLocation();

  // Define routes that MUST be in dark mode
  const isRentalPage = 
    location.pathname.startsWith('/rental') || 
    location.pathname.startsWith('/supplier') || 
    location.pathname.startsWith('/admin/rental') ||
    location.pathname === '/register-supplier';

  // Effective theme is user preference
  const theme = userTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', userTheme);
  }, [theme, userTheme]);

  const toggleTheme = () => setUserTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: theme === 'dark',
      userTheme,
      isForced: false 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

