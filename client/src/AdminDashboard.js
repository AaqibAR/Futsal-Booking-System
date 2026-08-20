import React from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import PartnerDashboard from './PartnerDashboard';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  // Simple "Traffic Cop" Logic
  if (user.role === 'admin') {
    return <SuperAdminDashboard />;
  } else {
    return <PartnerDashboard />;
  }
}

export default AdminDashboard;