import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="flex justify-between items-center py-6 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">CC</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Code Checker</h1>
          <p className="text-gray-600 text-sm">Static Code Analysis Tool</p>
        </div>
      </div>
      
      <nav className="flex space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Главная
        </Link>
        <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Анализ
        </button>
        <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          История
        </button>
        <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Настройки
        </button>
      </nav>
      
       <div className="flex items-center space-x-4">
        <Link 
          to="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Войти
        </Link>
      </div>
    </header>
  );
}

export default Header;