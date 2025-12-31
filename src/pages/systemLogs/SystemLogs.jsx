/**
 * System Logs Page
 * Government Standard Design - Uttarakhand Government Portal
 * View system activity logs and audit trails
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { auditAPI } from '../../api/backendAPI';
import { ErrorMsg } from '../../components/alerts';
import auditIcon from '../../img/audit.png';
import '../dashboards/SuperAdminDashboard.css';

const SystemLogs = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'SUPER_ADMIN';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, document, user, department, system
  const [dateRange, setDateRange] = useState('today'); // today, week, month, all

  // Check if user has access to audit logs
  const hasAccess = role === 'SUPER_ADMIN' || role === 'AUDITOR';

  useEffect(() => {
    if (hasAccess) {
      fetchLogs();
    } else {
      setError('You do not have permission to view system logs. This feature is restricted to Super Admins and Auditors only.');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange, hasAccess]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Filter by action type
      if (filter !== 'all') {
        params.action = filter;
      }

      // Filter by date range
      const now = new Date();
      if (dateRange === 'today') {
        params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      } else if (dateRange === 'week') {
        params.startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      } else if (dateRange === 'month') {
        params.startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      }

      const response = await auditAPI.getAll(params);
      
      if (response.data.success) {
        setLogs(response.data.data.map(log => ({
          id: log._id,
          timestamp: new Date(log.timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          user: log.user?.name || 'System',
          role: log.user?.role || 'SYSTEM',
          action: log.action,
          resource: log.resource,
          details: log.details,
          ipAddress: log.ipAddress || 'N/A',
          status: log.status || 'success'
        })));
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
      setError(err.response?.data?.message || 'Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('create') || actionLower.includes('upload')) return { bg: '#d4edda', color: '#155724' };
    if (actionLower.includes('update') || actionLower.includes('edit')) return { bg: '#d1ecf1', color: '#0c5460' };
    if (actionLower.includes('delete') || actionLower.includes('reject')) return { bg: '#f8d7da', color: '#721c24' };
    if (actionLower.includes('approve')) return { bg: '#d4edda', color: '#155724' };
    if (actionLower.includes('login') || actionLower.includes('logout')) return { bg: '#e7f3ff', color: '#004085' };
    return { bg: '#e9ecef', color: '#495057' };
  };

  const filteredLogs = logs;

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>System <span className="dashboard-highlight">Logs</span></h1>
            <p className="dashboard-subtitle">
              Monitor all system activities and audit trails
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ padding: '0 40px', marginTop: '20px' }}>
            <ErrorMsg message={error} onDismiss={() => setError('')} />
          </div>
        )}

        {/* Filters - Only show if user has access */}
        {hasAccess && (
        <div style={{ 
          background: '#ffffff',
          borderBottom: '2px solid #f0f0f0',
          padding: '16px 40px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Action Filter */}
            <div style={{ display: 'flex', gap: '0' }}>
              {['all', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderBottom: filter === f ? '3px solid #0f5e59' : '3px solid transparent',
                    background: 'transparent',
                    color: filter === f ? '#0f5e59' : '#666666',
                    fontSize: '13px',
                    fontWeight: filter === f ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {f === 'all' ? 'All Actions' : f}
                </button>
              ))}
            </div>

            {/* Date Range Filter */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#666666', fontWeight: '500', marginRight: '8px' }}>
                TIME RANGE:
              </span>
              {['today', 'week', 'month', 'all'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    padding: '8px 16px',
                    border: dateRange === range ? '1px solid #0f5e59' : '1px solid #d0d0d0',
                    background: dateRange === range ? '#0f5e59' : '#ffffff',
                    color: dateRange === range ? '#ffffff' : '#666666',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}
                >
                  {range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Main Content - Only show if user has access */}
        {hasAccess && (
        <div style={{ padding: '32px 40px' }}>
          {/* Logs Table */}
          <div style={{ 
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f0f0f0',
                  borderTop: '4px solid #0f5e59',
                  borderRadius: '50%',
                  margin: '0 auto 16px auto',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#666666', fontSize: '14px' }}>Loading system logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <img 
                  src={auditIcon} 
                  alt="No logs" 
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    opacity: 0.5, 
                    marginBottom: '16px',
                    display: 'block',
                    margin: '0 auto 16px auto'
                  }}
                />
                <h3 style={{ fontSize: '18px', color: '#333333', margin: '0 0 8px 0' }}>
                  No Logs Found
                </h3>
                <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
                  No system activity logs found for the selected filters.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{ 
                      background: '#0f5e59',
                      color: '#ffffff'
                    }}>
                      <th style={tableHeaderStyle}>TIMESTAMP</th>
                      <th style={tableHeaderStyle}>USER</th>
                      <th style={tableHeaderStyle}>ROLE</th>
                      <th style={tableHeaderStyle}>ACTION</th>
                      <th style={tableHeaderStyle}>RESOURCE</th>
                      <th style={tableHeaderStyle}>DETAILS</th>
                      <th style={tableHeaderStyle}>IP ADDRESS</th>
                      <th style={tableHeaderStyle}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => {
                      const actionColors = getActionBadgeColor(log.action);
                      return (
                        <tr 
                          key={log.id}
                          style={{
                            background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafafa'}
                        >
                          <td style={{...tableCellStyle, fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'nowrap'}}>
                            {log.timestamp}
                          </td>
                          <td style={tableCellStyle}>
                            <strong>{log.user}</strong>
                          </td>
                          <td style={{...tableCellStyle, fontSize: '12px'}}>
                            <span style={{
                              padding: '3px 8px',
                              background: '#e9ecef',
                              color: '#495057',
                              borderRadius: '3px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {log.role}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '3px',
                              fontSize: '12px',
                              fontWeight: '500',
                              background: actionColors.bg,
                              color: actionColors.color
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{log.resource}</td>
                          <td style={{...tableCellStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                            {log.details || '-'}
                          </td>
                          <td style={{...tableCellStyle, fontFamily: 'monospace', fontSize: '12px'}}>
                            {log.ipAddress}
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: log.status === 'success' ? '#28a745' : '#dc3545',
                              marginRight: '6px'
                            }}></span>
                            {log.status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {!loading && filteredLogs.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px', 
              marginTop: '24px' 
            }}>
              <div style={metricCardStyle}>
                <div style={{ ...metricValueStyle, color: '#0f5e59' }}>
                  {filteredLogs.length}
                </div>
                <div style={metricLabelStyle}>Total Events</div>
              </div>
              <div style={metricCardStyle}>
                <div style={{ ...metricValueStyle, color: '#28a745' }}>
                  {filteredLogs.filter(l => l.status === 'success').length}
                </div>
                <div style={metricLabelStyle}>Successful</div>
              </div>
              <div style={metricCardStyle}>
                <div style={{ ...metricValueStyle, color: '#dc3545' }}>
                  {filteredLogs.filter(l => l.status === 'failed').length}
                </div>
                <div style={metricLabelStyle}>Failed</div>
              </div>
              <div style={metricCardStyle}>
                <div style={{ ...metricValueStyle, color: '#6c757d' }}>
                  {new Set(filteredLogs.map(l => l.user)).size}
                </div>
                <div style={metricLabelStyle}>Unique Users</div>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Styling Constants
const tableHeaderStyle = {
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  borderBottom: '2px solid #0a4a45'
};

const tableCellStyle = {
  padding: '12px 14px',
  color: '#333333',
  verticalAlign: 'middle',
  fontSize: '13px'
};

const metricCardStyle = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center'
};

const metricValueStyle = {
  fontSize: '32px',
  fontWeight: '700',
  marginBottom: '6px',
  lineHeight: '1'
};

const metricLabelStyle = {
  fontSize: '12px',
  color: '#666666',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

export default SystemLogs;
