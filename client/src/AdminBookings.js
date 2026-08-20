import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        navigate('/login');
        return;
    }

    // Fetch bookings for this Partner's courts
    axios.get(`http://localhost:3001/admin/bookings?userId=${user.user_id}`)
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div style={{background: '#F4F7F6', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', padding: '20px'}}>
      
      {/* Header */}
      <div style={{display: 'flex', alignItems: 'center', marginBottom: '30px'}}>
        <button onClick={() => navigate('/admin')} style={{background: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', marginRight: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', fontWeight: '600', color: '#64748b'}}>
            ← Back
        </button>
        <div>
            <h2 style={{margin: 0, color: '#1e293b', fontSize: '22px'}}>Booking Management</h2>
            <p style={{margin: 0, fontSize: '13px', color: '#64748b'}}>Track your court schedules</p>
        </div>
      </div>

      {loading ? (
        <p style={{textAlign: 'center', color: '#64748b'}}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div style={{textAlign: 'center', padding: '50px', background: 'white', borderRadius: '20px', color: '#94a3b8'}}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>📅</div>
            No bookings found yet.
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {bookings.map((booking) => (
                <div key={booking.booking_id} style={{background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: booking.status === 'confirmed' ? '5px solid #00C853' : '5px solid #FF4444'}}>
                    
                    {/* Left: User & Court Info */}
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                            <span style={{fontWeight: '700', color: '#1e293b', fontSize: '16px'}}>{booking.username}</span>
                            <span style={{fontSize: '11px', background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#64748b'}}>ID: #{booking.booking_id}</span>
                        </div>
                        <div style={{color: '#64748b', fontSize: '13px'}}>
                            📍 {booking.court_name}
                        </div>
                    </div>

                    {/* Middle: Date & Time */}
                    <div style={{textAlign: 'right'}}>
                        <div style={{fontWeight: '600', color: '#1e293b', fontSize: '15px'}}>{booking.booking_date}</div>
                        <div style={{color: '#00C853', fontWeight: 'bold', fontSize: '14px'}}>{booking.time_slot}</div>
                    </div>

                </div>
            ))}
        </div>
      )}

    </div>
  );
}

export default AdminBookings;