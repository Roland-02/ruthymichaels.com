// src/components/common/Products.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/common.css';
import '../../styles/index.css';
import '../../bootstrap/css/mdb.min.css';

const Products = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/get_products');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <section id="products" className="container">
            <div className="row" id="products_section">
                {products.map((product) => (
                    <div className="col-3" key={product.name}>
                        <div className="card product-card">
                            <div className="card-body">
                                <img
                                    src={`https://drive.google.com/thumbnail?id=${product.image_1}`}
                                    className="product-image"
                                    alt="Product"
                                />
                                <h4 className="card-title">{product.name}</h4>
                                <p className="card-text">{product.description}</p>
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 className="price-text-style">£{product.price}</h3>
                                </div>
                                <div>
                                    <button type="button" className="btn penguin-btn">
                                        <i className="fa fa-shopping-cart"></i> BUY
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Products;
