import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../client/src/components/context/SessionContext';
import { CurrencyProvider } from '../../client/src/components/context/CurrencyContext';

import ProtectedRoute from './components/context/ProtectedRoutes';
import AdminProtectedRoute from './components/context/AdminProtectedRoute';

import Index from './pages/index';
import View_Product from './pages/view_product'
import Cart from './pages/cart';
import Wishlist from './pages/wishlist';
import Profile from './pages/profile';
import About from './pages/about';
import Contact from './pages/contact';
import Privacy from './pages/privacy';
import NotFound from './components/common/NotFound';

import Admin from './pages/admin';
import AdminProducts from './components/admin/Products_View';


const App = () => {
    return (
        <SessionProvider>
            <CurrencyProvider>
                <Router>
                    <Routes>

                        <Route path="/" element={<Index />} />
                        <Route path="/home" element={<Index />} />
                        <Route path="/index" element={<Index />} />
                        <Route path="/login" element={<Index form="login" />} />
                        <Route path="/create_account" element={<Index form="createAccount" />} />

                        <Route path="/item/:name" element={<View_Product />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/privacy" element={<Privacy />} />

                        {/* Protected Routes (requires logged in user) */}
                        <Route path="/change_password" element={<ProtectedRoute element={<Index form="change_password" />} />} />
                        <Route path="/wishlist" element={<ProtectedRoute element={<Wishlist />} />} />
                        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                        <Route path="/profile/review_item/:id" element={<ProtectedRoute element={<Profile form="review" />} />} />
                        <Route path="/profile/change_password/:id" element={<ProtectedRoute element={<Profile form="change_password" />} />} />

                        {/* Admin Protected Routes (requires admin role) */}
                        <Route path="/admin" element={<AdminProtectedRoute element={<Admin />} />} />
                        <Route path="/admin/products" element={<AdminProtectedRoute element={<AdminProducts />} />} />
                        <Route path="/admin/products/add_product" element={<AdminProtectedRoute element={<AdminProducts />} />} />
                        <Route path="/admin/products/edit_product/:id" element={<AdminProtectedRoute element={<AdminProducts />} />} />

                        {/* Catch-all Route for Not Found pages */}
                        <Route path="*" element={<NotFound />} />

                    </Routes>
                </Router>
            </CurrencyProvider>
        </SessionProvider>
    );
};


export default App;