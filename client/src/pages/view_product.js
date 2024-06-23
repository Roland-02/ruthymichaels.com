import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import '../styles/view_product.css'

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';


const View_Product = ({ session }) => {
    const { name } = useParams();
    const [product, setProduct] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/products/get_product/${name}`);
                const productWithImages = response.data.map(product => {
                    const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    return { ...product, imageUrls };
                });
                setProduct(productWithImages);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProduct();
        console.log(name)

    }, [name]);

    return (
        <div>
            <Navbar session={session} />
            <main>

                <section id='product_images'>

                </section>

                <section id='dialog_box'>

                </section>

                <section id='similar_items'>

                </section>

            </main>
            <Footer />
        </div>
    );
};

export default View_Product;