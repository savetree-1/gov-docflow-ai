/**
 * Super Admin Dashboard with Real Analytics
 * State-level oversight with data visualizations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { MetricCard, DataTable, StatusBadge } from '../../components/dashboardShared/SharedComponents';
import { departmentAPI, userAPI, documentAPI } from '../../api/backendAPI';
import { analyticsAPI } from '../../api/analyticsAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import './SuperAdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalDepartments: 0,
    pendingRegistrations: 0,
    totalUsers: 0,
    documentsProcessed: 0
  });

  // Analytics data
  const [documentsOverTime, setDocumentsOverTime] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [processingTrends, setProcessingTrends] = useState([]);
  
  // Other data
  const [allDepartments, setAllDepartments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [registrationTab, setRegistrationTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [deptsRes, usersRes, docsRes, allDeptsRes, allDocsRes, deletedDocsRes] = await Promise.all([
        departmentAPI.getStats(),
        userAPI.getStats(),
        documentAPI.getStats(),
        departmentAPI.getAll(),
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

      if (allDeptsRes.data.success) {
        setAllDepartments(allDeptsRes.data.data || []);
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

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const [docsOverTime, deptPerf, statusDist, processTrends] = await Promise.all([
        analyticsAPI.getDocumentsOverTime(selectedTimeRange),
        analyticsAPI.getDepartmentPerformance(),
        analyticsAPI.getStatusDistribution(),
        analyticsAPI.getProcessingTrends(selectedTimeRange)
      ]);

      if (docsOverTime.data.success) {
        setDocumentsOverTime(docsOverTime.data.data);
      }

      if (deptPerf.data.success) {
        setDepartmentPerformance(deptPerf.data.data);
      }

      if (statusDist.data.success) {
        setStatusDistribution(statusDist.data.data);
      }

      if (processTrends.data.success) {
        setProcessingTrends(processTrends.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await departmentAPI.approve(id);
      if (response.data.success) {
        setSuccess('Department approved successfully');
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
          <strong style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px', lineHeight: '1.4', wordBreak: 'break-word' }}>
            {row.title}
          </strong>
          <div style={{ fontSize: '13px', color: '#86868b', fontFamily: 'Monaco, Menlo, monospace' }}>
            {row.referenceNumber}
          </div>
        </div>
      )
    },
    { 
      header: 'Category', 
      render: (row) => (
        <span style={{ textTransform: 'capitalize', color: '#1d1d1f', fontSize: '14px' }}>
          {row.category}
        </span>
      )
    },
    { 
      header: 'Department', 
      render: (row) => (
        <span style={{ color: '#1d1d1f', fontSize: '14px' }}>
          {row.department?.name || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Status', 
      render: (row) => <StatusBadge status={row.status} />
    },
    { 
      header: 'Created', 
      render: (row) => (
        <span style={{ color: '#1d1d1f', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => navigate(`/document/${row._id}`)}
            style={{ backgroundColor: '#007aff', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            View
          </button>
          <button 
            onClick={() => handleDeleteDocument(row._id, row.title)}
            style={{ backgroundColor: '#ff3b30', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
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
          <strong style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#ff3b30', marginBottom: '4px', lineHeight: '1.4', wordBreak: 'break-word' }}>
            {row.title}
          </strong>
          <div style={{ fontSize: '13px', color: '#86868b', fontFamily: 'Monaco, Menlo, monospace' }}>
            {row.referenceNumber}
          </div>
        </div>
      )
    },
    { 
      header: 'Deleted At', 
      render: (row) => (
        <span style={{ color: '#1d1d1f', fontSize: '14px', whiteSpace: 'nowrap' }}>
          {new Date(row.deletedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
        <div style={{ maxWidth: '250px', fontSize: '13px', color: '#86868b', lineHeight: '1.4' }}>
          {row.deleteReason || 'No reason provided'}
        </div>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleRestoreDocument(row._id, row.title)}
            style={{ backgroundColor: '#34c759', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            Restore
          </button>
          <button 
            onClick={() => handlePermanentDelete(row._id, row.title)}
            style={{ backgroundColor: '#8e8e93', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          >
            Permanent Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar role="SUPER_ADMIN" />
        <div className="dashboard-content">
          <div className="loading-state">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar role="SUPER_ADMIN" />
      <div className="dashboard-content">
        {error && <ErrorMsg message={error} onClose={() => setError('')} />}
        {success && <SuccessMsg message={success} onClose={() => setSuccess('')} />}
        
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Super Admin <span className="dashboard-highlight">Dashboard</span></h1>
            <p className="dashboard-subtitle">State-level oversight and governance</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <MetricCard 
            title="Total Departments" 
            value={metrics.totalDepartments}
          />
          <MetricCard 
            title="Pending Registrations" 
            value={metrics.pendingRegistrations}
            trend={metrics.pendingRegistrations > 0 ? "pending" : ""}
          />
          <MetricCard 
            title="Total Users" 
            value={metrics.totalUsers}
          />
          <MetricCard 
            title="Documents Processed" 
            value={metrics.documentsProcessed}
          />
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <div className="section-header-with-controls">
            <h2>Analytics & Insights</h2>
            <div className="time-range-selector">
              <button 
                className={selectedTimeRange === 7 ? 'active' : ''}
                onClick={() => setSelectedTimeRange(7)}
              >
                7 Days
              </button>
              <button 
                className={selectedTimeRange === 30 ? 'active' : ''}
                onClick={() => setSelectedTimeRange(30)}
              >
                30 Days
              </button>
              <button 
                className={selectedTimeRange === 90 ? 'active' : ''}
                onClick={() => setSelectedTimeRange(90)}
              >
                90 Days
              </button>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="loading-state">Loading analytics...</div>
          ) : (
            <div className="analytics-grid">
              {/* Documents Over Time */}
              <div className="chart-card" style={{ position: 'relative' }}>
                <h3>Documents Uploaded Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={documentsOverTime.length > 0 ? documentsOverTime : [{ date: '', count: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} name="Documents" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                {documentsOverTime.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    pointerEvents: 'none'
                  }}>
                    No data available
                  </div>
                )}
              </div>

              {/* Department Performance */}
              <div className="chart-card" style={{ position: 'relative' }}>
                <h3>Department Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformance.length > 0 ? departmentPerformance : [{ departmentCode: '', totalDocuments: 0, approved: 0, pending: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="departmentCode" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalDocuments" fill="#0088FE" name="Total" />
                    <Bar dataKey="approved" fill="#00C49F" name="Approved" />
                    <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
                {departmentPerformance.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    pointerEvents: 'none'
                  }}>
                    No data available
                  </div>
                )}
              </div>

              {/* Status Distribution */}
              <div className="chart-card" style={{ position: 'relative' }}>
                <h3>Document Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution.length > 0 ? statusDistribution : [{ status: 'No Data', count: 1 }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={statusDistribution.length > 0 ? ({status, count}) => `${status}: ${count}` : false}
                      outerRadius={80}
                      fill="#f0f0f0"
                      dataKey="count"
                    >
                      {statusDistribution.length > 0 ? statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      )) : <Cell fill="#e0e0e0" />}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {statusDistribution.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    pointerEvents: 'none'
                  }}>
                    No data available
                  </div>
                )}
              </div>

              {/* Processing Time Trends */}
              <div className="chart-card" style={{ position: 'relative' }}>
                <h3>Average Processing Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processingTrends.length > 0 ? processingTrends : [{ date: '', avgHours: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgHours" stroke="#FF8042" strokeWidth={2} name="Avg Processing (hrs)" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
                {processingTrends.length === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#999',
                    fontSize: '14px',
                    fontWeight: '500',
                    pointerEvents: 'none'
                  }}>
                    No data available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Department Registrations */}
        <div className="dashboard-section" style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: '700', color: '#1d1d1f' }}>
            Department Registrations
          </h2>
          
          {/* Registration Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #f0f0f0',
            marginBottom: '24px',
            gap: '8px'
          }}>
            <button
              onClick={() => setRegistrationTab('pending')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                color: registrationTab === 'pending' ? '#0f5e59' : '#86868b',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: registrationTab === 'pending' ? '3px solid #0f5e59' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease'
              }}
            >
              Pending ({allDepartments.filter(d => d.status === 'Pending').length})
            </button>
            <button
              onClick={() => setRegistrationTab('approved')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                color: registrationTab === 'approved' ? '#0f5e59' : '#86868b',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: registrationTab === 'approved' ? '3px solid #0f5e59' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease'
              }}
            >
              Approved ({allDepartments.filter(d => d.status === 'Approved').length})
            </button>
            <button
              onClick={() => setRegistrationTab('rejected')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                color: registrationTab === 'rejected' ? '#0f5e59' : '#86868b',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: registrationTab === 'rejected' ? '3px solid #0f5e59' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.2s ease'
              }}
            >
              Rejected ({allDepartments.filter(d => d.status === 'Rejected').length})
            </button>
          </div>

          {/* Tab Content */}
          {registrationTab === 'pending' && (
            allDepartments.filter(d => d.status === 'Pending').length === 0 ? (
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
                  No pending registrations
                </p>
              </div>
            ) : (
              <DataTable 
                columns={registrationColumns}
                data={allDepartments.filter(d => d.status === 'Pending').map(dept => ({
                  id: dept._id,
                  departmentName: dept.name,
                  nodalOfficer: dept.nodalOfficer?.name || 'Not Assigned',
                  email: dept.contactEmail || dept.nodalOfficer?.email || 'N/A',
                  status: dept.status,
                  submittedOn: new Date(dept.createdAt).toLocaleDateString()
                }))}
                onAction={(action, id) => {
                  if (action === 'approve') handleApprove(id);
                  if (action === 'reject') handleReject(id);
                }}
              />
            )
          )}

          {registrationTab === 'approved' && (
            allDepartments.filter(d => d.status === 'Approved').length === 0 ? (
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
                  No approved departments
                </p>
              </div>
            ) : (
              <DataTable 
                columns={[
                  {
                    field: 'departmentName',
                    header: 'Department Name',
                    render: (row) => <strong style={{ color: '#0f5e59' }}>{row.departmentName}</strong>
                  },
                  {
                    field: 'nodalOfficer',
                    header: 'Nodal Officer'
                  },
                  {
                    field: 'email',
                    header: 'Email'
                  },
                  {
                    field: 'status',
                    header: 'Status',
                    render: (row) => <StatusBadge status={row.status} />
                  },
                  {
                    field: 'submittedOn',
                    header: 'Approved On'
                  }
                ]}
                data={allDepartments.filter(d => d.status === 'Approved').map(dept => ({
                  id: dept._id,
                  departmentName: dept.name,
                  nodalOfficer: dept.nodalOfficer?.name || 'Not Assigned',
                  email: dept.contactEmail || dept.nodalOfficer?.email || 'N/A',
                  status: dept.status,
                  submittedOn: dept.approvedAt ? new Date(dept.approvedAt).toLocaleDateString() : new Date(dept.createdAt).toLocaleDateString()
                }))}
              />
            )
          )}

          {registrationTab === 'rejected' && (
            allDepartments.filter(d => d.status === 'Rejected').length === 0 ? (
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
                  No rejected departments
                </p>
              </div>
            ) : (
              <DataTable 
                columns={[
                  {
                    field: 'departmentName',
                    header: 'Department Name',
                    render: (row) => <strong style={{ color: '#0f5e59' }}>{row.departmentName}</strong>
                  },
                  {
                    field: 'nodalOfficer',
                    header: 'Nodal Officer'
                  },
                  {
                    field: 'email',
                    header: 'Email'
                  },
                  {
                    field: 'status',
                    header: 'Status',
                    render: (row) => <StatusBadge status={row.status} />
                  },
                  {
                    field: 'submittedOn',
                    header: 'Rejected On'
                  }
                ]}
                data={allDepartments.filter(d => d.status === 'Rejected').map(dept => ({
                  id: dept._id,
                  departmentName: dept.name,
                  nodalOfficer: dept.nodalOfficer?.name || 'Not Assigned',
                  email: dept.contactEmail || dept.nodalOfficer?.email || 'N/A',
                  status: dept.status,
                  submittedOn: dept.rejectedAt ? new Date(dept.rejectedAt).toLocaleDateString() : new Date(dept.createdAt).toLocaleDateString()
                }))}
              />
            )
          )}
        </div>

        {/* Recent Documents */}
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
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1d1d1f' }}>
                {showDeleted ? 'Deleted Documents Archive' : 'Document Management'}
              </h2>
            </div>
            <div>
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                style={{
                  backgroundColor: showDeleted ? '#f5f5f7' : '#007aff',
                  color: showDeleted ? '#1d1d1f' : '#ffffff',
                  border: showDeleted ? '1px solid #d1d1d6' : 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
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
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
