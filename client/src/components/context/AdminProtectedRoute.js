import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { SessionContext } from './SessionContext';

const AdminProtectedRoute = ({ element }) => {
    const { session, Loading } = useContext(SessionContext);

    if (Loading) return; 

    if (!(session && session.role === 'admin')) {
        return <Navigate to="/" replace />;
    }

    return element;
};

export default AdminProtectedRoute;