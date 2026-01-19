// frontend/src/services/api.js
import axios from 'axios';

// Создаем экземпляр axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: true, // Для отправки cookies с refresh token
  headers: {
    'Content-Type': 'application/json',
  }
});

// Утилита для работы с токеном
export const tokenManager = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
};

// Интерцептор для добавления токена к запросам
axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для автоматического обновления токена
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axiosInstance.post('/refresh');
        tokenManager.setToken(data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Очищаем токен и редиректим на логин
        tokenManager.removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const API = {
  // Аутентификация
  register: (userData) => axiosInstance.post('/register', userData),
  login: (userData) => axiosInstance.post('/login', userData),
  logout: () => axiosInstance.post('/logout'),
  refreshToken: () => axiosInstance.post('/refresh'),
  getCurrentUser: () => axiosInstance.get('/users/me'),

  // Работа с сообщениями и чатами
  sendMessage: (messageData) => axiosInstance.post('/message', messageData),
  uploadFile: (file, conversationId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }
    return axiosInstance.post('/load_file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getConversations: () => axiosInstance.get('/conversations'),
  getConversation: (conversationId) => axiosInstance.get(`/conversations/${conversationId}`),
  deleteConversation: (conversationId) => axiosInstance.delete(`/conversations/${conversationId}`),
  updateConversation: (conversationId, data) => axiosInstance.patch(`/conversations/${conversationId}`, data),

  // Работа с настройками пользователя
  getUserSettings: () => axiosInstance.get('/users/me/settings'),
  updateUserSettings: (settingsData) => axiosInstance.patch('/users/me/settings', settingsData),
  updateUserProfile: (profileData) => axiosInstance.patch('/users/me', profileData),

  // Проверка здоровья
  checkApiHealth: () => axiosInstance.get('/health-api'),
  checkMlHealth: () => axiosInstance.get('/health-ml')
};

export default API;