import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';

import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const Orders_View = ({ session }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [bookVaultRef, setBookVaultRef] = useState('');
    const [trackingRef, setTrackingRef] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const navigate = useNavigate();

    // Fetch the orders from the backend API
    const fetchOrders = async () => {
        try {
            const response = await axios.get('/admin/orders_status');
            if (response.data) {
                setOrders(response.data.orders);
            }
            setLoading(false);
        } catch (err) {
            setError("There was an error fetching the orders.");
            setLoading(false);
        }
    };

    // Get available statuses based on the current status
    const getAvailableStatuses = (currentStatus) => {
        const statusFlow = ['Printing', 'Shipped', 'Delivered'];
        const currentIndex = statusFlow.indexOf(currentStatus);
        return statusFlow.slice(currentIndex + 1);
    };

    // Handle row click to open the form with order details
    const handleRowClick = (order) => {
        setSelectedOrder(order);
        setBookVaultRef(order.bookVault_ref || '');  // Set the initial BookVault reference
        setOrderStatus(order.status);  // Set the current status
    };

    const handleClose = () => {
        setSelectedOrder(null);
    };

    // Handle status update and notify user
    const handleSaveChanges = async () => {
        if (selectedOrder) {
            const confirmSave = window.confirm('Are you sure you want to update the order status and notify the customer?');

            if (confirmSave) {
                try {
                    await axios.post('/admin/update_order_status', {
                        customer_email: selectedOrder.user_email,
                        order_id: selectedOrder.order_id,
                        status: orderStatus,
                        bookVault_ref: bookVaultRef,
                        tracking_ref: trackingRef
                    });

                    // Reload the orders after update
                    await fetchOrders();
                    alert('Order status updated successfully!');
                } catch (err) {
                    alert('Failed to update the order status.');
                }
                setSelectedOrder(null);  // Close the form
            }
        }
    };

    useEffect(() => {
        const initialize = async () => {
            window.scrollTo(0, 0);
            setLoading(true);

            try {
                await fetchOrders();
            } catch (error) {
                setError('Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };
        initialize();
    }, [session, navigate]);

    return (
        <div>
            <Navbar session={session} />

            {/* Form for updating order status */}
            {selectedOrder && (
                <div>
                    <div className="overlay" onClick={handleClose}></div>

                    <div className="page-form-container orders-form">
                        <h4>Order: ...{selectedOrder.order_id.slice(-8)}</h4>

                        <form className="container" style={{ width: '90%' }}>

                            <div className="form-group mb-4 mt-3">
                                <label htmlFor="bookVaultRef">BookVault Reference:</label>
                                <input
                                    type="text"
                                    id="bookVaultRef"
                                    value={bookVaultRef}
                                    onChange={(e) => setBookVaultRef(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter BookVault reference"
                                />
                            </div>

                            <div className="form-group mb-4">
                                <label htmlFor="orderStatus">Order Status:</label>
                                <select
                                    id="orderStatus"
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="form-control"
                                >
                                    <option value={selectedOrder.status}>{selectedOrder.status}</option>
                                    {getAvailableStatuses(selectedOrder.status).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group mb-6">
                                <label htmlFor="trackingRef">Shipping Tracking Number:</label>
                                <input
                                    type="text"
                                    id="trackingRef"
                                    value={trackingRef}
                                    onChange={(e) => setTrackingRef(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter tracking reference"
                                    disabled={orderStatus !== 'Shipped'} // Disable if not 'Shipped'
                                />
                            </div>

                            <div className='row'>
                                <div className="form-buttons col d-flex justify-content-center mb-4 ">
                                    <button className="btn btn-success me-2" onClick={handleSaveChanges}>Save Changes</button>
                                    <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cancel</button>
                                </div>
                            </div>

                        </form>
                    </div>

                </div>

            )}

            <div className="container adminProductsContainer">
                <h2>Orders Overview</h2>

                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped admin-product-table">
                            <thead>
                                <tr>
                                    <th>Customer Email</th>
                                    <th>Customer Reference</th>
                                    <th>BookVault Reference</th>
                                    <th>Tracking Reference</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map(order => (
                                        <tr key={order.order_id} onClick={() => handleRowClick(order)}>
                                            <td>{order.user_email}</td>
                                            <td>...{order.order_id.slice(-15)}</td>
                                            <td>{order.bookVault_ref}</td>
                                            <td>{order.tracking_ref}</td>
                                            <td>{order.status}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>



            <Footer />
        </div>
    );
};

export default Orders_View;
