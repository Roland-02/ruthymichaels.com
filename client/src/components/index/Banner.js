import React from 'react';

import '../../styles/index.css';
import '../../bootstrap/css/mdb.min.css';

import banner from '../../images/banner_image.png';


const Banner = () => {

    const handleScrollDown = () => {
        window.scrollTo({
            top: 750, 
            behavior: 'smooth',     
        });
    };

    return (
        <section className="banner-section" onClick={handleScrollDown}>
            <div className="banner">
                <img
                    src={banner}
                    alt="Welcome banner"
                    className="banner-img"
                />
            </div>
        </section>
    );
};

export default Banner;
