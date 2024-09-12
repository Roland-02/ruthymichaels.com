import React, { useState } from 'react';
import '../../styles/profile.css';
import '../../styles/common.css';

const OrderHistory = ({ orders, handleReviewClick, reviews }) => {
    const [expandedOrders, setExpandedOrders] = useState({});

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
                            <th>Price</th>
                            <th>Date</th>
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
                                        <td>£{item.price.toFixed(2)}</td>
                                        {index === 0 && (
                                            <td rowSpan={order.items.length}>
                                                {new Date(order.date).toLocaleDateString('en-GB')}
                                            </td>
                                        )}
                                        <td>
                                            <a
                                                className={`review-link ${reviews[item.product_id] ? 'reviewed' : ''}`}
                                                onClick={() => handleReviewClick(item.product_id, order.item_name)}
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
                                {order.items.map((item) => (
                                    <div key={`${order.order_id}-${item.product_id}`} className="mobile-order-item">
                                        <p>Item: {item.item}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: £{item.price.toFixed(2)}</p>
                                        <p>Date: {new Date(order.date).toLocaleDateString('en-GB')}</p>
                                        <div className="review-link-container">
                                            <a
                                                className={`review-link ${reviews[item.product_id] ? 'reviewed' : ''}`}
                                                onClick={() => handleReviewClick(item.product_id, order.item_name)}
                                            >
                                                {reviews[item.product_id] ? 'reviewed' : 'review'}
                                            </a>
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
