import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Index = ({ session }) => {
    const navigate = useNavigate();

    const handleClick_products = () => {
        navigate('/admin/products');
    };
    
    return (
        <div>
            <Navbar session={session} />
            <main>
                <div className="manage-products-container">
                    <div className="manage-products-button" onClick={handleClick_products}>
                        Manage Products
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Index;


