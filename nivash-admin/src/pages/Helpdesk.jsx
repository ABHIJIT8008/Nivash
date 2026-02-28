import { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { 
  IoBuildOutline, 
  IoCheckmarkCircleOutline, 
  IoTimeOutline, 
  IoAlertCircleOutline 
} from 'react-icons/io5';

const Helpdesk = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchAllTickets = async () => {
    try {
      const response = await API.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      setMessage({ text: 'Failed to load tickets.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await API.put(`/tickets/${ticketId}`, { status: newStatus });
      setMessage({ text: `Ticket marked as ${newStatus}`, type: 'success' });
      
      setTickets(tickets.map(ticket => 
        ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));

      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Failed to update ticket', error);
      setMessage({ text: 'Failed to update ticket status.', type: 'error' });
    }
  };

  // Helper function to render beautiful status badges
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#d1e7dd', color: '#0f5132' }}>
            <IoCheckmarkCircleOutline style={styles.badgeIcon} /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ ...styles.badge, backgroundColor: '#fff3cd', color: '#856404' }}>
            <IoTimeOutline style={styles.badgeIcon} /> In Progress
          </span>
        );
      case 'Open':
      default:
        return (
          <span style={{ ...styles.badge, backgroundColor: '#f8d7da', color: '#842029' }}>
            <IoAlertCircleOutline style={styles.badgeIcon} /> Open
          </span>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <IoBuildOutline size={28} color="#007bff" style={{ marginRight: '12px' }} />
          <h2 style={styles.pageTitle}>Maintenance Helpdesk</h2>
        </div>
        <p style={styles.subtitle}>Review, manage, and resolve resident issues.</p>
      </div>

      {message.text && (
        <div style={{ ...styles.alert, backgroundColor: message.type === 'success' ? '#d1e7dd' : '#f8d7da', color: message.type === 'success' ? '#0f5132' : '#842029' }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Loading tickets...</p>
      ) : (
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Resident Info</th>
                <th style={styles.th}>Issue Details</th>
                <th style={styles.th}>Current Status</th>
                <th style={styles.th}>Update Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>No tickets found in the system.</td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket._id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.dateText}>
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.residentName}>{ticket.raised_by?.name || 'Unknown User'}</div>
                      <div style={styles.flatInfo}>
                        Block {ticket.flat_id?.block} - Flat {ticket.flat_id?.flat_number}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ticketTitle}>{ticket.title}</div>
                      <div style={styles.ticketDesc}>{ticket.description}</div>
                    </td>
                    <td style={styles.td}>
                      {renderStatusBadge(ticket.status)}
                    </td>
                    <td style={styles.td}>
                      <select 
                        value={ticket.status} 
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="Open">Set as Open</option>
                        <option value="In Progress">Set In Progress</option>
                        <option value="Resolved">Mark Resolved</option>
                      </select>
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
  
  alert: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600', fontSize: '14px', border: '1px solid transparent' },
  
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  
  th: { padding: '16px 24px', backgroundColor: '#f8f9fa', color: '#6c757d', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef', transition: 'background-color 0.2s' },
  td: { padding: '16px 24px', verticalAlign: 'middle' },
  
  dateText: { color: '#555', fontSize: '14px', fontWeight: '500' },
  
  residentName: { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  flatInfo: { fontSize: '13px', color: '#888' },
  
  ticketTitle: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' },
  ticketDesc: { fontSize: '13px', color: '#666', lineHeight: '1.4', maxWidth: '300px' },
  
  badge: { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.3px' },
  badgeIcon: { marginRight: '6px', fontSize: '14px' },
  
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ced4da', backgroundColor: '#fff', color: '#495057', fontSize: '13px', fontWeight: '500', cursor: 'pointer', outline: 'none' },
  
  emptyState: { textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }
};

export default Helpdesk;