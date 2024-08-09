import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import '../styles/profile.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MessageBanner from '../components/common/MessageBanner';


const Profile = () => {
    const { session } = useContext(SessionContext);
    const { name } = useParams();
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();
    const [User, setUser] = useState({
        email: 'name@domain.com',
        address: {
            line_1: 'Address line 1',
            line_2: 'Address line 2',
            city: 'City',
            country: 'Country',
            postcode: 'Postcode'
        }
    });
    const [orders, setOrders] = useState([]);
    const [editState, setEditState] = useState({
        email: false,
        address: false,
    });
    const [isChanged, setIsChanged] = useState({
        email: false,
        address: false,
    });

    const fetchAddress = async () => {
        try {
            const response = await axios.get(`/server/get_address/${session.id}`);
            if (response.status === 200) {
                setUser((prevState) => ({
                    ...prevState,
                    address: {
                        line_1: response.data.line_1,
                        line_2: response.data.line_2,
                        city: response.data.city,
                        country: response.data.country,
                        postcode: response.data.postcode
                    }
                }));
            } else {
                console.error('Failed to fetch address');
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    }

    useEffect(() => {
        const initialize = async () => {
            if (session && session.id) {
                setUser(prevState => ({
                    ...prevState,
                    email: session.email
                }));
                await fetchAddress()

            }
        };
        window.scrollTo(0, 0);
        initialize();

    }, [session, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setIsChanged((prevState) => ({
            ...prevState,
            email: true,
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({
            ...prevState,
            address: {
                ...prevState.address,
                [name]: value,
            },
        }));
    };

    const handleEdit = (field) => {
        setEditState((prevState) => ({
            ...prevState,
            [field]: true
        }));
      
    };

    const handleSave = async (section) => {
        if (section === 'address') {
            try {
                const response = await axios.post('/server/save_address', {
                    user_id: session.id,
                    line_1: User.address.line_1,
                    line_2: User.address.line_2,
                    city: User.address.city,
                    country: User.address.country,
                    postcode: User.address.postcode
                });

                if (response.status === 200) {
                    console.log('Address saved successfully');
                    setEditState((prevState) => ({
                        ...prevState,
                        [section]: false
                    }));
                } else {
                    console.error('Failed to save address');
                }
            } catch (error) {
                console.error('Error saving address:', error);
            }

        }else if(section === 'email'){
            try {
                const newEmail = User.email; // Assuming User.email is updated with the new email
    
                const response = await axios.post(`/change_email/${session.id}`, {
                    newEmail,
                });
    
                if (response.status === 200) {
                    console.log('Email updated successfully');
                    setEditState((prevState) => ({
                        ...prevState,
                        [section]: false,
                    }));
                } else {
                    console.error('Failed to update email');
                }
            } catch (error) {
                console.error('Error saving email:', error);
            }

        }
    };


    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            <main>
                <div className="view-container">

                    <div className="profile-container">
                        <div className="profile-info">

                            <div className="profile-section email">
                                <h2>Email</h2>
                                {editState.email ? (
                                    <div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={User.email}
                                            onChange={handleChange}
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-floppy save-button" viewBox="0 0 16 16" onClick={() => handleSave('email')}>
                                            <path d="M11 2H9v3h2z" />
                                            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div>
                                        <p>{User.email}</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-pencil-square" viewBox="0 0 16 16" onClick={() => handleEdit('email')}>
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="profile-section address">
                                <h2>Delivery Address</h2>
                                {editState.address ? (
                                    <div className="address-form-container">
                                        <form className="address-form">
                                            <input
                                                type="text"
                                                placeholder="Address line 1"
                                                name="line_1"
                                                value={User.address.line_1}
                                                onChange={handleAddressChange}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Address line 2"
                                                name="line_2"
                                                value={User.address.line_2}
                                                onChange={handleAddressChange}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Town/City"
                                                name="city"
                                                value={User.address.city}
                                                onChange={handleAddressChange}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Country"
                                                name="country"
                                                value={User.address.country}
                                                onChange={handleAddressChange}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Postcode"
                                                name="postcode"
                                                value={User.address.postcode}
                                                onChange={handleAddressChange}
                                            />
                                        </form>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-floppy save-button" viewBox="0 0 16 16" onClick={() => handleSave('address')}>
                                            <path d="M11 2H9v3h2z" />
                                            <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="address-display">
                                        <p>{User.address.line_1}</p>
                                        <p>{User.address.line_2}</p>
                                        <p>{User.address.city}</p>
                                        <p>{User.address.country}</p>
                                        <p>{User.address.postcode}</p>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-pencil-square" viewBox="0 0 16 16" onClick={() => handleEdit('address')}>
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="order-history">
                            <h2>Order History</h2>
                            <table>
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
                                    {orders.map((order) => (
                                        <tr key={order.orderNumber}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order.item}</td>
                                            <td>{order.quantity}</td>
                                            <td>£{order.price.toFixed(2)}</td>
                                            <td>{new Date(order.date).toLocaleDateString('en-GB')}</td>
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
