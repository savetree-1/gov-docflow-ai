import api from './backendAPI';

/****** Analytics API ******/
export const analyticsAPI = {
  /****** Taking documents over time ******/
  getDocumentsOverTime: async (days = 30) => {
    return api.get(`/analytics/documents-over-time?days=${days}`);
  },

  /****** Taking department performance ******/
  getDepartmentPerformance: async () => {
    return api.get('/analytics/department-performance');
  },

  /****** Taking status distribution ******/
  getStatusDistribution: async () => {
    return api.get('/analytics/status-distribution');
  },

  /****** Taking urgency distribution ******/
  getUrgencyDistribution: async () => {
    return api.get('/analytics/urgency-distribution');
  },

  /****** Taking processing trends ******/
  getProcessingTrends: async (days = 30) => {
    return api.get(`/analytics/processing-trends?days=${days}`);
  },

  /****** Taking user activity ******/
  getUserActivity: async (days = 7) => {
    return api.get(`/analytics/user-activity?days=${days}`);
  },

  /****** Taking dashboard summary ******/
  getDashboardSummary: async () => {
    return api.get('/analytics/dashboard-summary');
  }
};
