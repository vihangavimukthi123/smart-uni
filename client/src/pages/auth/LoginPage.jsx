import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdSchool, MdArrowForward } from 'react-icons/md';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.role === 'admin' || user.role === 'scheduler' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(17, 82, 212, 0.15) 0%, transparent 70%)',
        top: '-10%', left: '-10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        bottom: '-5%', right: '-5%', pointerEvents: 'none' }} />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon">SC</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>SmartCampus</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>Resource Optimization Platform</div>
          </div>
        </div>

        <h2 className="mb-sm" style={{ color: '#fff', fontWeight: 700 }}>Welcome Back</h2>
        <p className="mb-lg" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Please enter your details to sign in.</p>

        <form onSubmit={handleSubmit} className="flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" size={20} />
              <input
                type="email"
                className={`form-input${errors.email ? ' error' : ''}`}
                placeholder="name@campus.edu"
                value={form.email}
                onChange={handleChange('email')}
                autoFocus
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.span 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="form-error mt-xs"
                >
                  {errors.email}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-xs">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem' }} className="text-secondary font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <MdLock className="input-icon" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange('password')}
              />
              <button 
                type="button" 
                className="input-action" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.span 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="form-error mt-xs"
                >
                  {errors.password}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-sm mb-md">
            <input type="checkbox" id="remember" style={{ cursor: 'pointer' }} />
            <label htmlFor="remember" className="text-xs text-secondary cursor-pointer select-none">Remember for 30 days</label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : (
              <>
                Sign In <MdArrowForward />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--text-primary)' }}>
          New here? <Link to="/register" style={{ color: 'var(--indigo-light)', fontWeight: 700 }}>Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}

