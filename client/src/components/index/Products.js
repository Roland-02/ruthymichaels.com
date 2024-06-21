// src/components/common/Products.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/common.css';
import '../../styles/index.css';
import '../../bootstrap/css/mdb.min.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [lovedProducts, setLovedProducts] = useState({});
    const [cartProducts, setCartedProducts] = useState({});


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/server/get_products');
                const productsWithImages = response.data.map(product => {
                    const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
                    const firstImageUrl = imageIds.length > 0 ? `https://drive.google.com/thumbnail?id=${imageIds[0]}` : null;
                    return { ...product, firstImageUrl };
                });
                setProducts(productsWithImages);

            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        // setProducts([{
        //     name: 'black girl book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'
        // },
        // {
        //     name: 'black girl colouring book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colouring',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colouring book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colouring book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colourinb book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colourinb book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colourinb book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colouring book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // },
        // {
        //     name: 'black girl colouring book',
        //     type: 'book',
        //     description: 'positive affirmations',
        //     price: '4.99',
        //     firstImageUrl: 'https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw'

        // }]);

        fetchProducts();

    }, []);

    const handleLoveClick = (productID) => {
        setLovedProducts((prev) => ({
            ...prev,
            [productID]: !prev[productID],
        }));
    };

    const handleCartClick = (productID) => {
        setCartedProducts((prev) => ({
            ...prev,
            [productID]: !prev[productID],
        }));
    };

    return (
        <section id="products" className="container">
            <div className="row" id="products_section">
                {products.map((product) => (
                    <div className="col-3" key={product.id}>
                        <div className="product-card">
                            <div className="card-body">
                                <img
                                    src={product.firstImageUrl}
                                    className="product-image"
                                    alt="Product"
                                />
                                <div className='product-details'>
                                    <h2 className="card-title">{product.name}</h2>
                                    <h5 className="card-price">£{product.price}</h5>
                                    <h4 className="card-type">{product.type}</h4>
                                </div>
                            </div>
                    
                            <div className="card-footer">
                                <div className="menu-item shop-btn" onClick={() => handleLoveClick(product.id)}>
                                    {lovedProducts[product.id] ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                            <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" className="bi bi-suit-heart" viewBox="0 0 16 16">
                                            <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="menu-item shop-btn" onClick={() => handleCartClick(product.id)}>
                                    {cartProducts[product.id] ? (                                        
                                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" class="bi bi-cart-fill" viewBox="0 0 16 16">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" className="bi bi-cart" viewBox="0 0 16 16">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                        </svg>
                                    )}
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
