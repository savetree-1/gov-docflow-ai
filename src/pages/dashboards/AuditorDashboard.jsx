/**
 * Auditor Dashboard
 * Read-only compliance and audit support
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { DataTable, StatusBadge } from '../../components/dashboardShared/SharedComponents';
import { documentAPI, auditAPI } from '../../api/backendAPI';
import { ErrorMsg } from '../../components/alerts';
import '../dashboards/SuperAdminDashboard.css';
import './AuditorDashboard.css';

const AuditorDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    department: '',
    dateFrom: '',
    dateTo: '',
    category: ''
  });

  const [recentDocuments, setRecentDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [docsRes, auditRes] = await Promise.all([
        documentAPI.getAll({ limit: 10, sortBy: '-createdAt' }),
        auditAPI.getAll({ limit: 10, sortBy: '-timestamp' })
      ]);

      if (docsRes.data.success) {
        setRecentDocuments(docsRes.data.data.map(doc => ({
          id: doc._id,
          title: doc.title,
          department: doc.department?.name || 'N/A',
          category: doc.category,
          uploadedBy: doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'N/A',
          uploadDate: new Date(doc.createdAt).toLocaleDateString(),
          status: doc.status,
          accessedBy: doc.actionHistory?.length || 0
        })));
      }

      if (auditRes.data.success) {
        setAuditLogs(auditRes.data.data.map(log => ({
          id: log._id,
          action: log.action,
          user: log.userEmail || 'System',
          document: log.resource || '-',
          timestamp: new Date(log.timestamp).toLocaleString(),
          ipAddress: log.ipAddress || 'N/A'
        })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        ...searchFilters,
        limit: 50
      };
      const response = await documentAPI.getAll(params);
      if (response.data.success) {
        setRecentDocuments(response.data.data.map(doc => ({
          id: doc._id,
          title: doc.title,
          department: doc.department?.name || 'N/A',
          category: doc.category,
          uploadedBy: doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : 'N/A',
          uploadDate: new Date(doc.createdAt).toLocaleDateString(),
          status: doc.status,
          accessedBy: doc.actionHistory?.length || 0
        })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const documentColumns = [
    { header: 'Title', field: 'title' },
    { header: 'Department', field: 'department' },
    { header: 'Uploaded By', field: 'uploadedBy' },
    { header: 'Date', field: 'uploadDate' },
    { 
      header: 'Status', 
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <button 
          className="table-action-btn view"
          onClick={() => navigate(`/document/${row.id || row._id}`)}
        >
          View Details
        </button>
      )
    }
  ];

  const auditColumns = [
    { header: 'Timestamp', field: 'timestamp' },
    { header: 'Action', field: 'action' },
    { header: 'User', field: 'user' },
    { header: 'Document', field: 'document' },
    { header: 'IP Address', field: 'ipAddress' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="AUDITOR" />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Auditor <span className="dashboard-highlight">Dashboard</span></h1>
            <p className="dashboard-subtitle">Read-Only Access - Compliance & Audit Support</p>
          </div>
        </div>
        {error && <ErrorMsg message={error} />}
        {/* Search Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Search Documents</h2>
          </div>
          
          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, keyword, or document ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn" onClick={handleSearch}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="search-filters">
              <select 
                className="filter-select"
                value={searchFilters.department}
                onChange={(e) => setSearchFilters({...searchFilters, department: e.target.value})}
              >
                <option value="">All Departments</option>
                <option value="agriculture">Agriculture</option>
                <option value="revenue">Revenue</option>
                <option value="forest">Forest</option>
              </select>

              <select 
                className="filter-select"
                value={searchFilters.category}
                onChange={(e) => setSearchFilters({...searchFilters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="land">Land</option>
                <option value="finance">Finance</option>
              </select>

              <input
                type="date"
                className="filter-date"
                value={searchFilters.dateFrom}
                onChange={(e) => setSearchFilters({...searchFilters, dateFrom: e.target.value})}
                placeholder="From Date"
              />

              <input
                type="date"
                className="filter-date"
                value={searchFilters.dateTo}
                onChange={(e) => setSearchFilters({...searchFilters, dateTo: e.target.value})}
                placeholder="To Date"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">TITLE</th>
                  <th scope="col">DEPARTMENT</th>
                  <th scope="col">UPLOADED BY</th>
                  <th scope="col">DATE</th>
                  <th scope="col">STATUS</th>
                  <th scope="col" style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      Loading...
                    </td>
                  </tr>
                ) : recentDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>
                      No documents found
                    </td>
                  </tr>
                ) : (
                  recentDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.title}</td>
                      <td>{doc.department?.split(' ')[0] || doc.department}</td>
                      <td>{doc.uploadedBy}</td>
                      <td>{doc.uploadDate}</td>
                      <td>
                        <StatusBadge status={doc.status} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="table-action-btn view"
                          onClick={() => navigate(`/document/${doc.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Audit Logs</h2>
            <button className="section-action-btn">Export Logs</button>
          </div>
          
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">TIMESTAMP</th>
                  <th scope="col">ACTION</th>
                  <th scope="col">USER</th>
                  <th scope="col">DOCUMENT</th>
                  <th scope="col">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                      Loading...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>
                      No audit logs available
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.timestamp}</td>
                      <td>{log.action}</td>
                      <td>{log.user}</td>
                      <td>{log.document}</td>
                      <td>{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Read-Only Notice */}
        <div className="notice-banner">
          <div className="notice-content">
            <strong>Read-Only Access</strong>
            <p>You have view-only permissions. You cannot upload, edit, or approve documents.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
