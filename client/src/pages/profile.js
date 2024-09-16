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
    const { session, setSession, Loading } = useContext(SessionContext);
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState({});
    const [reviewItem, setReviewItem] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const navigate = useNavigate();


    const [User, setUser] = useState({
        email: session ? session.email : '',
        password: '******************'
    });

    const checkVerificationStatus = async () => {
        try {
            const response = await axios.get('/check_verification', {
                params: { email: session.email }
            });
            setVerificationStatus(response.data.verified);
        } catch (error) { }
    };

    const handleResendVerification = async () => {
        try {
            // const email = session.email
            const response = await axios.post(`/resend_verification/${session.email}`);

            if (response.status === 200) {
                setMessage({ content: `${response.data.message}`, product: '', action: 'success' });

            } else {
                setMessage({ content: `${response.data.message}`, product: '', action: 'error' });
            }
        } catch (error) { }
    };

    const handleReviewClick = (product_id, product_name) => {
        console.log(product_name)
        const existingReview = reviews[product_id];

        if (existingReview) {
            // If review exists, pre-fill the form with existing review data
            setReviewItem({
                // order_id,
                product_id,
                product_name,
                rating: existingReview.rating,
                review: existingReview.review
            });
        } else {
            // If no review exists, open a blank form
            setReviewItem({
                // order_id,
                product_id,
                product_name,
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
                setMessage({ content: 'Thank you for your review', product: null, action: 'success' });

            } else {
                setMessage({ content: 'Failed to save your review. Please try again', product: null, action: 'error' });
            }

        } catch (error) {
            setMessage({ content: 'Please rate and review before saving!', product: null, action: 'error' });
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
                setMessage({ content: 'Review deleted', product: null, action: 'success' });
            } else if (response.status === 404) {
                setOverlayVisible(false)
            }

        } catch (error) {
            setMessage({ content: 'Error deleting review', product: null, action: 'error' });

        } finally {
            setReviewItem(null);
            setOverlayVisible(false);
            navigate(`/profile`);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                const response = await axios.post(`/server/delete_account/${session.id}`);
                if (response.data.success) {

                    setMessage({ content: 'We\'re sorry to see you go :(', product: '', action: 'success' })

                    setTimeout(() => {
                        setSession(null);
                        navigate('/');
                    }, 3000); // 3000 milliseconds = 3 seconds

                } else {
                    setMessage({ content: 'There was an error deleting your account', product: '', action: 'error' })
                }
            } catch (error) {
                setMessage({ content: 'There was an error deleting your account', product: '', action: 'error' })
            }
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

        } catch (error) {
            setMessage({ content: 'Failed to load order history', product: null, action: 'error' });
        }
    };

    const fetchUserReviews = async () => {
        try {
            const response = await axios.get(`/server/fetch_user_reviews/${session.id}`);
            if (response.status === 200) {
                const reviewsArray = response.data.reviews;

                // Convert the array to an object keyed by "product_id"
                const reviewsObject = reviewsArray.reduce((acc, review) => {
                    acc[review.product_id] = review;
                    return acc;
                }, {});

                setReviews(reviewsObject);

            } else {
                setReviews({});
            }
        } catch (error) { }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleClose = () => {
        navigate('/profile');
    };

    useEffect(() => {
        const initialize = async () => {
            window.scrollTo(0, 0);

            if (Loading) return;

            try {
                setUser(prevState => ({
                    ...prevState,
                    email: session.email,
                }));

                await fetchOrders();
                await fetchUserReviews();

                if (session.method === null) {
                    await checkVerificationStatus();
                }

            } catch (error) { }

        }

        initialize();

    }, [session, Loading, navigate]);

    useEffect(() => {
        if (form === 'review' || form === 'change_password') {
            setOverlayVisible(true);
        } else {
            setOverlayVisible(false);
        }

    }, [form]);


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
                            item_name={reviewItem.product_name}
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
                                <div className="label-with-link">
                                    <label htmlFor="email">Email</label>
                                    {(session && session.method === null) && (
                                        verificationStatus === null ? (
                                            <p>Loading...</p>
                                        ) : verificationStatus ? (
                                            <span className="verified-text">Verified</span>
                                        ) : (
                                            <div>
                                                <span className="unverified-text">Unverified</span>
                                                <a
                                                    className="resend-link profile"
                                                    onClick={handleResendVerification}
                                                >
                                                    Verify email
                                                </a>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="input-with-button">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={User.email}
                                        onChange={handleChange}
                                        disabled
                                    />
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
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    <OrderHistory
                        orders={orders}
                        handleReviewClick={handleReviewClick}
                        reviews={reviews}
                    />

                    {/* Delete account button */}
                    {(session && session.role === 'user') && (
                        <div className="delete-account-container">
                            <button className="delete-account-btn" onClick={handleDeleteAccount}>
                                Delete Account
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
