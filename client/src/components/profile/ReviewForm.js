import React, { useState } from 'react';

import '../../styles/profile.css';
import '../../styles/common.css';

const ReviewForm = ({ onSave, onCancel, order_id, product_id, item_name }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');

    const handleClick = (rate) => {
        setRating(rate);
    };

    const handleMouseEnter = (rate) => {
        setHoverRating(rate);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleSave = () => {
        if (rating > 0 && review.trim()) {
            // Call onSave with the review details
            onSave({
                order_id,
                product_id,
                rating,
                review,
            });
        } else {
            alert('Please provide a rating and a review.');
        }
    };

    return (
        <div className='review-container'>

            <div className="review-form">
                <h2>Leave a Review</h2>
                <p>{item_name}</p>

                <div className="form-group">

                    <label>Rating:</label>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const starValue = index + 1;
                            const halfStarValue = index + 0.5;
                            return (
                                <span key={index} className="star-container">
                                    <i
                                        className={`star full-star ${(hoverRating >= starValue || rating >= starValue) ? 'filled' : ''}`}
                                        onClick={() => handleClick(starValue)}
                                        onMouseEnter={() => handleMouseEnter(starValue)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        ★
                                    </i>
                                    <i
                                        className={`star half-star ${(hoverRating >= halfStarValue || rating >= halfStarValue) ? 'filled' : ''}`}
                                        onClick={() => handleClick(halfStarValue)}
                                        onMouseEnter={() => handleMouseEnter(halfStarValue)}
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
                    <button className="btn btn-save" onClick={handleSave}>
                        Save
                    </button>
                    <button className="btn btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>

    );
};

export default ReviewForm;
