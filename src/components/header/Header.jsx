import React, { useState, useEffect } from "react";
import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import emblemIndia from "../../img/emblem-india.jpeg";
import uttarakhandLogo from "../../img/ukrajya.png";
import mygovLogo from "../../img/mygov.png";
import azadiLogo from "../../img/azadi.png";
import ourLogo from "../../img/ourlogo.png";
import wheelchairIcon from "../../img/icons8-wheelchair-24.png";
import { useSelector, useDispatch } from "react-redux";
import { getLogoutAction } from "../../redux/actions";
import { notificationAPI } from "../../api/notificationAPI";

//images
import userIcon from "../../img/user_icon.svg";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.authReducer?.user?.data);
  const isLoggedIn = useSelector((state) => state.authReducer?.isLoggedIn);
  const token = useSelector((state) => state.tokenReducer?.token?.accessToken);
  
  // Enhanced authentication check
  const hasToken = token || localStorage.getItem('accessToken');
  const hasUserData = user && (user.firstName || user.email || user.id);
  const isAuthenticated = (isLoggedIn && hasToken) || (hasToken && hasUserData);

  // Debug authentication state (remove in production)
  useEffect(() => {
    console.log('Header Auth Debug:', {
      user: user ? { firstName: user.firstName, email: user.email, id: user.id } : null,
      isLoggedIn,
      hasToken: !!hasToken,
      hasUserData,
      isAuthenticated,
      isDashboardPage,
      pathname: location.pathname
    });
  }, [user, isLoggedIn, hasToken, hasUserData, isAuthenticated, isDashboardPage, location.pathname]);

  const [show, setShow] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if current page is a dashboard/protected page
  const isDashboardPage = location.pathname.includes('/dashboard') || 
                          location.pathname.startsWith('/admin/') || 
                          location.pathname.startsWith('/department/') ||
                          location.pathname.startsWith('/officer/') ||
                          location.pathname.startsWith('/audit/') ||
                          location.pathname === '/settings' ||
                          location.pathname === '/my-documents' ||
                          location.pathname.startsWith('/document/upload') ||
                          location.pathname.startsWith('/document/') ||                          location.pathname.startsWith('/document/') ||                          location.pathname === '/notifications' ||
                          location.pathname.startsWith('/routing') ||
                          (location.pathname.includes('/users') && location.pathname !== '/');

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Poll for unread notifications every 30 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated && isDashboardPage) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDashboardPage]);

  // Refresh count when navigating
  useEffect(() => {
    if (isAuthenticated && isDashboardPage && location.pathname !== '/notifications') {
      fetchUnreadCount();
    }
  }, [location.pathname, isAuthenticated, isDashboardPage]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
            <a href="#main-content" className="utility-link" aria-label="Skip to main content">Skip to main content</a>
            <a href="/sitemap" className="utility-link" aria-label="View sitemap">Sitemap</a>
          </div>
          <div className="utility-right">
            <div className="language-toggle" role="group" aria-label="Language selection">
              <span className="lang-label" id="lang-en">English</span>
              <button 
                className="toggle-switch" 
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                aria-label={`Switch to ${language === "en" ? "Hindi" : "English"}`}
                aria-checked={language === "hi"}
                role="switch"
              >
                <div className={`toggle-slider ${language === "hi" ? "active" : ""}`}></div>
              </button>
              <span className="lang-label" id="lang-hi">हिंदी</span>
            </div>
            <div className="font-controls" role="group" aria-label="Font size controls">
              <button 
                onClick={() => changeFontSize("large")} 
                className="font-btn" 
                aria-label="Increase font size"
                title="Increase font size"
              >
                A+
              </button>
              <button 
                onClick={() => changeFontSize("normal")} 
                className="font-btn font-btn-equal" 
                aria-label="Reset to normal font size"
                title="Normal font size"
              >
                A=
              </button>
              <button 
                onClick={() => changeFontSize("small")} 
                className="font-btn" 
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                A-
              </button>
            </div>
            <button 
              className="accessibility-btn" 
              aria-label="Accessibility options"
              title="Accessibility"
            >
              <img src={wheelchairIcon} alt="" width="18" height="18" aria-hidden="true" />
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
              <img src={ourLogo} alt="Pravaah Logo" />
            </div>
            {/* Divider */}
            <div className="branding-divider"></div>
            {/* Project Title */}
            <div className="project-title">
              <h1 className="title-main">Pravaah</h1>
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
      <nav className="main-navigation" aria-label="Main navigation">
        <div className="nav-container">
          <ul className="nav-menu" role="menubar">
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/")} 
                className="nav-link"
                role="menuitem"
                aria-label="Home page"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
                </svg>
                <span>Home</span>
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/about")} 
                className="nav-link"
                role="menuitem"
                aria-label="About Pravaah"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"/>
                </svg>
                <span>About Pravaah</span>
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/how-it-works")} 
                className="nav-link"
                role="menuitem"
                aria-label="How It Works"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z"/>
                </svg>
                <span>How It Works</span>
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/departments")} 
                className="nav-link"
                role="menuitem"
                aria-label="View Departments"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z"/>
                </svg>
                <span>Departments</span>
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/whats-new")} 
                className="nav-link"
                role="menuitem"
                aria-label="What's New"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 2H4C3 2 2 2.9 2 4V7C2 7.55 2.45 8 3 8C3.55 8 4 7.55 4 7V4H20V7C20 7.55 20.45 8 21 8C21.55 8 22 7.55 22 7V4C22 2.9 21 2 20 2ZM11.8 20.9L8 17L9.4 15.6L11 17.2V9H13V17.2L14.6 15.6L16 17L12.2 20.9C12.1 21 11.9 21 11.8 20.9Z"/>
                </svg>
                <span>What's New</span>
              </button>
            </li>
            <li className="nav-item" role="none">
              <button 
                onClick={() => navigate("/help")} 
                className="nav-link"
                role="menuitem"
                aria-label="Help and Support"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M11 18H13V16H11V18ZM12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10H10C10 8.9 10.9 8 12 8S14 8.9 14 10C14 12 11 11.75 11 15H13C13 12.75 16 12.5 16 10C16 7.79 14.21 6 12 6Z"/>
                </svg>
                <span>Help</span>
              </button>
            </li>
          </ul>

          {/* Auth Section Desktop */}
          {isAuthenticated && isDashboardPage ? (
            <div className="header-auth-section">
              {/* Notification Bell */}
              <button
                className="notification-bell-btn"
                onClick={() => navigate('/notifications')}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                title="View Notifications"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div 
                className="user-profile-nav"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                role="navigation"
                aria-label="User menu"
              >
                <button
                  className="user-info-nav"
                  onClick={() => setShow(!show)}
                  aria-expanded={show}
                  aria-haspopup="true"
                  aria-label={`User menu for ${user?.firstName} ${user?.lastName}`}
                >
                <img 
                  className="user-avatar-nav" 
                  src={user?.profilePhoto || userIcon} 
                  alt="" 
                  aria-hidden="true"
                  style={{ objectFit: 'cover' }}
                />
                <div className="user-details-nav">
                  <p className="user-name-nav">{user?.firstName} {user?.lastName}</p>
                  <span className="user-role-nav">{user?.role?.replace(/_/g, ' ')}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{marginLeft: '8px', transition: 'transform 0.2s', transform: show ? 'rotate(180deg)' : 'rotate(0deg)'}} aria-hidden="true">
                  <path d="M7 10L12 15L17 10H7Z"/>
                </svg>
              </button>
              {show && (
                <div className="user-dropdown-nav" role="menu" aria-label="User menu options">
                  <button 
                    onClick={() => { 
                      const roleRoute = user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : 
                                       user?.role === 'DEPARTMENT_ADMIN' ? '/department/dashboard' : 
                                       user?.role === 'AUDITOR' ? '/auditor/dashboard' : 
                                       '/officer/dashboard';
                      navigate(roleRoute); 
                      setShow(false); 
                    }} 
                    className="dropdown-item-nav"
                    role="menuitem"
                    aria-label="Go to dashboard"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}} aria-hidden="true">
                      <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z"/>
                    </svg>
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { navigate("/settings"); setShow(false); }} 
                    className="dropdown-item-nav"
                    role="menuitem"
                    aria-label="Go to profile settings"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}} aria-hidden="true">
                      <path d="M12 12C14.21 12 16 10.21 16 8S14.21 4 12 4 8 5.79 8 8 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
                    </svg>
                    Profile & Settings
                  </button>
                  <div className="dropdown-divider-nav" role="separator"></div>
                  <button 
                    onClick={() => { handleLogout(); setShow(false); }} 
                    className="dropdown-item-nav logout-nav"
                    role="menuitem"
                    aria-label="Logout from account"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}} aria-hidden="true">
                      <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons-desktop">
              <button 
                onClick={() => navigate("/login")} 
                className="auth-btn-outline"
                aria-label="Login to your account"
              >
                Login
              </button>
              <button 
                onClick={() => navigate("/department-registration")} 
                className="auth-btn-filled"
                aria-label="Register your department"
              >
                Register Department
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
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
          <div className="mobile-menu" id="mobile-navigation" role="navigation" aria-label="Mobile navigation">
            <button 
              onClick={() => { navigate("/"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to Home"
            >
              Home
            </button>
            <button 
              onClick={() => { navigate("/about"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to About"
            >
              About
            </button>
            <button 
              onClick={() => { navigate("/how-it-works"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to How It Works"
            >
              How It Works
            </button>
            <button 
              onClick={() => { navigate("/departments"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to Departments"
            >
              Departments
            </button>
            {isAuthenticated && isDashboardPage && (
              <>
                <button 
                  onClick={() => { 
                    const roleRoute = user?.role === 'SUPER_ADMIN' ? '/admin/dashboard' : 
                                     user?.role === 'DEPARTMENT_ADMIN' ? '/department/dashboard' : 
                                     user?.role === 'AUDITOR' ? '/auditor/dashboard' : 
                                     '/dashboard';
                    navigate(roleRoute); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-nav-link"
                  aria-label="Navigate to Dashboard"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => { navigate("/notifications"); setMobileMenuOpen(false); }} 
                  className="mobile-nav-link"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '20px',
                        height: '20px',
                        padding: '0 6px',
                        background: '#ff3b30',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '10px',
                        lineHeight: '1',
                        boxShadow: '0 1px 3px rgba(255, 59, 48, 0.3)',
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                </button>
              </>
            )}
            <button 
              onClick={() => { navigate("/help"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to Help"
            >
              Help
            </button>
            <button 
              onClick={() => { navigate("/whats-new"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to What's New"
            >
              What's New
            </button>
            <button 
              onClick={() => { navigate("/faq"); setMobileMenuOpen(false); }} 
              className="mobile-nav-link"
              aria-label="Navigate to FAQ"
            >
              FAQ
            </button>
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => { navigate("/login"); setMobileMenuOpen(false); }} 
                  className="mobile-nav-link login-btn"
                  aria-label="Login to your account"
                >
                  Login
                </button>
                <button 
                  onClick={() => { navigate("/department-registration"); setMobileMenuOpen(false); }} 
                  className="mobile-nav-link login-btn"
                  aria-label="Register your department"
                >
                  Register Department
                </button>
              </>
            ) : (
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                className="mobile-nav-link logout-btn"
                aria-label="Logout from account"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </nav>

    </header>
  );
};

export default Header;
