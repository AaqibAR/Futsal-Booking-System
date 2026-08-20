import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SuperAdminDashboard() {
  // Data States
  const [stats, setStats] = useState({ revenue: 0, bookings: 0, total_partners: 0, total_players: 0, top_court: null });
  const [chartData, setChartData] = useState([]);
  const [peakData, setPeakData] = useState([]); // ✅ NEW: Peak Hours Data
  const [pendingPartners, setPendingPartners] = useState([]);
  const [activePartners, setActivePartners] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [successMessage, setSuccessMessage] = useState('');

  // View Mode State
  const [viewMode, setViewMode] = useState('monthly'); 

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: null, title: '', message: '', data: null });
  const [commissionInput, setCommissionInput] = useState('');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if(user) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]); 

  const fetchData = () => {
    axios.get(`http://localhost:3001/admin/stats?userId=${user.user_id}`).then(res => setStats(res.data));
    axios.get('http://localhost:3001/admin/pending-partners').then(res => setPendingPartners(res.data));
    axios.get('http://localhost:3001/admin/active-partners').then(res => setActivePartners(res.data));
    axios.get(`http://localhost:3001/admin/chart-data?period=${viewMode}`).then(res => setChartData(res.data));
    axios.get('http://localhost:3001/admin/users').then(res => setAllUsers(res.data));
    
    // ✅ NEW: Fetch Peak Hours
    axios.get('http://localhost:3001/admin/peak-hours').then(res => setPeakData(res.data));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- MODAL TRIGGERS ---
  const confirmVerification = (id, status) => {
    setModal({
        isOpen: true,
        type: 'verify',
        title: status === 'approved' ? 'Approve Partner?' : 'Reject Partner?',
        message: `Are you sure you want to ${status} this facility?`,
        data: { id, status }
    });
  };

  const openCommissionModal = (id, currentRate) => {
      setCommissionInput(currentRate);
      setModal({
          isOpen: true,
          type: 'commission',
          title: 'Update Commission',
          message: 'Enter the new percentage count (e.g., 15)',
          data: { id }
      });
  };

  const confirmDeleteUser = (id, username) => {
      setModal({
          isOpen: true,
          type: 'delete',
          title: 'Remove User?',
          message: `This will permanently delete "${username}" and all their data.`,
          data: { id }
      });
  };

  const closeModal = () => {
      setModal({ isOpen: false, type: null, title: '', message: '', data: null });
      setCommissionInput('');
  };

  // --- ACTIONS ---
  const handleModalConfirm = async () => {
      try {
          if (modal.type === 'verify') {
              const { id, status } = modal.data;
              await axios.put(`http://localhost:3001/admin/verify-user/${id}`, { status });
              setSuccessMessage(`Partner account ${status}!`);
          } 
          else if (modal.type === 'commission') {
              if (!commissionInput || isNaN(commissionInput)) return alert("Please enter a valid number");
              const { id } = modal.data;
              await axios.put(`http://localhost:3001/admin/update-rate/${id}`, { commission_rate: commissionInput });
              setSuccessMessage(`Commission updated to ${commissionInput}%`);
          }
          else if (modal.type === 'delete') { 
              const { id } = modal.data;
              await axios.delete(`http://localhost:3001/admin/users/${id}`);
              setSuccessMessage('User permanently removed.');
          }
          
          fetchData();
          closeModal();

      } catch (err) {
          alert("Action failed. User might have active dependencies.");
          closeModal();
      }
  };

  const getToggleStyle = (mode) => ({
      padding: '6px 15px', 
      borderRadius: '8px', 
      border: 'none', 
      fontSize: '12px', 
      fontWeight: '600', 
      cursor: 'pointer',
      background: viewMode === mode ? 'white' : 'transparent',
      color: viewMode === mode ? '#1e293b' : '#64748b',
      boxShadow: viewMode === mode ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
      transition: '0.2s'
  });

  return (
    <div style={{background: '#F4F7F6', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', paddingBottom: '40px'}}>
      
      {/* Header */}
      <div style={{background: '#0f172a', padding: '30px 20px', borderBottomLeftRadius: '30px', borderBottomRightRadius: '30px', color: 'white', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto'}}>
            <div>
                <h2 style={{margin: 0, fontSize: '24px', color: '#F59E0B'}}>👑 Super Admin</h2>
                <p style={{margin: 0, opacity: 0.7, fontSize: '13px'}}>Business Intelligence Dashboard</p>
            </div>
            <button onClick={handleLogout} style={{background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>Logout</button>
        </div>
      </div>

      <div className="container" style={{maxWidth: '1000px', margin: '0 auto', padding: '0 20px'}}>
        
        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px'}}>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>💰</div>
                <div style={{fontSize: '18px', fontWeight: '800', color: '#10b981'}}>LKR {stats.revenue ? stats.revenue.toLocaleString() : 0}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Net Profit</div>
            </div>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>📅</div>
                <div style={{fontSize: '18px', fontWeight: '800', color: '#1e293b'}}>{stats.bookings}</div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Total Bookings</div>
            </div>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>🏆</div>
                <div style={{fontSize: '14px', fontWeight: '700', color: '#F59E0B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {stats.top_court ? stats.top_court.name : "No Data"}
                </div>
                <div style={{fontSize: '11px', color: '#64748b'}}>Best Seller ({stats.top_court ? stats.top_court.booking_count : 0})</div>
            </div>
            <div style={statCardStyle}>
                <div style={{fontSize: '24px', marginBottom: '5px'}}>👥</div>
                <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                    <span style={{fontSize: '14px', fontWeight: '700', color: '#3b82f6'}}>{stats.total_players || 0} <span style={{fontSize: '10px', color:'#94a3b8', fontWeight:'400'}}>Users</span></span>
                    <span style={{fontSize: '14px', fontWeight: '700', color: '#8b5cf6'}}>{stats.total_partners || 0} <span style={{fontSize: '10px', color:'#94a3b8', fontWeight:'400'}}>Partners</span></span>
                </div>
            </div>
        </div>

        {/* --- REVENUE CHART --- */}
        <div style={{background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <h3 style={{color: '#1e293b', fontSize: '16px', margin: 0}}>📈 Revenue Growth ({viewMode.charAt(0).toUpperCase() + viewMode.slice(1)})</h3>
                <div style={{background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex', gap: '5px'}}>
                    <button onClick={() => setViewMode('weekly')} style={getToggleStyle('weekly')}>Weekly</button>
                    <button onClick={() => setViewMode('monthly')} style={getToggleStyle('monthly')}>Monthly</button>
                    <button onClick={() => setViewMode('yearly')} style={getToggleStyle('yearly')}>Yearly</button>
                </div>
            </div>
            <div style={{width: '100%', height: 300}}>
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- ✅ NEW: PEAK HOURS BAR CHART --- */}
        <div style={{background: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
            <h3 style={{color: '#1e293b', fontSize: '16px', margin: '0 0 20px'}}>⏰ Peak Activity (Busiest Hours)</h3>
            <div style={{width: '100%', height: 250}}>
                <ResponsiveContainer>
                    <BarChart data={peakData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Split Grid for Management */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px'}}>
            {/* Pending Approvals */}
            <div>
                <h3 style={{color: '#1e293b', fontSize: '16px', margin: '0 0 15px'}}>🚨 Pending Approvals</h3>
                {pendingPartners.length === 0 ? (
                    <div style={emptyCardStyle}>✅ No pending approvals.</div>
                ) : (
                    <div style={cardContainerStyle}>
                        {pendingPartners.map(p => (
                            <div key={p.user_id} style={listItemStyle}>
                                <div>
                                    <div style={{fontWeight: '700', fontSize: '13px', color: '#1e293b'}}>{p.username}</div>
                                    {p.document_url && <a href={p.document_url} target="_blank" rel="noreferrer" style={{fontSize: '11px', color: '#3b82f6'}}>📄 View Doc</a>}
                                </div>
                                <div style={{display: 'flex', gap: '5px'}}>
                                    <button onClick={() => confirmVerification(p.user_id, 'approved')} style={{...btnStyle, background: '#00C853'}}>Approve</button>
                                    <button onClick={() => confirmVerification(p.user_id, 'rejected')} style={{...btnStyle, background: '#FF4444'}}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Commission Control */}
            <div>
                <h3 style={{color: '#1e293b', fontSize: '16px', margin: '0 0 15px'}}>💼 Partner Commissions</h3>
                <div style={cardContainerStyle}>
                    {activePartners.map(p => (
                        <div key={p.user_id} style={listItemStyle}>
                            <div>
                                <div style={{fontWeight: '700', fontSize: '13px', color: '#1e293b'}}>{p.username}</div>
                                <div style={{fontSize: '11px', color: '#64748b'}}>Rate: <span style={{fontWeight: 'bold', color: '#00C853'}}>{p.commission_rate}%</span></div>
                            </div>
                            <button onClick={() => openCommissionModal(p.user_id, p.commission_rate)} style={{...btnStyle, background: '#3b82f6'}}>Edit %</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* User Management Section */}
        <h3 style={{color: '#1e293b', fontSize: '16px', margin: '0 0 15px'}}>👥 User Management</h3>
        <div style={{background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
                <thead>
                    <tr style={{borderBottom: '2px solid #f1f5f9', color: '#64748b', textAlign: 'left'}}>
                        <th style={{padding: '10px'}}>User</th>
                        <th style={{padding: '10px'}}>Role</th>
                        <th style={{padding: '10px'}}>Status</th>
                        <th style={{padding: '10px'}}>Email</th>
                        <th style={{padding: '10px', textAlign: 'right'}}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {allUsers.map(u => (
                        <tr key={u.user_id} style={{borderBottom: '1px solid #f1f5f9'}}>
                            <td style={{padding: '15px 10px', fontWeight: '600', color: '#1e293b'}}>{u.username}</td>
                            <td style={{padding: '15px 10px'}}>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                                    background: u.role === 'partner' ? '#EDE9FE' : '#E0F2FE',
                                    color: u.role === 'partner' ? '#8B5CF6' : '#0369A1'
                                }}>
                                    {u.role.toUpperCase()}
                                </span>
                            </td>
                            <td style={{padding: '15px 10px', color: u.verification_status === 'approved' ? '#00C853' : '#F59E0B', fontWeight: '600'}}>{u.verification_status}</td>
                            <td style={{padding: '15px 10px', color: '#64748b'}}>{u.email}</td>
                            <td style={{padding: '15px 10px', textAlign: 'right'}}>
                                <button 
                                    onClick={() => confirmDeleteUser(u.user_id, u.username)}
                                    style={{background: 'rgba(255, 68, 68, 0.1)', color: '#FF4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: '0.2s'}}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      </div>

      {/* --- POPUP MODAL --- */}
      {modal.isOpen && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease'}}>
            <div style={{background: '#1e293b', padding: '30px', borderRadius: '20px', width: '85%', maxWidth: '350px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', textAlign: 'center', border: '1px solid #334155'}}>
                
                <div style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', background: (modal.type === 'delete' || (modal.type === 'verify' && modal.data.status === 'rejected')) ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)'}}>
                    {modal.type === 'delete' ? <span style={{fontSize: '24px'}}>🗑️</span> : 
                     modal.type === 'commission' ? <span style={{fontSize: '24px'}}>💰</span> : 
                     <span style={{fontSize: '24px'}}>⚠️</span>}
                </div>
                
                <h3 style={{margin: '0 0 10px', color: 'white'}}>{modal.title}</h3>
                <p style={{fontSize: '14px', color: '#94a3b8', marginBottom: '20px'}}>{modal.message}</p>

                {modal.type === 'commission' && (
                    <input type="number" value={commissionInput} onChange={(e) => setCommissionInput(e.target.value)} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #475569', background: '#0f172a', color: 'white', fontSize: '16px', textAlign: 'center', marginBottom: '20px', outline: 'none'}} placeholder="%" autoFocus />
                )}

                <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={closeModal} style={{flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
                    <button onClick={handleModalConfirm} style={{flex: 1, padding: '12px', background: (modal.type === 'delete' || (modal.type === 'verify' && modal.data.status === 'rejected')) ? '#FF4444' : '#00C853', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer'}}>
                        {modal.type === 'delete' ? 'Delete' : modal.type === 'commission' ? 'Update' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && <div style={{position: 'fixed', bottom: 30, right: 30, background: '#1e293b', color: 'white', padding: '15px 25px', borderRadius: '12px', zIndex: 1100, borderLeft: '4px solid #00C853'}}>✅ {successMessage}</div>}
    </div>
  );
}

// Styles
const statCardStyle = { background: 'white', padding: '20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const cardContainerStyle = { background: 'white', borderRadius: '15px', padding: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' };
const emptyCardStyle = { textAlign: 'center', padding: '20px', background: 'white', borderRadius: '15px', color: '#94a3b8', fontSize: '13px' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px' };
const btnStyle = { color: 'white', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' };

export default SuperAdminDashboard;