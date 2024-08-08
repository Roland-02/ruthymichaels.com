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


const Index = () => {
  const { session} = useContext(SessionContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [message, setMessage] = useState({ content: null, product: null, action: null });
  const location = useLocation();
  const navigate = useNavigate();

  // check session, open login forms
  useEffect(() => {

    if(session && session.id){
      navigate('/')
    }

    // open login forms if in url
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
      <Navbar />

      <MessageBanner message={message} setMessage={setMessage} />

        {(showLogin || showCreateAccount) && (
          <div>
            <div id="overlay" onClick={handleClose}></div>
            {showLogin && <Login onClose={handleClose} />}
            {showCreateAccount && <CreateAccount onClose={handleClose} />}
          </div>
        )}
        
        <Banner />
        <Products setMessage={setMessage}/>
        
      <Footer />
    </div>
  );
};

export default Index;


