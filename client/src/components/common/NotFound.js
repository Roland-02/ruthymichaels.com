import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';

import '../../styles/common.css';

import PageNotFound from '../../images/404_Spacemen.png';
import Navbar from './Navbar';
import Footer from './Footer';

const NotFound = () => {
    const { session } = useContext(SessionContext);

    return (
        <div>

            <Navbar session={session} />

            <div className='view-container' style={{ marginTop: '100px' }}>
                <h2 className='mb-0'>Page Not Found</h2>
                <img src={PageNotFound} alt="Page Not Found" style={{ width: '60%'}} />
                   <Link to="/" className='back-to-shopping'>
                    Continue shopping
                </Link>
            </div>

            <Footer />

        </div>

    );
};

export default NotFound;
