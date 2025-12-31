/**
 * Routing Configuration Page
 * Configure auto-routing rules for documents
 * Access: Super Admin and Department Admin
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import { routingAPI, userAPI, departmentAPI } from '../../api/backendAPI';
import { SuccessMsg, ErrorMsg } from '../../components/alerts';
import ConfirmDialog from '../../components/ConfirmDialog';
import './RoutingConfiguration.css';

const RoutingConfiguration = () => {
  const user = useSelector((state) => state.authReducer.user.data);
  const role = user?.role || 'SUPER_ADMIN';

  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    category: 'any',
    urgency: 'any',
    keywords: '',
    assignTo: '',
    priority: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesRes, usersRes, deptsRes] = await Promise.all([
        routingAPI.getAll(),
        userAPI.getAll({ limit: 100 }),
        departmentAPI.getAll({ isActive: true })
      ]);

      if (rulesRes.data.success) setRules(rulesRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (deptsRes.data.success) setDepartments(deptsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      department: user?.department || '',
      category: 'any',
      urgency: 'any',
      keywords: '',
      assignTo: '',
      priority: 0
    });
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      department: rule.department?._id || '',
      category: rule.conditions?.category || 'any',
      urgency: rule.conditions?.urgency || 'any',
      keywords: rule.conditions?.keywords?.join(', ') || '',
      assignTo: rule.assignTo?._id || '',
      priority: rule.priority || 0
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        department: formData.department,
        conditions: {
          category: formData.category,
          urgency: formData.urgency,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : []
        },
        assignTo: formData.assignTo,
        priority: parseInt(formData.priority)
      };

      if (editingRule) {
        const response = await routingAPI.update(editingRule._id, payload);
        if (response.data.success) {
          setSuccess('Routing rule updated successfully');
          setShowModal(false);
          fetchData();
        }
      } else {
        const response = await routingAPI.create(payload);
        if (response.data.success) {
          setSuccess('Routing rule created successfully');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save routing rule');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Routing Rule',
      message: 'Are you sure you want to delete this routing rule? This action cannot be undone.',
      icon: '🗑️',
      confirmStyle: 'danger',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await routingAPI.delete(ruleId);
          if (response.data.success) {
            setSuccess('Routing rule deleted successfully');
            fetchData();
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete routing rule');
        }
      }
    });
  };

  const handleTest = async () => {
    if (!formData.department || !formData.category || !formData.urgency) {
      setError('Please fill in department, category, and urgency to test');
      return;
    }

    try {
      const response = await routingAPI.test({
        department: formData.department,
        category: formData.category === 'any' ? 'finance' : formData.category,
        urgency: formData.urgency === 'any' ? 'Medium' : formData.urgency
      });

      if (response.data.success) {
        setTestResult(response.data.data);
        if (response.data.data) {
          setSuccess('Matching rule found! See preview below.');
        } else {
          setSuccess('No matching rule found. This document would remain unassigned.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to test routing');
    }
  };

  const categories = [
    { value: 'any', label: 'Any Category' },
    { value: 'finance', label: 'Finance & Budget' },
    { value: 'land', label: 'Land Records' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'policy', label: 'Policy & Guidelines' },
    { value: 'legal', label: 'Legal & Compliance' },
    { value: 'other', label: 'Other' }
  ];

  const urgencyLevels = [
    { value: 'any', label: 'Any Urgency' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Routing <span className="dashboard-highlight">Configuration</span></h1>
            <p className="dashboard-subtitle">Configure auto-routing rules for documents</p>
          </div>
          <button onClick={handleCreate} className="btn-primary">
            + Add Routing Rule
          </button>
        </div>

        {success && <SuccessMsg message={success} />}
        {error && <ErrorMsg message={error} />}

        {/* Rules Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Active Routing Rules</h2>
            <span className="section-count">{rules.length} rules</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Name</th>
                <th>Department</th>
                <th>Conditions</th>
                <th>Assign To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No routing rules found. Create one to get started.</td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule._id}>
                    <td>
                      <span className="priority-badge">{rule.priority}</span>
                    </td>
                    <td><strong>{rule.name}</strong></td>
                    <td>{rule.department?.name || '-'}</td>
                    <td>
                      <div className="conditions-list">
                        <span className="condition-tag">Cat: {rule.conditions?.category}</span>
                        <span className="condition-tag">Urg: {rule.conditions?.urgency}</span>
                        {rule.conditions?.keywords?.length > 0 && (
                          <span className="condition-tag">+{rule.conditions.keywords.length} keywords</span>
                        )}
                      </div>
                    </td>
                    <td>{rule.assignTo?.firstName} {rule.assignTo?.lastName}</td>
                    <td>
                      {rule.isActive ? (
                        <span className="status-badge approved">Active</span>
                      ) : (
                        <span className="status-badge rejected">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="btn-icon"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(rule._id)}
                          className="btn-icon"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingRule ? 'Edit Routing Rule' : 'Add New Routing Rule'}</h2>
                <button onClick={() => setShowModal(false)} className="btn-close">×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., High Priority Finance Documents"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-select"
                      required
                      disabled={role === 'DEPARTMENT_ADMIN'}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority *</label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-input"
                      min="0"
                      required
                    />
                    <small>Higher priority rules are matched first</small>
                  </div>
                </div>

                <div className="section-divider">Matching Conditions</div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="form-select"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="form-select"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Keywords (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="form-input"
                    placeholder="e.g., budget, allocation, emergency"
                  />
                  <small>Documents containing these keywords will match this rule</small>
                </div>

                <div className="section-divider">Assignment</div>

                <div className="form-group">
                  <label>Assign To *</label>
                  <select
                    value={formData.assignTo}
                    onChange={(e) => setFormData({ ...formData, assignTo: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select User</option>
                    {users
                      .filter(u => u.department?._id === formData.department || !formData.department)
                      .map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.role})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Test Routing */}
                <div className="test-section">
                  <button type="button" onClick={handleTest} className="btn-secondary">
                    🧪 Test This Rule
                  </button>
                  {testResult && (
                    <div className="test-result">
                      <strong>Test Result:</strong>
                      <p>Would assign to: {testResult.assignTo?.firstName} {testResult.assignTo?.lastName}</p>
                      <p>Rule: {testResult.name} (Priority: {testResult.priority})</p>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmStyle={confirmDialog.confirmStyle}
          icon={confirmDialog.icon}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
};

export default RoutingConfiguration;
