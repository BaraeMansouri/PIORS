import api from './api';

export const authService = {
  async login(values) {
    const response = await api.post('/auth/login', values);
    return { user: response.data.user, token: response.data.token, source: 'api' };
  },

  async register(values) {
    const response = await api.post('/auth/register', values);
    return { user: response.data.user, token: response.data.token, source: 'api' };
  },

  async fetchProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(values) {
    const isFormData = values instanceof FormData;
    const response = isFormData
      ? await api.post('/auth/profile?_method=PATCH', values, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      : await api.patch('/auth/profile', values);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      return true;
    }

    return true;
  },
};
