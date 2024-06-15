import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Login from '../components/common/Login';
import CreateAccount from '../components/common/CreateAccount';
import Banner from '../components/common/Banner';
import Products from '../components/index/Products';


const Index = ({ session }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check session on component mount
    const checkSession = async () => {
      try {
        const response = await axios.get('/session');
        if (response.data && response.data.userId) {
          // If session is active, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();

    if (location.pathname === '/login') {
      setShowLogin(true);
      setShowCreateAccount(false);
    } else if (location.pathname === '/createAccount') {
      setShowCreateAccount(true);
      setShowLogin(false);
    } else {
      setShowLogin(false);
      setShowCreateAccount(false);
    }
  }, [location.pathname, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div>
      <Navbar session={session} />
          <main>
        {/* Your index page content */}
        {(showLogin || showCreateAccount) && (
          <div>
            <div id="overlay" onClick={handleClose}></div>
            {showLogin && <Login onClose={handleClose} />}
            {showCreateAccount && <CreateAccount onClose={handleClose} />}
          </div>
        )}
        <Banner />
        <Products/>
      
      </main>
      <Footer />
    </div>
  );
};

export default Index;


