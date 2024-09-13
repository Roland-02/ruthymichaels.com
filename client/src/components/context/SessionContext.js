import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [Loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('/session');
                setSession(response.data);
            } catch (error) {
                console.error('Error fetching session data:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

    }, []);
    
    return (
        <SessionContext.Provider value={{ session, setSession, Loading }}>
            {children}
        </SessionContext.Provider>
    );
};