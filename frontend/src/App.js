import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LanguageCard from './components/LanguageCard';
import Registration from './components/Registration';
import Login from './components/Login';
import Chat from './components/Chat';
import Settings from './components/Settings';
import './App.css';

/**
 * Компонент главной страницы приложения
 * Отображает приветствие, список поддерживаемых языков и информацию о сервисе
 */
function HomePage() {
  // Данные о поддерживаемых языках программирования
  const languages = [
    {
      name: "Python",
      description: "Lorem ipsum dolor sit amet consectetur. Commodo sagittis turpis orci omare tellus aliquam. In risus eget sempre eu posuere cursus cursus. In eu libero cras duis cras. Felis amet risus diam tristique dui nullum fermentum. Eget risus pulvinar nullum auctor consectetur or eu et. Sed quam mi ultrices consequat aliquam. Egestas amet pharetra pulvinar odio dui."
    },
    {
      name: "JS",
      description: "Lorem ipsum dolor sit amet consectetur. Commodo sagittis turpis orci omare tellus aliquam. In risus eget sempre eu posuere cursus cursus. In eu libero cras duis cras. Felis amet risus diam tristique dui nullum fermentum. Eget risus pulvinar nullum auctor consectetur or et eu et. Sed quam mi ultrices consequat aliquam. Egestas amet pharetra pulvinar odio dui."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Основной контент главной страницы */}
        <div className="mt-12">
          {/* Приветственный заголовок */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Добро пожаловать!
          </h1>
          
          {/* Описание сервиса */}
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
            Lorem ipsum dolor sit amet consectetur. Luctus nisl placecu id magna. Sed pharetra risus sed velit vestibulum mattis massa aliquam pharetra. Diam enim una lectus sapien nisi. Purus gravida eru et vulputate mauris habitant in tincidunt. In turpis sapien faucibus leculis mauris. Amet in mi tellus elit quam dia facilitis sed ac. Ultrties tellus dui diam aliquam.
          </p>

          {/* Разделительная линия с текстом */}
          <div className="flex items-center justify-center my-12">
            <div className="h-px bg-gray-300 dark:bg-gray-600 w-24"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mx-6">
              Приступим!
            </h2>
            <div className="h-px bg-gray-300 dark:bg-gray-600 w-24"></div>
          </div>

          {/* Секция поддерживаемых языков программирования */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              CODE CHECKER может проверить код на этих языках
            </h3>
            
            {/* Сетка карточек языков */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {languages.map((language, index) => (
                <LanguageCard 
                  key={index}
                  name={language.name}
                  description={language.description}
                />
              ))}
            </div>
          </div>

          {/* Брендовый футер с названием приложения */}
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl font-bold py-4 px-8 rounded-2xl shadow-lg">
              CODE CHECKER
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Главный компонент приложения
 * Обеспечивает маршрутизацию, управление темой и общую структуру приложения
 */
function App() {
  return (
    // Провайдер темы для всего приложения
    <ThemeProvider>
      {/* Провайдер аутентификации */}
      <AuthProvider>
        {/* Маршрутизатор для навигации между страницами */}
        <Router>
          {/* Общий layout приложения с поддержкой dark mode */}
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            {/* Общий Header для всех страниц */}
            <Header />
            
            {/* Контейнер маршрутов приложения */}
            <Routes>
              {/* Главная страница */}
              <Route path="/" element={<HomePage />} />
              
              {/* Страница регистрации */}
              <Route path="/register" element={<Registration />} />
              
              {/* Страница входа в систему */}
              <Route path="/login" element={<Login />} />
              
              {/* Страница чата с AI */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              
              {/* Страница настроек приложения */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;