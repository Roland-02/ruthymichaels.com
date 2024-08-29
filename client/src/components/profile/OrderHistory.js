import React from 'react';

import '../../styles/profile.css';
import '../../styles/common.css';

const OrderHistory = ({ orders }) => {
    return (
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
                        <React.Fragment key={order.order_id}>
                            {order.items.map((item, index) => (
                                <tr key={`${order.order_id}-${index}`}>
                                    {/* Only display the order ID and date on the first row of each order */}
                                    {index === 0 && (
                                        <td rowSpan={order.items.length}>
                                            {order.order_id}
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
