import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Products_View from '../components/admin/Admin_Products_View';
import Add_Products from '../components/admin/Add_Products_Form';


const Index = ({ session }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const location = useLocation();
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


