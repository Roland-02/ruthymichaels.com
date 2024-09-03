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
            }, 2500); //seconds

            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    if (!message.content) {
        return null;
    }

    const handleClick = () => {
        switch (message.action) {
            case 'cart':
                navigate('/cart');
                break;
            case 'love':
                navigate('/wishlist');
                break;
            default:
                break;
        }
    
        // Reset the message state after handling the click
        setMessage({ content: null, product: null, action: null });
    };

    const messageClass = () => {
        switch (message.action) {
            case 'error':
                return 'message-banner error';
            case 'success':
                return 'message-banner success';
            default:
                return 'message-banner default';
        }
    };
    
    return (
        <div className={messageClass()} onClick={handleClick}>
            {message.content}          
        </div>
    );
};

export default MessageBanner;