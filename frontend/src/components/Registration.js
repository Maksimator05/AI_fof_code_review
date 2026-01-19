import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useTheme } from '../contexts/ThemeContext';
import API from '../services/api';

function Registration() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Состояние для хранения данных формы регистрации
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Обрабатывает изменение значений полей формы
   * @param {Event} e - событие изменения input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Очищаем ошибку при изменении полей
    if (error) setError('');
  };

  /**
   * Обрабатывает отправку формы регистрации
   * @param {Event} e - событие отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      await API.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // После успешной регистрации перенаправляем на страницу входа
      navigate('/login', {
        state: { message: 'Регистрация успешна! Теперь войдите в систему.' }
      });
    } catch (err) {
      console.error('Registration error:', err);

      if (err.response?.status === 400) {
        if (err.response.data.detail.includes('Username')) {
          setError('Этот логин уже занят');
        } else {
          setError(err.response.data.detail);
        }
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ошибка подключения к серверу. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">
      {/* Используем общий Header компонент для навигации */}
      
      {/* Основной контейнер страницы регистрации */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          
          {/* Блок с брендингом */}
          <div className="text-center">
            {/* Логотип и название приложения */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl font-bold py-4 px-8 rounded-2xl shadow-lg inline-block mb-2">
              CODE CHECKER
            </div>
          </div>

          {/* Форма регистрации */}
          <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors duration-200" onSubmit={handleSubmit}>
            
            {/* Заголовок формы */}
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Регистрация
              </h2>
            </div>

            {/* Поля формы */}
            <div className="space-y-4">
              {/* Сообщение об ошибке */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Поле для логина */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Логин
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Введите логин"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Поле для email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Электронная почта
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Поле для пароля */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Минимум 6 символов"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Поле для подтверждения пароля */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Повторите пароль
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Уведомление о согласии с обработкой данных */}
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              <p>
                При регистрации вы даёте согласие на обработку персональных данных 
                в соответствии с условиями пользовательского соглашения.
              </p>
            </div>

            {/* Блок с кнопками и ссылками */}
            <div className="flex flex-col space-y-3">
              {/* Кнопка регистрации */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              {/* Разделительная линия с текстом "или" */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    или
                  </span>
                </div>
              </div>

              {/* Ссылка на вход для существующих пользователей */}
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Уже есть аккаунт? </span>
                <Link 
                  to="/login" 
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Войти
                </Link>
              </div>
            </div>
          </form>

          {/* Ссылка для возврата на главную страницу */}
          <div className="text-center">
            <Link 
              to="/" 
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 text-sm"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;