import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import '../../styles/profile.css';
import '../../styles/common.css';

const ReviewForm = ({ onSave, onDelete, order_id, product_id, item_name, rating: initialRating = 0, review: initialReview = '' }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const navigate = useNavigate();


    const handleClick = (rate) => {
        setRating(rate);
    };

    const handleMouseEnter = (rate) => {
        setHoverRating(rate);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClose = () => {
        navigate('/profile')
    }

    const handleSave = () => {
        onSave({
            order_id,
            product_id,
            rating,
            review,
        });
    };

    const handleDelete = () => {
        onDelete({
            order_id,
            product_id,
        })
    }

    useEffect(() => {
        setRating(initialRating);
        setReview(initialReview);
    }, [initialRating, initialReview]);


    return (
        <div className='review-container'>
            <div className="review-form">
            <button className="close-button" onClick={handleClose}>×</button>

                <h2>Leave a Review</h2>
                <p>{item_name}</p>

                <div className="form-group">
                    <label>Rating:</label>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            return (
                                <span key={index} className="star-container review-form">
                                    <i
                                        className={`star full-star ${(hoverRating >= starValue || rating >= starValue) ? 'filled' : ''}`}
                                        onClick={() => handleClick(starValue)}
                                        onMouseEnter={() => handleMouseEnter(starValue)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        ★
                                    </i>
                                </span>
                            );
                        })}
                    </div>

                </div>

                <div className="form-group">
                    <label htmlFor="review">Review:</label>
                    <textarea
                        id="review"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="form-control"
                        rows="4"
                        placeholder="Write your review here..."
                    ></textarea>
                </div>
                <div className="form-buttons">
                    <a className="btn btn-save" onClick={handleSave}>
                        Save
                    </a>
                    <a className="btn btn-delete" onClick={handleDelete}>
                        Delete
                    </a>
                </div>
            </div>
        </div>

    );
};

export default ReviewForm;
