import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { IoMegaphoneOutline, IoSendOutline, IoNotificationsOutline, IoTrashOutline, IoPencilOutline, IoCloseOutline } from 'react-icons/io5';

const NoticeBoard = () => {
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  
  // NEW: State for Edit Mode
  const [editingId, setEditingId] = useState(null);

  const fetchNotices = async () => {
    try {
      const response = await API.get('/notices');
      setNotices(response.data);
    } catch (error) {
      setStatusMsg({ text: 'Failed to load notices.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ text: '', type: '' });

    if (!title || !messageText) {
      setStatusMsg({ text: 'Please fill out both fields.', type: 'error' });
      return;
    }

    try {
      if (editingId) {
        // UPDATE EXISTING NOTICE
        await API.put(`/notices/${editingId}`, { title, message: messageText });
        setStatusMsg({ text: 'Notice updated successfully!', type: 'success' });
      } else {
        // CREATE NEW NOTICE
        await API.post('/notices', { title, message: messageText });
        setStatusMsg({ text: 'Notice published successfully!', type: 'success' });
      }
      
      resetForm();
      fetchNotices();
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
    } catch (error) {
      setStatusMsg({ text: 'Failed to save notice.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await API.delete(`/notices/${id}`);
        fetchNotices();
      } catch (error) {
        setStatusMsg({ text: 'Failed to delete notice.', type: 'error' });
      }
    }
  };

  const handleEdit = (notice) => {
    setTitle(notice.title);
    setMessageText(notice.message);
    setEditingId(notice._id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back up to the form
  };

  const resetForm = () => {
    setTitle('');
    setMessageText('');
    setEditingId(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <IoMegaphoneOutline size={28} color="#007bff" style={{ marginRight: '12px' }} />
          <h2 style={styles.pageTitle}>Admin Notice Board</h2>
        </div>
        <p style={styles.subtitle}>Broadcast important announcements directly to residents' phones.</p>
      </div>

      {statusMsg.text && (
        <div style={{ ...styles.alert, backgroundColor: statusMsg.type === 'success' ? '#d1e7dd' : '#f8d7da', color: statusMsg.type === 'success' ? '#0f5132' : '#842029' }}>
          {statusMsg.text}
        </div>
      )}

      {/* --- PUBLISH / EDIT FORM --- */}
      <div style={{ ...styles.formCard, borderTop: editingId ? '4px solid #fd7e14' : '4px solid #007bff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
          {editingId && (
            <button onClick={resetForm} style={styles.cancelBtn}>
              <IoCloseOutline size={18} /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Announcement Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Scheduled Water Supply Interruption" style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Message Details</label>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your detailed announcement here..." rows="4" style={{ ...styles.input, resize: 'vertical' }} />
          </div>

          <button type="submit" style={{ ...styles.button, backgroundColor: editingId ? '#fd7e14' : '#007bff' }}>
            <IoSendOutline size={18} style={{ marginRight: '8px' }} />
            {editingId ? 'Update Announcement' : 'Publish to Residents'}
          </button>
        </form>
      </div>

      <div style={styles.feedHeaderRow}>
        <IoNotificationsOutline size={22} color="#555" style={{ marginRight: '8px' }} />
        <h3 style={styles.feedTitle}>Past Announcements</h3>
      </div>

      {/* --- NOTICE HISTORY FEED --- */}
      {loading ? (
        <p style={{ color: '#666' }}>Loading announcements...</p>
      ) : notices.length === 0 ? (
        <div style={styles.emptyCard}>No announcements have been published yet.</div>
      ) : (
        <div style={styles.feed}>
          {notices.map((notice) => (
            <div key={notice._id} style={styles.noticeCard}>
              <div style={styles.noticeHeader}>
                <div>
                  <h4 style={styles.noticeCardTitle}>{notice.title}</h4>
                  <span style={styles.noticeDate}>
                    {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {/* EDIT & DELETE BUTTONS */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(notice)} style={styles.actionBtn}>
                    <IoPencilOutline size={18} color="#007bff" />
                  </button>
                  <button onClick={() => handleDelete(notice._id)} style={styles.actionBtn}>
                    <IoTrashOutline size={18} color="#dc3545" />
                  </button>
                </div>
              </div>
              <p style={styles.noticeBody}>{notice.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reusing your excellent existing styles + a few new ones for the buttons
const styles = {
  container: { fontFamily: '"Inter", sans-serif', animation: 'fadeIn 0.4s ease-in', maxWidth: '900px' },
  headerArea: { marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', marginBottom: '8px' },
  pageTitle: { margin: 0, fontSize: '24px', color: '#1a1a1a', fontWeight: '700' },
  subtitle: { margin: 0, color: '#666', fontSize: '15px' },
  alert: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', fontSize: '14px' },
  
  formCard: { backgroundColor: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', marginBottom: '40px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '15px', color: '#333', backgroundColor: '#f8f9fa' },
  button: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', width: 'max-content' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' },
  
  feedHeaderRow: { display: 'flex', alignItems: 'center', marginBottom: '16px' },
  feedTitle: { margin: 0, fontSize: '18px', color: '#333', fontWeight: '700' },
  feed: { display: 'flex', flexDirection: 'column', gap: '16px' },
  
  noticeCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', borderLeft: '6px solid #007bff', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' },
  noticeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  noticeCardTitle: { margin: 0, fontSize: '18px', color: '#1a1a1a', fontWeight: '700' },
  noticeDate: { fontSize: '13px', color: '#888', fontWeight: '500' },
  noticeBody: { margin: '0', fontSize: '15px', color: '#555', lineHeight: '1.5' },
  
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', transition: 'background 0.2s' },
  emptyCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', color: '#888', fontStyle: 'italic', border: '1px dashed #ccc' }
};

export default NoticeBoard;