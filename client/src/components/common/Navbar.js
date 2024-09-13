import React, { useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SessionContext } from '../context/SessionContext';
import axios from 'axios';

import logo from '../../images/Ruthy_Michaels_logo.png';

import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';

const Navbar = () => {
  const { session, setSession } = useContext(SessionContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const resultsContainerRef = useRef(null)
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();


  const handleSignOut = async () => {
    try {
      await axios.post('/signout');
      setSession(null);
      navigate('/');

    } catch (error) {}

  };

  const handleClickOutside = (event) => {
    // close search if click outside
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target) &&
      resultsContainerRef.current &&
      !resultsContainerRef.current.contains(event.target)
    ) {
      setIsExpanded(false);
      setSearchQuery('');
      setSearchResults([]);
    }

    // close menu if click outside
    if (
      menuRef.current && !menuRef.current.contains(event.target) &&
      buttonRef.current && !buttonRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }

  };

  const handleTitleClick = async () => {
    navigate('/');
  };

  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? <strong key={index}>{part}</strong> : part
    );
  };

  const toggleMenu = (event) => {
    event.stopPropagation();
    setMenuOpen((prevState) => !prevState);
  };

  const handleProductClick = (name) => {
    navigate(`/${name}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearch = () => {
    setSearchResults([]);
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery) {
        try {
          const response = await axios.get('/server/search', {
            params: { query: searchQuery }
          });
          const productData = response.data;

          const formattedResults = productData.map(product => {
            const imageIds = product.image_URLs ? product.image_URLs.split(',') : [];
            const imageUrls = imageIds.map(id => `https://drive.google.com/thumbnail?id=${id}`);
            return { ...product, imageUrls };
          });

          setSearchResults(formattedResults);

        } catch (err) {
          setMessage({ content: 'Error fetching search results', product: null, action: 'error' });
        }
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (

    <header>

      {/* desktop */}
      <div className="nav-bar desktop">
        <div className="nav-container">

          {/* Left elements */}
          <div className="nav-left">
            {session && session.id ? (
              <div className="menu-item" onClick={handleSignOut}>
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" className="bi bi-box-arrow-in-left" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M10 3.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 1 0v2A1.5 1.5 0 0 1 9.5 14h-8A1.5 1.5 0 0 1 0 12.5v-9A1.5 1.5 0 0 1 1.5 2h8A1.5 1.5 0 0 1 11 3.5v2a.5.5 0 0 1-1 0z" />
                  <path fillRule="evenodd" d="M4.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H14.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
                </svg>
              </div>
            ) : (
              <Link to="/login" className="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" className="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z" />
                  <path fillRule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                </svg>
              </Link>
            )}

            {/* Admin label */}
            {session && session.role === 'admin' && <span className='nav-admin-label'>Admin</span>}

            {/* Search form */}
            <div className="search-container menu-item" ref={searchContainerRef}>
              <input
                type="text"
                className={`search-input ${isExpanded ? 'expanded' : ''}`}
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                className={`search-icon ${isExpanded ? 'expanded' : ''}`}
                viewBox="0 0 16 16"
                onClick={toggleSearch}
              >
                {isExpanded ? (
                  // "X" icon
                  <path
                    fillRule="evenodd"
                    d="M3.707 3.707a1 1 0 0 1 1.414 0L8 6.586l2.879-2.879a1 1 0 1 1 1.414 1.414L9.414 8l2.879 2.879a1 1 0 0 1-1.414 1.414L8 9.414l-2.879 2.879a1 1 0 1 1-1.414-1.414L6.586 8 3.707 5.121a1 1 0 0 1 0-1.414z"
                  />
                ) : (
                  // Search icon
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                )}              </svg>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="results-container visible" ref={resultsContainerRef}>
                {searchResults.map((result) => (
                  <div
                    className="result-item"
                    key={result.id}
                    onClick={() => handleProductClick(result.name)}
                  >
                    <div className="result-image">
                      <img src={result.imageUrls[0]} alt={result.name} />
                    </div>
                    <div className="result-details">
                      <p className="name">{highlightText(result.name, searchQuery)}</p>
                      <p className="type">{highlightText(result.type, searchQuery)}</p>
                      <p className="description">{highlightText(result.description, searchQuery)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Centered title */}
          <div className="nav-center" onClick={handleTitleClick}>
            <img
              src={logo}
              alt="Ruthy Michaels Logo"
              className="logo-image"
            />
          </div>

          {/* Right elements */}
          <div className="nav-right">
            {session && session.role === 'admin' ? (
              <>
                <Link to="/admin" className={`menu-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-speedometer" viewBox="0 0 16 16">
                    <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2M3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.39.39 0 0 0-.029-.518z" />
                    <path fill-rule="evenodd" d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.95 11.95 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                {/* Cart */}
                <Link to="/cart" className={`menu-item ${location.pathname === '/cart' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-cart" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                  </svg>
                </Link>

                {/* Wishlist */}
                <Link to="/wishlist" className={`menu-item ${location.pathname === '/wishlist' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart" viewBox="0 0 16 16">
                    <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                  </svg>
                </Link>

                {/* Profile */}
                <Link to="/profile" className={`menu-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                  {session && session.id ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-person-fill" viewBox="0 0 16 16">
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-person" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                  )}
                </Link>

              </>
            )}
          </div>

        </div>
      </div>

      {/* mobile */}
      <div className="nav-bar mobile">
        <div className="nav-container">

          {/* Left elements */}
          <div className="nav-left">
            <button className={`menu-toggle-btn menu-item ${menuOpen ? 'active' : ''}`} onClick={toggleMenu} ref={buttonRef}>
              <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" class="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
              </svg>
            </button>

            {/* Collapsible menu */}
            <nav className={`nav-menu ${menuOpen ? 'open' : ''}`} ref={menuRef}>
              <ul>
                <li><Link to="/" className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}>Home</Link></li>
                <li><Link to="/wishlist" className={`menu-item ${location.pathname === '/wishlist' ? 'active' : ''}`}>Wishlist</Link></li>
                <li><Link to="/profile" className={`menu-item ${location.pathname === '/profile' ? 'active' : ''}`}>Profile</Link></li>
                <li><Link to="/about" className={`menu-item ${location.pathname === '/about' ? 'active' : ''}`}>About</Link></li>
                <li><Link to="/contact" className={`menu-item ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link></li>
                {session && session.id ? (
                  <li><Link to="/">Logout</Link></li>
                ) : (
                  <li><Link to="/login">Login</Link></li>
                )}
              </ul>
            </nav>

            {/* Search form */}
            <div className="search-container menu-item" ref={searchContainerRef}>
              <input
                type="text"
                className={`search-input ${isExpanded ? 'expanded' : ''}`}
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                className={`search-icon ${isExpanded ? 'expanded' : ''}`}
                viewBox="0 0 16 16"
                onClick={toggleSearch}
              >
                {isExpanded ? (
                  // "X" icon
                  <path
                    fillRule="evenodd"
                    d="M3.707 3.707a1 1 0 0 1 1.414 0L8 6.586l2.879-2.879a1 1 0 1 1 1.414 1.414L9.414 8l2.879 2.879a1 1 0 0 1-1.414 1.414L8 9.414l-2.879 2.879a1 1 0 1 1-1.414-1.414L6.586 8 3.707 5.121a1 1 0 0 1 0-1.414z"
                  />
                ) : (
                  // Search icon
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                )}
              </svg>
            </div>
            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="results-container visible" ref={resultsContainerRef}>
                {searchResults.map((result) => (
                  <div
                    className="result-item"
                    key={result.id}
                    onClick={() => handleProductClick(result.name)}
                  >
                    <div className="result-image">
                      <img src={result.imageUrls[0]} alt={result.name} />
                    </div>
                    <div className="result-details">
                      <p className="name">{highlightText(result.name, searchQuery)}</p>
                      <p className="type">{highlightText(result.type, searchQuery)}</p>
                      <p className="description">{highlightText(result.description, searchQuery)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Centered title */}
          <div className={`nav-center ${isExpanded ? 'hidden' : ''}`} onClick={handleTitleClick}>
            <img
              src={logo}
              alt="Ruthy Michaels Logo"
              className="logo-image"
            />
          </div>

          {/* Right elements */}
          <div className="nav-right">
            {session && session.role === 'admin' ? (
              <>
                <Link to="/admin" className={`menu-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" class="bi bi-speedometer" viewBox="0 0 16 16">
                    <path d="M8 2a.5.5 0 0 1 .5.5V4a.5.5 0 0 1-1 0V2.5A.5.5 0 0 1 8 2M3.732 3.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 8a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 8m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 7.31A.91.91 0 1 0 8.85 8.569l3.434-4.297a.39.39 0 0 0-.029-.518z" />
                    <path fill-rule="evenodd" d="M6.664 15.889A8 8 0 1 1 9.336.11a8 8 0 0 1-2.672 15.78zm-4.665-4.283A11.95 11.95 0 0 1 8 10c2.186 0 4.236.585 6.001 1.606a7 7 0 1 0-12.002 0" />
                  </svg>
                </Link>
              </>
            ) : (
              <>
                {/* Cart */}
                <Link to="/cart" className={`menu-item ${location.pathname === '/cart' ? 'active' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-cart" viewBox="0 0 16 16">
                    <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                  </svg>
                </Link>
              </>
            )}
          </div>

        </div>

      </div>

    </header>

  );

};

export default Navbar;
