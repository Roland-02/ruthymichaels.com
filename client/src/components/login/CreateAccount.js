import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';

import FacebookLogin from 'react-facebook-login';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';


const CreateAccount = () => {
  const { setSession } = useContext(SessionContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');


  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    navigate('/')
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confPassword) {
      setError('Passwords do not match');
      return;
    }
    try {

      const response = await fetch('/createAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.id) {
        setSession({ id: result.id, email: result.email, method: null, role: 'user' });
        navigate('/'); // Redirect to the home page or dashboard
      } else {
        setError('User already exists');
      }

    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const responseFacebook = (response) => {
    if (response.accessToken) {
      Cookies.set('sessionID', response.userID, { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionEmail', response.email, { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionMethod', 'facebook', { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionRole', 'user', { path: '/', secure: true, sameSite: 'Strict' });
      setSession({ id: response.userID, email: response.email, method: 'facebook', role: 'user' });
      navigate('/');
    } else {
      console.log('User cancelled login or did not fully authorize.');
      setError('Please log into this app.');
    }

  };

  const responseGoogle = (response) => {
    if (response.credential) {
      const decodedToken = jwtDecode(response.credential);
      Cookies.set('sessionID', decodedToken.sub, { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionEmail', decodedToken.email, { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionMethod', 'google', { path: '/', secure: true, sameSite: 'Strict' });
      Cookies.set('sessionRole', 'user', { path: '/', secure: true, sameSite: 'Strict' });
      setSession({ id: decodedToken.sub, email: decodedToken.email, method: 'google', role: 'user' });
      navigate('/');
    } else {
      console.log('User cancelled login or did not fully authorize.');
      setError('Please log into this app.');
    }
  };


  return (
    <div className="col-lg login-container border rounded justify-content-center align-items-center text-center">
      <button className="close-button" onClick={handleClose}>×</button>

      <h2 className="text-center mt-2 mb-4">Create Account</h2>
      {error && <label className="error-label">{error}</label>}

      <form id="createAccount-form" className="container" style={{ width: '90%' }} onSubmit={handleSubmit}>
        <div className="form-outline mb-4">
          <input
            type="email"
            className="form-control border"
            id="email_signup"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="email_signup">Email address</label>
        </div>

        <div className="form-outline mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control border"
            id="password_signup"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="password_signup">Password</label>
        </div>

        <div className="form-outline mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control border"
            id="confPassword_signup"
            value={confPassword}
            onChange={(e) => setConfPassword(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="confPassword_signup">Confirm password</label>
        </div>

        <div className="row mb-4">
          <div className="col d-flex justify-content-center">
            <div className="form-check">
              <input className="form-check-input" id="show" type="checkbox" onClick={togglePassword} />
              <label htmlFor="show">Show password</label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block mb-4"><strong>SIGN UP</strong></button>
        <p>or continue with</p>

        <div className="m-3">

          <div className="d-flex justify-content-center mb-2">
            <FacebookLogin
              appId="417605231226749"
              autoLoad={false}
              fields="name, email"
              callback={responseFacebook}
              cssClass="loginBtn"
            />
          </div>

          {<GoogleOAuthProvider clientId="142386812768-5dfql3hsf32etn4tpdpa7lo9dol09j4q.apps.googleusercontent.com">
            <div className="d-flex justify-content-center">
              <GoogleLogin
                cssClass="loginBtn"
                onSuccess={responseGoogle}
                onError={() => {
                  console.log('Login Failed');
                }}
              />
            </div>
          </GoogleOAuthProvider>}
          <div id="status"></div>
        </div>

        <div className="text-center">
          <p>Already registered? <a href="/login">Sign in</a></p>
        </div>
      </form>
    </div>
  );

};

export default CreateAccount;
