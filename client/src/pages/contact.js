import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import '../styles/contact.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MessageBanner from '../components/common/MessageBanner';


const Contact = () => {
    const { session } = useContext(SessionContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState(session ? session.email : '');
    const [orderRef, setOrderRef] = useState('');
    const [text, setText] = useState('');
    const [message, setMessage] = useState({ content: null, product: null, action: null });


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('server/contact', {
                email,
                orderRef,
                text,
            });

            if (response.data.success) {
                setMessage({ content: 'Message sent succesfully!', product: null, action: 'success' });

                // clear after submission
                setEmail('');
                setOrderRef('');
                setMessage('');

            } else {
                setMessage({ content: 'Error sending message', product: null, action: 'error' });

            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessage({ content: 'Error sending message', product: null, action: 'error' });
        }

    };

    return (
        <div>
            <Navbar session={session} />

            <MessageBanner message={message} setMessage={setMessage} />

            <div className="view-container contact">
                <h2>Contact Us</h2>

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="orderRef">Order Reference (optional)</label>
                        <input
                            type="text"
                            id="orderRef"
                            value={orderRef}
                            onChange={(e) => setOrderRef(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="text">Message</label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="submit-button">Submit</button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;
