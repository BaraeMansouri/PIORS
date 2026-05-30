import api from './api';

export const adminService = {
  async getStudents() {
    const response = await api.get('/students');
    return response.data;
  },

  async getTrainers() {
    const response = await api.get('/formateurs');
    return response.data;
  },

  async approveUser(userId) {
    const response = await api.post(`/users/${userId}/approve`);
    return response.data;
  },

  async getFilieres() {
    const response = await api.get('/filieres');
    return response.data;
  },

  async createFiliere(payload) {
    const response = await api.post('/filieres', payload);
    return response.data;
  },

  async getClasses() {
    const response = await api.get('/classes');
    return response.data;
  },

  async createClass(payload) {
    const response = await api.post('/classes', payload);
    return response.data;
  },
};
