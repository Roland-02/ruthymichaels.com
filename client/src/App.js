import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../client/src/components/context/SessionContext';
import Index from './pages/index';
import View_Product from './pages/view_product'
import Admin from './pages/admin'; 
import AdminProducts from './components/admin/Products_View';
import Cart from './pages/cart';
import Wishlist from './pages/wishlist';
import Profile from './pages/profile';


const App = () => {
    return (
        <SessionProvider>
            <Router>
                <Routes>
                    
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Index />} />
                <Route path="/index" element={<Index />} />
                
                <Route path="/login" element={<Index form="login" />} />
                <Route path="/createAccount" element={<Index form="createAccount" />} />
                
                <Route path="/item/:name" element={<View_Product />} />

                <Route path="/basket" element={<Cart />} />
                <Route path="/cart" element={<Cart />} />

                <Route path="/wishlist" element={<Wishlist />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Profile />} />

                <Route path="/profile/order/:id/review_item/:id" element={<Profile form="review" />} />
                <Route path="/profile/change_password/:id" element={<Profile form="change_password" />} />
                <Route path="/account/order/:id/review_item/:id" element={<Profile form="review" />} />
                <Route path="/account/change_password/:id" element={<Profile form="change_password" />} />

                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/add_product" element={<AdminProducts />} />
                <Route path="/admin/products/edit_product/:id" element={<AdminProducts />} />

                </Routes>
            </Router>
        </SessionProvider>
    );
};


export default App;