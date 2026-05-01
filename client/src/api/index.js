import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  guestLogin: () => api.post('/auth/guest'),
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  subscribe: () => api.post('/users/subscribe'),
  subscribeSuccess: () => api.post('/users/subscribe-success'),
  deleteAccount: () => api.delete('/users/account'),
};

export const templateAPI = {
  getAll: (category) =>
    api.get('/templates', { params: category && category !== 'all' ? { category } : {} }),
  getById: (id) => api.get(`/templates/${id}`),
};
