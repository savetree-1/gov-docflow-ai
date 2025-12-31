/**
 * Protected Route Component
 * Enforces role-based access control for dashboard routes
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = useSelector((state) => state.tokenReducer?.token?.accessToken);
  const user = useSelector((state) => state.authReducer?.user?.data);
  const isLoggedIn = useSelector((state) => state.authReducer?.isLoggedIn);

  // Fallback to localStorage if Redux is empty
  const finalToken = token || localStorage.getItem('accessToken');
  const finalUser = user || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  // Check if user is authenticated
  if (!finalToken || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check if user profile is loaded and has role
  if (!finalUser || !finalUser.role) {
    console.log('No user or role, showing loading');
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Loading Profile...</h2>
        <p>Please wait while we load your account information.</p>
      </div>
    );
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(finalUser.role)) {
    console.log('Access denied for role:', finalUser.role);
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>Access Denied</h1>
        <p style={{ fontSize: '16px', marginBottom: '10px' }}>You do not have permission to view this page.</p>
        <p style={{ fontSize: '14px', color: '#666' }}>Required role: <strong>{allowedRoles.join(' or ')}</strong></p>
        <p style={{ fontSize: '14px', color: '#666' }}>Your role: <strong>{user.role}</strong></p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#0f5e59',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
