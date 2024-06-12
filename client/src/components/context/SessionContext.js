import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.get('/session'); // Updated endpoint
                setSession(response.data);
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSession();
    }, []);

    return (
        <SessionContext.Provider value={{ session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};
