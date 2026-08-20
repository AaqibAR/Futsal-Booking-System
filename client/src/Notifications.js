import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(user) {
        axios.get(`http://localhost:3001/notifications/${user.user_id}`)
             .then(res => setNotifs(res.data));
    }
  }, []);

  return (
    <div className="container">
      <div className="header" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div onClick={() => navigate('/home')} style={{cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '10px'}}>⬅</div>
        <h2 style={{margin: 0, fontSize: '20px'}}>Notifications</h2>
      </div>

      <div style={{padding: '20px', paddingBottom: '80px'}}>
        {notifs.length === 0 && <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>No new notifications.</p>}
        
        {notifs.map(n => (
            <div key={n.notification_id} style={{background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '15px', borderLeft: n.type === 'sms' ? '5px solid #3b82f6' : '5px solid #f59e0b', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                    <span style={{fontWeight: '700', color: '#333', fontSize: '14px'}}>
                        {n.type === 'sms' ? '📱 SMS Message' : '📧 Email Alert'}
                    </span>
                    <span style={{fontSize: '10px', color: '#aaa'}}>{n.created_at.split('T')[0]}</span>
                </div>
                <p style={{fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.4', fontFamily: 'monospace', background: '#f8fafc', padding: '8px', borderRadius: '8px'}}>
                    {n.message}
                </p>
            </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

export default Notifications;