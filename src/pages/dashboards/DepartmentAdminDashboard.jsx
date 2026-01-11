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
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../dashboards/SuperAdminDashboard.css';
import OfficerChat from "../../components/chat/OfficerChat";

const DepartmentAdminDashboard = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const [timeRange, setTimeRange] = useState(30);
  const [metrics, setMetrics] = useState({
    receivedToday: 0,
    requireAction: 0,
    overdue: 0,
    recentlyRouted: 0
  });

  const [documents, setDocuments] = useState([]);
  const [documentsOverTime, setDocumentsOverTime] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [processingTrends, setProcessingTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const departmentId = user?.department?._id || user?.department;
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

      // Fetch analytics data filtered by department
      const [docsOverTimeRes, statusDistRes, processingTrendsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/documents-over-time?days=${timeRange}&department=${departmentId}`, config),
        fetch(`${API_BASE_URL}/analytics/status-distribution?department=${departmentId}`, config),
        fetch(`${API_BASE_URL}/analytics/processing-trends?days=${timeRange}&department=${departmentId}`, config)
      ]);

      const [docsOverTime, statusDist, processingTrends] = await Promise.all([
        docsOverTimeRes.json(),
        statusDistRes.json(),
        processingTrendsRes.json()
      ]);

      if (docsOverTime.success) {
        setDocumentsOverTime(docsOverTime.data || []);
      }

      if (statusDist.success) {
        setStatusDistribution(statusDist.data || []);
      }

      if (processingTrends.success) {
        setProcessingTrends(processingTrends.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

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
            <h1>
              Department Admin{" "}
              <span className="dashboard-highlight">Dashboard</span>
            </h1>
            <p className="dashboard-subtitle">
              {user?.department?.name || "Department"} - Uttarakhand
            </p>
          </div>
          <div className="time-range-selector">
            <button
              className={timeRange === 7 ? "active" : ""}
              onClick={() => setTimeRange(7)}
            >
              7 Days
            </button>
            <button
              className={timeRange === 30 ? "active" : ""}
              onClick={() => setTimeRange(30)}
            >
              30 Days
            </button>
            <button
              className={timeRange === 90 ? "active" : ""}
              onClick={() => setTimeRange(90)}
            >
              90 Days
            </button>
          </div>
        </div>

        {error && <ErrorMsg message={error} />}

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
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
              <MetricCard title="Overdue" value={metrics.overdue} />
              <MetricCard
                title="Recently Routed"
                value={metrics.recentlyRouted}
              />
            </div>
            {/* Analytics Section */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Department Analytics</h2>
              </div>

              <div className="analytics-grid">
                {/* Documents Over Time */}
                <div className="chart-card" style={{ position: "relative" }}>
                  <h3>Documents Over Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={
                        documentsOverTime.length > 0
                          ? documentsOverTime
                          : [{ date: "", count: 0 }]
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#0088FE"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Documents"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  {documentsOverTime.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#999",
                        fontSize: "14px",
                        fontWeight: "500",
                        pointerEvents: "none",
                      }}
                    >
                      No data available
                    </div>
                  )}
                </div>

                {/* Status Distribution */}
                <div className="chart-card" style={{ position: "relative" }}>
                  <h3>Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={
                          statusDistribution.length > 0
                            ? statusDistribution
                            : [{ status: "No Data", count: 1 }]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={statusDistribution.length > 0}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statusDistribution.length > 0 ? (
                          statusDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"][
                                  index % 4
                                ]
                              }
                            />
                          ))
                        ) : (
                          <Cell key="empty" fill="#e0e0e0" />
                        )}
                      </Pie>
                      <Tooltip />
                      {statusDistribution.length > 0 && <Legend />}
                    </PieChart>
                  </ResponsiveContainer>
                  {statusDistribution.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#999",
                        fontSize: "14px",
                        fontWeight: "500",
                        pointerEvents: "none",
                      }}
                    >
                      No data available
                    </div>
                  )}
                </div>

                {/* Processing Time Trends */}
                <div
                  className="chart-card"
                  style={{ position: "relative", gridColumn: "span 2" }}
                >
                  <h3>Average Processing Time (Hours)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={
                        processingTrends.length > 0
                          ? processingTrends
                          : [{ date: "", avgHours: 0 }]
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis
                        stroke="#666"
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgHours"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Avg. Hours"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  {processingTrends.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#999",
                        fontSize: "14px",
                        fontWeight: "500",
                        pointerEvents: "none",
                      }}
                    >
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>
            // Example Layout
            <div className="row">
              {/* Left Side: Your Charts/Stats (Width 8) */}
              <div className="col-xl-8 col-lg-7">
                {/* ... existing chart code ... */}
              </div>

            </div>
            {/* Documents Overview */}
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Document Overview</h2>
                <button className="section-action-btn">View All</button>
              </div>

              <div className="document-grid">
                {documents.map((doc) => (
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
                <button
                  className="quick-action-card"
                  onClick={() => (window.location.href = "/department/users")}
                >
                  <span className="action-label">Manage Users</span>
                </button>
                <button
                  className="quick-action-card"
                  onClick={() => (window.location.href = "/department/routing")}
                >
                  <span className="action-label">Routing Rules</span>
                </button>
                <button
                  className="quick-action-card"
                  onClick={() =>
                    (window.location.href = "/department/settings")
                  }
                >
                  <span className="action-label">Settings</span>
                </button>
                <button
                  className="quick-action-card"
                  onClick={() => (window.location.href = "/department/audit")}
                >
                  <span className="action-label">Audit Logs</span>
                </button>
              </div>
            </div>
          </>
        )}
        <div className="col-xl-4 col-lg-5">
          {/* Sticky container to keep chat visible while scrolling */}
          <div style={{ position: "sticky", top: "20px", zIndex: 99 }}>
            <OfficerChat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAdminDashboard;
