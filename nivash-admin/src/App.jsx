import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import ManageBlocks from './pages/ManageBlocks';
import PreSeedUsers from './pages/PreSeedUsers';
import Helpdesk from './pages/Helpdesk';
import NoticeBoard from './pages/NoticeBoard';
import MasterVisitorLog from './pages/MasterVisitorLog';
import AdminLayout from './components/AdminLayout';
import PollManagement from './pages/PollManagement';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmergencySiren from './components/EmergencySiren';
import ParcelManagement from './pages/ParcelManagement';
import InvoiceManagement from './pages/InvoiceManagement';


const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>; 
  
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      {/* 🚨 THE SIREN LISTENER IS ACTIVE HERE 🚨 */}
      <EmergencySiren />
      
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

        <Route 
          path="/polls" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PollManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/parcels" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ParcelManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/invoices" 
          element={
            <ProtectedRoute>
              <AdminLayout>
                <InvoiceManagement />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
      </Routes>
    </Router>
  );
}

export default App;