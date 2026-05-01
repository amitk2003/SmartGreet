import axios from 'axios';

// Create a base axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('claasplus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 globally (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('claasplus_token');
      localStorage.removeItem('claasplus_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
