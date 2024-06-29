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
    const [similar, setSimilar] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();


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
            console.error('Error fetching product: ', error);
        }
    };

    const fetchSimilar = async () => {
        try {
            const response = await axios.get('/server/get_products');
            if (response.status == 200) {
                const response = await axios.get('/server/get_products');

                    // setSimilar(response.data);
                    // const orderedSimilar = similar
                    //     .filter(x => x.type === product.type)
                    //     .filter(x => x.id !== product.id)
                    //     .concat(similar.filter(x => x.type !== product.type));

                    // setSimilar(orderedSimilar);

                    const allProducts = response.data;

                    // Filter out the selected product
                    const filteredProducts = allProducts.filter(x => x.id !== product.id);
    
                    // Order the products, putting those with the same type first
                    const orderedSimilar = filteredProducts
                        .filter(x => x.type === product.type)
                        .concat(filteredProducts.filter(x => x.type !== product.type));
    
                    setSimilar(orderedSimilar);
    
            } else {
                console.log('error')
            }

        } catch (error) {
            console.error('Error fetching products: ', error);
        }
    };

    useEffect(() => {

        // fetchProduct();
        // fetchSimilar();

        const exampleProduct = {
            id: 1,
            name: 'black girl book',
            type: 'book',
            description: 'You are invited on this therapeutic journey as you immerse yourself in coloring this book and imbibing the positivity and self-love in the coloring pages. This coloring book celebrates the Strength and Beauty in you as a Black Woman or Black Girl. It will nurture self-care and positivity. This book is a good companion on your journey of empowerment and self-discovery. 8.5x11 inches Glossy 64 pages with 30 illustrations with vibrant pictures and intricate designs Single-sided illustration to prevent a bleed-through',
            price: '4.99',
            imageUrls: [
                "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
            ]
        };

        const similarProducts = [
            {
                id: 1,
                name: 'Empowerment Journal',
                type: 'journal',
                description: 'This journal helps you track your daily progress and stay motivated. It features inspirational quotes and prompts to keep you focused on your goals.',
                price: 9.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 2,
                name: 'Self-Care Planner',
                type: 'book',
                description: 'A planner designed to help you prioritize self-care with sections for daily affirmations, goal setting, and reflection.',
                price: 12.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 3,
                name: 'Inspirational Mug',
                type: 'mug',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 4,
                name: 'Motivational Wall Aivational Wall Aivational Wall Aivational Wall Aivational Wall Art',
                type: 'art',
                description: 'Decorate your space with this beautiful wall art that reminds you of your strength and resilience every day.',
                price: 14.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 5,
                name: 'Self-Care Planner',
                type: 'book',
                description: 'A planner designed to help you prioritize self-care with sections for daily affirmations, goal setting, and reflection.',
                price: 12.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 6,
                name: 'Inspirational Mug',
                type: 'mug',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 7,
                name: 'Motivational Wall Aivational Wall Aivational Wall Aivational Wall Aivational Wall Art',
                type: 'art',
                description: 'Decorate your space with this beautiful wall art that reminds you of your strength and resilience every day.',
                price: 14.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 8,
                name: 'Self-Care Planner',
                type: 'book',
                description: 'A planner designed to help you prioritize self-care with sections for daily affirmations, goal setting, and reflection.',
                price: 12.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 9,
                name: 'Motivational Wall Aivational Wall Aivational Wall Aivational Wall Aivational Wall Art',
                type: 'book',
                description: 'Decorate your space with this beautiful wall art that reminds you of your strength and resilience every day.',
                price: 14.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 10,
                name: 'Self-Care Planner',
                type: 'book',
                description: 'A planner designed to help you prioritize self-care with sections for daily affirmations, goal setting, and reflection.',
                price: 12.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 11,
                name: 'Inspirational Mug',
                type: 'book',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 12,
                name: 'Inspirational Mug',
                type: 'book',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 13,
                name: 'Inspirational Mug',
                type: 'book',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            },
            {
                id: 14,
                name: 'Inspirational Mug',
                type: 'book',
                description: 'Start your day with a cup of positivity. This mug features an inspirational quote to lift your spirits every morning.',
                price: 7.99,
                imageUrls: [
                    "https://drive.google.com/thumbnail?id=1tUmLqgo5tHJGvhWJ_N6KCPHcZl9VN9hw",
                    "https://drive.google.com/thumbnail?id=1P6l05c0EdW052ZTm-48Kob-tKkrLRgkQ"
                ]
            }
        ];

        const filteredProducts = similarProducts.filter(x => x.id !== product.id);
            setProduct(exampleProduct);

        // const orderedSimilar = filteredProducts
        //     .filter(x => x.type === product.type)
        //     .concat(filteredProducts.filter(x => x.type !== product.type));
   

        setSimilar(orderedSimilar);

        setSelectedImage(exampleProduct.imageUrls[0]);


    }, [name]);

    console.log(similar)

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

    return (
        <div>
            <Navbar session={session} />
            <main>
                <div className="container view-container">
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
                            <div className='buy-container'>
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

                                <p className='product-total'>Total: £{(product.price * quantity).toFixed(2)}</p>

                                <div>
                                    <button className="add-to-cart expand">
                                        Add to Cart
                                    </button>

                                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" class="bi bi-suit-heart love-btn expand" viewBox="0 0 16 16">
                                        <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                                    </svg>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    <div className="similar-products-wrapper">
                        <h4 className="similar-products-title">Similar Items</h4>
                        <div className="similar-products-container">
                            {similar.map((prod, index) => (
                                <div key={prod.id} className="similar-product">
                                    <img src={prod.imageUrls[0]} alt={prod.name} className="similar-product-image" />
                                    <p className="similar-product-name">{prod.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>


            </main>
            <Footer />
        </div>
    );
};


export default View_Product;