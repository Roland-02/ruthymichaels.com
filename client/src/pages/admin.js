import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Admin = ({ session }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState({ content: null, product: null, action: null });

    useEffect(() => {

        const initialize = async () => {
    
          const params = new URLSearchParams(location.search);
          const verified = params.get('verified');
          const tokenFromQuery = params.get('token');
    
          if (verified) {
            if (verified === 'true') {
              setMessage({ content: 'Your account has been verified succesfully', product: null, action: 'success' });
    
            } else {
              setMessage({ content: 'Account verification failed', product: null, action: 'error' });
    
            }
    
            navigate('/');
          }
    
          if (tokenFromQuery) {
            setToken(tokenFromQuery);
          }

        }
    
        initialize();
    
      }, [location, navigate]);


    const handleClick_products = () => {
        navigate('/admin/products');
    };
    
    return (
        <div>
            <Navbar session={session} />
            <main>
                <div className="manage-products-container">
                    <div className="manage-products-button" onClick={handleClick_products}>
                        Manage Products
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Admin;


