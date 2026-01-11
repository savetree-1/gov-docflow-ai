/**
 * Dashboard Sidebar Component
 * Adapts navigation based on user role
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSaveTokenAction, getLogoutAction } from '../../redux/actions';
import { notificationAPI } from '../../api/notificationAPI';
import './Sidebar.css';
import promoImage1 from '../../img/image copy 5.png';
import promoImage2 from '../../img/image copy 6.png';
import mygovIcon from '../../img/mygov.png';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.authReducer?.user?.data);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Image carousel for promotional content
  const carouselImages = [
    { src: promoImage1, alt: 'Government Scheme Portal 1' },
    { src: promoImage2, alt: 'Government Scheme Portal 2' }
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const carouselInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(carouselInterval);
  }, [carouselImages.length]);

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

  // Poll for unread notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when navigating away from notifications page
  useEffect(() => {
    if (location.pathname !== '/notifications') {
      fetchUnreadCount();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear Redux state
    dispatch(getLogoutAction());
    dispatch(getSaveTokenAction(null));
    
    // Redirect to login
    navigate('/login');
  };

  const getMenuItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/chat', label: 'Chat' },
          { path: '/admin/registrations', label: 'Department Registrations' },
          { path: '/admin/users', label: 'User Management' },
          { path: '/admin/routing', label: 'Routing Configuration' },
          { path: '/admin/departments', label: 'Departments' },
          { path: '/admin/logs', label: 'System Logs' },
          { path: '/admin/settings', label: 'Settings' },
        ];
      
      case 'DEPARTMENT_ADMIN':
        return [
          { path: '/department/dashboard', label: 'Dashboard' },
          { path: '/department/chat', label: 'Chat' },
          { path: '/department/documents', label: 'Documents' },
          { path: '/document/upload', label: 'Upload Document' },
          { path: '/department/users', label: 'User Management' },
          { path: '/department/routing', label: 'Routing Configuration' },
          { path: '/notifications', label: 'Notifications' },
          { path: '/department/settings', label: 'Settings' },
        ];
      
      case 'OFFICER':
        return [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/my-documents', label: 'My Documents' },
          { path: '/document/upload', label: 'Upload Document' },
          { path: '/notifications', label: 'Notifications' },
          { path: '/settings', label: 'Settings' },
        ];
      
      case 'AUDITOR':
        return [
          { path: '/audit/search', label: 'Search Documents' },
          { path: '/audit/logs', label: 'Audit Logs' },
          { path: '/settings', label: 'Settings' },
        ];
      
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>Document Management</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-label">{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span>Logout</span>
        </button>
      </div>

      {/* Image Carousel for Promotions */}
      <div className="sidebar-carousel">
        <div className="carousel-container">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                opacity: index === currentSlide ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out'
              }}
            >
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* MyGov Portal Link */}
      <a 
        href="https://uttarakhand.mygov.in/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mygov-portal-link"
      >
        <img src={mygovIcon} alt="MyGov Uttarakhand" className="mygov-icon" />
        <span>Visit MyGov Uttarakhand Portal</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="external-icon">
          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
        </svg>
      </a>
    </div>
  );
};

export default Sidebar;
