import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Check if user is admin but trying to access non-admin pages
    if (user.email === process.env.REACT_APP_ADMIN_EMAIL && !location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin" replace />;
    }

    // Check if non-admin user is trying to access admin pages
    if (adminOnly && user.email !== process.env.REACT_APP_ADMIN_EMAIL) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;