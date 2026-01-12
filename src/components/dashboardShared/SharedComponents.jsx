/******
    Reusable Dashboard Components
******/

import React from 'react';
import './SharedComponents.css';

/****** Status Badge Component ******/
export const StatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'action_required': return 'status-action';
      case 'for_information': return 'status-info';
      case 'completed': return 'status-completed';
      case 'overdue': return 'status-overdue';
      default: return 'status-default';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

/****** Metric Card Component - Government Standard ******/
export const MetricCard = ({ title, value, trend }) => {
  return (
    <div className="metric-card">
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <p className="metric-value">{value}</p>
        {trend && <span className="metric-trend">{trend}</span>}
      </div>
    </div>
  );
};

/****** Document Card Component ******/
export const DocumentCard = ({ document, onClick }) => {
  return (
    <div className="document-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="document-header">
        <h4 className="document-title">{document.title}</h4>
        <StatusBadge status={document.status} />
      </div>
      <div className="document-meta">
        <span className="document-category">{document.category}</span>
        {document.urgency && (
          <span className={`document-urgency ${document.urgency.toLowerCase()}`}>
            {document.urgency}
          </span>
        )}
      </div>
      {document.summary && (
        <p className="document-summary">{document.summary}</p>
      )}
      <div className="document-footer">
        {document.assignedTo && (
          <span className="document-assigned">Assigned: {document.assignedTo}</span>
        )}
        {document.deadline && (
          <span className="document-deadline">Due: {document.deadline}</span>
        )}
      </div>
    </div>
  );
};

/****** Empty State Component - Apple HIG Standard ******/
export const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  return (
    <div className="empty-state">
      {icon && (
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px', opacity: 0.24 }}>
          <path d="M22 11H55L77 33V71C77 74.3137 74.3137 77 71 77H22C18.6863 77 16 74.3137 16 71V17C16 13.6863 18.6863 11 22 11Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M55 11V33H77" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M33 44H60M33 55H60M33 66H49" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )}
      {title && (
        <h3 style={{ 
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif',
          fontSize: '17px', 
          fontWeight: '600',
          color: '#1d1d1f', 
          marginBottom: '8px',
          letterSpacing: '-0.408px',
          WebkitFontSmoothing: 'antialiased'
        }}>
          {title}
        </h3>
      )}
      <p style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
        fontSize: '14px',
        color: '#8e8e93',
        marginBottom: '24px',
        lineHeight: '1.52857',
        letterSpacing: '-0.154px'
      }}>
        {message}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
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
          {actionText}
        </button>
      )}
    </div>
  );
};

/****** Table Component ******/
export const DataTable = ({ columns, data, onAction }) => {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {col.render ? col.render(row, onAction) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
