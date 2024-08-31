import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import '../styles/profile.css';
import '../styles/common.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MessageBanner from '../components/common/MessageBanner';
import OrderHistory from '../components/profile/OrderHistory';
import ReviewForm from '../components/profile/ReviewForm';


const Profile = ({ form }) => {
    const { session } = useContext(SessionContext);
    const { name } = useParams();
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState({});
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewItem, setReviewItem] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        window.scrollTo(0, 0);

        // Determine which form to show based on the 'form' prop
        if (form === 'review' || form === 'change_password') {
            setOverlayVisible(true);
        } else {
            setOverlayVisible(false);
        }

    }, [form]);

    const [User, setUser] = useState({
        email: 'name@domain.com',
        password: '******************'
    });
    const [editState, setEditState] = useState({
        email: false,
        password: false
    });

    const handleReviewClick = (product_id, item_name) => {
        const existingReview = reviews[product_id];

        if (existingReview) {
            // If review exists, pre-fill the form with existing review data
            setReviewItem({
                // order_id,
                product_id,
                item_name,
                rating: existingReview.rating,
                review: existingReview.review
            });
        } else {
            // If no review exists, open a blank form
            setReviewItem({
                // order_id,
                product_id,
                item_name,
                rating: 0,
                review: ''
            });
        }

        navigate(`/profile/review_item/${product_id}`);
    };

    const handleReviewSave = async (reviewData) => {
        try {

            const data = {
                ...reviewData,
                user_id: session.id,
            }

            const response = await axios.post('/server/add_review', data);
            if (response.status === 201) {
                setMessage({ content: 'Thank you for your review', product: null, action: '' });


            } else {
                console.error('Failed to save the review.');
                setMessage({ content: 'Failed to save your review. Please try again', product: null, action: '' });
            }

        } catch (error) {
            setMessage({ content: 'Please rate and review before saving!', product: null, action: '' });
            console.error('Error saving the review:', error);
        } finally {
            setReviewItem(null);
            setOverlayVisible(false);
            navigate(`/profile`);

        }


    };

    const handleReviewDelete = async (reviewData) => {
        try {
            const data = {
                ...reviewData,
                user_id: session.id,
            }

            const response = await axios.post('/server/delete_review', data);
            if (response.status === 200) {
                setMessage({ content: 'Review deleted', product: null, action: '' });
            } else if (response.status === 404) {
                setOverlayVisible(false)
            }

        } catch (error) {
            setMessage({ content: 'Error deleting review', product: null, action: '' });
            console.error('Error saving the review:', error);

        } finally {
            setReviewItem(null);
            setOverlayVisible(false);
            navigate(`/profile`);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`/server/order_history/${session.id}`);

            // Assuming the response is the order history data array
            const formattedOrders = response.data.map(order => ({
                ...order,
                date: order.date,
                items: order.items.map(item => ({
                    ...item,
                    price: item.price
                }))
            }));
            setOrders(formattedOrders);

            const user_reviews = await fetchUserReviews();
            setReviews(user_reviews)


        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setMessage({ content: 'Failed to load order history', product: null, action: null });
        }
    };

    const fetchUserReviews = async () => {
        try {
            const response = await axios.get(`/server/fetch_user_reviews/${session.id}`);
            if (response.status === 200) {
                const reviewsArray = response.data.reviews;

                // Convert the array to an object keyed by "order_id_product_id"
                const reviewsObject = reviewsArray.reduce((acc, review) => {
                    acc[review.product_id] = review;  // Key by product_id only
                    return acc;
                }, {});

                return reviewsObject;
            } else {
                return {};
            }
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            return {};
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (session && session.id) {
                // Fetch the user's info if a session exists
                try {
                    setUser(prevState => ({
                        ...prevState,
                        email: session.email,
                    }));
                    fetchOrders()
                } catch (error) {
                    console.error('Error fetching user info:', error);
                }

            } else {
                navigate('/login');
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
    };

    const handleEdit = (field) => {
        setEditState((prevState) => ({
            ...prevState,
            [field]: true
        }));

    };

    const handleSave = async (section) => {
        if (section === 'email') {
            try {
                const newEmail = User.email;

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

        } else if (section === 'password') {
            try {
                const newPassword = User.password;

                const response = await axios.post(`/change_password/${session.id}`, {
                    newPassword,
                });

                if (response.status === 200) {
                    console.log('Password updated successfully');
                    setEditState((prevState) => ({
                        ...prevState,
                        [section]: false,
                    }));
                } else {
                    console.error('Failed to update password');
                }
            } catch (error) {
                console.error('Error saving password:', error);
            }
        }
    };

    const handleClose = () => {
        navigate('/profile');
    };

    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            {overlayVisible && (
                <div>
                    <div className="overlay" onClick={handleClose}></div>
                    {form === 'review' &&
                        <ReviewForm
                            onSave={handleReviewSave}
                            onDelete={handleReviewDelete}
                            order_id={reviewItem.order_id}
                            product_id={reviewItem.product_id}
                            item_name={reviewItem.item_name}
                            rating={reviewItem.rating}
                            review={reviewItem.review}
                        />}
                </div>
            )}

            <div className="view-container profile">

                <div className="profile-container">
                    <div className="profile-info">
                        <div className="profile-section email">
                            <div className="input-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-with-button">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={User.email}
                                        onChange={handleChange}
                                        disabled={!editState.email}
                                    />

                                    {(session && session.method === null) && (
                                        <>
                                            {!editState.email && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="45"
                                                    height="45"
                                                    className="bi bi-pencil-square edit-button"
                                                    viewBox="0 0 16 16"
                                                    onClick={() => handleEdit('email')}
                                                >
                                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                                </svg>
                                            )}
                                            {editState.email && (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="45"
                                                    height="45"
                                                    className="bi bi-floppy save-button"
                                                    viewBox="0 0 16 16"
                                                    onClick={() => handleSave('email')}
                                                >
                                                    <path d="M11 2H9v3h2z" />
                                                    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                                </svg>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(session && session.method === null) && (
                            <div className="profile-section password">
                                <div className="input-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="input-with-button">
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            value={User.password}
                                            onChange={handleChange}
                                            disabled={!editState.password}
                                        />
                                        {!editState.password && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="45"
                                                height="45"
                                                className="bi bi-pencil-square edit-button"
                                                viewBox="0 0 16 16"
                                                onClick={() => handleEdit('password')}
                                            >
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                            </svg>
                                        )}
                                        {editState.password && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="45"
                                                height="45"
                                                className="bi bi-floppy save-button"
                                                viewBox="0 0 16 16"
                                                onClick={() => handleSave('password')}
                                            >
                                                <path d="M11 2H9v3h2z" />
                                                <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <OrderHistory
                        orders={orders}
                        handleReviewClick={handleReviewClick}
                    />



                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
