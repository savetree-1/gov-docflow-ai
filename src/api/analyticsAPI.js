import api from './backendAPI';

/**
 * Analytics API
 */
export const analyticsAPI = {
  // Get documents over time
  getDocumentsOverTime: async (days = 30) => {
    return api.get(`/analytics/documents-over-time?days=${days}`);
  },

  // Get department performance
  getDepartmentPerformance: async () => {
    return api.get('/analytics/department-performance');
  },

  // Get status distribution
  getStatusDistribution: async () => {
    return api.get('/analytics/status-distribution');
  },

  // Get urgency distribution
  getUrgencyDistribution: async () => {
    return api.get('/analytics/urgency-distribution');
  },

  // Get processing trends
  getProcessingTrends: async (days = 30) => {
    return api.get(`/analytics/processing-trends?days=${days}`);
  },

  // Get user activity
  getUserActivity: async (days = 7) => {
    return api.get(`/analytics/user-activity?days=${days}`);
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    return api.get('/analytics/dashboard-summary');
  }
};
