import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(storedUser);
    setFormData({
      username: storedUser.username || '',
      email: storedUser.email || '',
      phone: storedUser.phone || ''
    });
  }, [navigate]);

  const handleSave = async () => {
    // 1. Optimistic Update (Update LocalStorage immediately for Demo)
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setMessage('✅ Profile updated successfully!');

    // 2. (Optional) Send to Backend
    // try {
    //    await axios.put(`http://localhost:3001/users/${user.user_id}`, formData);
    // } catch (err) { console.error("Backend update failed"); }

    setTimeout(() => setMessage(''), 3000);
  };

  if (!user) return null;

  const isSuperAdmin = user.role === 'admin';

  return (
    <div style={{background: '#F4F7F6', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', padding: '20px'}}>
      
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '30px'}}>
        <button 
            onClick={() => navigate('/admin')} 
            style={{background: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', marginRight: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontWeight: '600', color: '#64748b'}}
        >
            ← Back
        </button>
        <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px'}}>My Profile</h2>
      </div>

      {/* Profile Card */}
      <div style={{background: 'white', maxWidth: '500px', margin: '0 auto', borderRadius: '25px', padding: '40px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center'}}>
        
        {/* Avatar */}
        <div style={{
            width: '100px', 
            height: '100px', 
            background: isSuperAdmin ? '#0f172a' : '#1e293b', 
            color: 'white', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '40px', 
            fontWeight: 'bold',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
        }}>
            {user.username.charAt(0).toUpperCase()}
        </div>

        <h2 style={{margin: '0 0 5px', color: '#1e293b'}}>{user.username}</h2>
        <span style={{
            background: isSuperAdmin ? '#FFF7ED' : '#F0FDF4', 
            color: isSuperAdmin ? '#F59E0B' : '#00C853', 
            padding: '5px 15px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            textTransform: 'uppercase'
        }}>
            {isSuperAdmin ? '👑 Super Admin' : '🏟️ Facility Manager'}
        </span>

        {/* Form Fields */}
        <div style={{marginTop: '40px', textAlign: 'left'}}>
            
            <label style={labelStyle}>Username</label>
            <input 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                disabled={!isEditing}
                style={{...inputStyle, borderColor: isEditing ? '#00C853' : '#e2e8f0'}} 
            />

            <label style={labelStyle}>Email Address</label>
            <input 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
                style={{...inputStyle, borderColor: isEditing ? '#00C853' : '#e2e8f0'}} 
            />

            <label style={labelStyle}>Phone Number</label>
            <input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
                style={{...inputStyle, borderColor: isEditing ? '#00C853' : '#e2e8f0'}} 
            />

        </div>

        {/* Action Buttons */}
        <div style={{marginTop: '30px', display: 'flex', gap: '10px'}}>
            {isEditing ? (
                <>
                    <button onClick={handleSave} className="btn" style={{flex: 1, background: '#00C853', border: 'none', padding: '15px', borderRadius: '15px', color: 'white', fontWeight: 'bold', cursor: 'pointer'}}>Save Changes</button>
                    <button onClick={() => setIsEditing(false)} style={{flex: 1, background: '#f1f5f9', border: 'none', padding: '15px', borderRadius: '15px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer'}}>Cancel</button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)} className="btn" style={{flex: 1, background: '#1e293b', border: 'none', padding: '15px', borderRadius: '15px', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}>Edit Profile</button>
            )}
        </div>

        {/* Success Message */}
        {message && <p style={{marginTop: '20px', color: '#00C853', fontWeight: '600', fontSize: '14px', animation: 'fadeIn 0.3s'}}>{message}</p>}

        {/* Logout Section */}
        <div style={{marginTop: '40px', borderTop: '1px solid #f1f5f9', paddingTop: '30px'}}>
            <button 
                onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} 
                style={{background: '#FFF0F0', color: '#FF4444', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'}}
            >
                Log Out
            </button>
        </div>

      </div>
    </div>
  );
}

// --- Styles ---
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '13px', color: '#64748b', fontWeight: '600', marginLeft: '5px' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', marginBottom: '20px', transition: 'all 0.2s' };

export default AdminProfile;