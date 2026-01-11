/**
 * Department Management Page
 * Government Standard Design - Uttarakhand Government Portal
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { departmentAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import documentsIcon from '../../img/Documents.png';
import '../dashboards/SuperAdminDashboard.css';

const DepartmentManagement = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'SUPER_ADMIN';

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const params = { status: 'Approved' };
      
      if (filter === 'active') params.isActive = 'true';
      if (filter === 'inactive') params.isActive = 'false';

      const response = await departmentAPI.getAll(params);
      
      if (response.data.success) {
        setDepartments(response.data.data.map(dept => ({
          id: dept._id,
          name: dept.name,
          code: dept.code,
          nodalOfficer: dept.nodalOfficer?.name || 'N/A',
          email: dept.nodalOfficer?.email || 'N/A',
          phone: dept.nodalOfficer?.phone || 'N/A',
          isActive: dept.isActive !== false,
          status: dept.isActive !== false ? 'Active' : 'Inactive',
          approvedOn: dept.approvedAt ? new Date(dept.approvedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : (dept.createdAt ? new Date(dept.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'N/A')
        })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!confirmAction) {
      setConfirmAction({ id, currentStatus });
      return;
    }

    try {
      const newStatus = currentStatus === 'Active' ? false : true;
      const response = await departmentAPI.update(id, { isActive: newStatus });
      
      if (response.data.success) {
        setSuccess(`Department ${newStatus ? 'activated' : 'deactivated'} successfully`);
        setConfirmAction(null);
        fetchDepartments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department status');
      setConfirmAction(null);
    }
  };

  const filteredDepartments = departments.filter(dept => {
    if (filter === 'active') return dept.isActive;
    if (filter === 'inactive') return !dept.isActive;
    return true;
  });

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Department <span className="dashboard-highlight">Management</span></h1>
            <p className="dashboard-subtitle">
              View and manage all approved government departments
            </p>
          </div>
        </div>

        {/* Summary Metrics - At Top */}
        {!loading && departments.length > 0 && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px', 
            margin: '24px 0',
            padding: '0 40px'
          }}>
            <div style={metricCardStyle}>
              <div style={{ ...metricValueStyle, color: '#0f5e59' }}>
                {departments.length}
              </div>
              <div style={metricLabelStyle}>{t('totalDepartments')}</div>
            </div>
            <div style={metricCardStyle}>
              <div style={{ ...metricValueStyle, color: '#28a745' }}>
                {departments.filter(d => d.isActive).length}
              </div>
              <div style={metricLabelStyle}>{t('activeDepartments')}</div>
            </div>
            <div style={metricCardStyle}>
              <div style={{ ...metricValueStyle, color: '#6c757d' }}>
                {departments.filter(d => !d.isActive).length}
              </div>
              <div style={metricLabelStyle}>{t('inactiveDepartments')}</div>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div style={{ padding: '0 40px' }}>
          {success && <SuccessMsg message={success} onDismiss={() => setSuccess('')} />}
          {error && <ErrorMsg message={error} onDismiss={() => setError('')} />}
        </div>

        {/* Filter Tabs */}
        <div style={{ 
          background: '#ffffff',
          borderBottom: '2px solid #f0f0f0',
          padding: '0 40px'
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderBottom: filter === 'all' ? '3px solid #0f5e59' : '3px solid transparent',
                background: 'transparent',
                color: filter === 'all' ? '#0f5e59' : '#666666',
                fontSize: '14px',
                fontWeight: filter === 'all' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              All Departments
            </button>
            <button
              onClick={() => setFilter('active')}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderBottom: filter === 'active' ? '3px solid #0f5e59' : '3px solid transparent',
                background: 'transparent',
                color: filter === 'active' ? '#0f5e59' : '#666666',
                fontSize: '14px',
                fontWeight: filter === 'active' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              style={{
                padding: '14px 28px',
                border: 'none',
                borderBottom: filter === 'inactive' ? '3px solid #0f5e59' : '3px solid transparent',
                background: 'transparent',
                color: filter === 'inactive' ? '#0f5e59' : '#666666',
                fontSize: '14px',
                fontWeight: filter === 'inactive' ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '32px 40px' }}>
          {/* Department Table */}
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
                <p style={{ color: '#666666', fontSize: '14px' }}>{t('loadingDepartments')}</p>
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <img 
                  src={documentsIcon} 
                  alt="No departments" 
                  style={{ width: '64px', height: '64px', opacity: 0.5, marginBottom: '16px' }}
                />
                <h3 style={{ fontSize: '18px', color: '#333333', margin: '0 0 8px 0' }}>
                  {t('noDepartmentsFound')}
                </h3>
                <p style={{ fontSize: '14px', color: '#666666', margin: '0' }}>
                  {filter === 'all' 
                    ? t('noApprovedDepartments')
                    : t('noFilteredDepartments', { filter: t(filter) })}
                </p>
              </div>
            ) : (
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ 
                    background: '#0f5e59',
                    color: '#ffffff'
                  }}>
                    <th style={tableHeaderStyle}>DEPARTMENT NAME</th>
                    <th style={tableHeaderStyle}>CODE</th>
                    <th style={tableHeaderStyle}>NODAL OFFICER</th>
                    <th style={tableHeaderStyle}>OFFICIAL EMAIL</th>
                    <th style={tableHeaderStyle}>PHONE</th>
                    <th style={tableHeaderStyle}>STATUS</th>
                    <th style={tableHeaderStyle}>APPROVED ON</th>
                    <th style={tableHeaderStyle}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((dept, index) => (
                    <tr 
                      key={dept.id}
                      style={{
                        background: index % 2 === 0 ? '#ffffff' : '#fafafa',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#ffffff' : '#fafafa'}
                    >
                      <td style={tableCellStyle}>
                        <strong>{dept.name}</strong>
                      </td>
                      <td style={{...tableCellStyle, fontFamily: 'monospace', fontSize: '13px'}}>
                        {dept.code}
                      </td>
                      <td style={tableCellStyle}>{dept.nodalOfficer}</td>
                      <td style={tableCellStyle}>{dept.email}</td>
                      <td style={tableCellStyle}>{dept.phone}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: dept.isActive ? '#d4edda' : '#e9ecef',
                          color: dept.isActive ? '#155724' : '#6c757d'
                        }}>
                          {dept.status}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{dept.approvedOn}</td>
                      <td style={tableCellStyle}>
                        {confirmAction?.id === dept.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Confirm?</span>
                            <button
                              onClick={() => handleToggleStatus(dept.id, dept.status)}
                              style={{
                                padding: '5px 12px',
                                fontSize: '13px',
                                border: '1px solid #28a745',
                                background: '#28a745',
                                color: '#ffffff',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmAction(null)}
                              style={{
                                padding: '5px 12px',
                                fontSize: '13px',
                                border: '1px solid #6c757d',
                                background: '#ffffff',
                                color: '#6c757d',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(dept.id, dept.status)}
                            style={{
                              padding: '6px 16px',
                              fontSize: '13px',
                              border: dept.isActive ? '1px solid #dc3545' : '1px solid #28a745',
                              background: '#ffffff',
                              color: dept.isActive ? '#dc3545' : '#28a745',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = dept.isActive ? '#dc3545' : '#28a745';
                              e.target.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#ffffff';
                              e.target.style.color = dept.isActive ? '#dc3545' : '#28a745';
                            }}
                          >
                            {dept.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary Metrics - Below Table - REMOVED, NOW AT TOP */}
        </div>
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
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  borderBottom: '2px solid #0a4a45'
};

const tableCellStyle = {
  padding: '14px 16px',
  color: '#333333',
  verticalAlign: 'middle'
};

const metricCardStyle = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  padding: '28px 24px',
  textAlign: 'center'
};

const metricValueStyle = {
  fontSize: '42px',
  fontWeight: '700',
  marginBottom: '8px',
  lineHeight: '1'
};

const metricLabelStyle = {
  fontSize: '13px',
  color: '#666666',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

export default DepartmentManagement;
