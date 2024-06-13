// client/src/components/common/Footer.js
import React from 'react';
import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer bg-dark text-white py-3">
        <div className="container text-center">
          <p>&copy; {new Date().getFullYear()} Ruthy Michaels. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
