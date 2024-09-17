import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SessionContext } from '../components/context/SessionContext';

import '../styles/privacy.css';

import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Privacy = () => {
    const { session } = useContext(SessionContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to the top when the component is rendered
    }, [location])

    return (
        <div>
            
            <Navbar session={session} />

            <div className="view-container" style={{ marginTop: '100px' }}>
                <h1>Privacy Policy</h1>

                <p><strong>Last Updated: </strong>17/09/2024</p>

                <div className='privacy-container'>

                    <p>At ruthymichaels.com, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information when you interact with our website. By using ruthymichaels.com, you agree to the terms outlined in this policy.</p>

                    <h3>1. Information We Collect</h3>

                    <p>When you register an account on ruthymichaels.com, we collect the following personal information:</p>
                    <ul>
                        <li><strong>Email Address:</strong> This is required for account creation, login, and communication purposes.</li>
                        <li><strong>Password:</strong> This is required for account access and is securely stored using industry-standard encryption.</li>
                    </ul>
                    <p>We do not collect or store any payment information. All transactions, including credit card information, are processed securely by our third-party payment provider, <strong>Stripe</strong>.</p>

                    <h3>2. How We Use Your Information</h3>

                    <p>The personal information we collect is used for the following purposes:</p>
                    <ul>
                        <li><strong>Account Creation and Login:</strong> Your email and password allow you to create and access your account on ruthymichaels.com.</li>
                        <li><strong>Communication:</strong> We may use your email address to send important notifications regarding your account, such as password resets or confirmations of your orders.</li>
                        <li><strong>Security:</strong> We use your information to ensure the security of our services and to protect against unauthorized access to your account.</li>
                    </ul>

                    <h3>3. Payment Processing</h3>

                    <p>All payments on ruthymichaels.com are processed by <strong>Stripe</strong>, a third-party payment provider. We do not store any payment details, such as credit card numbers or billing addresses.</p>

                    <p>For more information on how Stripe handles your payment information, please refer to <a href="https://stripe.com/privacy">Stripe’s Privacy Policy</a>.</p>

                    <h3>4. Data Security</h3>

                    <p>We take appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Your password is encrypted, and we follow best practices to ensure your data remains secure.</p>

                    <h3>5. Third-Party Services</h3>

                    <p>Apart from Stripe, we <strong>do not</strong> share your personal information with any third parties unless required to comply with legal obligations.</p>

                    <h3>6. Your Rights</h3>

                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Account Deletion:</strong> You can delete your account at any time from your <strong>Profile</strong> while signed in. Please note, this action <strong>will not</strong> remove your order history, which will be retained for record-keeping purposes.</li>
                        <li><strong>Opt-out:</strong> If you do not wish to receive communications from us, you can opt-out by following the unsubscribe instructions included in any of our emails.</li>
                    </ul>

                    <h3>7. Changes to this Privacy Policy</h3>

                    <p>We may update this Privacy Policy from time to time. When we do, we will post the updated policy on this page and revise the "Last Updated" date at the top. We encourage you to review this policy periodically to stay informed about how we are protecting your information.</p>


                    <p>By using ruthymichaels.com, you agree to this Privacy Policy. If you do not agree, please refrain from using our site.</p>

                </div>

            </div>

            <Footer />

        </div>
    );
};

export default Privacy;