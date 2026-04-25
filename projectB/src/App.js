import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login'; // We will build this in Phase 3
import ManageAssets from './pages/ManageAssets';
import ManageInventory from './pages/ManageInventory';
import ManageAssignments from './pages/ManageAssignments';
import ManageRepairs from './pages/ManageRepairs';
import AdminDashboard from './pages/AdminDashboard'
import TechDashboard from './pages/TechDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard'

// CRITICAL: Bootstrap styles
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* All Admin Routes wrapped in Protection and Layout */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><AdminDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/assets" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><ManageAssets /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/inventory" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><ManageInventory /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/assignments" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><ManageAssignments /></Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/repairs" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout><ManageRepairs /></Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Navigate to="/admin" />} />
                    
                    {/* Protected Technician Route */}
                    <Route path="/repairs" element={
                        <ProtectedRoute allowedRoles={['admin', 'technician']}>
                            <Layout><TechDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Employee Dashboard */}
                    <Route path="/my-assets" element={
                        <ProtectedRoute allowedRoles={['employee']}>
                            <Layout><EmployeeDashboard /></Layout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;