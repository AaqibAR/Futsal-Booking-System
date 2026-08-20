import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(user) {
        axios.get(`http://localhost:3001/my-refunds/${user.user_id}`)
             .then(res => setRefunds(res.data));
    }
  }, []);

  return (
    <div className="container">
      <div className="header" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div onClick={() => navigate('/profile')} style={{cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '10px'}}>⬅</div>
        <h2 style={{margin: 0, fontSize: '20px'}}>Refunds</h2>
      </div>
      
      <div style={{padding: '20px'}}>
        {refunds.length === 0 ? (
            <div style={{textAlign: 'center', padding: '50px 30px', color: '#636E72'}}>
                <div style={{width: '80px', height: '80px', background: '#F0F2F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '30px'}}>🧾</div>
                <h3 style={{color: '#2D3436'}}>No Refund Requests</h3>
                <p>Cancelled bookings will appear here automatically.</p>
            </div>
        ) : (
            <div>
                {refunds.map(refund => (
                    <div key={refund.refund_id} style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '15px', border: '1px solid #f0f0f0'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                            <span style={{fontWeight: '700', fontSize: '16px'}}>{refund.court_name}</span>
                            <span style={{fontWeight: '700', color: '#00C853'}}>LKR {refund.amount}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontSize: '12px', color: '#888'}}>📅 {refund.requested_at.split('T')[0]}</span>
                            <span style={{
                                background: refund.status === 'pending' ? '#FFF7ED' : '#E8F5E9',
                                color: refund.status === 'pending' ? '#F59E0B' : '#00C853',
                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700'
                            }}>
                                {refund.status.toUpperCase()} ⏳
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
export default Refunds;