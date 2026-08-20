import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

// 🚨 1. ENSURE THIS MATCHES YOUR OTHER FILES
const API_URL = "http://localhost:3001"; 

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // ✅ 2. HELPER TO FIX IMAGE ON ANDROID
  const getImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"; // Default Fallback
    
    // If it's already an absolute URL (like Google/Unsplash), use it
    if (url.startsWith('http') && !url.includes('localhost')) {
        return url;
    }
    
    // Fix localhost issue for Android
    if (url.includes('localhost')) {
        return url.replace('localhost', 'localhost');
    }
    
    // Fix relative path (e.g. "/uploads/pic.jpg")
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }
    
    return url;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="container">
      {/* --- New Profile Header --- */}
      <div className="profile-header">
        <img 
            src={getImageUrl(user?.profile_picture)} 
            alt="Profile" 
            className="profile-avatar"
            onError={(e) => {e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}}
        />
        <h2 className="profile-name">{user ? user.username : 'Guest User'}</h2>
        <p className="profile-email">{user ? user.email : 'guest@futsalapp.com'}</p>
        <div style={{marginTop: '10px', padding: '5px 15px', background: '#E8F5E9', borderRadius: '20px', color: '#00C853', fontSize: '12px', fontWeight: 'bold'}}>
            Premium Member 🌟
        </div>
      </div>

      {/* --- Menu List --- */}
      <div className="profile-menu">
        
        {/* Account Details */}
        <div className="menu-item" onClick={() => navigate('/account')}>
            <div className="menu-icon-box">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <span className="menu-text">Account Details</span>
            <svg className="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        </div>

        {/* Bookings */}
        <div className="menu-item" onClick={() => navigate('/my-bookings')}>
            <div className="menu-icon-box">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <span className="menu-text">My Bookings</span>
            <svg className="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        </div>

        {/* Favorites */}
        <div className="menu-item" onClick={() => navigate('/favorites')}>
            <div className="menu-icon-box" style={{color: '#FF4757', background: '#FFF0F1'}}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <span className="menu-text">Favorite Venues</span>
            <svg className="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        </div>

        {/* Refunds */}
        <div className="menu-item" onClick={() => navigate('/refunds')}>
            <div className="menu-icon-box">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <span className="menu-text">Refunds & Payments</span>
            <svg className="arrow-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
        </div>

        <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f0'}}/>

        {/* Logout */}
        <div className="menu-item" onClick={handleLogout} style={{marginBottom: '50px'}}>
            <div className="menu-icon-box" style={{background: '#FFF0F0', color: '#FF4444'}}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <span className="menu-text" style={{color: '#FF4444'}}>Log Out</span>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

export default Profile;