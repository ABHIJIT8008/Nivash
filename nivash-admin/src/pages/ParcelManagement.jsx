import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParcelManagement = () => {
  const [parcels, setParcels] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for the OTP Verification Modal
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  // States for the Log New Package Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [newParcel, setNewParcel] = useState({ flat_id: '', delivery_company: '' });
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchParcels();
    fetchFlats(); // Fetch flats so we can populate the dropdown!
  }, []);

  const fetchParcels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/parcels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setParcels(data);
    } catch (error) {
      console.error('Error fetching parcels', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/flats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlats(data);
    } catch (error) {
      console.error('Error fetching flats', error);
    }
  };

  // --- HANDLER: Log a new package (Replaces Postman!) ---
  const handleLogPackage = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/api/parcels', newParcel, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('📦 Package Logged! The resident has been notified with their OTP.');
      setShowLogModal(false);
      setNewParcel({ flat_id: '', delivery_company: '' }); // Reset form
      fetchParcels(); // Refresh the table to show the new package
    } catch (error) {
      alert(`❌ Error logging package: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setLogging(false);
    }
  };

  // --- HANDLER: Verify the Resident's OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/parcels/${selectedParcel._id}/verify`, 
        { otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert('✅ OTP Verified! Hand over the package.');
      setSelectedParcel(null);
      setOtpInput('');
      fetchParcels(); 
    } catch (error) {
      alert(`❌ Verification Failed: ${error.response?.data?.message || 'Invalid OTP'}`);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div>Loading Gate Desk...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📦 Gate Desk: Parcel Management</h2>
        
        {/* The button now opens our new Log Modal */}
        <button style={styles.logBtn} onClick={() => setShowLogModal(true)}>
          + Log New Package
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
            <th style={styles.th}>Flat</th>
            <th style={styles.th}>Delivery Company</th>
            <th style={styles.th}>Arrived</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {parcels.map((parcel) => (
            <tr key={parcel._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>
                {/* FIX 1: number changed to flat_number */}
                <strong>{parcel.flat_id?.block}-{parcel.flat_id?.flat_number}</strong>
              </td>
              <td style={styles.td}>{parcel.delivery_company}</td>
              <td style={styles.td}>{new Date(parcel.createdAt).toLocaleString()}</td>
              <td style={styles.td}>
                <span style={parcel.status === 'Collected' ? styles.badgeGreen : styles.badgeOrange}>
                  {parcel.status}
                </span>
              </td>
              <td style={styles.td}>
                {parcel.status === 'Pending' ? (
                  <button style={styles.verifyBtn} onClick={() => setSelectedParcel(parcel)}>
                    Enter OTP
                  </button>
                ) : (
                  <span style={{ color: '#888', fontSize: '14px' }}>Claimed</span>
                )}
              </td>
            </tr>
          ))}
          {parcels.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No packages logged at the gate.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- MODAL 1: LOG NEW PACKAGE --- */}
      {showLogModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Log Arriving Package</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Record a delivery to automatically notify the resident.</p>
            
            <form onSubmit={handleLogPackage} style={{ textAlign: 'left', marginTop: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Flat Destination:</label>
                <select 
                  style={styles.input} 
                  value={newParcel.flat_id}
                  onChange={(e) => setNewParcel({...newParcel, flat_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Flat --</option>
                  {flats.map(flat => (
                    <option key={flat._id} value={flat._id}>
                      {/* FIX 2: number changed to flat_number */}
                      Block {flat.block} - Flat {flat.flat_number}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Delivery Company:</label>
                <input 
                  type="text" 
                  style={styles.input}
                  placeholder="e.g., Amazon, Swiggy, BlueDart"
                  value={newParcel.delivery_company}
                  onChange={(e) => setNewParcel({...newParcel, delivery_company: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="button" onClick={() => setShowLogModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.logBtn} disabled={logging}>
                  {logging ? 'Logging...' : 'Notify Resident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VERIFY OTP --- */}
      {selectedParcel && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Verify Gate Pass</h3>
            {/* FIX 3: number changed to flat_number */}
            <p>Enter the 4-digit code from Resident <strong>{selectedParcel.flat_id?.block}-{selectedParcel.flat_id?.flat_number}</strong></p>
            
            <form onSubmit={handleVerifyOTP}>
              <input 
                type="text" 
                maxLength="4"
                placeholder="0000"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                style={styles.otpInput}
                autoFocus
                required
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setSelectedParcel(null)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn} disabled={verifying}>
                  {verifying ? 'Checking...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { padding: '15px', borderBottom: '2px solid #dee2e6' },
  td: { padding: '15px' },
  logBtn: { backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  verifyBtn: { backgroundColor: '#198754', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
  badgeOrange: { backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeGreen: { backgroundColor: '#d1e7dd', color: '#0f5132', padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  otpInput: { width: '100px', fontSize: '30px', textAlign: 'center', letterSpacing: '5px', padding: '10px', border: '2px solid #ccc', borderRadius: '8px', marginTop: '10px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#e9ecef', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  submitBtn: { flex: 2, padding: '10px', backgroundColor: '#198754', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }
};

export default ParcelManagement;