/**
 * Government-Style Login Page
 * Uttarakhand Government Internal Platform
 * 
 * Features:
 * - Minimal, professional design
 * - Email/Employee ID login
 * - No social auth, no public signup
 * - CAPTCHA placeholder
 * - Audit-ready
 */

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authenticationAPI";
import { getSaveTokenAction, getSaveProfileAction, getLoginAction } from "../redux/actions";
import "./GovLogin.css";

// Government Logo
import govLogo from "../img/ukgov.png";

const GovLogin = () => {
  const [credentials, setCredentials] = useState({
    emailOrEmployeeId: "",
    password: "",
    captchaToken: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error on input
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!credentials.emailOrEmployeeId || !credentials.password) {
      setError("Please enter both Email/Employee ID and Password");
      return;
    }

    setLoading(true);

    try {
      // Call authentication API
      const response = await login(credentials);

      if (response.success) {
        // Store token in Redux with correct structure
        const tokens = {
          accessToken: response.token,
          refreshToken: localStorage.getItem('refreshToken')
        };
        dispatch(getSaveTokenAction(tokens));
        
        // Store user profile from login response
        dispatch(getSaveProfileAction(response.user));
        
        // Trigger login state
        dispatch(getLoginAction());

        // Redirect based on role
        redirectBasedOnRole(response.user.role);
      } else {
        // Show error message
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        navigate("/admin/dashboard");
        break;
      case "DEPARTMENT_ADMIN":
        navigate("/department/dashboard");
        break;
      case "OFFICER":
        navigate("/dashboard");
        break;
      case "AUDITOR":
        navigate("/audit/search");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="gov-login-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
      >
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="gov-login-header" style={{ position: 'relative', zIndex: 1 }}>
        <div className="gov-header-content">
          <img src={govLogo} alt="Government of Uttarakhand" className="gov-logo" />
          <div className="gov-header-text">
            <h1>उत्तराखंड सरकार</h1>
            <h1>Government of Uttarakhand</h1>
            <h2>आंतरिक दस्तावेज़ प्रबंधन प्रणाली</h2>
            <h2>Internal Document Management System</h2>
          </div>
        </div>
      </div>

      <div className="gov-login-main" style={{ position: 'relative', zIndex: 1 }}>
        <div className="gov-login-box">
          <div className="gov-login-title">
            <h3>Authorized Personnel Login</h3>
            <p>For official use only</p>
          </div>

          {error && (
            <div className="gov-alert gov-alert-error" role="alert">
              <span className="gov-alert-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="gov-login-form">
            <div className="gov-form-group">
              <label htmlFor="emailOrEmployeeId" className="gov-label">
                Email Address / Employee ID
              </label>
              <input
                type="text"
                id="emailOrEmployeeId"
                name="emailOrEmployeeId"
                className="gov-input"
                value={credentials.emailOrEmployeeId}
                onChange={handleInputChange}
                placeholder="Enter your email or employee ID"
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>

            <div className="gov-form-group">
              <label htmlFor="password" className="gov-label">
                Password
              </label>
              <div className="gov-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="gov-input"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="gov-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CAPTCHA Placeholder - for future implementation */}
            <div className="gov-form-group">
              <div className="gov-captcha-placeholder">
                <input 
                  type="checkbox" 
                  id="captcha" 
                  className="gov-checkbox"
                  disabled={loading}
                  required 
                />
                <label htmlFor="captcha" className="gov-checkbox-label">
                  I am not a robot (CAPTCHA placeholder)
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="gov-btn gov-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="gov-spinner"></span>
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="gov-login-footer">
            <Link to="/department-registration" className="gov-link">
              <span className="gov-link-icon">📋</span>
              Department Registration Request
            </Link>

            <div className="gov-info-text">
              <p>
                <strong>Note:</strong> This is a restricted system for authorized 
                government personnel only. All login attempts are logged and monitored. 
                Unauthorized access is prohibited.
              </p>
              <p className="gov-help-text">
                For technical support or account issues, contact your department 
                administrator or the State IT Cell.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="gov-login-footer-bar">
        <p>
          &copy; {new Date().getFullYear()} Government of Uttarakhand. 
          Designed and maintained by State IT Cell / NIC.
        </p>
      </div>
    </div>
  );
};

export default GovLogin;
