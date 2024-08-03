import React, { useState } from 'react';
import '../../styles/common.css';

const PaymentForm = ({ onClose }) => {
    const [cardholderName, setCardholderName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Your payment form submission logic here
    };

    return (
        <div className="payment-form-container" onClick={onClose}>
            <div className="payment-form" onClick={(e) => e.stopPropagation()}>
                {/* <div className="payment-form-close" onClick={onClose}>×</div> */}
                <h2 className='mb-4 text-center'>Enter Payment Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-outline">
                        <label className="form-label mb-0" htmlFor="cardholderName">Cardholder Name</label>
                        <input
                            type="text"
                            id="cardholderName"
                            className="form-control"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-outline">
                        <label className="form-label mb-0" htmlFor="cardNumber">Card Number</label>
                        <input
                            type="text"
                            id="cardNumber"
                            className="form-control"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-outline">
                        <label className="form-label mb-0" htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            className="form-control"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label mb-0" htmlFor="cvc">CVC</label>
                        <input
                            type="text"
                            id="cvc"
                            className="form-control"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            required
                        />
                    </div>

                    <div className='text-center'>
                        <button type="submit" className="btn">Save Payment Details</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
