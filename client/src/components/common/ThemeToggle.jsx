import { useTheme } from '../../context/ThemeContext';
import { MdLightMode, MdDarkMode, MdContrast } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme, isMonochrome, toggleMonochrome } = useTheme();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 1000
    }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMonochrome}
        className="glass-card"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isMonochrome ? 'var(--indigo-light)' : 'var(--text-primary)',
          fontSize: '1.4rem'
        }}
        title="Toggle Black & White"
      >
        <MdContrast />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="glass-card"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '1.4rem'
        }}
        title="Toggle Light/Dark"
      >
        {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
      </motion.button>
    </div>
  );
}
