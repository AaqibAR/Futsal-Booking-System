import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

// 🚨 1. CHANGE YOUR IP HERE IF YOU MOVE WI-FI
const API_URL = "http://localhost:3001"; 

function Home() {
  const [courts, setCourts] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); 
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  // Booking Form States
  const [date, setDate] = useState(null); 
  const [time, setTime] = useState(null);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState(null); 
  const [searchTime, setSearchTime] = useState(null);
  
  // Modals & Processing States
  const [showPayModal, setShowPayModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingError, setBookingError] = useState(''); 
  
  // Payment Input States
  const [cardNumber, setCardNumber] = useState('');
  const [cvc, setCvc] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardType, setCardType] = useState('');

  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // --- 2. HELPER: FIX ANDROID IMAGES ---
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('localhost')) {
        return url.replace('localhost', 'localhost');
    }
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }
    return url;
  };

  // --- 3. FETCH DATA ---
  const fetchBookings = () => {
      axios.get(`${API_URL}/bookings/all`).then((response) => {
        setBookedSlots(response.data);
    });
  };

  useEffect(() => {
    axios.get(`${API_URL}/courts`).then((response) => {
      setCourts(response.data);
    });
    fetchBookings(); 
    const savedFavs = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavs);
  }, []);

  // --- FETCH BLOCKED DATES ---
  useEffect(() => {
    if (selectedCourt) {
        setDate(null);
        setTime(null);
        setBlockedDates([]); 

        axios.get(`${API_URL}/maintenance/${selectedCourt}`)
            .then((response) => {
                const convertedDates = response.data.map(item => new Date(item.date));
                setBlockedDates(convertedDates);
            })
            .catch(err => console.error("Error fetching maintenance dates:", err));
    }
  }, [selectedCourt]);

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
    
    return slots.map(slotLabel => {
        let isTaken = false;
        if (date && selectedCourt) {
            const dateStr = formatDate(date);
            isTaken = bookedSlots.some(b => 
                b.court_id === selectedCourt && 
                b.booking_date === dateStr && 
                b.time_slot === slotLabel
            );
        }
        return { 
            value: slotLabel, 
            label: isTaken ? `${slotLabel} (Booked)` : slotLabel, 
            isDisabled: isTaken 
        };
    });
  };

  const timeOptions = generateTimeSlots();

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '15px',
      border: '2px solid #F0F2F5',
      backgroundColor: '#F8FAFC',
      padding: '5px',
      boxShadow: state.isFocused ? '0 0 0 2px #00C853' : null,
      borderColor: state.isFocused ? '#00C853' : '#F0F2F5',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isDisabled ? '#f0f0f0' : (state.isSelected ? '#00C853' : state.isFocused ? '#e8f5e9' : 'white'),
      color: state.isDisabled ? '#ccc' : (state.isSelected ? 'white' : '#2d3436'),
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '14px',
    }),
    placeholder: (provided) => ({ ...provided, color: '#aaa' })
  };

  const toggleFavorite = (court) => {
    let newFavs;
    const exists = favorites.find(f => f.court_id === court.court_id);
    if (exists) newFavs = favorites.filter(f => f.court_id !== court.court_id);
    else newFavs = [...favorites, court];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const openBooking = (courtId) => {
      fetchBookings(); 
      setSelectedCourt(courtId);
      if(searchDate) setDate(searchDate);
      if(searchTime) setTime(searchTime);
  };

  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('4')) setCardType('visa');
    else if (val.startsWith('5')) setCardType('mastercard');
    else setCardType('');
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val.slice(0, 19)); 
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
        val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setExpiry(val);
  };

  const handleProceedToPay = async () => {
    if(!date || !time) {
        setBookingError("Please select a valid date and time.");
        return;
    }
    const formattedDate = formatDate(date);
    if(new Date(formattedDate) < new Date().setHours(0,0,0,0)) {
        setBookingError("You cannot book for a past date.");
        return;
    }

    try {
        const response = await axios.post(`${API_URL}/check-availability`, {
            court_id: selectedCourt,
            date: formattedDate,
            time: time.value
        });

        if (response.data.available === false) {
             setBookingError("⚠️ This slot is unavailable (Booked or Maintenance).");
             fetchBookings(); 
             setTime(null);   
             return; 
        }
        setShowPayModal(true);
    } catch (error) {
        console.error("Availability check failed", error);
        setBookingError("Network error. Please try again.");
    }
  };

  const handlePaymentAndBook = async () => {
    if (cardNumber.length < 18) return alert("⚠️ Invalid Card Number!");
    if (cvc.length !== 3) return alert("⚠️ Invalid CVC!");
    if (expiry.length !== 5) return alert("⚠️ Invalid Expiry!");

    setIsProcessing(true);
    const courtDetails = courts.find(c => c.court_id === selectedCourt);
    const priceToPay = courtDetails ? courtDetails.price : 4000;
    const formattedDate = formatDate(date);

    setTimeout(async () => {
        try {
            await axios.post(`${API_URL}/book`, {
                user_id: user.user_id,
                court_id: selectedCourt,
                date: formattedDate, 
                time: time.value, 
                price: priceToPay 
            });
            setIsProcessing(false);
            setShowPayModal(false);
            setShowSuccessModal(true); 
            setCardNumber(''); setCvc(''); setExpiry('');
        } catch (error) {
            setIsProcessing(false);
            setBookingError("Payment processing failed. Please try again.");
        }
    }, 2000); 
  };

  const generateCalendarLink = () => {
    if (!selectedCourt || !date || !time) return '#';
    const courtDetails = courts.find(c => c.court_id === selectedCourt);
    const courtName = courtDetails ? courtDetails.name : "Futsal Match";
    const location = courtDetails ? courtDetails.location : "Sri Lanka";

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    const timeString = typeof time === 'object' ? time.value : time;
    const [startRaw, endRaw] = timeString.split(' - ');
    const to24Hour = (timeStr) => {
        const [hour, modifier] = timeStr.split(' ');
        let h = parseInt(hour, 10);
        if (modifier === 'PM' && h < 12) h += 12;
        if (modifier === 'AM' && h === 12) h = 0;
        return h.toString().padStart(2, '0') + '0000';
    };

    const startTime = to24Hour(startRaw);
    const endTime = to24Hour(endRaw);

    const title = encodeURIComponent(`⚽ Match at ${courtName}`);
    const details = encodeURIComponent(`Booking Confirmed via FutsalPro.\nLocation: ${location}`);
    const loc = encodeURIComponent(location);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T${startTime}/${dateStr}T${endTime}&details=${details}&location=${loc}`;
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <div>
            <div style={{fontSize: '12px', opacity: 0.9}}>Location</div>
            <div style={{fontWeight: 'bold', fontSize: '16px'}}>📍 Colombo, LK</div>
          </div>
          <div className="location-badge" onClick={() => navigate('/notifications')} style={{cursor: 'pointer'}}>🔔</div>
        </div>
        <h2 style={{marginTop: '20px', fontSize: '24px', textTransform: 'capitalize'}}>Hello, {user ? user.username : 'Player'}! 👋</h2>
      </div>

      <div style={{padding: '20px 20px 0'}}>
        <input 
            className="login-input"
            placeholder="🔍 Search location or name..." 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{margin: '0 0 10px 0'}}
        />
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <div style={{flex: 1}}>
                <DatePicker selected={searchDate} onChange={(date) => setSearchDate(date)} placeholderText="📅 Date" minDate={new Date()} dateFormat="yyyy-MM-dd" />
            </div>
            <div style={{flex: 1}}>
                <Select options={timeOptions} value={searchTime} onChange={setSearchTime} placeholder="⏰ Time" styles={customSelectStyles} isClearable />
            </div>
        </div>
      </div>

      <div className="section-title">Available Courts ⚽</div>

      <div style={{paddingBottom: '20px'}}>
        {courts
          .filter((court) => {
            const matchesText = court.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                court.location.toLowerCase().includes(searchTerm.toLowerCase());
            let isAvailable = true;
            if (searchDate && searchTime) {
                const searchDateStr = formatDate(searchDate);
                isAvailable = !bookedSlots.some(booking => 
                    booking.court_id === court.court_id && 
                    booking.booking_date === searchDateStr &&
                    booking.time_slot === searchTime.value
                );
            }
            return matchesText && isAvailable;
          })
          .map((court) => {
            const isFav = favorites.some(f => f.court_id === court.court_id);
            let isBooked = false;
            if (searchDate && searchTime) {
                const searchDateStr = formatDate(searchDate);
                isBooked = bookedSlots.some(booking => booking.court_id === court.court_id && booking.booking_date === searchDateStr && booking.time_slot === searchTime.value);
            }
            return (
              <div key={court.court_id} className="court-card" style={{position: 'relative', opacity: isBooked ? 0.6 : 1, transition: 'opacity 0.3s'}}>
                <div onClick={() => toggleFavorite(court)} style={{position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontSize: '20px', zIndex: 2}}>
                    {isFav ? '❤️' : '🤍'}
                </div>
                
                {/* ✅ UPDATED IMAGE TAG WITH HELPER */}
                <img 
                    src={getImageUrl(court.image_url)} 
                    alt="court" 
                    className="court-img" 
                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}} 
                    style={{filter: isBooked ? 'grayscale(100%)' : 'none'}} 
                />
                
                <div className="court-info">
                  <div className="court-header">
                    <h3 className="court-name">{court.name}</h3>
                    {isBooked && <span style={{background: '#e74c3c', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold'}}>BUSY</span>}
                    {!isBooked && <span className="court-rating">★ 4.8</span>}
                  </div>
                  <p className="court-location">📍 {court.location} • Indoor Turf</p>
                  <span className="court-price">LKR {court.price}/hr</span>
                  {selectedCourt === court.court_id ? (
                    <div className="booking-form">
                      <label className="form-label">Select Date</label>
                      <div style={{marginBottom: '10px'}}>
                          <DatePicker 
                            selected={date} 
                            onChange={(d) => { setDate(d); setTime(null); }}
                            minDate={new Date()} 
                            placeholderText="Pick a date" 
                            dateFormat="yyyy-MM-dd"
                            excludeDates={blockedDates}
                            dayClassName={date => {
                                const isBlocked = blockedDates.some(blockedDate => 
                                    date.getDate() === blockedDate.getDate() &&
                                    date.getMonth() === blockedDate.getMonth() &&
                                    date.getFullYear() === blockedDate.getFullYear()
                                );
                                return isBlocked ? "maintenance-day" : undefined;
                            }}
                          />
                      </div>
                      <label className="form-label">Select Time</label>
                      <div style={{marginBottom: '15px'}}>
                          <Select 
                            options={timeOptions} 
                            value={time} 
                            onChange={setTime} 
                            placeholder="Select Slot" 
                            styles={customSelectStyles} 
                            isOptionDisabled={(option) => option.isDisabled}
                           />
                      </div>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button className="btn btn-secondary" onClick={() => setSelectedCourt(null)}>Cancel</button>
                        <button className="btn" onClick={handleProceedToPay}>Proceed to Pay</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn" style={{marginTop: '10px', background: isBooked ? '#ccc' : 'linear-gradient(to right, #00C853, #00E676)', cursor: isBooked ? 'not-allowed' : 'pointer'}} onClick={() => !isBooked && openBooking(court.court_id)} disabled={isBooked}>{isBooked ? 'Unavailable 🚫' : 'Book Now'}</button>
                  )}
                </div>
              </div>
            );
        })}
      </div>
      
      {/* Payment Modal */}
      {showPayModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '350px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <p style={{fontSize: '14px', color: '#636E72', margin: 0}}>Total to Pay</p>
                    <h2 style={{margin: '5px 0', color: '#00C853'}}>LKR {courts.find(c=>c.court_id===selectedCourt)?.price}</h2>
                </div>
                <div style={{position: 'relative'}}>
                    <input className="login-input" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardChange} style={{paddingLeft: '50px', letterSpacing: '2px', fontFamily: 'monospace'}} />
                    <div style={{position: 'absolute', top: '22px', left: '15px', fontSize: '24px'}}>
                        {cardType === 'visa' ? '💳' : cardType === 'mastercard' ? '💳' : '💳'}
                    </div>
                    {cardType === 'visa' && <span style={{position:'absolute', right:'15px', top:'25px', fontSize:'10px', fontWeight:'bold', color:'blue'}}>VISA</span>}
                    {cardType === 'mastercard' && <span style={{position:'absolute', right:'15px', top:'25px', fontSize:'10px', fontWeight:'bold', color:'orange'}}>MC</span>}
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input className="login-input" placeholder="MM/YY" value={expiry} onChange={handleExpiryChange} maxLength={5} style={{textAlign: 'center'}} />
                    <input className="login-input" placeholder="CVC" maxLength={3} type="password" value={cvc} onChange={(e) => setCvc(e.target.value)} style={{textAlign: 'center'}} />
                </div>
                <button className="btn" onClick={handlePaymentAndBook} disabled={isProcessing} style={{opacity: isProcessing ? 0.7 : 1, marginTop: '15px'}}>{isProcessing ? 'Processing Payment...' : 'Pay Now'}</button>
                <button onClick={() => setShowPayModal(false)} style={{width: '100%', background: 'none', border: 'none', color: '#B2BEC3', marginTop: '15px', cursor: 'pointer', fontSize: '14px'}}>Cancel Transaction</button>
            </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '40px 30px', borderRadius: '30px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 60px rgba(0,200,83,0.15)', textAlign: 'center', animation: 'scaleUp 0.3s ease'}}>
                <div style={{width: '80px', height: '80px', background: '#E8F5E9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(0,200,83,0.2)'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00C853" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 style={{margin: '0 0 10px', color: '#2D3436', fontSize: '22px'}}>Booking Confirmed!</h2>
                <p style={{fontSize: '14px', color: '#636E72', marginBottom: '25px', lineHeight: '1.5'}}>Your court has been successfully reserved. We've sent a receipt to your email.</p>
                <a href={generateCalendarLink()} target="_blank" rel="noreferrer" style={{textDecoration: 'none', display: 'block', marginBottom: '10px'}}>
                    <button className="btn" style={{background: '#4285F4', boxShadow: '0 8px 20px rgba(66, 133, 244, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <span></span> Add to Google Calendar
                    </button>
                </a>
                <button onClick={() => navigate('/my-bookings')} className="btn" style={{marginTop: 0, background: 'white', color: '#00C853', border: '2px solid #00C853', boxShadow: 'none'}}>View Ticket</button>
            </div>
        </div>
      )}

      {/* Booking Error Modal */}
      {bookingError && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '320px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', textAlign: 'center', animation: 'scaleUp 0.3s ease'}}>
                <div style={{width: '70px', height: '70px', background: '#FFF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'}}>
                    <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3 style={{margin: '0 0 10px', color: '#2D3436'}}>Slot Unavailable</h3>
                <p style={{fontSize: '14px', color: '#636E72', marginBottom: '20px'}}>
                    {bookingError}
                </p>
                <button onClick={() => setBookingError('')} className="btn" style={{marginTop: 0, background: '#2D3436', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'}}>
                    Okay, I'll pick another
                </button>
            </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
export default Home;