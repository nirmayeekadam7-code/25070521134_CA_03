import axios from 'axios';

// All requests go to /api (proxied to Express in development).
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to read a friendly error message from a failed request
export const getError = (error) =>
  error.response?.data?.message || 'Could not reach the server. Is it running?';

export default api;
