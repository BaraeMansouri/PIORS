import api from './api';

export const followUpService = {
  async getStudents() {
    const response = await api.get('/learners');
    return response.data;
  },

  async getCourses() {
    const response = await api.get('/courses');
    return response.data;
  },

  async getGrades() {
    const response = await api.get('/grades');
    return response.data;
  },

  async createGrade(payload) {
    const response = await api.post('/grades', payload);
    return response.data;
  },

  async getAbsences() {
    const response = await api.get('/absences');
    return response.data;
  },

  async createAbsence(payload) {
    const response = await api.post('/absences', payload);
    return response.data;
  },

  async getRecommendations(params = {}) {
    const response = await api.get('/recommendations', { params });
    return response.data;
  },

  async createRecommendation(payload) {
    const response = await api.post('/recommendations', payload);
    return response.data;
  },

  async updateRecommendation(id, payload) {
    const response = await api.put(`/recommendations/${id}`, payload);
    return response.data;
  },
};
