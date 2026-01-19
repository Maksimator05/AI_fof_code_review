// Базовый URL API из переменных окружения
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Получить токен из localStorage
export const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Сохранить токен в localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('access_token', token);
};

// Удалить токен из localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
};

// Проверить, авторизован ли пользователь
export const isAuthenticated = () => {
  return !!getAuthToken();
};