// SupplierProfilePage.jsx
import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import toast from "react-hot-toast";
import { 
  BiUser, BiMailSend, BiPhone, BiBriefcase, BiLockAlt, BiCamera, BiEditAlt, BiSave, BiStar, BiX, BiCheckShield, BiBadgeCheck, BiInfoCircle, BiShieldQuarter
} from "react-icons/bi";
import { useTheme } from "../../../context/ThemeContext";

export default function SupplierProfilePage() {
  const { darkMode } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    description: "",
    profileImage: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rental/suppliers/me");
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          description: data.description || "",
          profileImage: data.profileImage || ""
        });
      }
    } catch (error) {
      toast.error("Failed to load profile details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put("/rental/suppliers/update-profile", formData);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditMode(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const textPrimary = darkMode ? 'white' : '#0f172a';
  const textSecondary = '#64748b';
  const bgColor = darkMode ? '#0f172a' : 'white';
  const borderColor = darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  if (loading) {
    return (
      <div className="flex-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(37, 99, 235, 0.1)', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: textSecondary, fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Retrieving Identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper pb-20 anim-fadeIn">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.02em' }}>Supplier Identity</h1>
          <p style={{ color: textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your professional profile and security protocols</p>
        </div>
        
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)}
            style={{ 
              backgroundColor: '#2563eb', color: 'white', padding: '16px 32px', borderRadius: '16px', 
              fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.2)'; }}
          >
            <BiEditAlt size={20} /> 
            <span>EDIT IDENTITY</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => { setEditMode(false); fetchProfile(); }}
              style={{ backgroundColor: 'transparent', color: textSecondary, padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', border: `1px solid ${borderColor}`, transition: 'all 0.3s ease' }}
              disabled={saving}
            >
              CANCEL
            </button>
            <button 
              onClick={handleSave}
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', border: 'none', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}
              disabled={saving}
            >
              {saving ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <BiSave size={18} />}
              <span>SAVE CHANGES</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px' }}>
        {/* Profile Summary Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, 
            padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
            
            <div style={{ position: 'relative', marginBottom: '32px' }}>
              <div style={{ width: '140px', height: '140px', borderRadius: '40px', backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: `1px solid ${borderColor}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.profileImage || profile?.profileImage ? (
                  <img src={formData.profileImage || profile?.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '48px', fontWeight: '950', color: '#6366f1' }}>{profile?.firstName?.[0]}</span>
                )}
              </div>
              {editMode && (
                <label style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '44px', height: '44px', backgroundColor: '#6366f1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}>
                  <BiCamera size={20} />
                  <input type="text" style={{ display: 'none' }} name="profileImage" onChange={handleInputChange} />
                </label>
              )}
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '950', color: textPrimary, letterSpacing: '-0.02em', marginBottom: '4px' }}>{profile?.firstName} {profile?.lastName}</h2>
            <p style={{ fontSize: '11px', fontWeight: '800', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>{profile?.semail}</p>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: borderColor, borderRadius: '20px', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
              <div style={{ backgroundColor: bgColor, padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f59e0b' }}>
                  <BiStar size={18} />
                  <span style={{ fontSize: '18px', fontWeight: '950' }}>{profile?.rating || "5.0"}</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', opacity: '0.6' }}>Protocol Rating</span>
              </div>
              <div style={{ backgroundColor: bgColor, padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '950', color: textPrimary }}>{profile?.reviewsCount || 0}</span>
                <span style={{ fontSize: '9px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', opacity: '0.6' }}>System Reviews</span>
              </div>
            </div>

            {profile?.isVerified && (
              <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px 20px', borderRadius: '100px' }}>
                <BiCheckShield size={20} />
                <span style={{ fontSize: '10px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verified Asset Holder</span>
              </div>
            )}
          </div>
          
        </div>

        {/* Credentials Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Main Info */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(37, 99, 235, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <BiUser size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.01em' }}>Identity Parameters</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>First Name</label>
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} disabled={!editMode}
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Last Name</label>
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} disabled={!editMode}
                  style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Email (Locked)</label>
                <div style={{ position: 'relative' }}>
                  <BiMailSend style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, opacity: '0.5' }} size={20} />
                  <input 
                    type="email" value={profile?.semail} disabled
                    style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.02)', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textSecondary, fontSize: '14px', fontWeight: '700', cursor: 'not-allowed', opacity: '0.6' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Mobile Sync</label>
                <div style={{ position: 'relative' }}>
                  <BiPhone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} size={20} />
                  <input 
                    type="text" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!editMode}
                    style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '16px 20px 16px 52px', color: textPrimary, fontSize: '14px', fontWeight: '800', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Context */}
          <div style={{ 
            backgroundColor: bgColor, borderRadius: '32px', border: `1px solid ${borderColor}`, padding: '40px',
            boxShadow: darkMode ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(168, 85, 247, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                <BiBriefcase size={24} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: textPrimary, letterSpacing: '-0.01em' }}>Service Narrative</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '900', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '4px' }}>Organization Description</label>
              <textarea 
                name="description" value={formData.description} onChange={handleInputChange} disabled={!editMode} rows={4}
                placeholder="Describe your equipment logistics and rental specializations..."
                style={{ width: '100%', backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${borderColor}`, borderRadius: '20px', padding: '20px', color: textPrimary, fontSize: '14px', fontWeight: '600', lineHeight: '1.6', outline: 'none', resize: 'none' }}
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
