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
                <Route path="/login" element={<Index />} />
                <Route path="/createAccount" element={<Index />} />
                <Route path="/:name" element={<View_Product />} />

                <Route path="/basket" element={<Cart />} />
                <Route path="/cart" element={<Cart />} />

                <Route path="/wishlist" element={<Wishlist />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Profile />} />

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
