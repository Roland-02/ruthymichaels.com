import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../client/src/components/context/SessionContext';
import Index from './pages/index';
import Admin from './pages/admin'; 
import AdminProducts from './components/admin/Admin_Products_View';


const App = () => {
    return (
        <SessionProvider>
            <Router>
                <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Index />} />
                <Route path="/createAccount" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/add_product" element={<AdminProducts />} />


                </Routes>
            </Router>
        </SessionProvider>
    );
};


export default App;
