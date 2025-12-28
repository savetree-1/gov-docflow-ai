/**
 * Department Registration Request Form
 * Public-facing (no authentication required)
 * For department nodal officers to request onboarding
 * 
 * NOT A USER SIGNUP - This creates a PENDING request
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DepartmentRegistration.css";

// Government Logo
import govLogo from "../img/ourlogo.png";

const DEPARTMENT_LEVELS = {
  STATE: "STATE",
  DISTRICT: "DISTRICT"
};

const DepartmentRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentName: "",
    level: DEPARTMENT_LEVELS.STATE,
    districtName: "",
    nodalOfficerName: "",
    nodalOfficerEmail: "",
    nodalOfficerPhone: "",
    nodalOfficerDesignation: "",
    officeAddress: "",
    officePhone: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error on change
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (apiError) setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Department Name
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = "Department name is required";
    } else if (formData.departmentName.length < 3) {
      newErrors.departmentName = "Department name must be at least 3 characters";
    }

    // District Name (required if level is DISTRICT)
    if (formData.level === DEPARTMENT_LEVELS.DISTRICT && !formData.districtName.trim()) {
      newErrors.districtName = "District name is required for district-level departments";
    }

    // Nodal Officer Name
    if (!formData.nodalOfficerName.trim()) {
      newErrors.nodalOfficerName = "Nodal officer name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.nodalOfficerEmail.trim()) {
      newErrors.nodalOfficerEmail = "Official email is required";
    } else if (!emailRegex.test(formData.nodalOfficerEmail)) {
      newErrors.nodalOfficerEmail = "Invalid email format";
    } else if (!isGovernmentEmail(formData.nodalOfficerEmail)) {
      newErrors.nodalOfficerEmail = "Email must be from official government domain (e.g., @uk.gov.in, @nic.in)";
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.nodalOfficerPhone && !phoneRegex.test(formData.nodalOfficerPhone)) {
      newErrors.nodalOfficerPhone = "Invalid phone number (10 digits, starting with 6-9)";
    }

    // Designation
    if (!formData.nodalOfficerDesignation.trim()) {
      newErrors.nodalOfficerDesignation = "Designation is required";
    }

    // Office Address
    if (!formData.officeAddress.trim()) {
      newErrors.officeAddress = "Office address is required";
    } else if (formData.officeAddress.length < 10) {
      newErrors.officeAddress = "Please provide complete office address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isGovernmentEmail = (email) => {
    const govDomains = ['uk.gov.in', 'gov.uk.in', 'nic.in', 'uttarakhand.gov.in'];
    const domain = email.split('@')[1]?.toLowerCase();
    return govDomains.some(govDomain => 
      domain === govDomain || domain?.endsWith('.' + govDomain)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(
        `${API_BASE_URL}/departments/registrations`,
        formData
      );

      if (response.data.success) {
        setSubmitted(true);
      } else {
        setApiError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          "Failed to submit registration. Please try again later.";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="dept-reg-container">
        <div className="dept-reg-header">
          <div className="dept-header-content">
            <img src={govLogo} alt="Government of Uttarakhand" className="dept-logo" />
            <div className="dept-header-text">
              <h1>उत्तराखंड सरकार</h1>
              <h1>Government of Uttarakhand</h1>
              <h2>विभाग पंजीकरण</h2>
              <h2>Department Registration</h2>
            </div>
          </div>
        </div>

        <div className="dept-reg-main">
          <div className="dept-success-box">
            <div className="dept-success-icon">✓</div>
            <h2>Registration Request Submitted Successfully</h2>
            <p>
              Your department registration request has been received and is pending approval 
              from the State IT Cell / Super Administrator.
            </p>
            <p>
              You will be notified via email at <strong>{formData.nodalOfficerEmail}</strong> once 
              your request is reviewed.
            </p>
            <div className="dept-success-info">
              <h3>What happens next?</h3>
              <ol>
                <li>Your request will be reviewed by the Super Administrator</li>
                <li>Upon approval, a department account will be created</li>
                <li>You will receive login credentials via email</li>
                <li>You can then create accounts for your department staff</li>
              </ol>
            </div>
            <button 
              className="dept-btn dept-btn-primary"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </button>
          </div>
        </div>

        <div className="dept-reg-footer-bar">
          <p>&copy; {new Date().getFullYear()} Government of Uttarakhand</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dept-reg-container">
      <div className="dept-reg-header">
        <div className="dept-header-content">
          <img src={govLogo} alt="Government of Uttarakhand" className="dept-logo" />
          <div className="dept-header-text">
            <h1>उत्तराखंड सरकार</h1>
            <h1>Government of Uttarakhand</h1>
            <h2>विभाग पंजीकरण अनुरोध</h2>
            <h2>Department Registration Request</h2>
          </div>
        </div>
      </div>

      <div className="dept-reg-main">
        <div className="dept-reg-box">
          <div className="dept-reg-intro">
            <h3>New Department Onboarding</h3>
            <p>
              This form is for government department nodal officers to request access 
              to the internal document management system. After submission, your request 
              will be reviewed by the State IT Cell.
            </p>
            <div className="dept-alert dept-alert-info">
              <span className="dept-alert-icon">ℹ</span>
              <span>
                <strong>Important:</strong> Use only official government email addresses. 
                All fields marked with * are mandatory.
              </span>
            </div>
          </div>

          {apiError && (
            <div className="dept-alert dept-alert-error" role="alert">
              <span className="dept-alert-icon">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="dept-reg-form">
            {/* Department Information */}
            <fieldset className="dept-fieldset">
              <legend>Department Information</legend>

              <div className="dept-form-group">
                <label htmlFor="departmentName" className="dept-label">
                  Department Name <span className="dept-required">*</span>
                </label>
                <input
                  type="text"
                  id="departmentName"
                  name="departmentName"
                  className={`dept-input ${errors.departmentName ? 'dept-input-error' : ''}`}
                  value={formData.departmentName}
                  onChange={handleInputChange}
                  placeholder="e.g., Department of Agriculture"
                  disabled={loading}
                />
                {errors.departmentName && (
                  <span className="dept-error-text">{errors.departmentName}</span>
                )}
              </div>

              <div className="dept-form-group">
                <label htmlFor="level" className="dept-label">
                  Department Level <span className="dept-required">*</span>
                </label>
                <select
                  id="level"
                  name="level"
                  className="dept-input dept-select"
                  value={formData.level}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value={DEPARTMENT_LEVELS.STATE}>State Level</option>
                  <option value={DEPARTMENT_LEVELS.DISTRICT}>District Level</option>
                </select>
              </div>

              {formData.level === DEPARTMENT_LEVELS.DISTRICT && (
                <div className="dept-form-group">
                  <label htmlFor="districtName" className="dept-label">
                    District Name <span className="dept-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="districtName"
                    name="districtName"
                    className={`dept-input ${errors.districtName ? 'dept-input-error' : ''}`}
                    value={formData.districtName}
                    onChange={handleInputChange}
                    placeholder="e.g., Dehradun"
                    disabled={loading}
                  />
                  {errors.districtName && (
                    <span className="dept-error-text">{errors.districtName}</span>
                  )}
                </div>
              )}
            </fieldset>

            {/* Nodal Officer Information */}
            <fieldset className="dept-fieldset">
              <legend>Nodal Officer Information</legend>

              <div className="dept-form-row">
                <div className="dept-form-group">
                  <label htmlFor="nodalOfficerName" className="dept-label">
                    Full Name <span className="dept-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nodalOfficerName"
                    name="nodalOfficerName"
                    className={`dept-input ${errors.nodalOfficerName ? 'dept-input-error' : ''}`}
                    value={formData.nodalOfficerName}
                    onChange={handleInputChange}
                    placeholder="Full name of nodal officer"
                    disabled={loading}
                  />
                  {errors.nodalOfficerName && (
                    <span className="dept-error-text">{errors.nodalOfficerName}</span>
                  )}
                </div>

                <div className="dept-form-group">
                  <label htmlFor="nodalOfficerDesignation" className="dept-label">
                    Designation <span className="dept-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nodalOfficerDesignation"
                    name="nodalOfficerDesignation"
                    className={`dept-input ${errors.nodalOfficerDesignation ? 'dept-input-error' : ''}`}
                    value={formData.nodalOfficerDesignation}
                    onChange={handleInputChange}
                    placeholder="e.g., Joint Director"
                    disabled={loading}
                  />
                  {errors.nodalOfficerDesignation && (
                    <span className="dept-error-text">{errors.nodalOfficerDesignation}</span>
                  )}
                </div>
              </div>

              <div className="dept-form-row">
                <div className="dept-form-group">
                  <label htmlFor="nodalOfficerEmail" className="dept-label">
                    Official Email <span className="dept-required">*</span>
                  </label>
                  <input
                    type="email"
                    id="nodalOfficerEmail"
                    name="nodalOfficerEmail"
                    className={`dept-input ${errors.nodalOfficerEmail ? 'dept-input-error' : ''}`}
                    value={formData.nodalOfficerEmail}
                    onChange={handleInputChange}
                    placeholder="officer@uk.gov.in"
                    disabled={loading}
                  />
                  {errors.nodalOfficerEmail && (
                    <span className="dept-error-text">{errors.nodalOfficerEmail}</span>
                  )}
                </div>

                <div className="dept-form-group">
                  <label htmlFor="nodalOfficerPhone" className="dept-label">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    id="nodalOfficerPhone"
                    name="nodalOfficerPhone"
                    className={`dept-input ${errors.nodalOfficerPhone ? 'dept-input-error' : ''}`}
                    value={formData.nodalOfficerPhone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    disabled={loading}
                  />
                  {errors.nodalOfficerPhone && (
                    <span className="dept-error-text">{errors.nodalOfficerPhone}</span>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Office Contact Information */}
            <fieldset className="dept-fieldset">
              <legend>Office Contact Information</legend>

              <div className="dept-form-group">
                <label htmlFor="officeAddress" className="dept-label">
                  Complete Office Address <span className="dept-required">*</span>
                </label>
                <textarea
                  id="officeAddress"
                  name="officeAddress"
                  className={`dept-input dept-textarea ${errors.officeAddress ? 'dept-input-error' : ''}`}
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  placeholder="Full postal address with PIN code"
                  rows="3"
                  disabled={loading}
                />
                {errors.officeAddress && (
                  <span className="dept-error-text">{errors.officeAddress}</span>
                )}
              </div>

              <div className="dept-form-group">
                <label htmlFor="officePhone" className="dept-label">
                  Office Landline Number
                </label>
                <input
                  type="tel"
                  id="officePhone"
                  name="officePhone"
                  className="dept-input"
                  value={formData.officePhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 0135-2711234"
                  disabled={loading}
                />
              </div>
            </fieldset>

            <div className="dept-form-actions">
              <button 
                type="button" 
                className="dept-btn dept-btn-secondary"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="dept-btn dept-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="dept-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Registration Request"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="dept-reg-footer-bar">
        <p>&copy; {new Date().getFullYear()} Government of Uttarakhand. Designed and maintained by State IT Cell / NIC.</p>
      </div>
    </div>
  );
};

export default DepartmentRegistration;
