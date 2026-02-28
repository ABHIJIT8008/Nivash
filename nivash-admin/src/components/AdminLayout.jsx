import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  IoHomeOutline, 
  IoBusinessOutline, 
  IoPeopleOutline, 
  IoMegaphoneOutline, 
  IoBuildOutline, 
  IoLogOutOutline 
} from 'react-icons/io5'; // Using Ionicons to match your mobile app!

const AdminLayout = ({ children }) => {
  const { admin, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <IoHomeOutline size={20} /> },
    { name: 'Manage Blocks', path: '/manage-blocks', icon: <IoBusinessOutline size={20} /> },
    { name: 'Pre-Seed Users', path: '/pre-seed', icon: <IoPeopleOutline size={20} /> },
    { name: 'Notice Board', path: '/notice-board', icon: <IoMegaphoneOutline size={20} /> },
    { name: 'Helpdesk', path: '/helpdesk', icon: <IoBuildOutline size={20} /> },
    { name: 'Visitor Log', path: '/visitor-log', icon: <IoPeopleOutline size={20} /> }, // Can use a clipboard icon too
  ];

  return (
    <div style={styles.layout}>
      {/* --- SIDEBAR --- */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoSquare}>N</div>
          <h2 style={styles.logoText}>NIVASH</h2>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path} 
                style={{ ...styles.navLink, ...(isActive ? styles.activeNavLink : {}) }}
              >
                <span style={{ marginRight: '12px', display: 'flex' }}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button onClick={logout} style={styles.logoutButton}>
          <IoLogOutOutline size={20} style={{ marginRight: '10px' }} />
          Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div style={styles.mainArea}>
        {/* TOP BAR */}
        <header style={styles.topBar}>
          <h3 style={styles.pageTitle}>
            {navItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
          </h3>
          <div style={styles.adminProfile}>
            <div style={styles.avatar}>A</div>
            <span style={styles.adminName}>Super Admin</span>
          </div>
        </header>

        {/* PAGE CONTENT GOES HERE */}
        <main style={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: { display: 'flex', height: '100vh', backgroundColor: '#f4f7f6', fontFamily: '"Inter", sans-serif' },
  
  // Sidebar
  sidebar: { width: '260px', backgroundColor: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', padding: '20px 0' },
  logoContainer: { display: 'flex', alignItems: 'center', padding: '0 24px', marginBottom: '40px' },
  logoSquare: { width: '36px', height: '36px', backgroundColor: '#007bff', color: '#fff', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '20px', marginRight: '12px' },
  logoText: { margin: 0, fontSize: '22px', color: '#1a1a1a', letterSpacing: '1px' },
  
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' },
  navLink: { display: 'flex', alignItems: 'center', padding: '12px 16px', textDecoration: 'none', color: '#555', borderRadius: '8px', fontSize: '15px', fontWeight: '500', transition: 'all 0.2s' },
  activeNavLink: { backgroundColor: '#e6f2ff', color: '#007bff', fontWeight: '600' },
  
  logoutButton: { display: 'flex', alignItems: 'center', margin: '0 16px', padding: '12px 16px', backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '15px', fontWeight: '600', borderRadius: '8px', transition: 'background 0.2s' },
  
  // Main Area
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { height: '70px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px' },
  pageTitle: { margin: 0, fontSize: '20px', color: '#1a1a1a', fontWeight: '600' },
  
  adminProfile: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#007bff', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  adminName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  
  content: { flex: 1, padding: '32px', overflowY: 'auto' }
};

export default AdminLayout;