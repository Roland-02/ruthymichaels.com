import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Index = ({ session }) => {

    return (
        <div>
            <Navbar session={session} />
          
            <Footer />
        </div>
    );
};

export default Index;


