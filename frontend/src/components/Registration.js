import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext'; // Добавлен импорт

function Registration() {
  const { theme } = useTheme();
  const { register, error: authError } = useAuth(); // Получаем функцию register из контекста
  
  // Состояние для хранения данных формы регистрации
  const [formData, setFormData] = useState({
    username: '', // Изменено с login на username для соответствия API
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Обрабатывает изменение значений полей формы
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * Валидация email
   */
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  /**
   * Валидация пароля
   */
  const validatePassword = (password) => {
    return password.length >= 6; // Минимум 6 символов
  };

  /**
   * Обрабатывает отправку формы регистрации
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setLocalError('Заполните все поля');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setLocalError('Введите корректный email');
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setLocalError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    setLocalError(null);
    
    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      };
      
      const result = await register(userData);
      
      if (result.success) {
        setSuccess(true);
        // Автоматически очищаем форму
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setLocalError(result.error || 'Ошибка регистрации');
      }
    } catch (error) {
      setLocalError('Произошла непредвиденная ошибка');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Если регистрация успешна, показываем сообщение
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl font-bold py-4 px-8 rounded-2xl shadow-lg inline-block mb-2">
                CODE CHECKER
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Регистрация успешна!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ваш аккаунт успешно создан. Теперь вы можете войти в систему.
              </p>
              
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Войти в систему
                </Link>
                
                <Link 
                  to="/" 
                  className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                >
                  Вернуться на главную
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">
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

          {/* Показать ошибки если есть */}
          {(localError || authError) && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {localError || authError}
            </div>
          )}

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
              {/* Поле для имени пользователя */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                  placeholder="Введите имя пользователя"
                  value={formData.username}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Только латинские буквы, цифры и подчеркивания
                </p>
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
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                  placeholder="Введите пароль (минимум 6 символов)"
                  value={formData.password}
                  onChange={handleChange}
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
                  disabled={loading}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Регистрация...
                  </span>
                ) : 'Зарегистрироваться'}
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