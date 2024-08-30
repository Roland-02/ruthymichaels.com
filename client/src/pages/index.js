import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';

import Login from '../components/login/Login';
import CreateAccount from '../components/login/CreateAccount';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Banner from '../components/index/Banner';
import Products from '../components/index/Products';
import MessageBanner from '../components/common/MessageBanner'

import '../styles/common.css';
import '../styles/index.css';


const Index = ({ form }) => {
  const { session } = useContext(SessionContext);
  const [message, setMessage] = useState({ content: null, product: null, action: null });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Determine which form to show based on the 'form' prop
    if (form === 'login' || form === 'createAccount') {
      setOverlayVisible(true);
    } else {
      setOverlayVisible(false);
    }
  }, [form]);

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div>
      <Navbar />

      <MessageBanner message={message} setMessage={setMessage} />

      {overlayVisible && (
        <div>
          <div className="overlay" onClick={handleClose}></div>
          {form === 'login' && <Login onClose={handleClose} />}
          {form === 'createAccount' && <CreateAccount onClose={handleClose} />}
        </div>
      )}

      <Banner />
      <Products setMessage={setMessage} />

      <Footer />
    </div>
  );
};

export default Index;