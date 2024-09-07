import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { SessionContext } from './SessionContext';

const AdminProtectedRoute = ({ element }) => {
    const { session, loading } = useContext(SessionContext);

    if (loading) return; 

    // If no session exists, redirect to login
    if (!(session && session.id)) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default AdminProtectedRoute;
