import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    // If the AuthContext is still checking the token, show nothing (or a spinner)
    if (loading) return <div>Loading Security...</div>;

    // 1. Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check if user has the correct Role (admin, technician, employee)
    // If 'allowedRoles' is provided and user's role isn't in it, redirect
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;