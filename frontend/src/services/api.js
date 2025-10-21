import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  // ✅ NEW METHODS FOR BULK OPERATIONS
  bulkUpdate: (bulkData) => api.post('/tasks/bulk-update', bulkData),
  generateReport: (filters) => api.post('/tasks/generate-report', filters),
};

// Attachments API
export const attachmentsAPI = {
  getByTask: (taskId) => api.get(`/tasks/${taskId}/attachments`),
  upload: (taskId, file, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: config.onUploadProgress,
    });
  },
  download: (attachmentId) => api.get(`/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  }),
  delete: (attachmentId) => api.delete(`/attachments/${attachmentId}`),
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, comment) => api.post(`/tasks/${taskId}/comments`, { comment }),
  update: (commentId, comment) => api.put(`/comments/${commentId}`, { comment }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
};

// Reports API
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  download: (reportId) => api.get(`/reports/${reportId}/download`, {
    responseType: 'blob',
  }),
  delete: (reportId) => api.delete(`/reports/${reportId}`),
};

export default api;