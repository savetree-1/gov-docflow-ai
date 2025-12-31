import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/dashboardSidebar/Sidebar';
import { DocumentCard, EmptyState } from '../components/dashboardShared/SharedComponents';
import { documentAPI } from '../api/backendAPI';
import './dashboards/SuperAdminDashboard.css';

const MyDocuments = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'OFFICER';
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const response = await documentAPI.getAll(params);
      
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>My <span className="dashboard-highlight">Documents</span></h1>
            <p className="dashboard-subtitle">View and manage your uploaded documents</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="dashboard-section" style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px 14px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
                color: '#1d1d1f',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'all 180ms ease-out',
                minHeight: '44px',
                letterSpacing: '-0.154px'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0f5e59';
                e.target.style.boxShadow = '0 0 0 3px rgba(15, 94, 89, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              style={{
                padding: '12px 14px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
                color: '#1d1d1f',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'all 180ms ease-out',
                minHeight: '44px',
                letterSpacing: '-0.154px'
              }}
            >
              <option value="">All Categories</option>
              <option value="finance">Finance</option>
              <option value="land">Land</option>
              <option value="hr">HR</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="policy">Policy</option>
              <option value="legal">Legal</option>
              <option value="other">Other</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{
                padding: '12px 14px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
                color: '#1d1d1f',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                outline: 'none',
                transition: 'all 180ms ease-out',
                minHeight: '44px',
                letterSpacing: '-0.154px'
              }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In_Progress">In Progress</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={() => navigate('/document/upload')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#0f5e59',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 180ms ease-out',
                minHeight: '44px',
                letterSpacing: '-0.154px',
                WebkitFontSmoothing: 'antialiased'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0d4d47';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(15, 94, 89, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0f5e59';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Upload New
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Documents</h2>
            <span className="section-count">{documents.length} documents</span>
          </div>
          
          {loading ? (
            <div className="loading-message">Loading documents...</div>
          ) : documents.length === 0 ? (
            <EmptyState
              icon="description"
              title="No documents found"
              message="Start by uploading your first document"
              actionText="Upload Document"
              onAction={() => navigate('/document/upload')}
            />
          ) : (
            <div className="document-grid">
              {documents.map((doc) => (
                <DocumentCard 
                  key={doc._id || doc.id} 
                  document={doc} 
                  onClick={() => navigate(`/document/${doc._id || doc.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
