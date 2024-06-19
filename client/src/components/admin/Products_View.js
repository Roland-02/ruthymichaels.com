import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../styles/common.css';
import '../../styles/admin.css';
import '../../bootstrap/css/mdb.min.css';

import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import ProductForm from './Product_Form';

const Products_View = ({ session }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/server/get_products');
                if (response.status == 200) {
                    setProducts(response.data);
                } else {
                    setMessage({ text: 'No products found', type: 'info' });
                }
            } catch (error) {
                setMessage({ text: 'No products found', type: 'info' });
            } finally {
                setLoading(false);
            }
        };
        loadProducts();

        if (location.pathname.includes('/admin/products/')) {
            setShowAddForm(true);
        } else {
            setShowAddForm(false);
        }

    }, [location.pathname, navigate]);

    const handleDelete = async (productId) => {
        try {
            const response = await axios.post(`/admin/products/delete_product/${productId}`);
            if (response.status == 200) {
                setProducts(products.filter(product => product.id !== productId));
            setMessage({ text: 'Product deleted', type: 'success' });
            } else {
                setMessage({ text: 'Failed to delete', type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: 'Error deleting product. Please try again.', type: 'danger' });

        } finally {
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 2000);
        };
    };

    const handleEdit = (product) => {
        // setSelectedProduct(product);
        setShowAddForm(true);
        navigate(`/admin/products/edit_product/${product.id}`);
    };

    const handleNew = () => {
        // setSelectedProduct(null);
        setShowAddForm(true);
        navigate(`/admin/products/add_product`);
    };

    const handleClose = () => {
        setShowAddForm(false);
        navigate('/admin/products');
    };

    return (
        <div>
            <Navbar session={session} />
            {showAddForm && (
                <div>
                    <div id="overlay" onClick={handleClose}></div>
                    <ProductForm/>
                </div>
            )}

            <div className="container" id="adminProductsContainer">

                <div className="row">
                    <h2>Stock</h2>
                    {loading && <div className="loading-spinner"></div>}
                    {message.text && (
                        <div className={`alert alert-${message.type} text-center`} role="alert">
                            {message.text}
                        </div>
                    )}
                    <div className="table-container">
                        <table className="table table-striped admin-product-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} onClick={() => handleEdit(product)}>
                                        <td>{product.name}</td>
                                        <td>{product.type}</td>
                                        <td>{product.description}</td>
                                        <td>£{product.price}</td>
                                        <td>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                className="bi bi-trash control-icon"
                                                viewBox="0 0 16 16"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(product.id);
                                                }}
                                            >
                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                            </svg>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='addBtnContainer'>
                        <div onClick={handleNew}>
                            <svg className="control-icon" width="50" height="50" viewBox="0 0 16 16">
                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm6.5 4.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0" />
                            </svg>
                        </div>
                    </div>

                </div>

            </div>

            <Footer />
        </div>

    );
};

export default Products_View;
