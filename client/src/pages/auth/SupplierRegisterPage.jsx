import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPhone, MdBusiness } from 'react-icons/md';

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

export default function SupplierRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    semail: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.firstName) e.firstName = 'First name is required';
    if (!form.lastName) e.lastName = 'Last name is required';
    if (!form.semail || !/^\S+@\S+\.\S+$/.test(form.semail)) e.semail = 'Valid email required';
    if (!form.phone || form.phone.length < 10) e.phone = 'Valid phone number required';
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
      const response = await axios.post('/api/rental/suppliers/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.semail,
        phone: form.phone,
        password: form.password,
        role: 'supplier'
      });
      toast.success('Supplier account created! Please sign in. 🎉');
      navigate('/login');
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
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        top: '-10%', right: '-10%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
        bottom: '-5%', left: '-5%', pointerEvents: 'none' }} />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ maxWidth: 500 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'var(--grad-success)' }}>🏢</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>SmartCampus</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)' }}>Supplier Registration</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 14, marginBottom: 14 }}>
            {/* First Name */}
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-wrapper">
                <MdPerson className="input-icon" />
                <input className={`form-input${errors.firstName ? ' error' : ''}`} type="text"
                  placeholder="John" value={form.firstName} onChange={handleChange('firstName')} />
              </div>
              {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <div className="input-wrapper">
                <MdPerson className="input-icon" />
                <input className={`form-input${errors.lastName ? ' error' : ''}`} type="text"
                  placeholder="Doe" value={form.lastName} onChange={handleChange('lastName')} />
              </div>
              {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Business Email</label>
            <div className="input-wrapper">
              <MdEmail className="input-icon" />
              <input className={`form-input${errors.semail ? ' error' : ''}`} type="email"
                placeholder="vendor@company.com" value={form.semail} onChange={handleChange('semail')} />
            </div>
            {errors.semail && <span className="form-error">⚠ {errors.semail}</span>}
          </div>

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Contact Phone</label>
            <div className="input-wrapper">
              <MdPhone className="input-icon" />
              <input className={`form-input${errors.phone ? ' error' : ''}`} type="tel"
                placeholder="+1 234 567 890" value={form.phone} onChange={handleChange('phone')} />
            </div>
            {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <MdLock className="input-icon" />
              <input className={`form-input${errors.password ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'} placeholder="••••••••"
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
              <input className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'} placeholder="Repeat password"
                value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
            </div>
            {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-success w-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Creating Supplier Account...' : 'Register as Supplier'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--emerald)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
