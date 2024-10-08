import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';

import MessageBanner from '../common/MessageBanner'


const ChangePassword = ({ token }) => {
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        navigate('/')
      }

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (password !== confPassword) {
            setError('Passwords must match');
            return;
        }

        try {
            const response = await axios.post('/change_password', { token, password });

            if (response.data.success) {
                setMessage({ content: 'Password changed successfully', product: null, action: 'success' });
                // Wait for 3 seconds before redirecting to the login page
                setTimeout(() => {
                    navigate('/login');
                }, 3000); // 3000 milliseconds = 3 seconds

            } else {
                setMessage({ content: 'Error changing password', product: null, action: 'error' });
            }
        } catch (error) {
            setMessage({ content: 'Error changing password', product: null, action: 'error' });
        }
    };

    return (

        <div>
            <MessageBanner message={message} setMessage={setMessage} />

            <div className="page-form-container">

                <button className="close-button" onClick={handleClose}>×</button>

                <h2 className="text-center mt-2 mb-2">Change Password</h2>

                {error && <label className="error-label">{error}</label>}

                <form onSubmit={handleChangePassword} className="change-password-form">
                    <div className="form-outline mb-4">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control border"
                            id="password_signup"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label className="form-label" htmlFor="password_signup">New Password</label>
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
                        <label className="form-label" htmlFor="confPassword_signup">Confirm Password</label>
                    </div>

                    <div className="row mb-4">
                        <div className="col d-flex justify-content-center">
                            <div className="form-check">
                                <input className="form-check-input" id="show" type="checkbox" onClick={togglePassword} />
                                <label htmlFor="show">Show password</label>
                            </div>
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>

                </form>
            </div>
        </div>

    );
};


export default ChangePassword;
