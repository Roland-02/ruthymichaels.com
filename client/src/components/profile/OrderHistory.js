import React, { useState } from 'react';

import '../../styles/profile.css';
import '../../styles/common.css';

const OrderHistory = ({ orders, handleReviewClick }) => {

    return (
        <div className="order-history">
            <h2>Order History</h2>
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
                                        <button
                                            className='review-btn'
                                            onClick={() => handleReviewClick(item.product_id, item.item)}
                                        >
                                           Review
                                        </button>
                                    </td>
                                </tr>
                            ))}

                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderHistory;
