import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const defaultProfileImage = '/assets/default-profile.png';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  useEffect(() => {
    // Fetch menu items dynamically
    setMenuItems([
      "Business Card",
      "Envelope",
      "Brochure",
      "Bottle Sticker",
      "Calendar",
      "ID Card",
      "Menu Card",
      "School Diary",
      "CD/DVD Sticker",
      "Ribbon Badge",
    ]);
  }, []);

  const handleLoginClick = () => {
    setShowLogin(!showLogin);
  };

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Search through menu items and other content
    const results = menuItems.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (item) => {
    setShowSearchResults(false);
    setSearchTerm("");
    
    // Navigate based on the clicked item
    const itemPath = item.toLowerCase().replace(/\s+/g, '-');
    navigate(`/products/${itemPath}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitial = (email) => {
    return email ? email[0].toUpperCase() : '?';
  };

  const searchBarSection = (
    <div className="search-container position-relative">
      <div className="search-bar input-group me-3 d-none d-md-flex">
        <input
          type="search"
          className="form-control"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setShowSearchResults(true)}
        />
        <button className="btn border-0" id="search-icon">
          <i className="bi bi-search"></i>
        </button>
      </div>
      
      {showSearchResults && searchResults.length > 0 && (
        <div className="search-results position-absolute w-100 bg-white border shadow-sm">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item p-2 cursor-pointer hover-bg-light"
              onClick={() => handleSearchResultClick(result)}
            >
              {result}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>

     {/* Google Fonts Preconnect */}
     <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet"
      />

      <header className={`header ${visible ? '' : 'hidden'}`}>
        <div className="header-content">
          {/* Left Section */}
          <div className="d-flex align-items-center">
            <button
              className="btn border-0 me-2"
              onClick={handleSidebarToggle}
            >
              <i className="bi bi-list"></i>
            </button>
            
            <h1 className="logo">Pentagon Printers</h1>
          </div>

          {/* Center Section - Empty on larger screens */}
          <div className="d-none d-md-block"></div>

          {/* Right Section */}
          <div className="d-flex align-items-center">
            
            <button className="btn border-0 me-3 d-none d-md-block">
              <i className="bi bi-telephone"></i>
            </button>
            <button className="btn border-0 me-3 d-none d-md-block">
              <i className="bi bi-cart"></i>
            </button>
            <div className="profile-container">
              <div className="profile-section">
                <button 
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Profile menu"
                >
                  {user ? (
                    <div className="profile-initial">
                      {getInitial(user.email)}
                    </div>
                  ) : (
                    <i className="bi bi-person-circle profile-icon"></i>
                  )}
                </button>
                
                {showProfileMenu && (
                  <div className="profile-menu">
                    {user ? (
                      <>
                        <div className="profile-info">
                          <div className="profile-initial-large">
                            {getInitial(user.email)}
                          </div>
                          <p className="user-email">{user.email}</p>
                        </div>
                        <button onClick={() => handleSignOut()}>Sign Out</button>
                      </>
                    ) : (
                      <button 
                        className="login-button"
                        onClick={() => navigate('/login')}
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && (
        <>
          <div
            className="sidebar-overlay position-fixed top-0 start-0 w-100 h-100"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1040 }}
            onClick={handleSidebarToggle}
          ></div>
          <div
            className="sidebar position-fixed top-0 start-0 h-100 bg-light p-4 overflow-auto"
            style={{
              width: "320px",
              zIndex: 1050,
              borderRight: "1px solid #ddd",
              overflowY: "auto",
              maxHeight: "100vh",
            }}
          >
            <span
              className="position-absolute top-0 end-0 me-2 p-3 fw-light cursor-pointer"
              style={{ fontSize: "2rem", cursor: "pointer" }}
              onClick={handleSidebarToggle}
            >
              ×
            </span>
            <ul className="list-unstyled mt-5">
              {menuItems.map((item, index) => (
                <li
                  className="mb-4 position-relative"
                  key={index}
                >
                  <a
                    href="#"
                    className="d-block p-2 text-decoration-none"
                    style={{
                      position: "relative",
                      fontFamily: "Raleway, sans-serif",
                      fontSize: "1.3rem",
                      color: "#000",
                      fontWeight: 300,
                    }}
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget.querySelector("i");
                      if (icon) icon.style.opacity = 1;
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget.querySelector("i");
                      if (icon) icon.style.opacity = 0;
                    }}
                  >
                    {item}
                    <i
                      className="bi bi-chevron-right position-absolute end-0"
                      style={{
                        opacity: 0,
                        top:12,
                        transition: "opacity 0.3s",
                        fontSize: "1.0rem",
                      }}
                    ></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Login Popup */}
      {showLogin && (
        <div
          className="login-popup position-fixed top-50 start-50 translate-middle border p-4 bg-white"
          style={{
            borderRadius: "0px",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <span
            className="position-absolute top-0 end-0 mt-2 me-2 fw-bold cursor-pointer"
            style={{ fontSize: "1.5rem", cursor: "pointer" }}
            onClick={handleLoginClick}
          >
            ×
          </span>
          
        </div>
      )}
    </>
  );
};

export default Header;
