import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthClasses = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
const strengthColors = ['', 'var(--rose)', 'var(--amber)', '#3b82f6', 'var(--emerald)'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'At least 8 characters required';
    if (!/[A-Z]/.test(form.password)) e.password = 'Must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Must contain a number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(17, 82, 212, 0.15) 0%, transparent 70%)',
        top: '-10%', right: '-10%', pointerEvents: 'none' }} />
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
          <img src="/logo.png" alt="Logo" style={{ width: 38, height: 38, borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>MATRIX CORP</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>Create your account</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <MdPerson className="input-icon" />
              <input id="reg-name" className={`form-input${errors.name ? ' error' : ''}`} type="text"
                placeholder="Your full name" value={form.name} onChange={handleChange('name')} />
            </div>
            {errors.name && <span className="form-error">⚠ {errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input id="reg-email" className={`form-input${errors.email ? ' error' : ''}`} type="email"
                placeholder="you@campus.edu" value={form.email} onChange={handleChange('email')} />
            </div>
            {errors.email && <span className="form-error">⚠ {errors.email}</span>}
          </div>

          {/* Role */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Account Type</label>
            <select id="reg-role" className="form-select" value={form.role} onChange={handleChange('role')}>
              <option value="user">Student / User</option>
              <option value="scheduler">Scheduler</option>
            </select>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon" />
              <input id="reg-password" className={`form-input${errors.password ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, uppercase + number"
                value={form.password} onChange={handleChange('password')} />
              <button type="button" className="input-action" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {form.password && (
              <div className="password-strength">
                <div className={`strength-bar ${strengthClasses[strength]}`}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="strength-segment"
                      style={{ background: i <= strength ? strengthColors[strength] : undefined }} />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error">⚠ {errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon" />
              <input id="reg-confirm" className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
            </div>
            {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--indigo-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
