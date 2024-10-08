import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import CurrencyContext from '../components/context/CurrencyContext';
import { loadStripe } from '@stripe/stripe-js';

import '../styles/cart.css';
import '../styles/common.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SimilarProducts from '../components/common/SimilarProducts';
import MessageBanner from '../components/common/MessageBanner';
import axios from 'axios';


const Cart = () => {
    const { session, Loading } = useContext(SessionContext);
    const { currency, exchangeRates } = useContext(CurrencyContext);
    const [cartProducts, setCartedProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();
    const location = useLocation();

    const currencySymbols = {
        GBP: '£',
        USD: '$',
        EUR: '€',
    };

    const convertPrice = (priceInGBP, currency) => {
        if(currency === 'GBP'){
            return priceInGBP.toFixed(2);
        }
        const rate = exchangeRates[currency] || 1;
        return (priceInGBP * rate).toFixed(2);
    };

    const fetchCartProducts = async () => {
        if (session && session.id) {
            try {
                const response = await axios.get(`/server/get_cart_products/${session.id}`);
                if (response.status === 200) {

                    const products = response.data;

                    // Format imageUrls for each product
                    const formattedProducts = products.map(prod => {
                        const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                        const imageUrls = imageIds.map(name => `/uploads/${name}`);
                        return { ...prod, imageUrls };
                    });

                    setCartedProducts(formattedProducts);

                    const newTotalPrice = calculateTotalPrice(products);
                    setTotalPrice(newTotalPrice);

                } else {
                    setMessage({ content: 'Failed to fetch cart', product: null, action: 'error' });
                }
            } catch (error) {            
                setMessage({ content: 'Failed to fetch cart', product: null, action: 'error' });
            }

        } else {
            // Fetch cart from cache

            let cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

            if (cachedCart.length > 0) {
                try {
                    // Construct the query string with product IDs
                    const queryString = cachedCart.map(item => item.productID).join(',');

                    // Make a GET request to get the products by their IDs
                    const response = await axios.get(`/server/get_products_by_ids?ids=${queryString}`);
                    const products = response.data;

                    // Format image URLs and ensure each product has a qty
                    const formattedProducts = products.map(prod => {
                        const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                        const imageUrls = imageIds.map(name => `/uploads/${name}`);

                        // Find the corresponding cart item to get the qty
                        const cartItem = cachedCart.find(item => item.productID === prod.id);
                        const qty = cartItem ? cartItem.qty : 1;  // Default to 1 if qty not found

                        return { ...prod, imageUrls, qty };
                    });

                    setCartedProducts(formattedProducts);

                    // Calculate the total price after setting cart products
                    const totalPrice = calculateTotalPrice(formattedProducts);
                    setTotalPrice(totalPrice);

                } catch (error) {
                    setMessage({ content: 'Failed to fetch cart', product: null, action: 'error' });
                }

            }
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

        } catch (error) {}
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
                    // If the product is already loved, make a request to remove it
                    response = await axios.post('/server/remove_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Removed from wishlist', productID, action: 'love' });

                    } else {
                        setMessage({ content: 'Error removing from wishlist', productID, action: 'love' });
                    }
                } else {

                    // If the product is not loved, make a request to love it
                    response = await axios.post('/server/add_wishlist', {
                        user_id: session.id,
                        product_id: productID
                    });

                    if (response.status === 200) {
                        setMessage({ content: 'Added to wishlist', productID, action: 'love' });

                    } else {
                        setMessage({ content: 'Error adding to wishlist', productID, action: 'love' });

                    }
                }
            } catch (error) {
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

    const handleRemoveClick = async (productID) => {
        if (session && session.id != null) {
            try {
                const response = await axios.post('/server/remove_cart_product', {
                    user_id: session.id,
                    product_id: productID
                });

                if (response.status === 200) {
                    setMessage({ content: 'Item removed from cart', productID, action: 'cart' });
                    setCartedProducts(prevProducts => {
                        const updatedProducts = prevProducts.filter(product => product.id !== productID);
                        const newTotalPrice = calculateTotalPrice(updatedProducts);
                        setTotalPrice(newTotalPrice);
                        return updatedProducts;
                    });

                } else {
                    setMessage({ content: 'Failed to remove item', productID, action: 'cart' });
                }

            } catch (error) {
                setMessage({ content: 'Error removing item', productID, action: 'cart' });
            }

        } else {

            // Retrieve the current cart from localStorage
            let cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

            // Remove the product from the cached cart
            cachedCart = cachedCart.filter(item => item.productID !== productID);

            // Update the cart in localStorage
            localStorage.setItem('cartProducts', JSON.stringify(cachedCart));

            setMessage({ content: 'Item removed from cart', productID, action: 'cart' });
            setCartedProducts(prevProducts => {
                const updatedProducts = prevProducts.filter(product => product.id !== productID);
                const newTotalPrice = calculateTotalPrice(updatedProducts);
                setTotalPrice(newTotalPrice);
                return updatedProducts;
            });
        }

    };

    const calculateTotalPrice = (products) => {
        return products.reduce((total, product) => total + (product.price * product.qty), 0);
    };

    const handleQtyChange = async (productId, newQty) => {
        // Update the products in the state
        const updatedProducts = cartProducts.map(product =>
            product.id === productId ? { ...product, qty: newQty } : product
        );
        setCartedProducts(updatedProducts);

        // Recalculate the total price
        const newTotalPrice = calculateTotalPrice(updatedProducts);
        setTotalPrice(newTotalPrice);

        if (session && session.id) {
            try {
                const response = await axios.post('/server/update_cart', {
                    user_id: session.id,
                    product_id: productId,
                    qty: newQty
                });

                if (response.status === 200) {
                    setMessage({ content: 'Updated quantity', product: null, action: 'success' });
                }

            } catch (error) {
                setMessage({ content: 'Failed to update quantity', product: null, action: 'error' });
            }

        } else {
            // Update the cart in localStorage when the user is not logged in
            let cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

            // Find the product in the cache and update its quantity
            cachedCart = cachedCart.map(item =>
                item.productID === productId ? { ...item, qty: newQty } : item
            );

            // Save the updated cart back to localStorage
            localStorage.setItem('cartProducts', JSON.stringify(cachedCart));
        }
    };

    const handleProductClick = (name) => {
        navigate(`/item/${name}`);
    };

    const handleCheckout = async () => {
        try {
            const convertedCartItems = cartProducts.map((product) => ({
                ...product,
                price: convertPrice(product.price, currency),  // Convert the price to the selected currency
            }));

            const response = await axios.post(`/checkout/create_checkout_session`, {
                cartItems: convertedCartItems,
                user_id: session.id || null,
                user_email: session.email || '',
                shipping_cost: convertPrice(shippingCost, currency),
                currency: currency,
            });

            if (response.status === 200) {
                const { sessionId } = response.data;

                // public key
                const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

                // Redirect to the Stripe Checkout page
                await stripe.redirectToCheckout({ sessionId });

            } else {
                setMessage({ content: 'Error during checkout', product: null, action: 'error' });
            }
        } catch (error) {
            setMessage({ content: 'Error checking out', product: null, action: 'error' });
        }
    };

    useEffect(() => {
        const initialize = async () => {
            window.scrollTo(0, 0);

            if (Loading) return;

            await fetchCartProducts();

            if (session && session.id) {
                await fetchWishlist();
            }
        };
        initialize();

    }, [session, Loading, navigate]);

    useEffect(() => {
        if (cartProducts.length > 0) {
            setShippingCost(3.99);
        } else {
            setShippingCost(0);
        }
    }, [cartProducts]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const orderSuccess = params.get('order_success');
        const token = params.get('token');

        if (orderSuccess && token) {
            setOrderSuccess(true);
            localStorage.removeItem('cartProducts');
            setCartedProducts([]);
            setTotalPrice(0);
        }

    }, [location, session, cartProducts, navigate]);


    return (
        <div>
            <Navbar session={session} />

            <MessageBanner message={message} setMessage={setMessage} />

            <div className="view-container cart">
                <div className="cart-layout desktop">

                    <div className="col-lg-8">

                        {orderSuccess ? (
                            <div className="order-confirmation">
                                <h2>Thank you for your order!</h2>
                                <p>An order confirmation has been sent to your email</p>
                                <button className='continue-shopping' onClick={() => navigate('/')}>Continue Shopping</button>
                                {!(session && session.id) && (
                                    <button className='create-account' onClick={() => navigate('/createAccount')}>Create an Account</button>
                                )}
                            </div>
                        ) : (
                            <div className="cart-products">
                                {cartProducts.map((product) => (
                                    <div key={product.id} className="cart-product" onClick={(e) => {
                                        e.stopPropagation();
                                        handleProductClick(product.name);
                                    }}>
                                        <img src={product.imageUrls[0]} alt={product.name} className="cart-product-image" />
                                        <div className="cart-product-details">
                                            <div className="cart-product-top">
                                                <p className="cart-product-name">{product.name}</p>
                                                <p className="cart-product-type">{product.type}</p>
                                            </div>
                                            <div className="cart-product-bottom">
                                                <p className="cart-product-price">{currencySymbols[currency]}{convertPrice(product.price, currency)}</p>

                                                <input
                                                    type="number"
                                                    className="cart-product-qty"
                                                    value={product.qty}
                                                    min={1}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleQtyChange(product.id, parseInt(e.target.value))}
                                                />
                                                <div className="cart-card-footer">
                                                    <div className="menu-item shop-btn" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLoveClick(product.id);
                                                    }}>
                                                        {wishlist.includes(product.id) ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-suit-heart-fill" viewBox="0 0 16 16">
                                                                <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-suit-heart" viewBox="0 0 16 16">
                                                                <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="menu-item shop-btn" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveClick(product.id);
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-trash3" viewBox="0 0 16 16">
                                                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <div className="col-lg-4">
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <p><span>Subtotal:</span><span>{currencySymbols[currency]}{convertPrice(totalPrice, currency)}</span></p>
                            <p><span>Shipping:</span><span>{currencySymbols[currency]}{convertPrice(shippingCost, currency)}</span></p>
                            <h4><span>Total:</span> <span>{currencySymbols[currency]}{convertPrice(totalPrice + shippingCost, currency)}</span></h4>
                            <button className="checkout-button" onClick={handleCheckout} disabled={cartProducts.length === 0}>
                                Checkout
                            </button>
                        </div>
                    </div>

                </div>

                <div className="cart-layout mobile">

                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        <p><span>Subtotal:</span> <span>£{totalPrice.toFixed(2)}</span></p>
                        <p><span>Shipping:</span> <span>£{shippingCost.toFixed(2)}</span></p>
                        <h4><span>Total:</span> <span>£{(totalPrice + shippingCost).toFixed(2)}</span></h4>
                        <button className="checkout-button" onClick={handleCheckout} disabled={cartProducts.length === 0}>
                            Checkout
                        </button>
                    </div>

                    {orderSuccess ? (
                        <div className="order-confirmation">
                            <h2>Thank you for your order!</h2>
                            <p>An order confirmation has been sent to your email</p>
                            <button className='continue-shopping' onClick={() => navigate('/')}>Continue Shopping</button>
                            {!(session && session.id) && (
                                <button className='create-account' onClick={() => navigate('/createAccount')}>Create an Account</button>
                            )}
                        </div>
                    ) : (
                        <div className="cart-products">
                            {cartProducts.map((product) => (
                                <div key={product.id} className="cart-product" onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product.name);
                                }}>
                                    <img src={product.imageUrls[0]} alt={product.name} className="cart-product-image" />
                                    <div className="cart-product-details">
                                        <div className="cart-product-top">
                                            <p className="cart-product-name">{product.name}</p>
                                            <p className="cart-product-type">{product.type}</p>
                                        </div>
                                        <div className="cart-product-bottom">
                                            <p className="cart-product-price">£{product.price}</p>

                                            <input
                                                type="number"
                                                className="cart-product-qty"
                                                value={product.qty}
                                                min={1}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleQtyChange(product.id, parseInt(e.target.value))}
                                            />
                                            <div className="cart-card-footer">
                                                <div className="menu-item shop-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLoveClick(product.id);
                                                }}>
                                                    {wishlist.includes(product.id) ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-suit-heart-fill heartBtn" viewBox="0 0 16 16">
                                                            <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-suit-heart heartBtn" viewBox="0 0 16 16">
                                                            <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="menu-item shop-btn" onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveClick(product.id);
                                                }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className="bi bi-trash3 deleteBtn" viewBox="0 0 16 16">
                                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                <SimilarProducts />

            </div>

            <Footer />

        </div>
    );
};

export default Cart;