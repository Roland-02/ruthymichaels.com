import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../client/src/components/context/SessionContext';
import Index from './pages/index';
// import Admin from './pages/Admin'; 


const App = () => {
    return (
        <SessionProvider>
            <Router>
                <Routes>
                <Route path="/" element={<Index />} />
                {/* <Route path="/login" component={Login} /> */}
                    {/* <Route path="/admin" component={Admin} /> */}
                </Routes>
            </Router>
        </SessionProvider>
    );
};


export default App;
