/**
 * Document Detail Page
 * View document with metadata, preview, and action buttons
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { StatusBadge } from '../../components/dashboardShared/SharedComponents';
import { documentAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import './DocumentDetail.css';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'OFFICER';

  const [document, setDocument] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comment, setComment] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [showEditRouting, setShowEditRouting] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [blockchainVerification, setBlockchainVerification] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchDocument();
    fetchBlockchainVerification();
    fetchDepartments();
    
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [id]);

  // Load preview after document is fetched
  useEffect(() => {
    if (document) {
      loadPreview();
    }
  }, [document]);

  const loadPreview = async () => {
    try {
      if (!document) {
        console.log('Document not loaded yet, waiting...');
        return;
      }
      
      console.log('Loading preview for document:', id);
      console.log('Document fileType:', document.fileType);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const downloadUrl = `${API_BASE_URL}/documents/${id}/download`;
      console.log('Setting preview URL:', downloadUrl);
      
      // Set the URL directly for iframe to handle
      setPreviewUrl(downloadUrl);
    } catch (error) {
      console.error('Failed to load preview:', error);
      setPreviewUrl('error');
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('=== FETCHING DEPARTMENTS ===');
      const url = 'http://localhost:5001/api/departments?isActive=true';
      console.log('URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('Failed to fetch departments, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError('Unable to load departments. Please refresh the page.');
        return;
      }
      
      const result = await response.json();
      console.log('Departments API full response:', JSON.stringify(result, null, 2));
      console.log('Result.success:', result.success);
      console.log('Result.data:', result.data);
      console.log('Result.data.length:', result.data?.length);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('✅ Setting departments with', result.data.length, 'items');
        setDepartments(result.data);
        console.log('✅ Departments state updated');
      } else {
        console.log('❌ No departments in response');
        setError('No departments found.');
      }
    } catch (error) {
      console.error('❌ Failed to load departments - ERROR:', error);
      console.error('Error stack:', error.stack);
      setError('Network error while loading departments.');
    }
  };

  useEffect(() => {
    // Filter action history based on selected filter
    if (historyFilter === 'all') {
      setFilteredHistory(actionHistory);
    } else {
      setFilteredHistory(actionHistory.filter(item => 
        item.action.toLowerCase() === historyFilter.toLowerCase()
      ));
    }
  }, [actionHistory, historyFilter]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getById(id);
      
      if (response.data.success) {
        const doc = response.data.data;
        console.log('Document loaded:', doc.title);
        console.log('Has summary:', !!doc.summary);
        console.log('Summary length:', doc.summary?.length || 0);
        console.log('Key points:', doc.keyPoints?.length || 0);
        setDocument(doc);
        setActionHistory(doc.actionHistory || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainVerification = async () => {
    try {
      const response = await documentAPI.verifyBlockchain(id);
      if (response.data.success) {
        setBlockchainVerification(response.data.data);
      } else {
        // Set pending state if verification not yet available
        setBlockchainVerification({ verified: false, pending: true });
      }
    } catch (err) {
      console.log('Blockchain verification not available');
      // Set pending state on error
      setBlockchainVerification({ verified: false, pending: true });
    }
  };

  const handleAction = async (type) => {
    if (!comment && type !== 'Forward') {
      setError('Please add a comment/notes for this action');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await documentAPI.performAction(id, {
        action: type,
        notes: comment
      });

      if (response.data.success) {
        setSuccess(`Document ${type.toLowerCase()}d successfully`);
        setComment('');
        // Refresh document data
        await fetchDocument();
        setTimeout(() => {
          navigate(role === 'OFFICER' ? '/dashboard' : '/department/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${type.toLowerCase()} document`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRouting = async (confirmed, modifiedDepartment = null) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await documentAPI.confirmRouting(id, {
        confirmed,
        modifiedDepartment
      });

      if (response.data.success) {
        setSuccess(confirmed ? 'Routing confirmed successfully!' : 'Routing updated successfully!');
        setShowEditRouting(false);
        // Refresh document data
        await fetchDocument();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm routing');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use dedicated download endpoint
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      const downloadUrl = `${API_BASE_URL}/documents/${id}/download`;
      
      // Add authorization header via fetch and blob download
      const token = localStorage.getItem('token');
      console.log('Downloading from:', downloadUrl);
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Download response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || 'Download failed');
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create invisible link and trigger download
      const link = window.document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', document.fileName || 'document.pdf');
      link.style.display = 'none';
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setSuccess('Document downloaded successfully!');
      
      // Refresh to show new action in history
      await fetchDocument();
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      // Log print action
      await documentAPI.performAction(id, {
        action: 'Print',
        notes: 'Document printed'
      });
      
      window.print();
      // Refresh to show new action in history
      await fetchDocument();
    } catch (err) {
      console.error('Print error:', err);
      window.print();
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      setError('');
      const response = await documentAPI.performAction(id, {
        action: 'Comment',
        notes: comment
      });

      if (response.data.success) {
        setSuccess('Comment added successfully');
        setComment('');
        await fetchDocument();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDelete = async () => {
    const reason = prompt('Enter reason for deletion (required for audit):');
    if (!reason || !reason.trim()) {
      setError('Deletion reason is required');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to DELETE this document?\n\nTitle: ${document.title}\n\nThis will:\n✓ Mark document as deleted (soft delete)\n✓ Hide from all users (Officer, Department, Auditors)\n✓ Retain file for recovery\n✓ Log action in audit trail\n✓ Can be RESTORED later by SUPER_ADMIN`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      const response = await documentAPI.delete(id, reason);

      if (response.data.success) {
        setSuccess('Document deleted successfully. Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const confirmed = window.confirm(
      `RESTORE this document?\n\nTitle: ${document.title}\n\nThis will:\n✓ Restore document visibility\n✓ Make available to all authorized users\n✓ Retain deletion record in audit trail`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');
      const response = await documentAPI.restore(id);

      if (response.data.success) {
        setSuccess('Document restored successfully!');
        await fetchDocument(); // Refresh to show restored state
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore document');
    } finally {
      setLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    const reason = prompt('⚠️ PERMANENT DELETION\n\nThis will PERMANENTLY delete the document and file from the system.\nThis action CANNOT be undone.\n\nType "PERMANENTLY DELETE" to confirm:');
    
    if (reason !== 'PERMANENTLY DELETE') {
      setError('Permanent deletion cancelled - confirmation text did not match');
      return;
    }

    const finalConfirm = window.confirm(
      `⚠️ FINAL WARNING ⚠️\n\nPERMANENTLY DELETE:\n${document.title}\n\nThis will:\n✗ Delete file from server\n✗ Remove from database\n✗ CANNOT be recovered\n✗ Only audit log will remain\n\nClick OK to proceed with PERMANENT deletion.`
    );

    if (!finalConfirm) return;

    try {
      setLoading(true);
      setError('');
      const response = await documentAPI.permanentDelete(id);

      if (response.data.success) {
        setSuccess('Document permanently deleted. Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete document');
    } finally {
      setLoading(false);
    }
  };

  const canTakeAction = role !== 'AUDITOR';

  const getActionIcon = (action) => {
    // Removed emojis for professional appearance
    return '';
  };

  const getActionColor = (action) => {
    const colors = {
      'Upload': '#3498db',
      'Approve': '#27ae60',
      'Reject': '#e74c3c',
      'Forward': '#f39c12',
      'Comment': '#9b59b6',
      'Download': '#1abc9c',
      'Print': '#34495e',
      'View': '#95a5a6'
    };
    return colors[action] || '#7f8c8d';
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar role={role} />
        <div className="dashboard-content">
          <div className="loading-message">Loading document...</div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="dashboard-layout">
        <Sidebar role={role} />
        <div className="dashboard-content">
          <div className="error-message">Document not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}
        
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Back
            </button>
            <h1>{document.title}</h1>
            <p className="dashboard-subtitle">{document.referenceNumber}</p>
            {document.isDeleted && (
              <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', display: 'inline-block' }}>
                ⚠️ This document is DELETED (Soft Delete) - Visible to SUPER_ADMIN only
              </div>
            )}
          </div>
          <div className="header-actions">
            {!document.isDeleted && (
              <>
                <button onClick={handleDownload} className="btn-icon">
                  Download
                </button>
                <button onClick={handlePrint} className="btn-icon">
                  Print
                </button>
              </>
            )}
            
            {/* SUPER_ADMIN Delete/Restore Controls */}
            {role === 'SUPER_ADMIN' && !document.isDeleted && (
              <button 
                onClick={handleDelete} 
                className="btn-icon"
                style={{ backgroundColor: '#c62828', color: 'white' }}
              >
                Delete
              </button>
            )}
            
            {role === 'SUPER_ADMIN' && document.isDeleted && (
              <>
                <button 
                  onClick={handleRestore} 
                  className="btn-icon"
                  style={{ backgroundColor: '#2e7d32', color: 'white' }}
                >
                  Restore
                </button>
                <button 
                  onClick={handlePermanentDelete} 
                  className="btn-icon"
                  style={{ backgroundColor: '#b71c1c', color: 'white' }}
                >
                  Permanent Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="detail-layout">
          {/* Main Content */}
          <div className="detail-main">
            {/* Blockchain Verification Badge */}
            {blockchainVerification && blockchainVerification.verified && (
              <div className="dashboard-section blockchain-verification-section">
                <div className="verification-badge">
                  <div className="verification-details">
                    <div className="verification-title">Integrity Status: Verified</div>
                    <div className="verification-subtitle">Recorded on immutable ledger</div>
                    <div className="verification-subtitle">Audit-proof</div>
                  </div>
                </div>
                {blockchainVerification.polygonScanUrl && (
                  <a 
                    href={blockchainVerification.polygonScanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-blockchain"
                  >
                    View Blockchain Record →
                  </a>
                )}
              </div>
            )}
            
            {/* Blockchain Verification Pending */}
            {blockchainVerification && blockchainVerification.pending && (
              <div className="dashboard-section blockchain-verification-section pending">
                <div className="verification-badge">
                  <div className="verification-icon">⏳</div>
                  <div className="verification-details">
                    <div className="verification-title">Verification Pending</div>
                    <div className="verification-subtitle">Blockchain record will be created on approval</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggested Routing - Show ONLY if routing not confirmed yet */}
            {document.suggestedDepartment && !document.routingConfirmed && (
              <div className="dashboard-section routing-suggestion-section">
                <div className="section-header">
                  <h2>AI Suggested Routing</h2>
                  <span className="badge-ai">AI Recommendation</span>
                </div>
                
                <div className="routing-suggestion-content">
                  <div className="routing-details">
                    <div className="routing-field">
                      <label>Suggested Department:</label>
                      <div className="routing-value department">{document.suggestedDepartment}</div>
                    </div>
                    
                    <div className="routing-field">
                      <label>Confidence:</label>
                      <div className="routing-value">
                        <div className="confidence-bar">
                          <div className="confidence-fill" style={{width: `${document.routingConfidence || 85}%`}}></div>
                        </div>
                        <span className="confidence-text">{document.routingConfidence || 85}%</span>
                      </div>
                    </div>
                    
                    <div className="routing-field">
                      <label>AI Reasoning:</label>
                      <div className="routing-value reason">{document.routingReason || 'Based on document content analysis'}</div>
                    </div>
                  </div>

                  <div className="routing-actions">
                    <button 
                      className="btn-confirm-routing"
                      onClick={() => handleConfirmRouting(true)}
                      disabled={loading}
                    >
                      Confirm Routing
                    </button>
                    <button 
                      className="btn-edit-routing"
                      onClick={() => setShowEditRouting(true)}
                      disabled={loading}
                    >
                      Edit Routing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Show confirmed routing */}
            {document.routingConfirmed && document.department && (
              <div className="dashboard-section routing-confirmed-section">
                <div className="routing-confirmed-badge">
                  <span className="routing-text">
                    Routed to <strong>{document.department?.name || 'Department'}</strong>
                  </span>
                  <span className="routing-timestamp">
                    {document.routingConfirmedAt && new Date(document.routingConfirmedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* AI Summary Section - Only show if real summary exists */}
            {document.summary && (
              <div className="dashboard-section ai-summary-section">
                <div className="section-header">
                  <h2>AI-Generated Summary</h2>
                  <span className="badge-ai">AI Analyzed</span>
                </div>
                
                <div className="ai-summary-content">
                  <div className="summary-text">
                    <p>{document.summary}</p>
                  </div>
                  
                  {document.keyPoints && document.keyPoints.length > 0 && (
                    <div className="key-points">
                      <h4>Key Points</h4>
                      <ul>
                        {document.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action History */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Action History & Audit Trail</h2>
                <span className="section-count">{actionHistory.length} total actions</span>
              </div>
              
              <div className="history-filters">
                <button 
                  className={`filter-btn ${historyFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setHistoryFilter('all')}
                >
                  All ({actionHistory.length})
                </button>
                <button 
                  className={`filter-btn ${historyFilter === 'approve' ? 'active' : ''}`}
                  onClick={() => setHistoryFilter('approve')}
                >
                  Approvals
                </button>
                <button 
                  className={`filter-btn ${historyFilter === 'comment' ? 'active' : ''}`}
                  onClick={() => setHistoryFilter('comment')}
                >
                  Comments
                </button>
                <button 
                  className={`filter-btn ${historyFilter === 'forward' ? 'active' : ''}`}
                  onClick={() => setHistoryFilter('forward')}
                >
                  Forwards
                </button>
              </div>
              
              <div className="action-timeline">
                {filteredHistory.length === 0 ? (
                  <div className="no-actions">
                    <p>No {historyFilter !== 'all' ? historyFilter : ''} actions found</p>
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div key={item._id || index} className="timeline-item">
                      <div 
                        className="timeline-marker"
                        style={{ backgroundColor: getActionColor(item.action) }}
                      >
                        <span className="timeline-icon">{getActionIcon(item.action)}</span>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-action">
                            <strong className="action-name">{item.action}</strong>
                            {item.action === 'Approve' && <span className="action-badge success">Approved</span>}
                            {item.action === 'Reject' && <span className="action-badge danger">Rejected</span>}
                            {item.action === 'Forward' && <span className="action-badge warning">Forwarded</span>}
                          </div>
                          <span className="timeline-time">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="timeline-user">
                          {typeof item.performedBy === 'object' && item.performedBy
                            ? `${item.performedBy.firstName} ${item.performedBy.lastName}`
                            : item.user || 'System'}
                          {item.role && (
                            <span className="user-role"> • {item.role}</span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="timeline-notes">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Comment Section */}
            {canTakeAction && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Add Comment</h2>
                </div>
                
                <div className="comment-form">
                  <div className="form-group">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="form-textarea"
                      rows="3"
                      placeholder="Add a comment to the audit trail..."
                    />
                  </div>
                  <button 
                    onClick={handleAddComment}
                    className="btn-primary"
                    disabled={!comment.trim()}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {canTakeAction && document.status === 'Pending' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2>Take Action</h2>
                </div>
                
                <div className="action-form">
                  <div className="form-group">
                    <label>Add Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="form-textarea"
                      rows="3"
                      placeholder="Enter your comments or remarks"
                    />
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={() => handleAction('approve')} 
                      className="btn-action approve"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction('reject')} 
                      className="btn-action reject"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleAction('forward')} 
                      className="btn-action forward"
                    >
                      Forward
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="detail-sidebar">
            {/* Document Info */}
            <div className="info-card">
              <h3>Document Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Category</span>
                  <span className="info-value">{document.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Urgency</span>
                  <span className={`urgency-badge ${document.urgency.toLowerCase()}`}>
                    {document.urgency}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">
                    {typeof document.department === 'object' && document.department
                      ? document.department.name
                      : document.department || 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uploaded By</span>
                  <span className="info-value">
                    {typeof document.uploadedBy === 'object' && document.uploadedBy
                      ? `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`
                      : document.uploadedBy || 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Upload Date</span>
                  <span className="info-value">{document.uploadedOn}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Assigned To</span>
                  <span className="info-value">
                    {typeof document.assignedTo === 'object' && document.assignedTo
                      ? `${document.assignedTo.firstName} ${document.assignedTo.lastName}`
                      : document.assignedTo || 'Unassigned'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Stage</span>
                  <span className="info-value">{document.currentStage}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deadline</span>
                  <span className="info-value">{document.deadline}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="info-card">
                <h3>Tags</h3>
                <div className="tag-list">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="info-card">
              <h3>Description</h3>
              <p className="description">{document.description}</p>
            </div>
          </div>
        </div>

        {/* Edit Routing Modal */}
        {showEditRouting && (
          <div className="modal-overlay" onClick={() => setShowEditRouting(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Department Routing</h2>
                <button className="modal-close" onClick={() => setShowEditRouting(false)}>&times;</button>
              </div>
              
              <div className="modal-body">
                {console.log('🔍 Modal render - departments state:', departments, 'length:', departments.length)}
                <div className="form-group">
                  <label>Current Department:</label>
                  <div className="current-department">
                    {typeof document.department === 'object' && document.department
                      ? `${document.department.name} (${document.department.code})`
                      : document.suggestedDepartment || document.department || 'Not assigned'}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Select New Department</label>
                  <select 
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="form-input"
                    disabled={departments.length === 0}
                  >
                    <option value="">
                      {departments.length === 0 ? 'Loading departments...' : 'Choose a department'}
                    </option>
                    {departments.map(dept => {
                      console.log('Rendering dept option:', dept);
                      return (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      );
                    })}
                  </select>
                  {departments.length === 0 && (
                    <small className="form-hint">Please refresh the page if departments don't load.</small>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowEditRouting(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => handleConfirmRouting(true, selectedDepartment)}
                  disabled={!selectedDepartment}
                >
                  Confirm Routing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
