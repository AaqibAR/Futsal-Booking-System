import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if(!username || !email || !password || !contact) {
        alert("⚠️ Please fill in all fields."); return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("⚠️ Please enter a valid email address."); return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(contact)) {
        alert("⚠️ Phone number must be exactly 10 digits."); return false;
    }
    if (password.length < 4) {
        alert("⚠️ Password must be at least 4 characters long."); return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    try {
      await axios.post('http://localhost:3001/signup', { username, email, password, contact });
      alert("✅ Registration Successful! Please Login.");
      navigate('/login');
    } catch (error) {
      alert("❌ Registration failed.");
    }
  };

  return (
    <div className="login-page">
      <div style={{width: '100%', marginBottom: '20px'}}>
        <h2 style={{fontSize: '28px', fontWeight: '700', color: '#2D3436', marginBottom: '5px'}}>Create Account</h2>
        <p style={{color: '#B2BEC3', marginTop: 0}}>Join the community today</p>
      </div>
      
      <div style={{width: '100%'}}>
          <input className="login-input" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input className="login-input" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
          <input className="login-input" placeholder="Phone (10 digits)" maxLength={10} onChange={(e) => setContact(e.target.value)} />
          <input className="login-input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          
          <button className="btn" onClick={handleSignup} style={{marginTop: '20px'}}>Sign Up</button>
      </div>

      <p style={{marginTop: '30px', fontSize: '14px', color: '#636E72'}}>
        Already have an account? <span style={{color: '#00C853', fontWeight: '700', cursor: 'pointer'}} onClick={() => navigate('/login')}>Log In</span>
      </p>
    </div>
  );
}

export default Signup;