import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  
  // Custom Modal States
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialProvider, setSocialProvider] = useState(''); 
  const [socialEmail, setSocialEmail] = useState('');

  // Error Modal State
  const [loginError, setLoginError] = useState(''); 

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();

  // ✅ FIXED NAVIGATION LOGIC
  const navigateBasedOnRole = (user) => {
    if (user.role === 'admin') {
        navigate('/admin');   // Super Admin -> God Mode Dashboard
    } else if (user.role === 'partner') {
        navigate('/partner'); // 👈 CHANGE THIS: Partners go to Partner Dashboard
    } else {
        navigate('/home');    // Players -> Home Page
    }
  };

  const handleLogin = async () => {
    try {
      // ✅ FIX: Use localhost so it works on your computer consistently
      const response = await axios.post('http://localhost:3001/login', {
        username: username,
        password: password
      });
      
      const loggedUser = response.data;
      localStorage.setItem('user', JSON.stringify(loggedUser));

      navigateBasedOnRole(loggedUser);
      
    } catch (error) {
      console.error("Login Error:", error);
      // This was showing even on network errors!
      setLoginError(error.response?.data?.message || 'Login Failed. Check Server.'); 
    }
  };

  const handlePasswordReset = () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }
    setIsResetting(true);
    setTimeout(() => {
        setIsResetting(false);
        setResetSent(true); 
    }, 1500);
  };

  const closeForgotModal = () => {
      setShowForgotModal(false);
      setResetSent(false);
      setForgotEmail('');
  };

  const initiateSocialLogin = (provider) => {
    setSocialProvider(provider);
    setSocialEmail(''); 
    setShowSocialModal(true);
  };

  const executeSocialLogin = () => {
    if (!socialEmail) return alert("Please enter an email address.");
    if (!socialEmail.includes('@')) return alert("Invalid email format.");

    setShowSocialModal(false); 
    setIsSocialLoading(true);  
    
    setTimeout(async () => {
        try {
            // ✅ FIX: Update this to localhost as well
            const response = await axios.post('http://localhost:3001/social-login', {
                email: socialEmail,
                name: socialEmail.split('@')[0], 
                provider: socialProvider
            });

            const loggedUser = response.data;
            localStorage.setItem('user', JSON.stringify(loggedUser));
            
            navigateBasedOnRole(loggedUser);
            setIsSocialLoading(false);

        } catch (err) {
            setIsSocialLoading(false);
            setLoginError('Social Login Failed'); 
        }
    }, 1500);
  };

  return (
    <div className="login-page">
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <div style={{width: '70px', height: '70px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        </div>
        <h1 style={{margin: 0, color: '#2D3436', fontSize: '26px', fontWeight: '700'}}>Futsal<span style={{color: '#00C853'}}>Pro</span></h1>
        <p style={{margin: '5px 0 0', color: '#B2BEC3', fontSize: '14px'}}>Book your court in seconds</p>
      </div>

      <div style={{width: '100%'}}>
        <label className="form-label">Username</label>
        <input className="login-input" placeholder="Enter username" onChange={(e) => setUsername(e.target.value)} />
        
        <label className="form-label" style={{marginTop: '15px'}}>Password</label>
        <input className="login-input" type="password" placeholder="••••••" onChange={(e) => setPassword(e.target.value)} />
        
        <div style={{textAlign: 'right', marginBottom: '20px', marginTop: '10px'}}>
            <span onClick={() => setShowForgotModal(true)} style={{color: '#00C853', fontSize: '12px', fontWeight: '600', cursor: 'pointer'}}>
                Forgot Password?
            </span>
        </div>

        <button className="btn" onClick={handleLogin}>Log In</button>
      </div>

      {/* Social Media Section */}
      <div style={{marginTop: '30px', width: '100%'}}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
            <div style={{flex: 1, height: '1px', background: '#eee'}}></div>
            <span style={{padding: '0 10px', color: '#aaa', fontSize: '12px'}}>Or continue with</span>
            <div style={{flex: 1, height: '1px', background: '#eee'}}></div>
        </div>
        <div style={{display: 'flex', gap: '15px'}}>
            <button onClick={() => initiateSocialLogin('Google')} style={socialBtnStyle}>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width="20" />
                <span style={{marginLeft: '10px'}}>Google</span>
            </button>
            <button onClick={() => initiateSocialLogin('Facebook')} style={socialBtnStyle}>
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook" width="20" />
                <span style={{marginLeft: '10px'}}>Facebook</span>
            </button>
        </div>
        {isSocialLoading && <p style={{textAlign: 'center', color: '#00C853', fontSize: '12px', marginTop: '10px'}}>Connecting securely...</p>}
      </div>

      <div style={{marginTop: '40px', textAlign: 'center'}}>
        <p style={{fontSize: '14px', color: '#636E72'}}>
            Don't have an account? <span style={{color: '#00C853', fontWeight: '700', cursor: 'pointer'}} onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
        <div style={{marginTop: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px'}}>
            <span style={{fontSize: '13px', color: '#94a3b8', cursor: 'pointer'}} onClick={() => navigate('/partner-signup')}>
                Own a Futsal Court? <b style={{color: '#2D3436'}}>Join as Partner</b>
            </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '20px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    {resetSent ? <span style={{fontSize: '30px'}}>✅</span> : <span style={{fontSize: '30px'}}>🔑</span>}
                </div>
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>{resetSent ? 'Link Sent!' : 'Reset Password'}</h3>
                <p style={{fontSize: '13px', color: '#636E72', marginBottom: '20px', lineHeight: '1.5'}}>
                    {resetSent ? `We sent a recovery link to ${forgotEmail}. Check your inbox.` : "Enter your email address and we'll send you a link to reset your password."}
                </p>
                {!resetSent ? (
                    <>
                        <input className="login-input" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} style={{marginBottom: '20px'}} />
                        <button onClick={handlePasswordReset} className="btn" disabled={isResetting} style={{opacity: isResetting ? 0.7 : 1}}>{isResetting ? 'Sending...' : 'Send Reset Link'}</button>
                    </>
                ) : (
                    <button onClick={closeForgotModal} className="btn">Back to Login</button>
                )}
                {!resetSent && <button onClick={closeForgotModal} style={{marginTop: '15px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '14px'}}>Cancel</button>}
            </div>
        </div>
      )}

      {/* Error Modal */}
      {loginError && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '20px', width: '85%', maxWidth: '300px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center'}}>
                <div style={{width: '60px', height: '60px', background: '#FFF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>Login Failed</h3>
                <p style={{fontSize: '14px', color: '#636E72', marginBottom: '20px'}}>{loginError}</p>
                <button onClick={() => setLoginError('')} style={{width: '100%', padding: '12px', background: '#2D3436', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Try Again</button>
            </div>
        </div>
      )}

      {/* Social Login Modal */}
      {showSocialModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center'}}>
                <div style={{marginBottom: '20px'}}>
                    {socialProvider === 'Google' ? <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width="50" /> : <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" alt="Facebook" width="50" />}
                </div>
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>Continue with {socialProvider}</h3>
                <p style={{fontSize: '13px', color: '#636E72', marginBottom: '20px'}}>(Demo) Enter the email associated with your {socialProvider} account.</p>
                <input className="login-input" placeholder="name@example.com" value={socialEmail} onChange={(e) => setSocialEmail(e.target.value)} style={{textAlign: 'center', marginBottom: '20px'}} autoFocus />
                <button className="btn" onClick={executeSocialLogin}>Continue</button>
                <button onClick={() => setShowSocialModal(false)} style={{marginTop: '15px', background: 'none', border: 'none', color: '#B2BEC3', cursor: 'pointer', fontSize: '14px'}}>Cancel</button>
            </div>
        </div>
      )}
    </div>
  );
}

const socialBtnStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: 'white',
    border: '1px solid #eee',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'transform 0.1s'
};

export default Login;