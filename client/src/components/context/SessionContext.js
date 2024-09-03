import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SessionContext = createContext();


export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('/session');
                setSession(response.data);
            } catch (error) {
                console.error('Error fetching session data:', error);
            } finally {
                setLoading(false);  // Session check complete
            }
        };

        checkSession();
    }, []);

    return (
        <SessionContext.Provider value={{ session, setSession, loading }}>
            {children}
        </SessionContext.Provider>
    );
};
