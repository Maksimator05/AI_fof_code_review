import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { login } from '../api';

function Login() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({
        email: formData.email,
        password: formData.password
      });

      console.log('Успешный вход!');
      navigate('/chat');

    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.message || 'Не удалось войти. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">

          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl font-bold py-4 px-8 rounded-2xl shadow-lg inline-block mb-2">
              CODE CHECKER
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Вход
            </h2>
          </div>

          <form className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg transition-colors duration-200" onSubmit={handleSubmit}>

            {/* Показать ошибку */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                Забыли пароль?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Нет аккаунта? </span>
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Зарегистрироваться
                </Link>
              </div>
            </div>
          </form>

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

export default Login;