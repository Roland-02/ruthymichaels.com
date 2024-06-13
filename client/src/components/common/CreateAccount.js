// src/pages/CreateAccount.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';
import FacebookLogin from 'react-facebook-login';
// import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';


const CreateAccount = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [error, setError] = useState('');
  const { setSession } = useContext(SessionContext);

  useEffect(() => {
    const userId = Cookies.get('sessionID');
    if (userId) {
      console.log('Logged in User ID:', userId);
    }
  }, []);

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
        setSession({ id: result.id, email: result.email });
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
      document.cookie = `sessionID=${response.userID}; path=/; secure; samesite=Strict`;
      document.cookie = `sessionEmail=${response.email}; path=/; secure; samesite=Strict`;
      window.location.href = '/';
    } else {
      setError('User cancelled login or did not fully authorize.');
    }
  };

  const responseGoogle = (response) => {
    if (response.credential) {
      const data = parseJwt(response.credential);
      document.cookie = `sessionID=${data.sub}; path=/; SameSite=None; Secure`;
      document.cookie = `sessionEmail=${data.email}; path=/; SameSite=None; Secure`;
      window.location.href = '/';
    } else {
      setError('User cancelled login or did not fully authorize.');
    }
  };

  const parseJwt = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  };

  return (
    <div className="col-lg login-container border rounded justify-content-center align-items-center text-center">
      <h2 className="text-center mt-2 mb-3">Create Account</h2>
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
            type="password"
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
            type="password"
            className="form-control border"
            id="confPassword_signup"
            value={confPassword}
            onChange={(e) => setConfPassword(e.target.value)}
            required
          />
          <label className="form-label" htmlFor="confPassword_signup">Confirm password</label>
        </div>
        <button type="submit" className="btn btn-primary btn-block mb-4">Sign up</button>
        <p>or continue with</p>

        {/* <div className="m-3">
          <div className="d-flex justify-content-center">
            <FacebookLogin
              appId="417605231226749"
              autoLoad={false}
              fields="name,email,picture"
              callback={responseFacebook}
              icon="fa-facebook"
              cssClass="btn btn-primary m-2"
              textButton="Login with Facebook"
            />
          </div>
          <GoogleOAuthProvider clientId="142386812768-5dfql3hsf32etn4tpdpa7lo9dol09j4q.apps.googleusercontent.com">
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={responseGoogle}
                onError={() => {
                  setError('Login Failed');
                }}
                className="btn btn-danger m-2"
              />
            </div>
          </GoogleOAuthProvider>
          <div id="status"></div>
        </div> */}

        <div className="text-center">
          <p>Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;
