import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';

import axios from 'axios';

import '../../styles/index.css';
import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';


const Products = ({ setMessage, initialProducts, updateWishlist }) => {
    const { session } = useContext(SessionContext);
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [cartProducts, setCartedProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const initialize = async () => {
            if (initialProducts) {
                setProducts(initialProducts)
            } else {
                await fetchProducts();
            }
            await fetchWishlist();
            await fetchCartProducts();
        };
        initialize();

        const sampleWishlist = [
            {
                id: 1,
                name: 'Proroductroductduct roduct roductroduct',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '10.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            },
            {
                id: 2,
                name: 'Product 2',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '20.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            },
            {
                id: 3,
                name: 'Product 3',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '30.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            },
            {
                id: 4,
                name: 'Product 1',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '10.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            },
            {
                id: 5,
                name: 'Product 2',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '20.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            },
            {
                id: 6,
                name: 'Product 3',
                type: 'book',
                description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
                price: '30.00',
                imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
            }
        ];

        // setProducts(sampleWishlist)

    }, [session, initialProducts]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/server/get_products');
            const allProducts = response.data;
            const formattedProducts = allProducts.map(prod => {
                const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                return { ...prod, imageUrls };
            });
            setProducts(formattedProducts);

        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            if (session && session.id) {
                const response = await axios.get(`/server/get_wishlist/${session.id}`);
                const allLoved = response.data.map(x => x.product_id);
                setWishlist(allLoved);

            } else {
                setWishlist([])
            }

        } catch (error) {
            console.error('Error fetching loved products:', error);

        }
    };

    const fetchCartProducts = async () => {
        try {
            if (session && session.id) {
                const response = await axios.get(`/server/get_cart/${session.id}`);
                const allCart = response.data.map(x => x.product_id);
                setCartedProducts(allCart);

            } else {
                console.log('fetch cart from cache')
            }

        } catch (error) {
            console.error('Error fetching loved products:', error);

        }
    };


    const handleLoveClick = async (productID) => {
        if (session && session.id != null) {

            const isLoved = wishlist.includes(productID);
            setWishlist((prev) => {
                if (isLoved) {
                    return prev.filter(id => id !== productID); // Remove product
                } else {
                    return [...prev, productID]; // Add product
                }
            });

            try {
                let response;
                if (isLoved) {
                    await updateWishlist(productID);

                    // If the product is already loved, make a request to remove it
                    response = await axios.post('/server/remove_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        console.log('Product unloved successfully');
                        setMessage({ content: 'Removed from wishlist', productID, action: 'love' });

                    } else {
                        console.error('Failed to unlove product:', response.data);
                        setMessage({ content: 'Error removing from wishlist', productID, action: 'love' });

                    }
                } else {

                    // If the product is not loved, make a request to love it
                    response = await axios.post('/server/add_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        console.log('Product loved successfully');
                        setMessage({ content: 'Added to wishlist', productID, action: 'love' });

                    } else {
                        console.error('Failed to love product:', response.data);
                        setMessage({ content: 'Error adding to wishlist', productID, action: 'love' });

                    }
                }
            } catch (error) {
                console.error('Error toggling love state:', error);
                // Revert the state if the request fails
                setWishlist((prev) => ({
                    ...prev,
                    [productID]: isLoved,
                }));
                setMessage({ content: 'Error occurred while updating wishlist', productID, action: 'love' });

            }
        } else {
            navigate('/login');
        }
    };

    const handleCartClick = async (productID) => {
        if (session && session.id != null) {

            const isCart = cartProducts.includes(productID);
            setCartedProducts((prev) => {
                if (isCart) {
                    return prev.filter(id => id !== productID); // Remove product
                } else {
                    return [...prev, productID]; // Add product
                }
            });

            try {
                let response;
                if (isCart) {
                    // If the product is already loved, make a request to remove it
                    response = await axios.post('/server/remove_cart_product', {
                        user_id: session.id,
                        product_id: productID,
                    });

                    if (response.status === 200) {
                        console.log('Product uncarted successfully');
                        setMessage({ content: 'Removed from basket', productID, action: 'cart' });

                    } else {
                        console.error('Failed to uncart product:', response.data);
                        setMessage({ content: 'Failed to remove from basket', productID, action: 'cart' });

                    }
                } else {

                    // If the product is not loved, make a request to love it
                    response = await axios.post('/server/update_cart', {
                        user_id: session.id,
                        product_id: productID,
                        qty: 1
                    });

                    if (response.status === 200) {
                        console.log('Product cart successfully');
                        setMessage({ content: 'Added to basket', productID, action: 'cart' });

                    } else {
                        console.error('Failed to add to basket', response.data);
                    }
                }
            } catch (error) {
                console.error('Error toggling love state:', error);
                // Revert the state if the request fails
                setCartedProducts((prev) => ({
                    ...prev,
                    [productID]: isCart,
                }));
                setMessage({ content: 'Error saving basket', productID, action: 'cart' });

            }
        } else {
            console.log('store cart in cache')
        }
    };

    const handleProductClick = (name) => {
        navigate(`/${name}`);
    };


    return (
        <section className="container" id="products">
            <div className="row" id="products_section">

                {products.map((product) => (
                    <div className="col-lg-4 col-md-3 card-container" key={product.id}>
                        <div className="product-card" onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.name);
                        }}>
                            <div className="card-body">
                                <img
                                    src={product.imageUrls[0]}
                                    className="product-image"
                                    alt="Product"
                                    onMouseEnter={(e) => {
                                        if (product.imageUrls[1]) {
                                            e.currentTarget.src = product.imageUrls[1];
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.src = product.imageUrls[0];
                                    }}
                                />
                                <div className='product-details'>
                                    <h2 className="card-title">{product.name}</h2>
                                    <h5 className="card-price">£{product.price}</h5>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="menu-item shop-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoveClick(product.id);
                                }}>
                                    {wishlist.includes(product.id) ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                            <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart" viewBox="0 0 16 16">
                                            <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                        </svg>
                                    )}
                                </div>

                                <div className="menu-item shop-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    handleCartClick(product.id);
                                }}>
                                    {cartProducts.includes(product.id) ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-cart-fill" viewBox="0 0 16 16">
                                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-cart-plus" viewBox="0 0 16 16">
                                            <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
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
