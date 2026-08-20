import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import all pages
import Login from './Login';
import Signup from './Signup';
import Home from './Home';
import MyBookings from './MyBookings';
import Profile from './Profile';
import Favorites from './Favorites';
import Refunds from './Refunds';
import AccountDetails from './AccountDetails';
import PartnerSignup from './PartnerSignup';
import Notifications from './Notifications';

// Import Admin Pages
import AdminDashboard from './AdminDashboard';
import AddCourt from './AddCourt';
import AdminProfile from './AdminProfile'; // <--- Import this
import AdminBookings from './AdminBookings'; // <--- Import this
import PartnerDashboard from './PartnerDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Player Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/account" element={<AccountDetails />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-court" element={<AddCourt />} />
        <Route path="/partner-signup" element={<PartnerSignup />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/admin-bookings" element={<AdminBookings />} />
        <Route path="/partner" element={<PartnerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;