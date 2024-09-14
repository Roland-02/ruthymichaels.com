import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import '../styles/wishlist.css';
import '../styles/common.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Products from '../components/index/Products';
import SimilarProducts from '../components/common/SimilarProducts';
import MessageBanner from '../components/common/MessageBanner';
// import EmptyGraphic from '../images/NotFound_Rocketman.png';

const Wishlist = () => {
    const { session, Loading } = useContext(SessionContext);
    const [wishlist, setWishlist] = useState([]);
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            const response = await axios.get(`/server/get_wishlist_products/${session.id}`);
            if (response.status === 200) {
                const productData = response.data;

                const formatted = productData.map(product => {
                    const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    return { ...product, imageUrls };
                });
                setWishlist(formatted);

            } else {
                setWishlist([]);
            }
        } catch (error) {
            setMessage({ content: 'Error fetching wishlist', product: null, action: 'error' });
            setWishlist([]);
        }
    };

    const updateWishlist = async (productID) => {
        try {
            const response = await axios.post('/server/remove_wishlist', {
                user_id: session.id,
                product_id: productID
            });

            if (response.status === 200) {
                setWishlist(prevWishlist => prevWishlist.filter(product => product.id !== productID));
                setMessage({ content: 'Removed from wishlist', productID, action: 'success' });

            } else {
                setMessage({ content: 'Error removing from wishlist', productID, action: 'error' });
            }
        } catch (error) {
            setMessage({ content: 'Error updating wishlist', productID, action: 'error' });
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (Loading) return;

            await fetchWishlist();
        };
        initialize();

    }, [session, Loading, navigate]);


    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            <div className="wishlist">
                <div className="wishlist-container">
                        <Products
                            initialProducts={wishlist}
                            setMessage={setMessage}
                            updateWishlist={updateWishlist}
                        />
                </div>
                <SimilarProducts />
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;
