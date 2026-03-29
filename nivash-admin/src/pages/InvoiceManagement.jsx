import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoCheckmarkCircleOutline, IoTimeOutline, IoWalletOutline } from 'react-icons/io5';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for the Bulk Generation Modal
  const [showModal, setShowModal] = useState(false);
  const [bulkData, setBulkData] = useState({ title: '', amount: '', dueDate: '' });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:5000/api/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/api/invoices/bulk', bulkData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Bulk invoices generated successfully for all flats!');
      setShowModal(false);
      setBulkData({ title: '', amount: '', dueDate: '' });
      fetchInvoices(); 
    } catch (error) {
      alert(`❌ Error generating invoices: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm("Verify that you have received this payment via Cash/UPI?")) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/invoices/${id}/status`, 
        { status: 'Paid' },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchInvoices(); // Refresh table
    } catch (error) {
      alert('Failed to update invoice status.');
    }
  };

  const renderBadge = (status) => {
    if (status === 'Paid') return <span style={styles.badgeGreen}><IoCheckmarkCircleOutline /> Paid</span>;
    if (status === 'Overdue') return <span style={styles.badgeRed}><IoTimeOutline /> Overdue</span>;
    return <span style={styles.badgeYellow}><IoTimeOutline /> Pending</span>;
  };

  if (loading) return <div>Loading Financial Data...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>💳 Financial Management</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>Manage society maintenance and track offline payments.</p>
        </div>
        
        <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>
          <IoWalletOutline style={{ marginRight: '8px' }} />
          Generate Bulk Invoices
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
            <th style={styles.th}>Flat</th>
            <th style={styles.th}>Invoice Title</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Due Date</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Admin Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={styles.td}>
                <strong>{inv.flat_id?.block}-{inv.flat_id?.flat_number}</strong>
              </td>
              <td style={styles.td}>{inv.title}</td>
              <td style={styles.td}>₹{inv.amount}</td>
              <td style={styles.td}>{new Date(inv.dueDate).toLocaleDateString()}</td>
              <td style={styles.td}>{renderBadge(inv.status)}</td>
              <td style={styles.td}>
                {inv.status !== 'Paid' ? (
                  <button style={styles.verifyBtn} onClick={() => handleMarkAsPaid(inv._id)}>
                    Mark as Paid (Cash/UPI)
                  </button>
                ) : (
                  <span style={{ color: '#198754', fontSize: '13px', fontWeight: 'bold' }}>
                    Verified on {new Date(inv.paidAt).toLocaleDateString()}
                  </span>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                No invoices found. Generate a bulk invoice to begin.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- MODAL: GENERATE BULK INVOICES --- */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Generate Maintenance Bills</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              This will create a new pending invoice for every single registered flat in the society.
            </p>
            
            <form onSubmit={handleBulkGenerate} style={{ textAlign: 'left' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Bill Title (e.g., March 2026 Maintenance):</label>
                <input 
                  type="text" 
                  style={styles.input}
                  value={bulkData.title}
                  onChange={(e) => setBulkData({...bulkData, title: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount per Flat (₹):</label>
                <input 
                  type="number" 
                  style={styles.input}
                  value={bulkData.amount}
                  onChange={(e) => setBulkData({...bulkData, amount: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Due Date:</label>
                <input 
                  type="date" 
                  style={styles.input}
                  value={bulkData.dueDate}
                  onChange={(e) => setBulkData({...bulkData, dueDate: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.primaryBtn} disabled={generating}>
                  {generating ? 'Processing...' : 'Generate & Send to All Flats'}
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
  th: { padding: '15px', borderBottom: '2px solid #dee2e6', color: '#444' },
  td: { padding: '15px', verticalAlign: 'middle' },
  
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  verifyBtn: { backgroundColor: '#198754', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#e9ecef', border: 'none', borderRadius: '5px', cursor: 'pointer', color: '#333', fontWeight: 'bold' },
  
  badgeGreen: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#d1e7dd', color: '#0f5132', padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeRed: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f8d7da', color: '#842029', padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeYellow: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff3cd', color: '#856404', padding: '5px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', padding: '30px', borderRadius: '10px', width: '450px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '14px', boxSizing: 'border-box' }
};

export default InvoiceManagement;