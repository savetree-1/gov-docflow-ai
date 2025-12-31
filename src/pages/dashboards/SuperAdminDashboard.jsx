/**
 * Super Admin Dashboard
 * State-level oversight and governance
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { MetricCard, DataTable, StatusBadge } from '../../components/dashboardShared/SharedComponents';
import { departmentAPI, userAPI, documentAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalDepartments: 0,
    pendingRegistrations: 0,
    totalUsers: 0,
    documentsProcessed: 0
  });

  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [deptsRes, usersRes, docsRes, pendingDeptsRes, allDocsRes, deletedDocsRes] = await Promise.all([
        departmentAPI.getStats(),
        userAPI.getStats(),
        documentAPI.getStats(),
        departmentAPI.getAll({ status: 'Pending' }),
        documentAPI.getAll({ limit: 10, page: 1 }),
        documentAPI.getAll({ limit: 10, page: 1, includeDeleted: 'true' })
      ]);

      if (deptsRes.data.success && usersRes.data.success && docsRes.data.success) {
        setMetrics({
          totalDepartments: deptsRes.data.data.total || 0,
          pendingRegistrations: deptsRes.data.data.pending || 0,
          totalUsers: usersRes.data.data.total || 0,
          documentsProcessed: docsRes.data.data.total || 0
        });
      }

      if (pendingDeptsRes.data.success) {
        setPendingRegistrations(pendingDeptsRes.data.data.map(dept => ({
          id: dept._id,
          departmentName: dept.name,
          nodalOfficer: dept.nodalOfficer?.name || 'Not Assigned',
          email: dept.contactEmail || dept.nodalOfficer?.email || 'N/A',
          status: dept.approvalStatus,
          submittedOn: new Date(dept.createdAt).toLocaleDateString()
        })));
      }

      if (allDocsRes.data.success) {
        setDocuments(allDocsRes.data.data.filter(doc => !doc.isDeleted).slice(0, 10));
      }

      if (deletedDocsRes.data.success) {
        setDeletedDocuments(deletedDocsRes.data.data.filter(doc => doc.isDeleted));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await departmentAPI.approve(id);
      if (response.data.success) {
        setSuccess('Department approved successfully');
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve department');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      const response = await departmentAPI.reject(id, { reason });
      if (response.data.success) {
        setSuccess('Department rejected successfully');
        setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject department');
    }
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    const reason = prompt(`Delete Document: ${docTitle}\n\nEnter reason for deletion (required for audit):`);
    if (!reason || !reason.trim()) {
      setError('Deletion reason is required');
      return;
    }

    const confirmed = window.confirm(
      `DELETE DOCUMENT?\n\nTitle: ${docTitle}\n\nThis will:\n✓ Soft delete (can be restored)\n✓ Hide from all users\n✓ Keep file for recovery\n✓ Log in audit trail`
    );

    if (!confirmed) return;

    try {
      const response = await documentAPI.delete(docId, reason);
      if (response.data.success) {
        setSuccess('Document deleted successfully');
        await fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleRestoreDocument = async (docId, docTitle) => {
    const confirmed = window.confirm(
      `RESTORE DOCUMENT?\n\nTitle: ${docTitle}\n\nThis will make the document visible to all authorized users again.`
    );

    if (!confirmed) return;

    try {
      const response = await documentAPI.restore(docId);
      if (response.data.success) {
        setSuccess('Document restored successfully');
        await fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore document');
    }
  };

  const handlePermanentDelete = async (docId, docTitle) => {
    const confirmation = prompt(
      `⚠️ PERMANENT DELETION ⚠️\n\nDocument: ${docTitle}\n\nThis CANNOT be undone!\nType "PERMANENTLY DELETE" to confirm:`
    );
    
    if (confirmation !== 'PERMANENTLY DELETE') {
      return;
    }

    try {
      const response = await documentAPI.permanentDelete(docId);
      if (response.data.success) {
        setSuccess('Document permanently deleted');
        await fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete');
    }
  };

  const registrationColumns = [
    { header: 'Department Name', field: 'departmentName' },
    { header: 'Nodal Officer', field: 'nodalOfficer' },
    { header: 'Email', field: 'email' },
    { header: 'Submitted On', field: 'submittedOn' },
    { 
      header: 'Status', 
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row, onAction) => (
        <div className="table-actions">
          <button 
            className="table-action-btn approve"
            onClick={() => onAction('approve', row.id)}
          >
            Approve
          </button>
          <button 
            className="table-action-btn reject"
            onClick={() => onAction('reject', row.id)}
          >
            Reject
          </button>
        </div>
      )
    }
  ];

  const documentColumns = [
    { 
      header: 'Title', 
      render: (row) => (
        <div style={{ minWidth: '280px', maxWidth: '400px' }}>
          <strong style={{ 
            display: 'block', 
            fontSize: '15px', 
            fontWeight: '600',
            color: '#1d1d1f',
            marginBottom: '4px',
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {row.title}
          </strong>
          <div style={{ 
            fontSize: '13px', 
            color: '#86868b',
            fontFamily: 'Monaco, Menlo, monospace'
          }}>
            {row.referenceNumber}
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      render: (row) => (
        <span style={{ 
          textTransform: 'capitalize',
          color: '#1d1d1f',
          fontSize: '14px'
        }}>
          {row.category}
        </span>
      )
    },
    { 
      header: 'Status', 
      render: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Department', 
      render: (row) => (
        <span style={{ 
          color: '#1d1d1f',
          fontSize: '14px',
          display: 'block',
          maxWidth: '200px',
          lineHeight: '1.4'
        }}>
          {row.department?.name ? row.department.name.replace(/\s+Department$/i, '') : 'N/A'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => navigate(`/document/${row._id}`)}
            style={{ 
              backgroundColor: '#007aff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051d5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007aff'}
          >
            View
          </button>
          <button 
            onClick={() => handleDeleteDocument(row._id, row.title)}
            style={{ 
              backgroundColor: '#ff3b30',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff3b30'}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const deletedDocumentColumns = [
    { 
      header: 'Title', 
      render: (row) => (
        <div style={{ minWidth: '280px', maxWidth: '400px' }}>
          <strong style={{ 
            display: 'block',
            fontSize: '15px', 
            fontWeight: '600',
            color: '#ff3b30',
            marginBottom: '4px',
            lineHeight: '1.4',
            wordBreak: 'break-word'
          }}>
            {row.title}
          </strong>
          <div style={{ 
            fontSize: '13px', 
            color: '#86868b',
            fontFamily: 'Monaco, Menlo, monospace'
          }}>
            {row.referenceNumber}
          </div>
        </div>
      )
    },
    { 
      header: 'Deleted At', 
      render: (row) => (
        <span style={{ 
          color: '#1d1d1f',
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}>
          {new Date(row.deletedAt).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    { 
      header: 'Deleted By', 
      render: (row) => (
        <span style={{ color: '#1d1d1f', fontSize: '14px' }}>
          {row.deletedBy?.firstName ? `${row.deletedBy.firstName} ${row.deletedBy.lastName}` : 'N/A'}
        </span>
      )
    },
    { 
      header: 'Reason', 
      render: (row) => (
        <div style={{ 
          maxWidth: '250px', 
          fontSize: '13px', 
          color: '#86868b',
          lineHeight: '1.4'
        }}>
          {row.deleteReason || 'No reason provided'}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'nowrap'
        }}>
          <button 
            onClick={() => handleRestoreDocument(row._id, row.title)}
            style={{ 
              backgroundColor: '#34c759',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2da84a'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#34c759'}
          >
            Restore
          </button>
          <button 
            onClick={() => handlePermanentDelete(row._id, row.title)}
            style={{ 
              backgroundColor: '#8e0000',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#6e0000'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#8e0000'}
          >
            Permanent Delete
          </button>
        </div>
      )
    }
  ];

  const handleTableAction = (action, id) => {
    if (action === 'approve') {
      handleApprove(id);
    } else if (action === 'reject') {
      handleReject(id);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="SUPER_ADMIN" />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Super Admin <span className="dashboard-highlight">Dashboard</span></h1>
            <p className="dashboard-subtitle">State-level System Overview</p>
          </div>
        </div>

        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <>
        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Total Departments"
            value={metrics.totalDepartments}
          />
          <MetricCard
            title="Pending Registrations"
            value={metrics.pendingRegistrations}
          />
          <MetricCard
            title="Total Active Users"
            value={metrics.totalUsers}
          />
          <MetricCard
            title="Documents Processed"
            value={metrics.documentsProcessed}
          />
        </div>

        {/* Department Registrations Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Pending Department Registrations</h2>
            <span className="section-count">{pendingRegistrations.length} pending</span>
          </div>
          
          <DataTable
            columns={registrationColumns}
            data={pendingRegistrations}
            onAction={handleTableAction}
          />
        </div>

        {/* Document Management Section */}
        <div className="dashboard-section" style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div>
              <h2 style={{ 
                margin: '0 0 4px 0',
                fontSize: '22px',
                fontWeight: '600',
                color: '#1d1d1f',
                letterSpacing: '-0.5px'
              }}>
                Document Management
              </h2>
              <p style={{ 
                margin: 0,
                fontSize: '14px',
                color: '#86868b',
                fontWeight: '400'
              }}>
                {showDeleted ? 'Deleted documents archive' : 'Active documents in the system'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '14px',
                color: '#86868b',
                fontWeight: '500'
              }}>
                {showDeleted ? `${deletedDocuments.length} deleted` : `${documents.length} active`}
              </span>
              <button 
                onClick={() => setShowDeleted(!showDeleted)}
                style={{ 
                  backgroundColor: showDeleted ? '#f5f5f7' : '#007aff',
                  color: showDeleted ? '#1d1d1f' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  if (showDeleted) {
                    e.target.style.backgroundColor = '#e8e8ed';
                  } else {
                    e.target.style.backgroundColor = '#0051d5';
                  }
                }}
                onMouseOut={(e) => {
                  if (showDeleted) {
                    e.target.style.backgroundColor = '#f5f5f7';
                  } else {
                    e.target.style.backgroundColor = '#007aff';
                  }
                }}
              >
                {showDeleted ? 'Show Active Documents' : `View Deleted (${deletedDocuments.length})`}
              </button>
            </div>
          </div>
          
          {!showDeleted ? (
            <>
              <p style={{ 
                color: '#86868b', 
                marginBottom: '20px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Recent documents in the system. Click "View" to see details or "Delete" to soft-delete a document.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <DataTable
                  columns={documentColumns}
                  data={documents}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                backgroundColor: '#fff4e0', 
                border: '1px solid #ffcc00', 
                padding: '16px 20px', 
                borderRadius: '10px', 
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px', lineHeight: '1' }}>⚠️</span>
                  <div>
                    <strong style={{ 
                      display: 'block',
                      color: '#b45309',
                      fontSize: '15px',
                      fontWeight: '600',
                      marginBottom: '6px'
                    }}>
                      Deleted Documents Archive
                    </strong>
                    <p style={{ 
                      margin: 0,
                      fontSize: '14px',
                      color: '#92400e',
                      lineHeight: '1.5'
                    }}>
                      These documents are soft-deleted and hidden from all users. You can restore them or permanently delete them.
                    </p>
                  </div>
                </div>
              </div>
              {deletedDocuments.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  backgroundColor: '#f5f5f7',
                  borderRadius: '10px'
                }}>
                  <p style={{ 
                    margin: 0,
                    fontSize: '15px',
                    color: '#86868b',
                    fontWeight: '500'
                  }}>
                    No deleted documents
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <DataTable
                    columns={deletedDocumentColumns}
                    data={deletedDocuments}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* System Activity Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent System Activity</h2>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-content">
                <p className="activity-text">Revenue Department approved</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p className="activity-text">12 new users added across departments</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p className="activity-text">System logs archived</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
