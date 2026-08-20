import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MaintenanceModal = ({ courtId, onClose }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [reason, setReason] = useState("Renovations");
    const [loading, setLoading] = useState(false);
    
    // --- NEW: State to store existing blocks ---
    const [existingBlocks, setExistingBlocks] = useState([]);

    // Fetch existing blocks when modal opens
    useEffect(() => {
        fetchBlocks();
    }, [courtId]);

    const fetchBlocks = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/maintenance/${courtId}`);
            setExistingBlocks(res.data);
        } catch (error) {
            console.error("Error fetching blocks", error);
        }
    };

    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const handleBlock = async () => {
        if (!startDate || !endDate) return alert("⚠️ Please select a Start and End date.");

        setLoading(true);
        // Format to YYYY-MM-DD (Local Time)
        const format = (d) => {
            const offset = d.getTimezoneOffset();
            const local = new Date(d.getTime() - (offset*60*1000));
            return local.toISOString().split('T')[0];
        };

        try {
            await axios.post('http://localhost:3001/maintenance', {
                court_id: courtId,
                startDate: format(startDate),
                endDate: format(endDate),
                reason: reason
            });
            alert("✅ Dates Blocked Successfully!");
            
            // Refresh the list immediately so user sees it
            fetchBlocks();
            // Reset fields
            setStartDate(new Date());
            setEndDate(null);
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to block dates";
            alert("❌ " + msg);
        } finally {
            setLoading(false);
        }
    };

    // --- NEW: Handle Unblock ---
    const handleUnblock = async (id) => {
        if(!window.confirm("Are you sure you want to unblock this date?")) return;
        try {
            await axios.delete(`http://localhost:3001/maintenance/${id}`);
            fetchBlocks(); // Refresh list
        } catch (error) {
            alert("Error removing block.");
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>🚧 Manage Maintenance</h3>
                <p style={{color: '#666', fontSize: '13px', margin: '0 0 15px'}}>Add new blocks or remove existing ones.</p>
                
                {/* --- LEFT SIDE: ADD NEW BLOCK --- */}
                <div style={{display: 'flex', gap: '20px', textAlign: 'left'}}>
                    <div style={{flex: 1}}>
                        <h4 style={{fontSize: '14px', margin: '0 0 10px'}}>Add New Block</h4>
                        <div style={{marginBottom: '15px', display: 'flex', justifyContent: 'center'}}>
                            <DatePicker
                                selected={startDate}
                                onChange={onChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                minDate={new Date()}
                            />
                        </div>

                        <select style={styles.select} value={reason} onChange={(e) => setReason(e.target.value)}>
                            <option value="Renovations">Renovations</option>
                            <option value="Cleaning">Deep Cleaning</option>
                            <option value="Personal">Personal Use</option>
                        </select>

                        <button onClick={handleBlock} style={styles.confirmBtn} disabled={loading}>
                            {loading ? "Processing..." : "Confirm Block"}
                        </button>
                    </div>

                    {/* --- RIGHT SIDE: EXISTING BLOCKS LIST --- */}
                    <div style={{flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px', maxHeight: '400px', overflowY: 'auto'}}>
                        <h4 style={{fontSize: '14px', margin: '0 0 10px'}}>Active Blocks</h4>
                        {existingBlocks.length === 0 && <p style={{fontSize: '12px', color: '#999'}}>No dates blocked currently.</p>}
                        
                        {existingBlocks.map(block => (
                            <div key={block.id} style={styles.blockItem}>
                                <div>
                                    <div style={{fontWeight: 'bold', fontSize: '13px', color: '#e74c3c'}}>
                                        {new Date(block.date).toDateString()}
                                    </div>
                                    <div style={{fontSize: '11px', color: '#999'}}>{block.reason}</div>
                                </div>
                                <button onClick={() => handleUnblock(block.id)} style={styles.deleteBtn}>🗑</button>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={onClose} style={styles.closeBtn}>Close Window</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '15px', width: '700px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }, // Made modal wider
    select: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' },
    confirmBtn: { width: '100%', padding: '10px', border: 'none', background: '#e74c3c', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    closeBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' },
    
    // New Styles for the List
    blockItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#FFF5F5', borderRadius: '8px', marginBottom: '8px', border: '1px solid #FFE0E0' },
    deleteBtn: { background: 'white', border: '1px solid #ffcccc', borderRadius: '5px', cursor: 'pointer', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }
};

export default MaintenanceModal;