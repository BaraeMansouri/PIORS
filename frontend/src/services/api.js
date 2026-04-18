import axios from 'axios';

const resolvedBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 60000,
  timeoutErrorMessage: "Le serveur met trop de temps a repondre. Verifiez que Laravel est bien lance.",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('piors_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers.Accept = 'application/json';
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('piors_token');
      localStorage.removeItem('piors_user');
      window.dispatchEvent(new CustomEvent('piors:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export default api;
