import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { SessionContext } from '../context/SessionContext';
import axios from 'axios';
import '../../styles/common.css';
import '../../bootstrap/css/mdb.min.css';

const Navbar = () => {
  const { session, setSession } = useContext(SessionContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await axios.post('/signout');
      setSession(null);
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }

  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery) {
        try {
          const response = await axios.get('/server/search', {
            params: { query: searchQuery },
          });
          setSearchResults(response.data);
          console.log(searchResults)
        } catch (err) {
          console.error('Error fetching search results', err);
        }
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handleTitleClick = async () => {
    navigate('/');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const toggleSearch = () => {
    setIsExpanded(!isExpanded);
  };


  return (
    <section>
      <header>
        <div className="nav-bar py-1 bg-white border-bottom">
          <div className="container d-flex justify-content-center align-items-center text-center" style={{ marginLeft: '0px', marginRight: '0px' }}>

            {/* Left elements */}
            <div className="col-md col-sm text-start d-flex">
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

              {/* Search form */}
              <div className="search-container menu-item">
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
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
              
            </div>

            {/* Centered title */}
            <div className="col-md col-sm" onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
              <h1 className='page-title'>Ruthy Michaels</h1>
            </div>

            {/* Right elements */}
            <div className="col-md col-sm text-end nav-btns">

              <Link to="/basket" className="m-2 menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-cart" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                </svg>
              </Link>

              <Link to="/wishlist" className="m-2 menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-suit-heart" viewBox="0 0 16 16">
                  <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z" />
                </svg>
              </Link>

              <Link to="/account" className="m-2 menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" className="bi bi-person" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </header>
    </section>
  );
};

export default Navbar;
