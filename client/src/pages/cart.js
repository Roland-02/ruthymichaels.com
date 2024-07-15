import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SimilarProducts from '../components/common/SimilarProducts';
import MessageBanner from '../components/common/MessageBanner';

import axios from 'axios';
import { SessionContext } from '../components/context/SessionContext';

import '../styles/cart.css';



const Cart = () => {
    const { session } = useContext(SessionContext);
    const [cartProducts, setCartProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingCost, setShippingCost] = useState(5); // Example shipping cost
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();

    // Fetch cart products from server
    const fetchCartProducts = async () => {
        try {
            const response = await axios.get(`/server/get_cart_products/${session.id}`);
            if (response.status === 200) {

                const products = response.data;

                // Format imageUrls for each product
                const formattedProducts = products.map(prod => {
                    const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    return { ...prod, imageUrls };
                });

                setCartProducts(formattedProducts);

                // Calculate total price
                const total = formattedProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
                setTotalPrice(total);
            } else {
                console.error('Failed to fetch cart products');
            }
        } catch (error) {
            console.error('Error fetching cart products:', error);
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

    const handleRemoveClick = async (productID) => {
        if (session && session.id != null) {    
            try {

                const response = await axios.post('/server/remove_cart_product', {
                    user_id: session.id,
                    product_id: productID
                });

                if (response.status === 200) {
                    setMessage({ content: 'Item removed from cart', productID, action: 'cart' });
                    setCartProducts(prevProducts => prevProducts.filter(product => product.id !== productID));

                } else {
                    setMessage({ content: 'Failed to remove item', productID, action: 'cart' });
                }

            } catch (error) {                
                setMessage({ content: 'Error removing item', productID, action: 'cart' });
            }
        } else {
            console.log('store cart in cache');
        }

    };

    useEffect(() => {
        const initialize = async () => {
            if (session && session.id) {
                await fetchCartProducts();
                await fetchWishlist();
                
            }
        };
        window.scrollTo(0, 0); 
        initialize();

        // setCartProducts([
        //     {
        //         id: 1,
        //         name: 'Proroductroductduct roduct roductroduct',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '10.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     },
        //     {
        //         id: 2,
        //         name: 'Product 2',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '20.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     },
        //     {
        //         id: 3,
        //         name: 'Product 3',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '30.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     },
        //     {
        //         id: 4,
        //         name: 'Product 1',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '10.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     },
        //     {
        //         id: 5,
        //         name: 'Product 2',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '20.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     },
        //     {
        //         id: 6,
        //         name: 'Product 3',
        //         type: 'book',
        //         description: 'eisnjwnfsndlfsnldfknlsdfsafdsfasdfasfsdf',
        //         price: '30.00',
        //         imageUrls: ['https://drive.google.com/thumbnail?id=1R8WYVj_9le8fFJnr3OdBRKN_D0RWkwK0']
        //     }
        // ])

    }, [session, navigate]);


    const handleCheckout = () => {
        console.log('Proceeding to checkout');
    };

    return (
        <div>
            <Navbar session={session} />

            <MessageBanner message={message} setMessage={setMessage} />


            <div className="view-container">
                <div className="cart-layout">

                    <div className="col-lg-8">
                        <div className="cart-products">
                            {(cartProducts.map((product) => (
                                <div key={product.id} className="cart-product">
                                    <img src={product.imageUrls[0]} alt={product.name} className="cart-product-image" />
                                    <div className="cart-product-details">
                                        <p className="cart-product-name">{product.name}</p>
                                        <p className="cart-product-type">{product.type}</p>
                                        <div className="cart-product-bottom-row">
                                            <p className="cart-product-price">${product.price}</p>
                                            <input type="number" className="cart-product-qty" defaultValue={product.qty} min={1} />
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
                                    handleRemoveClick(product.id);
                                }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                      </svg>
                                   
                
                                </div>
                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            )}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            <p>Subtotal: ${totalPrice.toFixed(2)}</p>
                            <p>Shipping: ${shippingCost.toFixed(2)}</p>
                            <h4>Total: ${(totalPrice + shippingCost).toFixed(2)}</h4>
                            <button className="checkout-button" onClick={handleCheckout}>Proceed to Checkout</button>
                        </div>
                    </div>

                </div>


                <SimilarProducts />
            </div>

            <Footer />
        </div>
    );
};

export default Cart;

