import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { 
  IoPeopleOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline, 
  IoTimeOutline,
  IoPersonOutline
} from 'react-icons/io5';

const MasterVisitorLog = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllVisitors = async () => {
      try {
        const response = await API.get('/visitors');
        setVisitors(response.data);
      } catch (error) {
        console.error('Failed to fetch master visitor list', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllVisitors();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#d1e7dd', color: '#0f5132' }}>
            <IoCheckmarkCircleOutline style={styles.badgeIcon} /> Approved
          </span>
        );
      case 'Denied':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#f8d7da', color: '#842029' }}>
            <IoCloseCircleOutline style={styles.badgeIcon} /> Denied
          </span>
        );
      case 'Pending':
      default:
        return (
          <span style={{ ...styles.badge, backgroundColor: '#fff3cd', color: '#856404' }}>
            <IoTimeOutline style={styles.badgeIcon} /> Pending
          </span>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <IoPeopleOutline size={28} color="#007bff" style={{ marginRight: '12px' }} />
          <h2 style={styles.pageTitle}>Master Visitor Log</h2>
        </div>
        <p style={styles.subtitle}>Complete history of all society entries and resident decisions.</p>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading visitor history...</p>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Photo</th>
                <th style={styles.th}>Visitor Details</th>
                <th style={styles.th}>Visiting Flat</th>
                <th style={styles.th}>Entry Status</th>
              </tr>
            </thead>
            <tbody>
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>No visitors logged in the system yet.</td>
                </tr>
              ) : (
                visitors.map(visitor => (
                  <tr key={visitor._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.dateText}>{new Date(visitor.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={styles.timeText}>{new Date(visitor.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={styles.td}>
                      {visitor.photo_url ? (
                        <img src={visitor.photo_url} alt="Visitor" style={styles.photo} />
                      ) : (
                        <div style={styles.placeholderPhoto}><IoPersonOutline size={20} color="#aaa" /></div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.visitorName}>{visitor.visitor_name}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.flatInfo}>
                        {visitor.visiting_flat_id ? `Block ${visitor.visiting_flat_id.block} - Flat ${visitor.visiting_flat_id.flat_number}` : 'Unknown Flat'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {renderStatusBadge(visitor.status)}
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
  
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  
  th: { padding: '16px 24px', backgroundColor: '#f8f9fa', color: '#6c757d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s' },
  td: { padding: '16px 24px', verticalAlign: 'middle' },
  
  dateText: { color: '#333', fontSize: '14px', fontWeight: '600', marginBottom: '4px' },
  timeText: { color: '#888', fontSize: '13px' },
  
  photo: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' },
  placeholderPhoto: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f4f6f8', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid #e9ecef' },
  
  visitorName: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a' },
  flatInfo: { fontSize: '14px', color: '#555', fontWeight: '500' },
  
  badge: { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  badgeIcon: { marginRight: '6px', fontSize: '14px' },
  
  emptyState: { textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }
};

export default MasterVisitorLog;