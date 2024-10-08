import React, { useState } from 'react';
import '../../styles/profile.css';
import '../../styles/common.css';

const OrderHistory = ({ orders, handleReviewClick, reviews }) => {
    const [expandedOrders, setExpandedOrders] = useState({});

    const currencySymbols = {
        GBP: '£',
        USD: '$',
        EUR: '€',
    };

    const toggleExpandOrder = (order_id) => {
        setExpandedOrders((prevState) => ({
            ...prevState,
            [order_id]: !prevState[order_id], // toggle the current order's expanded state
        }));
    };

    return (
        <div className="order-history">
            <h2>Order History</h2>

            {/* Large screen table */}
            <div className="desktop">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <React.Fragment key={order.order_id}>
                                {order.items.map((item, index) => (
                                    <tr key={`${order.order_id}-${item.product_id}`}>
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                ...{order.order_id.slice(-10)}
                                            </td>
                                        )}
                                        <td>{item.item}</td>
                                        <td>{item.quantity}</td>
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                {currencySymbols[order.currency]}{order.totalPrice.toFixed(2)}
                                            </td>
                                        )}
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                {new Date(order.date).toLocaleDateString('en-GB')}
                                            </td>
                                        )}
                                         {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                {order.status}
                                            </td>
                                        )}
                                        <td>
                                            <a
                                                className={`review-link ${reviews[item.product_id] ? 'reviewed' : ''}`}
                                                onClick={() => handleReviewClick(item.product_id, item.item)}
                                            >
                                                {reviews[item.product_id] ? 'reviewed' : 'review'}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

            </div>

            {/* Mobile version - Expandable */}
            <div className="order mobile">
                {orders.map((order) => (
                    <div key={order.order_id} className="mobile-order">
                        {/* Clickable order ID to toggle expansion */}
                        <div className="mobile-order-header" onClick={() => toggleExpandOrder(order.order_id)}>
                            <span>Order: ...{order.order_id.slice(-10)}</span>
                            <span>{expandedOrders[order.order_id] ? '▲' : '▼'}</span>
                        </div>

                        {/* Expanded content */}
                        {expandedOrders[order.order_id] && (
                            <div className="mobile-order-details">
                                {order.items.map((item, index) => (
                                    <div className="mobile-order-item">
                                        {index === 0 && (
                                            <>
                                                <p>Total Price: <strong>{currencySymbols[order.currency]}{order.totalPrice.toFixed(2)}</strong></p>
                                                <p>Date: <strong>{new Date(order.date).toLocaleDateString('en-GB')}</strong> </p>
                                                <p>Status: <strong>{order.status}</strong> </p>
                                            </>
                                        )}

                                        <div key={`${order.order_id}-${item.product_id}`} >
                                            <p>Item: {item.item}</p>
                                            <p>Quantity: {item.quantity}</p>
                                            <div className="review-link-container">
                                                <a
                                                    className={`review-link ${reviews[item.product_id] ? 'reviewed' : ''}`}
                                                    onClick={() => handleReviewClick(item.product_id, item.item)}
                                                >
                                                    {reviews[item.product_id] ? 'reviewed' : 'review'}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
