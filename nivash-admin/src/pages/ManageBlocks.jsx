import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { IoBusinessOutline, IoAddCircleOutline, IoPencilOutline, IoTrashOutline, IoCloseOutline } from 'react-icons/io5';

const ManageBlocks = () => {
  const [block, setBlock] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [editingId, setEditingId] = useState(null);

  const fetchFlats = async () => {
    try {
      const res = await API.get('/flats');
      setFlats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFlats(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/flats/${editingId}`, { block, flat_number: flatNumber });
        setMsg({ text: 'Flat updated successfully!', type: 'success' });
      } else {
        await API.post('/flats', { block, flat_number: flatNumber });
        setMsg({ text: 'Flat created successfully!', type: 'success' });
      }
      resetForm();
      fetchFlats();
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Failed to save flat.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Deleting this flat will break associated users and tickets. Are you sure?')) {
      try {
        await API.delete(`/flats/${id}`);
        fetchFlats();
      } catch (error) {
        setMsg({ text: 'Failed to delete flat.', type: 'error' });
      }
    }
  };

  const handleEdit = (flat) => {
    setBlock(flat.block);
    setFlatNumber(flat.flat_number);
    setEditingId(flat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setBlock('');
    setFlatNumber('');
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <IoBusinessOutline size={28} color="#007bff" style={{ marginRight: '12px' }} />
          <h2 style={styles.pageTitle}>Manage Society Structure</h2>
        </div>
        <p style={styles.subtitle}>Create, update, and manage the physical flats in your society.</p>
      </div>

      {msg.text && (
        <div style={{ ...styles.alert, backgroundColor: msg.type === 'success' ? '#d1e7dd' : '#f8d7da', color: msg.type === 'success' ? '#0f5132' : '#842029' }}>
          {msg.text}
        </div>
      )}

      {/* Form Card */}
      <div style={{ ...styles.formCard, borderTop: editingId ? '4px solid #fd7e14' : '4px solid #007bff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Edit Flat Details' : 'Register New Flat'}</h3>
          {editingId && (
            <button onClick={resetForm} style={styles.cancelBtn}>
              <IoCloseOutline size={18} /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Block Name (e.g., A, B, Tower 1)</label>
            <input type="text" value={block} onChange={(e) => setBlock(e.target.value)} required style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Flat Number (e.g., 101, 504)</label>
            <input type="text" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required style={styles.input} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ ...styles.button, backgroundColor: editingId ? '#fd7e14' : '#007bff' }}>
              {editingId ? <IoPencilOutline size={18} style={{ marginRight: '8px' }}/> : <IoAddCircleOutline size={18} style={{ marginRight: '8px' }}/>}
              {editingId ? 'Update Flat' : 'Add Flat'}
            </button>
          </div>
        </form>
      </div>

      {/* Premium Table */}
      {loading ? (
        <p>Loading flats...</p>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Block Name</th>
                <th style={styles.th}>Flat Number</th>
                <th style={styles.th}>Database ID</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flats.length === 0 ? (
                <tr><td colSpan="4" style={styles.emptyState}>No flats registered yet.</td></tr>
              ) : (
                flats.map(flat => (
                  <tr key={flat._id} style={styles.tr}>
                    <td style={styles.td}><strong>Block {flat.block}</strong></td>
                    <td style={styles.td}>Flat {flat.flat_number}</td>
                    <td style={styles.td}><code style={styles.code}>{flat._id}</code></td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(flat)} style={styles.iconBtn} title="Edit">
                        <IoPencilOutline size={18} color="#007bff" />
                      </button>
                      <button onClick={() => handleDelete(flat._id)} style={styles.iconBtn} title="Delete">
                        <IoTrashOutline size={18} color="#dc3545" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { fontFamily: '"Inter", sans-serif', animation: 'fadeIn 0.4s ease-in' },
  headerArea: { marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  pageTitle: { margin: 0, fontSize: '24px', color: '#1a1a1a', fontWeight: '700' },
  subtitle: { margin: 0, color: '#666', fontSize: '15px' },
  alert: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' },
  
  formCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', marginBottom: '30px' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', backgroundColor: '#f8f9fa' },
  button: { display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', height: '45px' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' },
  
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px 24px', backgroundColor: '#f8f9fa', color: '#6c757d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '16px 24px', verticalAlign: 'middle', fontSize: '15px', color: '#333' },
  code: { backgroundColor: '#f4f4f4', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: '#d63384' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginRight: '8px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }
};

export default ManageBlocks;