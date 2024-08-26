import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';
import FacebookLogin from 'react-facebook-login';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { session, setSession } = useContext(SessionContext);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const userId = Cookies.get('sessionID');
        if (userId) {
            console.log('Logged in User ID:', userId);
        }
    }, [session]);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (result.id) {
                setSession({ id: result.id, email: result.email, method: null });
                navigate('/');
            } else {
                setErrorMessage('Password or email incorrect');
            }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    const responseFacebook = (response) => {
        if (response.accessToken) {
            Cookies.set('sessionID', response.userID, { path: '/', secure: true, sameSite: 'Strict' });
            Cookies.set('sessionEmail', response.email, { path: '/', secure: true, sameSite: 'Strict' });
            setSession({ id: response.userID, email: response.email, method: 'facebook' });
            navigate('/');
        } else {
            console.log('User cancelled login or did not fully authorize.');
            setErrorMessage('Please log into this app.');
        }
    };

    const responseGoogle = (response) => {
        if (response.credential) {
            const decodedToken = jwtDecode(response.credential);
            Cookies.set('sessionID', decodedToken.sub, { path: '/', secure: true, sameSite: 'Strict' });
            Cookies.set('sessionEmail', decodedToken.email, { path: '/', secure: true, sameSite: 'Strict' });
            setSession({ id: decodedToken.sub, email: decodedToken.email, method: 'google' });
            navigate('/');
        } else {
            console.log('User cancelled login or did not fully authorize.');
            setErrorMessage('Please log into this app.');
        }
    };

    return (
        <div className="col-lg login-container border rounded justify-content-center align-items-center text-center">
            <h2 className="text-center mt-2 mb-4">Login</h2>

            {errorMessage && <label className="error-label">{errorMessage}</label>}

            <form id="login-form" className="container" style={{ width: '90%' }} onSubmit={handleSubmit}>
                <div className="form-outline mb-4" style={{ textAlign: 'left' }}>
                    <input
                        type="email"
                        className="form-control border"
                        id="email_login"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label className="form-label" htmlFor="email_login">Email address</label>
                    <label className='error-label' htmlFor='email_login' id='emailError_login' hidden>email invalid</label>
                </div>

                <div className="form-outline mb-4" style={{ textAlign: 'left' }}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label className="form-label" htmlFor="password_login">Password</label>
                    <label className='error-label' htmlFor='password_login' id='passwordError_login' hidden>password must be 6 characters with 1 uppercase</label>
                </div>

                <div className="row mb-4">
                    <div className="col d-flex justify-content-center">
                        <div className="form-check">
                            <input className="form-check-input" id="show" type="checkbox" onClick={togglePassword} />
                            <label htmlFor="show">Show password</label>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block mb-4"><strong>SIGN IN</strong></button>

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
                                onError={(error) => {
                                    console.log('Login Failed', error);
                                }}
                            />
                        </div>
                    </GoogleOAuthProvider>}

                </div>
                <div className="text-center">
                    <p>Don't have an account? <a href="/createAccount">Sign up</a></p>
                </div>
            </form>
        </div>
    );
};

export default Login;
