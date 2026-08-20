import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewCourtId, setReviewCourtId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Manage Modal States
  const [showManageModal, setShowManageModal] = useState(false);
  const [bookingToManage, setBookingToManage] = useState(null); 
  
  // Reschedule States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);

  // Success Modal State
  const [successMessage, setSuccessMessage] = useState('');

  // --- Error Modal State ---
  const [rescheduleError, setRescheduleError] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = () => {
    if(user) { axios.get(`http://localhost:3001/my-bookings/${user.user_id}`).then(res => setBookings(res.data)); }
  };

  const formatDate = (d) => {
      if (!d) return '';
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - (offset*60*1000));
      return localDate.toISOString().split('T')[0];
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 22; i++) {
        const start = i > 12 ? `${i-12} PM` : `${i} AM`;
        const end = (i+1) > 12 ? `${i+1-12} PM` : `${i+1} AM`;
        const startFormatted = i === 12 ? '12 PM' : start;
        const endFormatted = (i+1) === 12 ? '12 PM' : end;
        slots.push(`${startFormatted} - ${endFormatted}`);
    }
    return slots.map(slot => ({ value: slot, label: slot }));
  };
  const timeOptions = generateTimeSlots();

  const customSelectStyles = {
    control: (provided) => ({ ...provided, borderRadius: '10px', border: '1px solid #ddd', padding: '2px' }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#00C853' : state.isFocused ? '#e8f5e9' : 'white',
      color: state.isSelected ? 'white' : '#333',
    })
  };

  const initiateManage = (booking) => {
    setBookingToManage(booking); 
    setIsRescheduling(false);    
    setNewDate(null);
    setNewTime(null);
    setShowManageModal(true);
  };

  const handleRefund = async () => {
    try { 
        await axios.post(`http://localhost:3001/bookings/cancel`, { 
            booking_id: bookingToManage.booking_id, 
            user_id: user.user_id 
        }); 
        
        setShowManageModal(false);
        fetchBookings(); 
        setSuccessMessage("Booking Cancelled! Refund request generated.");
    } 
    catch (err) { alert("Error processing refund"); }
  };

  const confirmReschedule = async () => {
      // --- FIX: Use setRescheduleError instead of alert ---
      if (!newDate || !newTime) {
          setRescheduleError("Please pick a new date and time.");
          return;
      }
      
      const formattedDate = formatDate(newDate);
      
      if(new Date(formattedDate) < new Date().setHours(0,0,0,0)) {
          setRescheduleError("⚠️ Cannot reschedule to the past.");
          return;
      }

      try {
          await axios.post('http://localhost:3001/bookings/reschedule', {
              booking_id: bookingToManage.booking_id,
              court_id: bookingToManage.court_id || bookingToManage.booking_id, 
              date: formattedDate,
              time: newTime.value
          });
          
          setShowManageModal(false);
          fetchBookings();
          setSuccessMessage("Reschedule Successful! Your ticket is updated.");

      } catch (error) {
          if (error.response && error.response.status === 409) {
              // --- FIX: Use Custom Modal for Busy Slot ---
              setRescheduleError("Sorry! That slot is already taken.");
          } else {
              setRescheduleError("Reschedule Failed. Please try again.");
          }
      }
  };

  const submitReview = async () => {
    if(!comment) return alert("Write a comment!");
    try { await axios.post('http://localhost:3001/reviews', { court_id: reviewCourtId, user_id: user.user_id, rating, comment });
        setShowReviewModal(false); setComment('');
        setSuccessMessage("Thanks! Your review has been submitted.");
    } catch (error) { alert("Error"); }
  };

  return (
    <div className="container">
      <div className="header">
        <h2 style={{margin: 0, fontSize: '24px'}}>My Tickets 🎟️</h2>
        <p style={{margin: '5px 0 0', opacity: 0.9}}>Manage your upcoming games</p>
      </div>

      <div style={{paddingTop: '10px', paddingBottom: '80px'}}>
        {bookings.map((booking) => (
          <div key={booking.booking_id} className="booking-item">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
              <h3 style={{fontWeight: '700', fontSize: '18px', color: '#2D3436'}}>{booking.name}</h3>
              
              <span style={{
                  background: booking.status === 'cancelled' ? '#FFF0F0' : '#E8F5E9', 
                  color: booking.status === 'cancelled' ? '#FF4444' : '#00C853', 
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', height: 'fit-content'
              }}>
                  {booking.status ? booking.status.toUpperCase() : 'CONFIRMED'}
              </span>
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#636E72', fontSize: '14px', marginBottom: '5px'}}>
                <span>📍 {booking.location}</span>
            </div>
            
            <div style={{background: '#F8FAFC', padding: '10px', borderRadius: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500', color: '#2D3436'}}>
              <span>📅 {booking.booking_date}</span>
              <span>⏰ {booking.time_slot}</span>
            </div>
            
            {booking.status !== 'cancelled' && (
                <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px'}}>
                    <button className="btn-secondary" onClick={() => {setReviewCourtId(booking.court_id); setShowReviewModal(true);}} style={{padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600'}}>⭐ Rate</button>
                    <button onClick={() => initiateManage(booking)} style={{padding: '10px', background: '#FFF0F0', color: '#FF4444', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '600'}}>Manage</button>
                </div>
            )}
          </div>
        ))}
        {bookings.length === 0 && <div style={{textAlign: 'center', padding: '50px', color: '#B2BEC3'}}>No bookings found.</div>}
      </div>

      {/* Manage Booking Modal */}
      {showManageModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'scaleUp 0.3s ease'}}>
                
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>
                    {isRescheduling ? 'Pick New Slot' : 'Manage Booking'}
                </h3>
                
                {!isRescheduling ? (
                    <>
                        <p style={{fontSize: '14px', color: '#636E72', marginBottom: '25px', lineHeight: '1.5'}}>
                            Would you like to reschedule this match or request a refund?
                        </p>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <button onClick={() => setIsRescheduling(true)} className="btn" style={{marginTop: 0, background: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>Reschedule</button>
                            <button onClick={handleRefund} className="btn" style={{marginTop: 0, background: '#FF4444', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>Refund</button>
                            <button onClick={() => setShowManageModal(false)} style={{marginTop: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px'}}>Close</button>
                        </div>
                    </>
                ) : (
                    <div style={{textAlign: 'left'}}>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px'}}>New Date</label>
                        <div style={{marginBottom: '15px'}}>
                            <DatePicker selected={newDate} onChange={(d) => setNewDate(d)} minDate={new Date()} placeholderText="Pick a date" dateFormat="yyyy-MM-dd" className="login-input" />
                        </div>
                        <label style={{fontSize: '12px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px'}}>New Time</label>
                        <div style={{marginBottom: '20px'}}>
                            <Select options={timeOptions} value={newTime} onChange={setNewTime} placeholder="Select Slot" styles={customSelectStyles} />
                        </div>
                        <button onClick={confirmReschedule} className="btn" style={{marginTop: 0}}>Confirm Change</button>
                        <button onClick={() => setIsRescheduling(false)} style={{width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px'}}>Back</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '25px', borderRadius: '20px', width: '85%', maxWidth: '350px'}}>
                <h3>⭐ Rate Experience</h3>
                <select className="login-input" value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                </select>
                <textarea className="login-input" rows="3" placeholder="How was it?" onChange={(e) => setComment(e.target.value)}/>
                <button className="btn" onClick={submitReview}>Submit</button>
                <button onClick={() => setShowReviewModal(false)} style={{width: '100%', background: 'none', border: 'none', color: '#888', marginTop: '10px', cursor: 'pointer'}}>Close</button>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '40px 30px', borderRadius: '30px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 60px rgba(0,200,83,0.15)', textAlign: 'center', animation: 'scaleUp 0.3s ease'}}>
                <div style={{width: '80px', height: '80px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(0,200,83,0.2)'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 style={{margin: '0 0 10px', color: '#2D3436', fontSize: '22px'}}>Success!</h2>
                <p style={{fontSize: '14px', color: '#636E72', marginBottom: '30px', lineHeight: '1.5'}}>{successMessage}</p>
                <button onClick={() => setSuccessMessage('')} className="btn" style={{marginTop: 0, background: '#2D3436', boxShadow: 'none'}}>Great, Thanks!</button>
            </div>
        </div>
      )}

      {/* --- NEW: RESCHEDULE ERROR MODAL --- */}
      {rescheduleError && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'scaleUp 0.3s ease'}}>
                
                {/* Warning Icon */}
                <div style={{width: '70px', height: '70px', background: '#FFF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>Unavailable</h3>
                <p style={{fontSize: '14px', color: '#636E72', marginBottom: '20px'}}>
                    {rescheduleError}
                </p>

                <button 
                    onClick={() => setRescheduleError('')} 
                    className="btn"
                    style={{marginTop: 0, background: '#2D3436', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'}}
                >
                    Okay, I'll pick another
                </button>
            </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
export default MyBookings;