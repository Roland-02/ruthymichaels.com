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
                    const imageUrls = imageIds.map(name => `/uploads/${name}`);
                    return { ...prod, imageUrls };
                });

                let filteredProducts;
                if (product && product.id) {
                    // Remove the selected product
                    filteredProducts = formattedProducts.filter(x => x.id !== product.id);

                    // Order the products, putting those with the same type first
                    // Sort products by type, then age, and finally price similarity
                filteredProducts = filteredProducts.sort((a, b) => {
                    // Compare by type (same type first)
                    if (a.type === product.type && b.type !== product.type) return -1;
                    if (a.type !== product.type && b.type === product.type) return 1;

                    // If type is the same, compare by age (closer age first)
                    if (a.type === product.type && b.type === product.type) {
                        const ageDiffA = Math.abs(a.age - product.age);
                        const ageDiffB = Math.abs(b.age - product.age);
                        if (ageDiffA < ageDiffB) return -1;
                        if (ageDiffA > ageDiffB) return 1;
                    }

                    // If both type and age are similar, compare by price (closest price first)
                    const priceDiffA = Math.abs(a.price - product.price);
                    const priceDiffB = Math.abs(b.price - product.price);
                    return priceDiffA - priceDiffB;
                });
                } else {
                    // Randomize the products if no specific product is provided
                    filteredProducts = formattedProducts.sort(() => Math.random() - 0.5);
                }

                setSimilar(filteredProducts);

            }

        } catch (error) {}

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
