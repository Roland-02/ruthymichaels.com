import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';

import '../styles/about.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const About = () => {
    const { session } = useContext(SessionContext);
    const navigate = useNavigate();
    const location = useLocation();
    window.scrollTo(0, 0);



    return (
        <div>
            <Navbar session={session} />

            <div className="view-container about">
                <h2>About us</h2>
                <p>
                    At Ruthy's Book Store, we believe in the transformative power of words and the profound impact they can have on our lives. That's why we're passionate about curating a diverse collection of motivational and activity books that ignite the spirit, spark creativity, and empower individuals to reach their full potential.
                </p>

                <p>
                    Our journey began with a simple yet powerful vision: to create a space where people could discover a wealth of resources to nourish their minds, uplift their spirits, and embark on meaningful journeys of self-discovery. Whether you're seeking inspiration to overcome challenges, cultivate mindfulness, or unlock your creativity, we're dedicated to offering a handpicked selection of books that resonate with your aspirations and dreams.
                </p>

                <p>
                    What sets Ruthy's Book Store apart is our unwavering commitment to quality, authenticity, and customer satisfaction. Each book in our collection is thoughtfully selected based on its ability to inspire, motivate, and enrich the lives of our customers. From best-selling classics to hidden gems, we strive to provide a diverse range of titles that cater to every interest and preference.
                </p>

                <p>
                    But Ruthy's Book Store is more than just a bookstore—it's a community of like-minded individuals united by a shared passion for personal growth and lifelong learning. We're here to support you on your journey, whether you're embarking on a new chapter in your life or seeking guidance to navigate the complexities of everyday living.
                </p>

                <p>
                    As a small, independent business, we're deeply grateful for the opportunity to serve you and be a part of your growth journey. Thank you for choosing Ruthy's Book Store as your trusted source for motivational and activity books. We look forward to inspiring and empowering you every step of the way.
                </p>
                
                
            </div>

            <Footer />


        </div>
    );
};

export default About;