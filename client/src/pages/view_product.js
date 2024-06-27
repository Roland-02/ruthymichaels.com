import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import '../styles/view_product.css'
import '../styles/index.css'

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';


const View_Product = ({ session }) => {
    const { name } = useParams();
    const [product, setProduct] = useState({
        id: null,
        name: '',
        type: '',
        description: '',
        price: '',
        imageUrls: []
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();


    useEffect(() => {

        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/server/get_product`, {
                    params: { name }
                });
                if (response.status == 200) {
                    const productData = response.data;
                    const imageIds = productData.image_URLs ? productData.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    setProduct({ ...productData, imageUrls });
                    setSelectedImage(imageUrls[0]);
                } else {
                    navigate('/')
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        // fetchProduct();

        const exampleProduct = {
            id: 1,
            name: 'black girl book',
            type: 'book',
            description: 'positive affirmations positive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmationspositive affirmations',
            price: '4.99',
            imageUrls: [
                "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
            ]
        };

        setProduct(exampleProduct);
        setSelectedImage(exampleProduct.imageUrls[0]);

    }, [name]);

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


    console.log(product);

    return (
        <div>
            <Navbar session={session} />
            <main>
                <div className="container view-container">

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
                        <p className='product-price'>£{product.price}</p>
                        <div className="quantity-container">
                            <button onClick={decreaseQuantity}>-</button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                            />                            
                            <button onClick={increaseQuantity}>+</button>
                        </div>
                        <p style={{ marginTop: '5px' }}>Total: £{(product.price * quantity).toFixed(2)}</p>
                        <button className="add-to-cart">
                            Add to Cart
                        </button>

                            
                    </div>

                </div>


            </main>
            <Footer />
        </div>
    );
};


export default View_Product;