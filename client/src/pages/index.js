import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';

import '../styles/common.css';
import '../styles/index.css';

import Login from '../components/login/Login';
import CreateAccount from '../components/login/CreateAccount';
import ChangePassword from '../components/login/ChangePassword';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Banner from '../components/index/Banner';
import Products from '../components/index/Products';
import MessageBanner from '../components/common/MessageBanner'


const Index = ({ form }) => {
  const { session, setSession } = useContext(SessionContext);
  const [message, setMessage] = useState({ content: null, product: null, action: null });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [token, setToken] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  useEffect(() => {
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


  }, [location, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Determine which form to show based on the 'form' prop
    if (form === 'login' || form === 'createAccount' || form === 'change_password') {
      setOverlayVisible(true);
    } else {
      setOverlayVisible(false);
    }

  }, [form]);


  return (
    <div>
      <Navbar />

      <MessageBanner message={message} setMessage={setMessage} />

      {overlayVisible && (
        <div>
          <div className="overlay" onClick={handleClose}></div>
          {form === 'login' && <Login onClose={handleClose} />}
          {form === 'createAccount' && <CreateAccount onClose={handleClose} />}
          {form === 'change_password' && <ChangePassword onClose={handleClose} token={token} />}
        </div>
      )}

      <Banner />
      <Products setMessage={setMessage} />

      <Footer />
    </div>
  );
};

export default Index;