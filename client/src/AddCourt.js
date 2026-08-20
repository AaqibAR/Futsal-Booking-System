import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCourt() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null); // Store the file
  const [previewUrl, setPreviewUrl] = useState(''); // To show preview
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Create a temporary preview URL
    }
  };

  const handleSubmit = async () => {
    if(!name || !location || !price || !imageFile) return alert("Please fill all fields and upload an image");
    
    // We must use FormData to send files
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('price', price);
    formData.append('owner_id', user.user_id);
    formData.append('image', imageFile); // 'image' must match backend 'upload.single("image")'

    try {
        await axios.post('http://localhost:3001/courts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Required for files
        });
        alert("✅ Facility Added Successfully!");
        navigate('/admin');
    } catch (error) {
        alert("Error uploading court");
    }
  };

  return (
    <div className="container" style={{padding: '30px'}}>
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <h2 style={{margin: 0, color: '#1e293b'}}>Add Facility 🏟️</h2>
        <p style={{color: '#64748b', fontSize: '14px'}}>Expand your sports empire</p>
      </div>
      
      <label className="form-label">Facility Name</label>
      <input className="login-input" placeholder="e.g. Royal Futsal Arena" onChange={e => setName(e.target.value)} />

      <label className="form-label">Location</label>
      <input className="login-input" placeholder="e.g. Colombo 07" onChange={e => setLocation(e.target.value)} />

      <label className="form-label">Price Per Hour (LKR)</label>
      <input className="login-input" type="number" placeholder="4500" onChange={e => setPrice(e.target.value)} />

      {/* --- FILE INPUT --- */}
      <label className="form-label">Facility Photo</label>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        className="login-input"
        style={{padding: '10px'}}
      />

      {/* Image Preview */}
      <div style={{marginTop: '10px', borderRadius: '15px', overflow: 'hidden', height: '160px', border: '2px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
        {previewUrl ? (
            <img src={previewUrl} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
            <span style={{color: '#94a3b8', fontSize: '13px'}}>Preview will appear here</span>
        )}
      </div>

      <button className="btn" onClick={handleSubmit} style={{marginTop: '20px', background: '#1e293b'}}>Save Facility</button>
      <button onClick={() => navigate('/admin')} style={{width: '100%', border: 'none', background: 'none', color: '#64748b', marginTop: '15px', cursor: 'pointer', fontWeight: '600'}}>Cancel</button>
    </div>
  );
}

export default AddCourt;