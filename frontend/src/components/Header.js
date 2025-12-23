import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Константы для навигационных элементов
// type: 'link' - ссылка с переходом, 'button' - кнопка без перехода
const NAV_ITEMS = [
  { path: '/', label: 'Главная', type: 'link' },
  { path: '/chat', label: 'Анализ', type: 'link' },
  { label: 'История', type: 'link' },
  { path: '/settings', label:'Настройки', type: 'link' },
];

function Header() {
  // Получаем текущий путь для подсветки активной ссылки
  const location = useLocation();
  // Получаем текущую тему для применения dark mode классов
  const { theme } = useTheme();

  /**
   * Функция для рендеринга навигационного элемента
   * @param {Object} item - объект элемента навигации
   * @param {number} index - индекс элемента в массиве
   * @returns {JSX.Element} - React элемент (ссылка или кнопка)
   */
  const renderNavItem = (item, index) => {
    // Проверяем, является ли ссылка активной (текущий путь совпадает с путем ссылки)
    const isActive = item.type === 'link' && location.pathname === item.path;
    
    // Базовые классы для навигационных элементов с поддержкой dark mode
    const baseClasses = `font-medium transition-colors duration-200 ${
      isActive 
        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1' 
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`;
    
    // Рендерим ссылку если тип 'link'
    if (item.type === 'link') {
      return (
        <Link 
          key={index}
          to={item.path} 
          className={baseClasses}
        >
          {item.label}
        </Link>
      );
    }
    
    // Рендерим кнопку если тип 'button'
    return (
      <button 
        key={index}
        className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200`}
      >
        {item.label}
      </button>
    );
  };

  return (
    // Основной контейнер header с поддержкой dark mode
    <header className="flex justify-between items-center py-4 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
      
      {/* Блок логотипа и названия приложения */}
      <div className="flex items-center space-x-4">
        {/* Логотип - градиентный круг с буквами CC */}
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg">CC</span>
        </div>
        
        {/* Название приложения и описание */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors duration-200">
            Code Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-200">
            Static Code Analysis Tool
          </p>
        </div>
      </div>
      
      {/* Навигационная панель */}
      <nav className="flex space-x-6">
        {NAV_ITEMS.map(renderNavItem)}
      </nav>
      
      {/* Блок с кнопками действий */}
      <div className="flex items-center space-x-4">
        {/* Кнопка входа в систему */}
        <Link 
          to="/login" 
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          Войти
        </Link>
      </div>
    </header>
  );
}

export default Header;