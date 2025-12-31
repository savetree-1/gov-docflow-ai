/**
 * Document Upload Page
 * Multi-step document upload with metadata and routing preview
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { documentAPI, routingAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import '../dashboards/SuperAdminDashboard.css';
import './DocumentUpload.css';

const DocumentUpload = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'OFFICER';
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [routingPreview, setRoutingPreview] = useState(null);
  const [loadingRouting, setLoadingRouting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    fileName: '',
    fileSize: '',
    title: '',
    category: '',
    subcategory: '',
    description: '',
    urgency: 'Medium',
    tags: '',
    referenceNumber: '',
    initialDepartment: ''
  });

  const [preview, setPreview] = useState(null);

  // Fetch registered departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      // If user already has a department (OFFICER or DEPT_ADMIN), use it
      if (user?.department) {
        console.log('✅ Using user department:', user.department);
        setDepartments([user.department]);
        setUploadData(prev => ({...prev, initialDepartment: user.department._id}));
        return;
      }

      // Otherwise, fetch all departments (for Super Admin)
      try {
        setLoadingDepartments(true);
        console.log('🔍 Fetching all departments...');
        const response = await fetch('http://localhost:5001/api/departments?isActive=true', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('📡 Response status:', response.status);
        const result = await response.json();
        console.log('📊 Departments result:', result);
        if (result.success) {
          console.log('✅ Setting departments:', result.data.length, 'departments');
          setDepartments(result.data);
        } else {
          console.error('❌ Failed to fetch departments:', result.message);
          setError('Failed to load departments. Please refresh the page.');
        }
      } catch (error) {
        console.error('❌ Failed to load departments:', error);
        setError('Failed to load departments. Please refresh the page.');
      } finally {
        setLoadingDepartments(false);
      }
    };
    
    fetchDepartments();
  }, [user]);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const categories = [
    { value: 'finance', label: 'Finance & Budget' },
    { value: 'land', label: 'Land Records' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'policy', label: 'Policy & Guidelines' },
    { value: 'legal', label: 'Legal & Compliance' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'Low', color: '#27ae60' },
    { value: 'Medium', color: '#e67e22' },
    { value: 'High', color: '#e74c3c' }
  ];

  const getFileIcon = (fileName, fileType) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📕';
    } else if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return '📘';
    } else if (fileType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return '📊';
    } else if (fileType.includes('powerpoint') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return '📙';
    }
    return '📄';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should not exceed 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setError('Unsupported file type. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
        return;
      }
      
      setError('');
      
      // Format file size
      const fileSize = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      setUploadData({
        ...uploadData,
        file: file,
        fileName: file.name,
        fileSize: fileSize
      });

      // Generate preview based on file type
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadstart = () => setLoading(true);
        reader.onloadend = () => {
          setPreview(reader.result);
          setLoading(false);
        };
        reader.onerror = () => {
          setError('Failed to load image preview');
          setPreview(null);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Create object URL for PDF preview
        const pdfUrl = URL.createObjectURL(file);
        setPreview(pdfUrl);
      } else {
        // For other document types, just show icon
        setPreview('DOCUMENT_FILE');
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && !uploadData.file) {
      setError('Please select a file');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (step === 2 && (!uploadData.title || !uploadData.category || !uploadData.initialDepartment)) {
      setError('Please fill all required fields (Title, Category, Department)');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Fetch routing preview when moving to step 3
    if (step === 2) {
      fetchRoutingPreview();
    }
    
    setStep(step + 1);
  };

  const fetchRoutingPreview = async () => {
    setLoadingRouting(true);
    try {
      const response = await routingAPI.test({
        department: user?.department?._id || user?.department,
        category: uploadData.category,
        urgency: uploadData.urgency,
        tags: uploadData.tags
      });

      if (response.data.success && response.data.data) {
        setRoutingPreview(response.data.data);
      } else {
        // No matching rule found - set default routing
        setRoutingPreview(null);
      }
    } catch (err) {
      console.error('Failed to fetch routing preview:', err);
      setRoutingPreview(null);
    } finally {
      setLoadingRouting(false);
    }
  };

  const handleBack = () => {
    setError('');
    setSuccess('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!uploadData.file || !uploadData.title || !uploadData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('category', uploadData.category);
      formData.append('urgency', uploadData.urgency);
      formData.append('description', uploadData.description);
      formData.append('tags', uploadData.tags);
      formData.append('initialDepartment', uploadData.initialDepartment);

      const response = await documentAPI.upload(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setUploadProgress(100);
        setSuccess(`Document uploaded successfully! Reference: ${response.data.data.referenceNumber}`);
        setTimeout(() => {
          navigate(role === 'OFFICER' ? '/dashboard' : '/department/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
      setLoading(false);
      setUploadProgress(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Upload <span className="dashboard-highlight">Document</span></h1>
            <p className="dashboard-subtitle">Submit new documents for processing and routing</p>
          </div>
        </div>

        {error && <ErrorMsg message={error} />}
        {success && <SuccessMsg message={success} />}

        {/* Progress Steps */}
        <div className="upload-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select File</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Add Details</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review & Submit</div>
          </div>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="dashboard-section">
            <div className="upload-area">
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
              
              {!uploadData.file ? (
                <label htmlFor="file-input" className="upload-box">
                  <svg className="upload-icon" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 8L32 40M32 8L24 16M32 8L40 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 32V52C16 54.2091 17.7909 56 20 56H44C46.2091 56 48 54.2091 48 52V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                  <h3>Click to upload or drag & drop</h3>
                  <p>PDF, DOC, DOCX, JPG or PNG • Maximum 10MB</p>
                  <div className="supported-formats">
                    <span className="format-badge">PDF</span>
                    <span className="format-badge">DOC</span>
                    <span className="format-badge">DOCX</span>
                    <span className="format-badge">JPG</span>
                    <span className="format-badge">PNG</span>
                  </div>
                </label>
              ) : loading ? (
                <div className="file-loading">
                  <div className="spinner"></div>
                  <p>Loading preview...</p>
                </div>
              ) : (
                <div className="file-preview">
                  {preview && preview.startsWith('data:image/') ? (
                    <div className="preview-content">
                      <div className="image-preview-container">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="preview-image"
                          onClick={() => window.open(preview, '_blank')}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full size"
                        />
                        <div className="image-preview-overlay">
                          <button 
                            className="btn-preview-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(preview, '_blank');
                            }}
                          >
                            View Full Size
                          </button>
                        </div>
                      </div>
                      <div className="preview-info">
                        <div className="file-icon-small">{getFileIcon(uploadData.fileName, uploadData.file?.type || '')}</div>
                        <div>
                          <div className="file-name">{uploadData.fileName}</div>
                          <div className="file-size">{uploadData.fileSize}</div>
                        </div>
                      </div>
                    </div>
                  ) : preview && preview.startsWith('blob:') ? (
                    <div className="preview-content">
                      <div className="pdf-preview-container">
                        <iframe
                          src={preview}
                          title="PDF Preview"
                          className="pdf-preview"
                        />
                        <div className="pdf-preview-overlay">
                          <button 
                            className="btn-preview-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(preview, '_blank');
                            }}
                          >
                            Open in New Tab
                          </button>
                        </div>
                      </div>
                      <div className="preview-info">
                        <div className="file-icon-small">📕</div>
                        <div>
                          <div className="file-name">{uploadData.fileName}</div>
                          <div className="file-size">{uploadData.fileSize}</div>
                          <div className="file-type-badge">PDF Document</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <div className="file-icon">{getFileIcon(uploadData.fileName, uploadData.file?.type || '')}</div>
                      <div className="file-name">{uploadData.fileName}</div>
                      <div className="file-size">{uploadData.fileSize}</div>
                      <div className="file-type-badge">
                        {uploadData.fileName.substring(uploadData.fileName.lastIndexOf('.')).toUpperCase()} Document
                      </div>
                      <p className="preview-note">Preview not available for this file type</p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      if (preview && preview.startsWith('blob:')) {
                        URL.revokeObjectURL(preview);
                      }
                      setUploadData({...uploadData, file: null, fileName: '', fileSize: ''});
                      setPreview(null);
                    }}
                    className="btn-remove"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            <div className="upload-actions">
              <button onClick={handleNext} className="btn-primary" disabled={!uploadData.file}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Metadata */}
        {step === 2 && (
          <div className="dashboard-section">
            <form className="upload-form">
              <div className="form-group">
                <label>Document Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="form-input"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Urgency Level *</label>
                  <select
                    value={uploadData.urgency}
                    onChange={(e) => setUploadData({...uploadData, urgency: e.target.value})}
                    className="form-input"
                    required
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.value}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={uploadData.initialDepartment}
                    onChange={(e) => setUploadData({...uploadData, initialDepartment: e.target.value})}
                    className="form-input"
                    required
                    disabled={loadingDepartments}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {loadingDepartments && <small style={{color: '#888'}}>Loading departments...</small>}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  className="form-textarea"
                  rows="4"
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={uploadData.referenceNumber}
                    onChange={(e) => setUploadData({...uploadData, referenceNumber: e.target.value})}
                    className="form-input"
                    placeholder="e.g., REF-2025-001"
                  />
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                    className="form-input"
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>
            </form>

            <div className="upload-actions">
              <button onClick={handleBack} className="btn-secondary">
                Back
              </button>
              <button onClick={handleNext} className="btn-primary">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="dashboard-section">
            <div className="review-section">
              <h3>Review Your Upload</h3>
              
              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">File Name:</span>
                  <span className="review-value">{uploadData.fileName}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">File Size:</span>
                  <span className="review-value">{uploadData.fileSize}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Document Title:</span>
                  <span className="review-value">{uploadData.title}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Category:</span>
                  <span className="review-value">
                    {categories.find(c => c.value === uploadData.category)?.label}
                  </span>
                </div>
                <div className="review-item">
                  <span className="review-label">Urgency:</span>
                  <span className="review-value">{uploadData.urgency}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{uploadData.description || 'N/A'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Reference:</span>
                  <span className="review-value">{uploadData.referenceNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="routing-preview">
                <h4>Expected Routing</h4>
                {loadingRouting ? (
                  <div className="routing-loading">
                    <div className="spinner"></div>
                    <p>Calculating routing path...</p>
                  </div>
                ) : routingPreview ? (
                  <div className="routing-matched">
                    <p className="routing-info">
                      <strong>Routing Rule Applied:</strong> {routingPreview.name}
                    </p>
                    <p className="routing-description">
                      Based on category <strong>{uploadData.category}</strong> and urgency <strong>{uploadData.urgency}</strong>
                    </p>
                    <div className="routing-path">
                      <div className="routing-step">
                        <div className="step-header">Current Department</div>
                        <div className="step-content">
                          {routingPreview.department?.name || 'Your Department'}
                        </div>
                      </div>
                      <div className="routing-arrow">→</div>
                      <div className="routing-step highlighted">
                        <div className="step-header">Will Be Assigned To</div>
                        <div className="step-content">
                          {routingPreview.assignTo?.firstName} {routingPreview.assignTo?.lastName}
                          <div className="step-role">{routingPreview.assignTo?.role?.replace(/_/g, ' ')}</div>
                          <div className="step-id">ID: {routingPreview.assignTo?.employeeId}</div>
                        </div>
                      </div>
                      <div className="routing-arrow">→</div>
                      <div className="routing-step">
                        <div className="step-header">Status</div>
                        <div className="step-content">Processing</div>
                      </div>
                    </div>
                    {routingPreview.priority && (
                      <p className="routing-priority">
                        Priority Level: <strong>{routingPreview.priority}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="routing-default">
                    <p className="routing-info">
                      <strong>Default Routing:</strong> No specific routing rule configured
                    </p>
                    <p className="routing-description">
                      Document will be assigned manually by department admin
                    </p>
                    <div className="routing-path">
                      <div className="routing-step">
                        <div className="step-header">Submitted By</div>
                        <div className="step-content">You</div>
                      </div>
                      <div className="routing-arrow">→</div>
                      <div className="routing-step">
                        <div className="step-header">Review</div>
                        <div className="step-content">Department Admin</div>
                      </div>
                      <div className="routing-arrow">→</div>
                      <div className="routing-step">
                        <div className="step-header">Assignment</div>
                        <div className="step-content">Manual Assignment</div>
                      </div>
                    </div>
                    <p className="routing-note">
                      Your department admin will assign this document to an appropriate officer
                    </p>
                  </div>
                )}
              </div>
            </div>

            {loading && (
              <div className="upload-progress-container">
                <div className="upload-progress-header">
                  <span className="upload-progress-text">Uploading document...</span>
                  <span className="upload-progress-percent">{uploadProgress}%</span>
                </div>
                <div className="upload-progress-bar">
                  <div 
                    className="upload-progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="upload-progress-info">
                  {uploadProgress < 100 
                    ? 'Please wait while we securely upload your document...' 
                    : 'Processing document...'}
                </p>
              </div>
            )}

            <div className="upload-actions">
              <button onClick={handleBack} className="btn-secondary" disabled={loading}>
                Back
              </button>
              <button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Uploading...
                  </span>
                ) : 'Submit Document'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
