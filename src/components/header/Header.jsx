import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import emblemIndia from "../../img/emblem-india.jpeg";
import uttarakhandLogo from "../../img/ukrajya.png";
import mygovLogo from "../../img/mygov.png";
import azadiLogo from "../../img/azadi.png";
import ourLogo from "../../img/ourlogo.png";
import wheelchairIcon from "../../img/icons8-wheelchair-24.png";
import { useSelector, useDispatch } from "react-redux";
import { getLogoutAction } from "../../redux/actions";
import Cookies from "js-cookie";

//images
import userIcon from "../../img/user_icon.svg";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authReducer);
  const isAuthenticated = Cookies.get("refresh-token");

  const [show, setShow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleLogout = () => {
    Cookies.remove("access-token");
    Cookies.remove("refresh-token");
    Cookies.remove("uuid");
    dispatch(getLogoutAction());
    navigate("/");
  };

  const changeFontSize = (size) => {
    console.log('Font size changed to:', size);
  };

  return (
    <header className="govt-header-wrapper sticky top-0 z-50">
      {/* Row 1: Utility / Accessibility Strip */}
      <div className="utility-strip">
        <div className="utility-container">
          <div className="utility-left">
            <a href="#main-content" className="utility-link">Skip to main content</a>
            <a href="/sitemap" className="utility-link">Sitemap</a>
          </div>
          <div className="utility-right">
            <div className="language-toggle">
              <span className="lang-label">English</span>
              <div className="toggle-switch" onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
                <div className={`toggle-slider ${language === "hi" ? "active" : ""}`}></div>
              </div>
              <span className="lang-label">हिंदी</span>
            </div>
            <div className="font-controls">
              <button onClick={() => changeFontSize("large")} className="font-btn" title="Increase font size">A+</button>
              <button onClick={() => changeFontSize("normal")} className="font-btn font-btn-equal" title="Normal font size">A=</button>
              <button onClick={() => changeFontSize("small")} className="font-btn" title="Decrease font size">A-</button>
            </div>
            <button className="accessibility-btn" title="Accessibility">
              <img src={wheelchairIcon} alt="Accessibility" width="18" height="18" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Branding Row */}
      <div className="branding-row">
        <div className="branding-container">
          <div className="branding-left">
            {/* Government Emblem */}
            <div className="emblem-wrapper">
              <img src={emblemIndia} alt="Government of India" style={{height: '56px', width: 'auto'}} />
            </div>
            {/* Divider */}
            <div className="branding-divider"></div>
            {/* Uttarakhand State Logo */}
            <div className="state-logo-wrapper">
              <img src={uttarakhandLogo} alt="Uttarakhand" style={{height: '52px', width: 'auto', display: 'block'}} />
            </div>
            {/* Divider */}
            <div className="branding-divider"></div>
            {/* MyGov Logo */}
            <div className="mygov-wrapper">
              <img src={mygovLogo} alt="MyGov" style={{height: '48px', width: 'auto', display: 'block'}} />
            </div>
            {/* Divider */}
            <div className="branding-divider"></div>
            {/* Our Logo */}
            <div className="our-logo-wrapper">
              <img src={ourLogo} alt="Document One Logo" />
            </div>
            {/* Divider */}
            <div className="branding-divider"></div>
            {/* Project Title */}
            <div className="project-title">
              <h1 className="title-main">Document One</h1>
              <p className="title-subtitle">Integrated Government Document Portal</p>
            </div>
          </div>
          <div className="branding-right">
            {/* National Initiative Emblem */}
            <div className="initiative-emblem">
              <img src={azadiLogo} alt="Azadi Ka Amrit Mahotsav" style={{height: '52px'}} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Main Navigation Bar */}
      <nav className="main-navigation">
        <div className="nav-container">
          <ul className="nav-menu">
            <li className="nav-item">
              <button onClick={() => navigate("/")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
                </svg>
                <span>Home</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/about")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
                </svg>
                <span>About Pravah</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/how-it-works")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"/>
                </svg>
                <span>How It Works</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/departments")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z"/>
                </svg>
                <span>Departments</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/whats-new")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4C3 2 2 2.9 2 4V7C2 7.55 2.45 8 3 8C3.55 8 4 7.55 4 7V4H20V7C20 7.55 20.45 8 21 8C21.55 8 22 7.55 22 7V4C22 2.9 21 2 20 2ZM11.8 20.9L8 17L9.4 15.6L11 17.2V9H13V17.2L14.6 15.6L16 17L12.2 20.9C12.1 21 11.9 21 11.8 20.9Z"/>
                </svg>
                <span>What's New</span>
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navigate("/help")} className="nav-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18H13V16H11V18ZM12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8S14 8.9 14 10C14 12 11 11.75 11 15H13C13 12.75 16 12.5 16 10C16 7.79 14.21 6 12 6Z"/>
                </svg>
                <span>Help</span>
              </button>
            </li>
          </ul>

          {/* Auth Buttons Desktop */}
          {!isAuthenticated && (
            <div className="auth-buttons-desktop">
              <button onClick={() => navigate("/login")} className="auth-btn-outline">
                Login
              </button>
              <button onClick={() => navigate("/register")} className="auth-btn-filled">
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              {mobileMenuOpen ? (
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
              ) : (
                <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <button onClick={() => { navigate("/"); setMobileMenuOpen(false); }} className="mobile-nav-link">Home</button>
            {isAuthenticated && (
              <>
                <button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="mobile-nav-link">Dashboard</button>
                <button onClick={() => { navigate("/addProduct"); setMobileMenuOpen(false); }} className="mobile-nav-link">Add Product</button>
              </>
            )}
            <button onClick={() => { navigate("/help"); setMobileMenuOpen(false); }} className="mobile-nav-link">Help</button>
            <button onClick={() => { navigate("/faq"); setMobileMenuOpen(false); }} className="mobile-nav-link">FAQ</button>
            {!isAuthenticated ? (
              <>
                <button onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} className="mobile-nav-link login-btn">Login</button>
                <button onClick={() => { navigate("/register"); setMobileMenuOpen(false); }} className="mobile-nav-link login-btn">Sign Up</button>
              </>
            ) : (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-nav-link logout-btn">Logout</button>
            )}
          </div>
        )}
      </nav>

      {/* User Profile Section - Fixed Position Desktop Only */}
      {isAuthenticated && (
        <div
          onMouseOver={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          className="user-profile-section"
        >
          <div className="user-profile-trigger">
            <img className="user-avatar" src={userIcon} alt="profile" />
            <p className="user-name">
              {"Hi, " + (authState?.user?.data?.first_name || "User")}
            </p>
          </div>
          {show && (
            <div className="user-dropdown">
              <button onClick={() => navigate("/update-profile")} className="dropdown-item">
                Profile
              </button>
              <button onClick={handleLogout} className="dropdown-item logout">
                Logout
              </button>
            </div>
          )}
        </div>
      )}

    </header>
  );
};

export default Header;
