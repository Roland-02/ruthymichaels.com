import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import '../styles/profile.css'

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MessageBanner from '../components/common/MessageBanner'

const Profile = () => {
    const { session } = useContext(SessionContext);
    const { name } = useParams();
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();

    const user = {
        email: 'user@example.com',
        address: '123 Main St, Anytown, USA',
        payment: {
            last4: '1234'
        }
    };

    const orders = [
        {
            orderNumber: '001',
            item: 'Product 1',
            quantity: 2,
            price: 19.99,
            date: '2023-06-12'
        },
        {
            orderNumber: '002',
            item: 'Product 2',
            quantity: 1,
            price: 9.99,
            date: '2023-06-14'
        },
        {
            orderNumber: '003',
            item: 'Product 3',
            quantity: 5,
            price: 49.99,
            date: '2023-06-16'
        }
    ];

    useEffect(() => {
        const initialize = async () => {
            if (session && session.id) {
                // Fetch any required data here
            }
        };
        initialize();
    }, [session, navigate]);

    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            <main>
                <div className="view-container">
                    <div className="profile-page container">
                        <div className="profile-header">
                            <h1>Profile</h1>
                        </div>
                        <div className="profile-info">
                            <div className="profile-section">
                                <h2>Email</h2>
                                <p>{user.email}</p>
                            </div>
                            <div className="profile-section">
                                <h2>Delivery Address</h2>
                                <p>{user.address}</p>
                            </div>
                            <div className="profile-section">
                                <h2>Payment Details</h2>
                                <p>**** **** **** {user.payment.last4}</p>
                            </div>
                        </div>
                        <div className="order-history">
                            <h2>Past Orders</h2>
                            <table className="order-table">
                                <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.orderNumber}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order.item}</td>
                                            <td>{order.quantity}</td>
                                            <td>${order.price.toFixed(2)}</td>
                                            <td>{new Date(order.date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
