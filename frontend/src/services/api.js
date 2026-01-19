// frontend/src/services/api.js
import axios from 'axios';

const API = {
  // Аутентификация
  register: (userData) => axios.post('/register', userData),
  login: (userData) => axios.post('/login', userData),
  logout: () => axios.post('/logout'),
  refreshToken: () => axios.post('/refresh'),
  getCurrentUser: () => axios.get('/users/me'),

  // Работа с сообщениями
  sendMessage: (messageData) => axios.post('/message', messageData),
  uploadFile: (file, conversationId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }
    return axios.post('/load_file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Проверка здоровья
  checkApiHealth: () => axios.get('/health-api'),
  checkMlHealth: () => axios.get('/health-ml')
};

// Интерцептор для автоматического обновления токена
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await API.refreshToken();
        return axios(originalRequest);
      } catch (refreshError) {
        // Редирект на логин если refresh не удался
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;