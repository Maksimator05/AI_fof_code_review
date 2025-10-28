import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from './Header';

function Settings() {
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    login: '12345678',
    email: '323423@mail.ru',
    password: '********',
    languages: {
      python: true,
      javascript: true,
      java: false,
      html: false,
      css: false,
      sql: false
    }
  });

  const [isEditing, setIsEditing] = useState({
    login: false,
    email: false,
    password: false
  });

  const [tempValues, setTempValues] = useState({
    login: '',
    email: '',
    password: ''
  });

  // Функция для начала редактирования поля
  const startEditing = (field) => {
    setIsEditing({
      ...isEditing,
      [field]: true
    });
    setTempValues({
      ...tempValues,
      [field]: settings[field] === '********' ? '' : settings[field]
    });
  };

  // Функция для сохранения изменений
  const saveField = (field) => {
    if (tempValues[field].trim()) {
      setSettings({
        ...settings,
        [field]: tempValues[field]
      });
    }
    setIsEditing({
      ...isEditing,
      [field]: false
    });
  };

  // Функция для отмены редактирования
  const cancelEditing = (field) => {
    setIsEditing({
      ...isEditing,
      [field]: false
    });
  };

  // Функция для изменения темы
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  // Функция для изменения выбора языка
  const handleLanguageChange = (language) => {
    setSettings({
      ...settings,
      languages: {
        ...settings.languages,
        [language]: !settings.languages[language]
      }
    });
  };

  // Функция для сохранения всех настроек
  const handleSaveSettings = () => {
    console.log('Настройки сохранены:', { ...settings, theme });
    alert('Настройки успешно сохранены!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* Заголовок */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Настройки</h1>

          <div className="space-y-8">
            {/* Секция логина */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Логин
              </label>
              <div className="flex items-center justify-between">
                {isEditing.login ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="text"
                      value={tempValues.login}
                      onChange={(e) => setTempValues({...tempValues, login: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField('login')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => cancelEditing('login')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-white">{settings.login}</span>
                    <button
                      onClick={() => startEditing('login')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Изменить
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Секция email */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Электронная почта
              </label>
              <div className="flex items-center justify-between">
                {isEditing.email ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="email"
                      value={tempValues.email}
                      onChange={(e) => setTempValues({...tempValues, email: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField('email')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => cancelEditing('email')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-white">{settings.email}</span>
                    <button
                      onClick={() => startEditing('email')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Изменить
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Секция пароля */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Пароль
              </label>
              <div className="flex items-center justify-between">
                {isEditing.password ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="password"
                      value={tempValues.password}
                      onChange={(e) => setTempValues({...tempValues, password: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите новый пароль"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField('password')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => cancelEditing('password')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-white">{settings.password}</span>
                    <button
                      onClick={() => startEditing('password')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Изменить
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Секция темы */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Тема сайта
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  Светлая
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  Темная
                </button>
              </div>
              
              {/* Индикатор текущей темы */}
              <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Текущая тема:</span>
                <span className="font-medium">
                  {theme === 'light' ? 'Светлая' : 'Темная'}
                </span>
                <span className={`w-2 h-2 rounded-full ${theme === 'light' ? 'bg-yellow-400' : 'bg-purple-500'}`}></span>
              </div>
            </div>

            {/* Секция языков программирования */}
            <div className="border-b border-gray-200 dark:border-gray-600 pb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Выберите язык для проверки
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(settings.languages).map(([language, isSelected]) => (
                  <label
                    key={language}
                    className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleLanguageChange(language)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <span className="text-gray-900 dark:text-white capitalize">
                      {language === 'javascript' ? 'JavaScript' :
                       language === 'html' ? 'HTML' :
                       language === 'css' ? 'CSS' :
                       language === 'sql' ? 'SQL' : language}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Кнопка сохранения */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;