import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ManageBlocks from './pages/ManageBlocks';
import PreSeedUsers from './pages/PreSeedUsers';
import Helpdesk from './pages/Helpdesk';
import NoticeBoard from './pages/NoticeBoard';
import MasterVisitorLog from './pages/MasterVisitorLog';
import AdminLayout from './components/AdminLayout';

// Import our pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// A "Bouncer" component to protect private routes
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; // Wait while we check LocalStorage
  
  // If no admin is logged in, kick them back to the login page
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, let them see the page
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

       {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/manage-blocks" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ManageBlocks />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pre-seed" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PreSeedUsers />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/notice-board" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <NoticeBoard />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/helpdesk" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Helpdesk />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/visitor-log" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <MasterVisitorLog />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </Router>
  );
}

export default App;