import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { 
  IoPeopleOutline, 
  IoPersonAddOutline, 
  IoShieldCheckmarkOutline, 
  IoHomeOutline, 
  IoStarOutline,
  IoTrashOutline 
} from 'react-icons/io5';

const PreSeedUsers = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Owner');
  const [flatId, setFlatId] = useState('');
  
  const [users, setUsers] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Fetch both the Users list and the Flats list (for the dropdown)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, flatsRes] = await Promise.all([
          API.get('/users'), // Assuming you have a GET /api/users route
          API.get('/flats')
        ]);
        setUsers(usersRes.data);
        setFlats(flatsRes.data);
        if (flatsRes.data.length > 0) setFlatId(flatsRes.data[0]._id);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    try {
      const payload = { name, phone, role };
      // Only attach a flat_id if they are a Resident (Owner)
      if (role === 'Owner') {
        payload.flat_id = flatId;
      }

      await API.post('/users', payload);
      setMsg({ text: 'User pre-seeded successfully!', type: 'success' });
      
      setName('');
      setPhone('');
      
      // Refresh user list
      const updatedUsers = await API.get('/users');
      setUsers(updatedUsers.data);
      
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (error) {
      setMsg({ text: error.response?.data?.message || 'Failed to create user.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/users/${id}`); // Assumes you have a DELETE /api/users/:id route
        setUsers(users.filter(user => user._id !== id));
      } catch (error) {
        setMsg({ text: 'Failed to delete user.', type: 'error' });
      }
    }
  };

  // Helper to render role badges with specific colors and icons
  const renderRoleBadge = (userRole) => {
    switch (userRole) {
      case 'Admin':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#e0cffc', color: '#4b2893' }}>
            <IoStarOutline style={styles.badgeIcon} /> Admin
          </span>
        );
      case 'Security':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#cfe2ff', color: '#084298' }}>
            <IoShieldCheckmarkOutline style={styles.badgeIcon} /> Security
          </span>
        );
      case 'Owner':
      default:
        return (
          <span style={{ ...styles.badge, backgroundColor: '#d1e7dd', color: '#0f5132' }}>
            <IoHomeOutline style={styles.badgeIcon} /> Owner
          </span>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <IoPeopleOutline size={28} color="#007bff" style={{ marginRight: '12px' }} />
          <h2 style={styles.pageTitle}>User Management</h2>
        </div>
        <p style={styles.subtitle}>Pre-register residents, security guards, and admins before they log in.</p>
      </div>

      {msg.text && (
        <div style={{ ...styles.alert, backgroundColor: msg.type === 'success' ? '#d1e7dd' : '#f8d7da', color: msg.type === 'success' ? '#0f5132' : '#842029' }}>
          {msg.text}
        </div>
      )}

      {/* --- REGISTRATION FORM --- */}
      <div style={styles.formCard}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Register New User</h3>
        </div>

        <form onSubmit={handleSubmit} style={styles.formRow}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., John Doe" style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (Login ID)</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g., 9876543210" style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select}>
              <option value="Owner">Resident (Owner)</option>
              <option value="Security">Security Guard</option>
              <option value="Admin">Management (Admin)</option>
            </select>
          </div>

          {/* Smart Field: Only show if Resident is selected */}
          {role === 'Owner' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Assign to Flat</label>
              <select value={flatId} onChange={(e) => setFlatId(e.target.value)} style={styles.select} required>
                {flats.length === 0 ? (
                  <option value="">No flats available</option>
                ) : (
                  flats.map(flat => (
                    <option key={flat._id} value={flat._id}>Block {flat.block} - Flat {flat.flat_number}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '10px' }}>
            <button type="submit" style={styles.button}>
              <IoPersonAddOutline size={18} style={{ marginRight: '8px' }} />
              Create User
            </button>
          </div>
        </form>
      </div>

      {/* --- USERS TABLE --- */}
      {loading ? (
        <p style={{ color: '#666' }}>Loading users...</p>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone Number</th>
                <th style={styles.th}>System Role</th>
                <th style={styles.th}>Assigned Flat</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" style={styles.emptyState}>No users registered yet.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}><strong>{u.name}</strong></td>
                    <td style={styles.td}>{u.phone}</td>
                    <td style={styles.td}>
                      {renderRoleBadge(u.role)}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.flatInfo}>
                        {u.role === 'Owner' && u.flat_id 
                          ? `Block ${u.flat_id.block} - Flat ${u.flat_id.flat_number}` 
                          : 'N/A'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleDelete(u._id)} style={styles.iconBtn} title="Delete User">
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
  
  formCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', marginBottom: '30px', borderTop: '4px solid #007bff' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', backgroundColor: '#f8f9fa' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', backgroundColor: '#f8f9fa', color: '#333', cursor: 'pointer' },
  button: { display: 'flex', alignItems: 'center', padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', height: '47px' },
  
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px 24px', backgroundColor: '#f8f9fa', color: '#6c757d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '16px 24px', verticalAlign: 'middle', fontSize: '15px', color: '#333' },
  
  badge: { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  badgeIcon: { marginRight: '6px', fontSize: '14px' },
  flatInfo: { fontSize: '14px', color: '#555', fontWeight: '500' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }
};

export default PreSeedUsers;