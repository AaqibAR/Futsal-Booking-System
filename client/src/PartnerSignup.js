import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PartnerSignup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [file, setFile] = useState(null);
  
  // Modal States
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false); // ✅ NEW Success State
  
  const navigate = useNavigate();

  const handleSignup = async () => {
    if(!username || !email || !password || !contact || !file) {
        setError("Please fill all fields and upload a business document.");
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('phone', contact);
    formData.append('password', password);
    formData.append('role', 'partner');
    formData.append('document', file);

    try {
      await axios.post('http://localhost:3001/signup', formData);
      
      // ✅ SUCCESS: Show the Custom Modal instead of ugly alert
      setShowSuccess(true); 

    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || "Registration failed. Please check your inputs.";
      setError(serverMsg);
    }
  };

  const handleSuccessClose = () => {
      setShowSuccess(false);
      navigate('/login'); // Redirect only after they click "Okay"
  };

  return (
    <div className="login-page" style={{background: '#1e293b', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      
      <div style={{width: '100%', maxWidth: '350px', marginBottom: '30px', textAlign: 'center', color: 'white'}}>
        <div style={{fontSize: '40px', marginBottom: '10px'}}>🤝</div>
        <h2 style={{fontSize: '26px', margin: 0, fontWeight: '700', color: '#4ade80'}}>Become a Partner</h2>
        <p style={{opacity: 0.7, marginTop: '5px', fontSize: '14px'}}>List your court & manage bookings</p>
      </div>
      
      <div style={{width: '100%', maxWidth: '350px'}}>
          <input 
            className="login-input" 
            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px'}} 
            placeholder="Business Name (Username)" 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            className="login-input" 
            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px'}} 
            placeholder="Business Email" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            className="login-input" 
            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px'}} 
            placeholder="Contact Phone" 
            onChange={(e) => setContact(e.target.value)} 
          />

          <div style={{textAlign: 'left', margin: '15px 0'}}>
              <label style={{color: '#94a3b8', fontSize: '12px', marginLeft: '5px', display: 'block', marginBottom: '5px'}}>
                  Business Reg. Document (PDF/Image)
              </label>
              <input 
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                style={{color: 'white', fontSize: '13px', width: '100%'}}
              />
          </div>

          <input 
            className="login-input" 
            type="password"
            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '12px', borderRadius: '10px', width: '100%', marginBottom: '15px'}} 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button 
            className="btn" 
            onClick={handleSignup} 
            style={{background: '#4ade80', color: '#000', marginTop: '25px', border: 'none', width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer'}}
          >
            Register Facility
          </button>
          
          <button 
            onClick={() => navigate('/login')} 
            style={{width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px'}}
          >
            Cancel & Return to Login
          </button>
      </div>

      {/* --- ERROR MODAL (Red) --- */}
      {error && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease'}}>
            <div style={{background: '#1e293b', padding: '30px', borderRadius: '20px', width: '85%', maxWidth: '300px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid #334155'}}>
                <div style={{width: '60px', height: '60px', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    <span style={{fontSize: '24px'}}>⚠️</span>
                </div>
                <h3 style={{margin: '0 0 10px', color: 'white'}}>Error</h3>
                <p style={{fontSize: '14px', color: '#94a3b8', marginBottom: '20px', wordWrap: 'break-word'}}>{error}</p>
                <button onClick={() => setError('')} style={{width: '100%', padding: '12px', background: '#FF4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Okay</button>
            </div>
        </div>
      )}

      {/* --- ✅ SUCCESS MODAL (Green) --- */}
      {showSuccess && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease'}}>
            <div style={{background: '#1e293b', padding: '30px', borderRadius: '20px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid #334155'}}>
                
                {/* Green Check Icon */}
                <div style={{width: '60px', height: '60px', background: 'rgba(0, 200, 83, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    <span style={{fontSize: '28px'}}>🎉</span>
                </div>
                
                <h3 style={{margin: '0 0 10px', color: 'white'}}>Registration Successful!</h3>
                <p style={{fontSize: '14px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5'}}>
                    Your account has been created. Please wait for <b>Admin Approval</b> before logging in.
                </p>

                <button 
                    onClick={handleSuccessClose} 
                    style={{width: '100%', padding: '12px', background: '#00C853', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}
                >
                    Back to Login
                </button>
            </div>
        </div>
      )}

    </div>
  );
}

export default PartnerSignup;