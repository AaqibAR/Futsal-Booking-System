import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MaintenanceModal from './MaintenanceModal'; 

// ✅ 1. CHANGE YOUR IP HERE ONLY (Easy to update for Viva)
const API_URL = "http://localhost:3001"; 

function PartnerDashboard() {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, courts: 0 });
  const [myCourts, setMyCourts] = useState([]); 
  const [refunds, setRefunds] = useState([]); 
  
  // Modals
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [courtToEdit, setCourtToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if(user) fetchData();
  }, []);

  const fetchData = () => {
    const userId = user.user_id;
    // ✅ Updated to use API_URL variable
    axios.get(`${API_URL}/admin/stats?userId=${userId}`).then(res => setStats(res.data));
    axios.get(`${API_URL}/admin/my-courts?userId=${userId}`).then(res => setMyCourts(res.data));
    axios.get(`${API_URL}/admin/refunds?userId=${userId}`).then(res => setRefunds(res.data));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const processRefund = async (id, status) => {
      try {
          await axios.put(`${API_URL}/admin/refunds/${id}`, { status });
          setSuccessMessage(`Refund ${status} successfully!`);
          fetchData(); 
      } catch (error) { alert("Error processing refund"); }
  };

  const handleDeleteCourt = async (courtId) => {
      if(!window.confirm("Are you sure? This will remove the court from the app.")) return;
      try {
          await axios.delete(`${API_URL}/courts/${courtId}`);
          setSuccessMessage("Facility deleted successfully.");
          fetchData();
      } catch (error) { alert("Could not delete. Check active bookings."); }
  };

  const handleSaveCourt = async () => {
      try {
          await axios.put(`${API_URL}/courts/${courtToEdit.court_id}`, {
              name: courtToEdit.name,
              location: courtToEdit.location,
              price: courtToEdit.price
          });
          setShowEditModal(false);
          setSuccessMessage("Court details updated!");
          fetchData(); 
      } catch (error) { alert("Network Error"); }
  };

  // ✅ NEW: PDF INVOICE DOWNLOAD FUNCTION
  const handleDownloadInvoice = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/generate-invoice?userId=${user.user_id}`, {
        responseType: 'blob', // IMPORTANT: Tell axios this is a file
      });
      
      // Create a fake link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${new Date().getMonth()+1}_2026.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Could not generate invoice. Make sure PDFKit is installed on server.");
    }
  };

  // ✅ HELPER: This fixes the broken images on Android
  const getImageUrl = (url) => {
    if (!url) return '';
    // If database has "localhost", replace it with IP
    if (url.includes('localhost')) {
        return url.replace('localhost', 'localhost');
    }
    // If database has relative path "/uploads/...", add the IP
    if (url.startsWith('/')) {
        return `${API_URL}${url}`;
    }
    return url;
  };

  return (
    <div style={{background: '#F4F7F6', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', paddingBottom: '40px'}}>
      
      {/* Header - Slate Blue for Partners */}
      <div style={{background: '#1e293b', padding: '30px 20px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', color: 'white', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '480px', margin: '0 auto'}}>
            <div onClick={() => navigate('/admin-profile')} style={{cursor: 'pointer'}}>
                <h2 style={{margin: 0, fontSize: '22px', color: '#4ade80'}}>Facility Manager</h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <p style={{margin: 0, opacity: 0.7, fontSize: '13px'}}>Dashboard for {user ? user.username : ''}</p>
                    <span style={{fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px'}}>✎ Edit</span>
                </div>
            </div>
            <button onClick={handleLogout} style={{background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>Logout</button>
        </div>
      </div>

      <div className="container" style={{background: 'transparent', boxShadow: 'none', maxWidth: '480px', margin: '0 auto', padding: '0 20px'}}>
        
        {/* Analytics Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px'}}>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>💰</div>
                <div style={{fontSize: '16px', fontWeight: '700', color: '#1e293b'}}>LKR {stats.revenue.toLocaleString()}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Total Revenue</div>
            </div>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>📅</div>
                <div style={{fontSize: '16px', fontWeight: '700', color: '#1e293b'}}>{stats.bookings}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Total Bookings</div>
            </div>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>🏟️</div>
                <div style={{fontSize: '16px', fontWeight: '700', color: '#1e293b'}}>{stats.courts}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>My Courts</div>
            </div>
        </div>

        {/* Actions */}
        <div style={{display: 'flex', gap: '15px', marginBottom: '30px'}}>
    
            <button 
                className="btn" 
                onClick={() => navigate('/add-court')} 
                style={{flex: 1, background: '#1e293b', color: 'white', padding: '15px', borderRadius: '15px', fontWeight: '600', cursor: 'pointer', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}
            >
                + Add New Facility
            </button>

            <button 
                className="btn" 
                onClick={() => navigate('/admin-bookings')} 
                style={{flex: 1, background: 'white', color: '#1e293b', border: '2px solid #1e293b', padding: '15px', borderRadius: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'}}
            >
                📅 View Bookings
            </button>

            {/* ✅ NEW: DOWNLOAD REPORT BUTTON */}
            <button 
                className="btn" 
                onClick={handleDownloadInvoice} 
                style={{flex: 1, background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'}}
            >
                📄 Download Report
            </button>

        </div>

        {/* My Facilities List */}
        <h3 style={{color: '#1e293b', fontSize: '18px', margin: '0 0 15px'}}>My Facilities</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px'}}>
            {myCourts.map(court => (
                <div key={court.court_id} style={{background: 'white', padding: '15px', borderRadius: '20px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)'}}>
                    
                    {/* ✅ UPDATED IMAGE TAG */}
                    <img 
                        src={getImageUrl(court.image_url)} 
                        alt="court" 
                        style={{width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover'}} 
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/60'}} // Fallback if image fails
                    />
                    
                    <div style={{flex: 1}}>
                        <div style={{fontWeight: '700', fontSize: '15px', color: '#1e293b'}}>{court.name}</div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>LKR {court.price}/hr</div>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => { setCourtToEdit(court); setShowEditModal(true); }} style={{background: '#F1F5F9', border: 'none', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer'}}>✎</button>
                        <button onClick={() => handleDeleteCourt(court.court_id)} style={{background: '#FFF0F0', color: '#FF4444', border: 'none', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer'}}>🗑</button>
                        <button onClick={() => { setSelectedCourtId(court.court_id); setShowMaintenanceModal(true); }} style={{background: '#FFF7ED', color: '#F59E0B', border: 'none', width: '35px', height: '35px', borderRadius: '10px', cursor: 'pointer'}}>🚧</button>
                    </div>
                </div>
            ))}
        </div>

        {/* Refunds Section */}
        {refunds.length > 0 && (
            <div style={{marginBottom: '30px'}}>
                <h3 style={{color: '#1e293b', fontSize: '18px', margin: '0 0 15px'}}>⚠️ Refund Requests</h3>
                <div style={{background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderLeft: '5px solid #F59E0B'}}>
                    {refunds.map(r => (
                        <div key={r.refund_id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                            <div>
                                <div style={{fontWeight: '700', fontSize: '14px', color: '#1e293b'}}>{r.court_name}</div>
                                <div style={{fontSize: '12px', color: '#64748b'}}>Amount: LKR {r.amount}</div>
                            </div>
                            <div>
                                <button onClick={() => processRefund(r.refund_id, 'approved')} style={{marginRight: '5px', background: '#E8F5E9', color: '#00C853', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>✔</button>
                                <button onClick={() => processRefund(r.refund_id, 'rejected')} style={{background: '#FFEBEE', color: '#FF4444', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && courtToEdit && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
            <div style={{background: 'white', padding: '30px', borderRadius: '25px', width: '85%', maxWidth: '350px'}}>
                <h3 style={{margin: '0 0 20px', color: '#1e293b'}}>Edit Facility</h3>
                <input className="login-input" value={courtToEdit.name} onChange={(e) => setCourtToEdit({...courtToEdit, name: e.target.value})} style={{marginBottom: '15px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <input className="login-input" value={courtToEdit.location} onChange={(e) => setCourtToEdit({...courtToEdit, location: e.target.value})} style={{marginBottom: '15px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <input className="login-input" type="number" value={courtToEdit.price} onChange={(e) => setCourtToEdit({...courtToEdit, price: e.target.value})} style={{marginBottom: '20px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={handleSaveCourt} style={{flex: 1, padding: '12px', background: '#00C853', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Save</button>
                    <button onClick={() => setShowEditModal(false)} style={{flex: 1, padding: '12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <MaintenanceModal courtId={selectedCourtId} onClose={() => setShowMaintenanceModal(false)} />
      )}

      {successMessage && (
        <div style={{position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#00C853', color: 'white', padding: '10px 20px', borderRadius: '20px', zIndex: 1100, boxShadow: '0 10px 30px rgba(0,200,83,0.3)'}}>
            {successMessage} <span onClick={() => setSuccessMessage('')} style={{marginLeft: '10px', cursor: 'pointer', fontWeight: 'bold'}}>✕</span>
        </div>
      )}

    </div>
  );
}

const statCardStyle = { background: 'white', padding: '20px 10px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };

export default PartnerDashboard;