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

            {/* Arrow animation */}
            <div className="arrow-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" class="bi bi-arrow-down" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                </svg>
            </div>
        </section>
    );
};

export default Banner;
