import api from './api';

export const orientationService = {
  async getTests() {
    const response = await api.get('/orientation/tests');
    return response.data;
  },

  async getResults(params = {}) {
    const response = await api.get('/orientation/results', { params });
    return response.data;
  },

  async getResources() {
    const response = await api.get('/orientation/resources');
    return response.data;
  },

  async submitTest(testId, payload) {
    const response = await api.post(`/orientation/tests/${testId}/submit`, payload);
    return response.data;
  },

  async createTest(payload) {
    const response = await api.post('/orientation/tests', payload);
    return response.data;
  },

  async updateTest(testId, payload) {
    const response = await api.put(`/orientation/tests/${testId}`, payload);
    return response.data;
  },

  async deleteTest(testId) {
    await api.delete(`/orientation/tests/${testId}`);
  },

  async addQuestion(testId, payload) {
    const response = await api.post(`/orientation/tests/${testId}/questions`, payload);
    return response.data;
  },

  async updateQuestion(questionId, payload) {
    const response = await api.put(`/orientation/questions/${questionId}`, payload);
    return response.data;
  },

  async deleteQuestion(questionId) {
    await api.delete(`/orientation/questions/${questionId}`);
  },
};
