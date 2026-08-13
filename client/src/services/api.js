import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });
export const googleLoginAuth = (idToken) => api.post('/auth/google', { idToken });

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  return api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const runAnalysis = (resumeText, jobDescription, provider = 'ollama', model = 'mistral', resumeName = '', jobTitle = '') => api.post('/analysis/run', { resumeText, jobDescription, provider, model, resumeName, jobTitle });
export const getAnalysis = (id) => api.get(`/analysis/${id}`);
export const getHistory = () => api.get('/analysis/history');

export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePassword = (data) => api.put('/auth/password', data);
export const deleteAllAnalyses = () => api.delete('/analysis/all');

export default api;
