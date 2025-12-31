/**
 * Officer Dashboard
 * Daily operational work
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { DocumentCard, EmptyState } from '../../components/dashboardShared/SharedComponents';
import { documentAPI } from '../../api/backendAPI';
import '../dashboards/SuperAdminDashboard.css';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const navigate = useNavigate();
  const [actionRequired, setActionRequired] = useState([]);
  const [forInformation, setForInformation] = useState([]);
  const [aiSummaries, setAiSummaries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse] = await Promise.all([
        documentAPI.getAll({ limit: 20 }),
        documentAPI.getStats()
      ]);

      if (docsResponse.data.success) {
        const docs = docsResponse.data.data;
        setActionRequired(docs.filter(d => d.status === 'Pending' || d.status === 'In_Progress'));
        setForInformation(docs.filter(d => d.status === 'Approved'));
        
        // Filter documents with AI summaries
        const docsWithSummary = docs.filter(d => d.summary && d.summary.length > 0);
        setAiSummaries(docsWithSummary.slice(0, 6)); // Show latest 6
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="OFFICER" />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Officer <span className="dashboard-highlight">Dashboard</span></h1>
            <p className="dashboard-subtitle">Welcome back, {user?.firstName} {user?.lastName}</p>
          </div>
        </div>

        {/* Priority Alert */}
        {actionRequired.length > 0 && (
          <div className="alert-banner priority">
            <div className="alert-content">
              <strong>Action Required</strong>
              <p>You have {actionRequired.length} documents requiring immediate attention</p>
            </div>
          </div>
        )}

        {/* AI-Analyzed Documents Section */}
        {aiSummaries.length > 0 && (
          <div className="dashboard-section ai-analysis-section">
            <div className="section-header">
              <h2>AI-Analyzed Documents</h2>
              <span className="ai-badge">Powered by AI</span>
            </div>
            
            <div className="ai-summaries-grid">
              {aiSummaries.map(doc => (
                <div 
                  key={doc._id || doc.id} 
                  className="ai-summary-card"
                  onClick={() => navigate(`/document/${doc._id || doc.id}`)}
                >
                  <div className="ai-card-header">
                    <h3>{doc.title}</h3>
                    <span className={`priority-tag ${doc.urgency?.toLowerCase() || 'medium'}`}>
                      {doc.urgency || 'Medium'}
                    </span>
                  </div>
                  
                  <div className="ai-summary-text">
                    <p>{doc.summary}</p>
                  </div>
                  
                  {doc.keyPoints && doc.keyPoints.length > 0 && (
                    <div className="ai-key-points">
                      <span className="points-label">Key Points:</span>
                      <ul>
                        {doc.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="ai-card-footer">
                    <span className="doc-category">{doc.category}</span>
                    <span className="doc-status">{doc.status}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="section-footer">
              <button 
                className="view-all-btn" 
                onClick={() => navigate('/documents?filter=ai-analyzed')}
              >
                View All AI-Analyzed Documents →
              </button>
            </div>
          </div>
        )}

        {/* Action Required Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Action Required</h2>
            <span className="section-count">{actionRequired.length} documents</span>
          </div>
          
          <div className="document-grid">
            {actionRequired.map(doc => (
              <DocumentCard 
                key={doc._id || doc.id} 
                document={doc} 
                onClick={() => navigate(`/document/${doc._id || doc.id}`)}
              />
            ))}
          </div>
        </div>

        {/* For Information Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>For Information</h2>
            <span className="section-count">{forInformation.length} documents</span>
          </div>
          
          <div className="document-grid">
            {forInformation.map(doc => (
              <DocumentCard 
                key={doc._id || doc.id} 
                document={doc} 
                onClick={() => navigate(`/document/${doc._id || doc.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions-grid">
            <button className="quick-action-card" onClick={() => navigate('/document/upload')}>
              <span className="action-label">Upload Document</span>
            </button>
            <button className="quick-action-card" onClick={() => navigate('/dashboard')}>
              <span className="action-label">My Documents</span>
            </button>
            <button className="quick-action-card" onClick={() => navigate('/settings')}>
              <span className="action-label">Settings</span>
            </button>
            <button className="quick-action-card" onClick={() => window.location.href = '/settings'}>
              <span className="action-label">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
