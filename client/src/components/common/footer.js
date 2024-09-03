import React from 'react';
import { Link } from 'react-router-dom';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';


const Footer = () => {
  return (
    <footer>
      <div className="footer py-3">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Ruthy Michaels. All rights reserved</p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;