import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  MdPerson, MdSettings, MdSecurity, MdNotifications, 
  MdEdit, MdPhotoCamera, MdLock, MdVisibility, 
  MdVisibilityOff, MdDevices, MdLocationOn, MdHistory
} from 'react-icons/md';

export default function UserProfilePage() {
  const { user, updateProfile, updatePassword, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) return toast.error('File size must be less than 1MB');
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, avatar: reader.result }));
        // Auto-save avatar
        updateProfile({ avatar: reader.result })
          .then(() => toast.success('Avatar updated!'))
          .catch(() => toast.error('Failed to update avatar'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        bio: profileForm.bio
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      toast.success('Setting updated');
    } catch (err) {
      toast.error('Failed to update setting');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Overview', icon: <MdPerson /> },
    { id: 'settings', label: 'Account Settings', icon: <MdSettings /> },
    { id: 'security', label: 'Security & Activity', icon: <MdSecurity /> }
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: '1200px' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Account <span className="gradient-text">Settings</span></h1>
          <p>Manage your personal information, security preferences, and settings.</p>
        </div>
      </div>

      <div className="flex-row gap-lg" style={{ flexWrap: 'wrap' }}>
        {/* Sidebar Tabs */}
        <div className="profile-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem', display: 'flex' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1" style={{ minWidth: '320px' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass-card-static p-xl"
              >
                <div className="text-center mb-lg">
                   <div className="avatar-upload-container mb-md">
                      <img 
                        src={profileForm.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1152D4&color=fff&size=128`} 
                        alt="Profile" 
                        className="avatar-large"
                      />
                      <div className="avatar-edit-badge" onClick={handleAvatarClick} title="Change Avatar">
                        <MdPhotoCamera size={18} />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{ display: 'none' }}
                      />
                   </div>
                   <h2 className="mb-sm">{user?.name}</h2>
                   <div className="badge badge-indigo">{user?.role}</div>

                   {/* Profile Completion */}
                   <div className="mx-auto mt-lg" style={{ maxWidth: '300px' }}>
                      <div className="flex-row justify-between" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Profile Completion</span>
                        <span>85%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-bar" style={{ width: '85%' }}></div>
                      </div>
                   </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="flex-col gap-md">
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        className="form-input" 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        className="form-input" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea 
                      className="form-textarea" 
                      rows="3"
                      value={profileForm.bio} 
                      onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                      placeholder="Tell us something about yourself..."
                    ></textarea>
                  </div>
                  <div className="flex-row justify-end" style={{ marginTop: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ paddingLeft: '32px', paddingRight: '32px' }} disabled={loading}>
                      {loading ? <span className="spinner" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex-col gap-lg"
              >
                <div className="glass-card-static p-xl">
                  <h3 className="mb-lg flex-row items-center gap-sm">
                    <MdLock style={{ color: 'var(--indigo)' }} /> Password & Security
                  </h3>
                  <form onSubmit={handleUpdatePassword} className="flex-col gap-md">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <div className="input-wrapper">
                        <MdLock className="input-icon" />
                        <input 
                          type={showCurrent ? "text" : "password"} 
                          className="form-input" 
                          placeholder="Enter current password"
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        />
                        <button type="button" className="input-action" onClick={() => setShowCurrent(!showCurrent)}>
                          {showCurrent ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">New Password</label>
                        <div className="input-wrapper">
                          <MdLock className="input-icon" />
                          <input 
                            type={showNew ? "text" : "password"} 
                            className="form-input" 
                            placeholder="Min. 8 characters"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          />
                          <button type="button" className="input-action" onClick={() => setShowNew(!showNew)}>
                            {showNew ? <MdVisibilityOff /> : <MdVisibility />}
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <div className="input-wrapper">
                          <MdLock className="input-icon" />
                          <input 
                            type="password" 
                            className="form-input" 
                            placeholder="Repeat new password"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-row justify-end" style={{ marginTop: '12px' }}>
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="glass-card-static p-xl">
                  <h3 className="mb-lg flex-row items-center gap-sm">
                    <MdNotifications style={{ color: 'var(--indigo)' }} /> Preferences
                  </h3>
                  <div className="flex-col gap-md">
                    <div className="toggle-container">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Email Notifications</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get alerts for schedule changes.</div>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={user?.notificationsEnabled} 
                          onChange={() => toggleSetting('notificationsEnabled', !user?.notificationsEnabled)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-container">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>2-Factor Authentication</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Added security for your account.</div>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={user?.twoFactorEnabled} 
                          onChange={() => toggleSetting('twoFactorEnabled', !user?.twoFactorEnabled)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-container">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dark Mode Experience</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optimized for low-light environments.</div>
                      </div>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={user?.prefersDarkMode} 
                          onChange={() => toggleSetting('prefersDarkMode', !user?.prefersDarkMode)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass-card-static p-xl"
              >
                <div className="flex-row justify-between items-center mb-lg">
                  <h3 className="flex-row items-center gap-sm">
                    <MdHistory style={{ color: 'var(--indigo)' }} /> Login History
                  </h3>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--rose)' }}>Logout All</button>
                </div>

                <div className="flex-col gap-sm">
                  {(user?.loginHistory?.length > 0 ? user.loginHistory : [
                    { id: 1, ip: '192.168.1.45', device: 'Chrome on Windows 11', location: 'London, UK', time: new Date() },
                    { id: 2, ip: '10.0.0.5', device: 'Safari on iPhone 15', location: 'San Francisco, US', time: new Date(Date.now() - 86400000) }
                  ]).map((activity, i) => (
                    <div key={activity._id || i} className="flex-row items-center justify-between p-md" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div className="flex-row items-center gap-md">
                        <div className="flex-row items-center justify-center" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(17, 82, 212, 0.1)', color: 'var(--indigo)' }}>
                          <MdDevices size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{activity.device}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                             {activity.location} • {activity.ip}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(activity.time).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-lg p-lg" style={{ background: 'rgba(17, 82, 212, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px dashed rgba(17, 82, 212, 0.2)' }}>
                   <div className="flex-row items-center gap-sm" style={{ color: 'var(--indigo)', fontWeight: 700, marginBottom: 8 }}>
                      <MdSecurity size={20} /> Security Tip
                   </div>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Enable 2-Factor Authentication to add an extra layer of security to your account and keep your data safe.
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
