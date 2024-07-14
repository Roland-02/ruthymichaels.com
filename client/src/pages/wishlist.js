import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';
import axios from 'axios';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Products from '../components/index/Products';
import SimilarProducts from '../components/common/SimilarProducts';

import MessageBanner from '../components/common/MessageBanner';
import '../styles/wishlist.css';

const Wishlist = () => {
    const { session } = useContext(SessionContext);
    const [wishlist, setWishlist] = useState([]);
    const [cartProducts, setCartedProducts] = useState([]);
    const [message, setMessage] = useState({ content: null, product: null, action: null });
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            const response = await axios.get(`/server/get_wishlist_products/${session.id}`);
            if (response.status == 200) {
                const productData = response.data;

                const formatted = productData.map(product => {
                    const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    return { ...product, imageUrls };
                });

                setWishlist(formatted);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setMessage({ content: 'Error fetching wishlist', product: null, action: 'error' });
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (session && session.id) {
                await fetchWishlist();
            }
        };
        initialize();

        const sampleWishlist = [
            {
                id: 1,
                name: 'Product 1',
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

        // setWishlist(sampleWishlist)

    }, [session, navigate, wishlist]);


    return (
        <div>
            <Navbar />

            <MessageBanner message={message} setMessage={setMessage} />

            <div className="products-container">

                <Products initialProducts={wishlist} setMessage={setMessage} />
                
                <SimilarProducts />
            </div>

            <Footer />
        </div>
    );
};

export default Wishlist;
