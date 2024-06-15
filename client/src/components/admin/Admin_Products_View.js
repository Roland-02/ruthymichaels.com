import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';

import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import AddProductsForm from './Add_Products_Form';

const Admin_Products_View = ({ session }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/get_products');
                setProducts(response.data);
            } catch (error) {
                setMessage('Error loading products. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        if (location.pathname === '/admin/products/add_product') {
            setShowAddForm(true);
        } else {
            setShowAddForm(false);
        }
    }, [location.pathname, navigate]);

    const handleDelete = async (productId) => {
        try {
            await axios.delete(`/delete_product/${productId}`);
            setProducts(products.filter(product => product.id !== productId));
        } catch (error) {
            setMessage('Error deleting product. Please try again.');
        }
    };

    const handleClose = () => {
        navigate('/admin/products');
    };


    return (
        <div>
            <Navbar session={session} />
            {showAddForm && (
                <div>
                    <div id="overlay" onClick={handleClose}></div>
                    {showAddForm && <AddProductsForm onClose={handleClose} />}
                </div>
            )}
            <section className="container" id="productsContainer">
                <div className="row">
                    <h2>Stock</h2>
                    <div className="container" id="viewProducts">
                        <div className="row justify-content-center">
                            {loading && <div className="loading-spinner"></div>}
                            {message && <div id="message" className="mt-3">{message}</div>}
                            {products.map(product => (
                                <div key={product.id} className="col-lg-12 mb-3">
                                    <div className="product-card d-flex align-items-center justify-content-between p-2">
                                        <div className="col-lg-4 text-left product-column">
                                            <h2 className="product-title">{product.name}</h2>
                                        </div>
                                        <div className="col-lg-2 text-center product-column">
                                            <h3>£{product.price}</h3>
                                        </div>
                                        <div className="col-lg-5 image-container product-column">
                                            <img src={`https://drive.google.com/thumbnail?id=${product.image_1}`} className="product-image" alt="Product Image" />
                                        </div>
                                        <div className="col-lg-1 control-buttons">
                                            <svg className="control-icon bi bi-trash3-fill" onClick={() => handleDelete(product.id)} width="40" height="40" viewBox="0 0 16 16">
                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                            </svg>

                                            <svg className="control-icon bi bi-floppy2-fill" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 16 16">
                                                <path d="M12 2h-2v3h2z" />
                                                <path
                                                    d="M1.5 0A1.5 1.5 0 0 0 0 1.5v13A1.5 1.5 0 0 0 1.5 16h13a1.5 1.5 0 0 0 1.5-1.5V2.914a1.5 1.5 0 0 0-.44-1.06L14.147.439A1.5 1.5 0 0 0 13.086 0zM4 6a1 1 0 0 1-1-1V1h10v4a1 1 0 0 1-1 1zM3 9h10a1 1 0 0 1 1 1v5H2v-5a1 1 0 0 1 1-1" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='addBtnContainer'>
                        <Link to="/admin/products/add_product">
                            <svg className="control-icon" width="50" height="50" viewBox="0 0 16 16">
                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0" />
                            </svg>
                        </Link>
                    </div>
                </div>

            </section>
            <Footer />
        </div>

    );
};

export default Admin_Products_View;
