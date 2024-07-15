import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SimilarProducts from '../components/common/SimilarProducts';
import axios from 'axios';
import { SessionContext } from '../components/context/SessionContext';

import '../styles/cart.css';



const Cart = ({ session }) => {

    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingCost, setShippingCost] = useState(5); // Example shipping cost
    const navigate = useNavigate();

    useEffect(() => {
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

        fetchCartProducts();


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

        setCartProducts(sampleWishlist)

    }, [session]);

    const handleCheckout = () => {
        // Implement checkout functionality
        console.log('Proceeding to checkout');
    };

    return (
        <div>
            <Navbar session={session} />

            <div className="view-container">
                <div className="cart-layout">

                    <div className="col-lg-8">
                        <div className="cart-products">
                            {(cartProducts.map((product) => (
                                <div key={product.id} className="cart-product">
                                    <img src={product.imageUrls[0]} alt={product.name} className="cart-product-image" />
                                    <div className="cart-product-details">
                                        <p className="cart-product-name">{product.name}</p>
                                        <p className="cart-product-price">${product.price}</p>
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

