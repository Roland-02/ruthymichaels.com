import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import SimilarProducts from '../components/common/SimilarProducts';


const Basket = ({ session }) => {

    // Example products array, replace with actual state/props
    const productsInCart = [
        {
            id: 1,
            name: 'Product 1',
            price: 10.0,
            imageUrl: 'https://example.com/image1.jpg',
        },
        {
            id: 2,
            name: 'Product 2',
            price: 20.0,
            imageUrl: 'https://example.com/image2.jpg',
        },
    ];

    const similarProducts = [
        {
            id: 3,
            name: 'Product 3',
            price: 15.0,
            imageUrl: 'https://example.com/image3.jpg',
        },
        {
            id: 4,
            name: 'Product 4',
            price: 25.0,
            imageUrl: 'https://example.com/image4.jpg',
        },
    ];


    return (
        <div>
            <Navbar session={session} />

            <div className="basket-container">
                
                {/* Products in Cart Section */}
                <div className="cart-products">
                   
                </div>

                {/* Postage, Total Cost, and Checkout Section */}
                <div className="cart-summary">
                  
                </div>


                <SimilarProducts />

            </div>

            <Footer />
        </div>
    );
};

export default Basket;
