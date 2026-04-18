import api from './api';
import { aiRecommendations, chartData, courses, dashboardStats, events, internships, notifications } from './mockData';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  async getDashboard(role) {
    await delay(350);

    return {
      stats: dashboardStats[role] ?? dashboardStats.stagiaire,
      notifications,
      charts: chartData,
      spotlightCourses: courses,
      spotlightEvents: events,
      spotlightInternships: internships,
      ai: aiRecommendations,
    };
  },

  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data.map((notification) => ({
        ...notification,
        time: notification.created_at ? new Date(notification.created_at).toLocaleString('fr-FR') : 'Maintenant',
        unread: !notification.read_at,
      }));
    } catch (error) {
      await delay();
      return notifications;
    }
  },

  async markNotificationAsRead(id) {
    await api.post(`/notifications/${id}/read`);
  },

  async approveUser(userId) {
    const response = await api.post(`/users/${userId}/approve`);
    return response.data;
  },
};
