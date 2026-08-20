import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(saved);
  }, []);

  const removeFav = (id) => {
    const newFavs = favorites.filter(f => f.court_id !== id);
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  return (
    <div className="container">
      <div className="header" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <div onClick={() => navigate('/profile')} style={{cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '10px'}}>⬅</div>
        <h2 style={{margin: 0, fontSize: '20px'}}>Favorite Venues</h2>
      </div>

      <div style={{paddingBottom: '80px', paddingTop: '10px'}}>
        {favorites.length === 0 && <p style={{textAlign:'center', color:'#B2BEC3', marginTop: '50px'}}>No favorites saved.</p>}
        
        {favorites.map(court => (
            <div key={court.court_id} className="court-card" style={{margin: '20px'}}>
                <img src={court.image_url} alt="court" className="court-img" style={{height: '140px'}}/>
                <div className="court-info">
                    <div className="court-header">
                        <h3 className="court-name">{court.name}</h3>
                        <span className="court-rating">★ 4.8</span>
                    </div>
                    <p className="court-location">📍 {court.location}</p>
                    <div style={{display:'flex', gap:'10px', marginTop: '15px'}}>
                        <button className="btn" onClick={() => navigate('/home')} style={{marginTop: 0, fontSize: '14px', padding: '10px'}}>Book Now</button>
                        <button onClick={() => removeFav(court.court_id)} style={{flex: 1, background: '#FFF0F0', color: '#FF4444', border: 'none', borderRadius: '15px', fontWeight: '600', cursor: 'pointer'}}>Remove</button>
                    </div>
                </div>
            </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
export default Favorites;