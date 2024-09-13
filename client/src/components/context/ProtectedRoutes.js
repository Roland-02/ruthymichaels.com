import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // Use Navigate component from react-router-dom
import { SessionContext } from './SessionContext';

const ProtectedRoute = ({ element }) => {
    const { session, Loading } = useContext(SessionContext);

    if (Loading) return; 

    // If no session exists, redirect to login
    if (!(session && session.id)) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default ProtectedRoute;
