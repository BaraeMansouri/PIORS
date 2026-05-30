import api from './api';

export const aiService = {
  async chat(message, history = []) {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },

  async generateRecommendation(studentId) {
    const response = await api.post(`/ai/students/${studentId}/recommendation`);
    return response.data;
  },
};
