/**
 * Department Admin Dashboard
 * Department-level control and coordination
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { MetricCard, DocumentCard, EmptyState } from '../../components/dashboardShared/SharedComponents';
import { documentAPI, userAPI } from '../../api/backendAPI';
import { ErrorMsg } from '../../components/alerts';
import '../dashboards/SuperAdminDashboard.css';

const DepartmentAdminDashboard = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const [metrics, setMetrics] = useState({
    receivedToday: 0,
    requireAction: 0,
    overdue: 0,
    recentlyRouted: 0
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [docsRes, statsRes] = await Promise.all([
        documentAPI.getAll({ 
          department: user?.department,
          limit: 10,
          sortBy: '-createdAt'
        }),
        documentAPI.getStats()
      ]);

      if (docsRes.data.success) {
        setDocuments(docsRes.data.data.map(doc => ({
          id: doc._id,
          title: doc.title,
          category: doc.category,
          urgency: doc.urgency,
          assignedTo: doc.assignedTo ? `${doc.assignedTo.firstName} ${doc.assignedTo.lastName}` : 'Unassigned',
          status: doc.status,
          summary: doc.description || 'No description',
          deadline: new Date(doc.createdAt).toLocaleDateString()
        })));
      }

      if (statsRes.data.success) {
        const stats = statsRes.data.data;
        setMetrics({
          receivedToday: stats.today || 0,
          requireAction: stats.pending || 0,
          overdue: stats.overdue || 0,
          recentlyRouted: stats.processing || 0
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="DEPARTMENT_ADMIN" />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Department Admin <span className="dashboard-highlight">Dashboard</span></h1>
            <p className="dashboard-subtitle">{user?.department?.name || 'Department'} - Uttarakhand</p>
          </div>
        </div>

        {error && <ErrorMsg message={error} />}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <>
        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Received Today"
            value={metrics.receivedToday}
          />
          <MetricCard
            title="Require Action"
            value={metrics.requireAction}
          />
          <MetricCard
            title="Overdue"
            value={metrics.overdue}
          />
          <MetricCard
            title="Recently Routed"
            value={metrics.recentlyRouted}
          />
        </div>

        {/* Documents Overview */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Document Overview</h2>
            <button className="section-action-btn">View All</button>
          </div>
          
          <div className="document-grid">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions-grid">
            <button className="quick-action-card" onClick={() => window.location.href = '/department/users'}>
              <span className="action-label">Manage Users</span>
            </button>
            <button className="quick-action-card" onClick={() => window.location.href = '/department/routing'}>
              <span className="action-label">Routing Rules</span>
            </button>
            <button className="quick-action-card" onClick={() => window.location.href = '/department/settings'}>
              <span className="action-label">Settings</span>
            </button>
            <button className="quick-action-card" onClick={() => window.location.href = '/department/audit'}>
              <span className="action-label">Audit Logs</span>
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentAdminDashboard;
