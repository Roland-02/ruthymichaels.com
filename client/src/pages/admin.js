import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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

  return (
    <div>
      <Navbar session={session} />
      <main>
        <div className='view-container'>
          <div className="admin-container">
            <Link to="/admin/products" className="manage-products-button">
              Products
            </Link>
            <Link to="/admin/orders" className="manage-orders-button">
              Orders
            </Link>
            <div className="view-sales-button" onClick={() => window.open('https://dashboard.stripe.com/dashboard', '_blank')}>
              Sales
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Admin;


