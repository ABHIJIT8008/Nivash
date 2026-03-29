import { useState, useEffect, useContext } from 'react';
import API from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { 
  IoBusinessOutline, 
  IoWarningOutline, 
  IoPeopleOutline, 
  IoMegaphoneOutline,
  IoLogOutOutline
} from 'react-icons/io5';

const Dashboard = () => {
  const { logout } = useContext(AuthContext); // <-- Grab the logout function
  const [stats, setStats] = useState({ flats: 0, openTickets: 0, visitors: 0, notices: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [flatsRes, ticketsRes, visitorsRes, noticesRes] = await Promise.all([
          API.get('/flats'),
          API.get('/tickets'),
          API.get('/visitors'),
          API.get('/notices')
        ]);

        const openTicketsCount = ticketsRes.data.filter(ticket => ticket.status !== 'Resolved').length;

        setStats({
          flats: flatsRes.data.length,
          openTickets: openTicketsCount,
          visitors: visitorsRes.data.length,
          notices: noticesRes.data.length
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Flats', 
      value: stats.flats, 
      icon: <IoBusinessOutline size={28} color="#0d6efd" />, 
      bgColor: '#cfe2ff' 
    },
    { 
      title: 'Unresolved Tickets', 
      value: stats.openTickets, 
      icon: <IoWarningOutline size={28} color="#dc3545" />, 
      bgColor: '#f8d7da' 
    },
    { 
      title: 'Total Logged Visitors', 
      value: stats.visitors, 
      icon: <IoPeopleOutline size={28} color="#198754" />, 
      bgColor: '#d1e7dd' 
    },
    { 
      title: 'Active Notices', 
      value: stats.notices, 
      icon: <IoMegaphoneOutline size={28} color="#fd7e14" />, 
      bgColor: '#ffe5d0' 
    }
  ];

  return (
    <div style={styles.container}>
      {/* --- UPDATED HEADER AREA --- */}
      <div style={styles.headerArea}>
        <div>
          <h1 style={styles.greeting}>Welcome back, Admin 👋</h1>
          <p style={styles.subtitle}>Here is what is happening in your society today.</p>
        </div>
        
        <button onClick={logout} style={styles.logoutBtn}>
          <IoLogOutOutline size={20} style={{ marginRight: '8px' }} />
          Log Out
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading society statistics...</p>
      ) : (
        <div style={styles.grid}>
          {statCards.map((card, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.cardContent}>
                <div>
                  <p style={styles.cardTitle}>{card.title}</p>
                  <h2 style={styles.cardValue}>{card.value}</h2>
                </div>
                <div style={{ ...styles.iconWrapper, backgroundColor: card.bgColor }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>System Overview</h3>
        <div style={styles.emptyBox}>
          <p style={{ color: '#888', margin: 0 }}>
            Everything is running smoothly. Use the sidebar to manage specific areas of the society.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: '"Inter", sans-serif', animation: 'fadeIn 0.5s ease-in' },
  
  // Updated to Flexbox to push the button to the right
  headerArea: { marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: '28px', color: '#1a1a1a', margin: '0 0 8px 0', fontWeight: '800' },
  subtitle: { fontSize: '15px', color: '#666', margin: 0 },
  
  // New Logout Button Style
  logoutBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    color: '#dc3545', 
    border: '1px solid #dc3545', 
    padding: '10px 20px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.1)'
  },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '3rem' },
  
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0', transition: 'transform 0.2s', cursor: 'default' },
  cardContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '14px', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { margin: 0, fontSize: '32px', color: '#1a1a1a', fontWeight: '800' },
  iconWrapper: { width: '56px', height: '56px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  recentSection: { marginTop: '2rem' },
  sectionTitle: { fontSize: '18px', color: '#333', marginBottom: '16px', fontWeight: '700' },
  emptyBox: { backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #ccc' }
};

export default Dashboard;