import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import CurrencyContext from '../components/context/CurrencyContext';
import axios from 'axios';

import '../styles/view_product.css'
import '../styles/common.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SimilarProducts from '../components/common/SimilarProducts';
import MessageBanner from '../components/common/MessageBanner'
import { argv0 } from 'process';


const View_Product = () => {
    const { session } = useContext(SessionContext);
    const { currency, exchangeRates } = useContext(CurrencyContext);
    const { name } = useParams();
    const [product, setProduct] = useState({
        id: null,
        name: '',
        type: '',
        description: '',
        age: '',
        price: '',
        imageUrls: []
    });
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [wishlist, setWishlist] = useState([]);
    const [cartProducts, setCartedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState([]);
    const navigate = useNavigate();


    const currencySymbols = {
        GBP: '£',
        USD: '$',
        EUR: '€',
    };

    const convertPrice = (priceInGBP, currency) => {
        if(currency === 'GBP'){
            return `${currencySymbols[currency]}${priceInGBP}`
        }
        const rate = exchangeRates[currency];
        const convertedPrice = (priceInGBP * rate).toFixed(2);
        return `${currencySymbols[currency]}${convertedPrice}`;
    };

    const convertPriceNumeric = (priceInGBP, currency) => {
        const rate = exchangeRates[currency] || 1;
        return (priceInGBP * rate).toFixed(2);
    };

    const totalPriceNumeric = (convertPriceNumeric(product.price, currency) * quantity).toFixed(2);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`/server/get_product`, {
                params: { name }
            });
            if (response.status === 200) {
                window.scrollTo(0, 0);
                const productData = response.data;
                const imageIds = productData.image_URLs ? productData.image_URLs.split(',') : [];
                const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                setProduct({ ...productData, imageUrls });
                setSelectedImage(imageUrls[0]);
            } else {
                navigate('/')
            }

        } catch (error) { }
    };

    const fetchProductReviews = async (product_id) => {
        try {
            const response = await axios.get(`/server/fetch_product_reviews/${product_id}`);
            if (response.status === 200) {
                const reviewsArray = response.data.reviews;
                const formattedReviewsArray = reviewsArray.map(review => ({
                    ...review,
                    user_email: review.user_email.split('@')[0]
                }));
    
                setReviews(formattedReviewsArray);
    
                // Calculate average rating here
                const sum = formattedReviewsArray.reduce((acc, review) => acc + review.rating, 0);
                const avg = formattedReviewsArray.length > 0 ? (sum / formattedReviewsArray.length) : 0;
    
                setAverageRating(Math.round(avg));
            } else {
                setReviews([]);
                setAverageRating(0); // Reset average rating if no reviews
            }
        } catch (error) {
            setReviews([]);
            setAverageRating(0); // Reset average rating on error
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

        } catch (error) { }
    };

    const fetchCartProducts = async () => {
        try {
            if (session && session.id) {
                const response = await axios.get(`/server/get_cart/${session.id}`);
                const allCart = response.data.map(x => x.product_id);
                setCartedProducts(allCart);
            } else {
                // fetch cart from cache
                const cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];
                const cartProductIDs = cachedCart.map(item => item.productID);
                setCartedProducts(cartProductIDs);
            }

        } catch (error) { }
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

    const handleCartClick = async (productID, quantity) => {
        if (session && session.id != null) {
            const isCart = cartProducts.some(item => item.productID === productID);

            setCartedProducts((prev) => {
                if (isCart) {
                    return prev.map(item =>
                        item.productID === productID ? { ...item, qty: item.qty + quantity } : item
                    );
                } else {
                    return [...prev, { productID, qty: quantity }];
                }
            });

            try {
                const response = await axios.post('/server/update_cart', {
                    user_id: session.id,
                    product_id: productID,
                    qty: quantity  // This should correctly update the quantity on the server
                });

                if (response.status === 200) {
                    setMessage({ content: 'Added to basket', productID, action: 'cart' });
                } else {
                    setMessage({ content: 'Failed to update quantity in basket', productID, action: 'cart' });
                }

            } catch (error) {
                setCartedProducts((prev) => {
                    if (isCart) {
                        return prev.map(item =>
                            item.productID === productID ? { ...item, qty: item.qty - quantity } : item
                        );
                    } else {
                        return prev.filter(item => item.productID !== productID);
                    }
                });
                setMessage({ content: 'Error saving basket', productID, action: 'cart' });
            }
        } else {
            // Logic for when the user is not signed in (store in cache)

            // Retrieve the current cart from localStorage
            let cachedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

            // Check if the product is already in the cached cart
            const isCart = cachedCart.some(item => item.productID === productID);

            // Add or update the product in the cached cart
            if (isCart) {
                cachedCart = cachedCart.map(item =>
                    item.productID === productID ? { ...item, qty: item.qty + quantity } : item
                );
            } else {
                cachedCart.push({ productID, qty: quantity });
            }

            // Update the cart in localStorage
            localStorage.setItem('cartProducts', JSON.stringify(cachedCart));

            // Update the state with only product IDs
            const cartProductIDs = cachedCart.map(item => item.productID);
            setCartedProducts(cartProductIDs);

            setMessage({ content: 'Added to basket', productID, action: 'cart' });
        }
    };

    const increaseQuantity = () => setQuantity(quantity + 1);
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        } else {
            setQuantity(1);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            window.scrollTo(0, 0);

            await fetchProduct();
            await fetchCartProducts();

            if (session && session.id) {
                await fetchWishlist();
            }

        };
        initialize();

    }, [navigate]);

    useEffect(() => {
        if (product && product.id) {
            fetchProductReviews(product.id);
        }
    }, [product]);


    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            <div className="view-container view-product">
                <div className="product-top-container">

                    <div className='product-image-side'>
                        <div className="thumbnail-container">
                            {product.imageUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Product Image ${index + 1}`}
                                    className={`thumbnail ${url === selectedImage ? 'selected' : ''}`}
                                    onClick={() => setSelectedImage(url)}
                                />
                            ))}
                        </div>

                        <div className="selected-image-container">
                            <img
                                src={selectedImage}
                                alt="Selected"
                                className="selected-image"
                            />
                        </div>
                    </div>

                    <div className="product-details-side">
                        <h2 className='product-name'>{product.name}</h2>
                        <p className='product-description'>{product.description}</p>
                        <div className="product-type-age">
                            <span className="product-type">{product.type}</span>
                            <span className="product-age">{product.age}</span>                        
                            </div>
                        <div className='buy-container'>
                            <p className='product-price'>{convertPrice(product.price, currency)}</p>
                            <div className="quantity-container">
                                <button onClick={decreaseQuantity}>-</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                />
                                <button onClick={increaseQuantity}>+</button>
                            </div>

                            <p className='product-total'>Total: {currencySymbols[currency]}{totalPriceNumeric}</p>

                            <div className='cart-container'>
                                {wishlist.includes(product.id) ? (
                                    <svg onClick={(e) => { handleLoveClick(product.id) }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" className="bi bi-suit-heart-fill love-btn expand" viewBox="0 0 16 16">
                                        <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1" />
                                    </svg>
                                ) : (
                                    <svg onClick={(e) => { handleLoveClick(product.id) }} xmlns="http://www.w3.org/2000/svg" width="50" height="50" className="bi bi-suit-heart love-btn expand" viewBox="0 0 16 16">
                                        <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                    </svg>
                                )}

                                <button className="add-to-cart expand" onClick={(e) => { handleCartClick(product.id, quantity) }} >
                                    Add to Cart
                                </button>

                            </div>

                        </div>
                    </div>
                </div>

                <div className='product-reviews-wrapper'>
                    <div className="product-reviews-header">
                        <h2 className="product-reviews-heading">Customer Reviews</h2>
                        <div className="product-average-rating">
                            <span>Average rating:</span>
                            <div className="star-container product-heading">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={i < averageRating ? 'star filled' : 'star'}>★</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="product-review-container">
                        {reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="product-review">
                                    <div className="product-review-header">
                                        <p className="product-review-user">{review.user_email}</p>
                                        <div className="star-container product">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="review-comment">{review.review}</p>
                                </div>
                            ))
                        ) : (
                            <p>No reviews yet. Be the first to review this product!</p>
                        )}
                    </div>
                </div>

                <SimilarProducts product={product} />

            </div>

            <Footer />

        </div>
    );
};


export default View_Product;