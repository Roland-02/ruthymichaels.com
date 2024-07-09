// MessageBanner.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/common.css';

const MessageBanner = ({ message, setMessage }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (message.content) {
            const timer = setTimeout(() => {
                setMessage({ content: null, product: null, action: null });
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    if (!message.content) {
        return null;
    }

    const handleClick = () => {
        if (message.action === 'cart') {
            navigate('/cart');
        } else if (message.action === 'love') {
            navigate('/wishlist');
        }
        setMessage({ content: null, product: null, action: null });
    };

    return (
        <div className="message-banner" onClick={handleClick}>
            {message.content}          
        </div>
    );
};

export default MessageBanner;