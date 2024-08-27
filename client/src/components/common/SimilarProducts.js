import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SimilarProducts = ({ product }) => {
    const [similar, setSimilar] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSimilar();
    }, [product]);

    const handleProductClick = (name) => {
        navigate(`/item/${name}`);
    };

    const fetchSimilar = async () => {
        try {
            const response = await axios.get('/server/get_products');
            if (response.status === 200) {
                const allProducts = response.data;

                // Format imageUrls for each product
                const formattedProducts = allProducts.map(prod => {
                    const imageIds = prod.image_URLs ? prod.image_URLs.split(',') : [];
                    const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
                    return { ...prod, imageUrls };
                });

                let filteredProducts;
                if (product && product.id) {
                    // Remove the selected product
                    filteredProducts = formattedProducts.filter(x => x.id !== product.id);

                    // Order the products, putting those with the same type first
                    filteredProducts = filteredProducts.sort((a, b) => {
                        if (a.type === product.type && b.type !== product.type) return -1;
                        if (a.type !== product.type && b.type === product.type) return 1;
                        return 0;
                    });
                } else {
                    // Randomize the products if no specific product is provided
                    filteredProducts = formattedProducts.sort(() => Math.random() - 0.5);
                }

                setSimilar(filteredProducts);

            } else {
                console.log('error');
            }
            
        } catch (error) {
            console.error('Error fetching products: ', error);
        }
    };

    return (
        <div className="similar-products-wrapper">
            <h2 className="similar-products-title">
                {product ? 'Similar Items' : 'Other Items'}
            </h2>
            <div className="similar-products-container">
                {similar.map((prod, index) => (
                    <div
                        key={prod.id}
                        className="similar-product"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(prod.name);
                        }}
                    >
                        <img src={prod.imageUrls[0]} alt={prod.name} className="similar-product-image" />
                        <p className="similar-product-name">{prod.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarProducts;
