import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LanguageCard from './components/LanguageCard';
import Registration from './components/Registration';
import Login from './components/Login';
import './App.css';

function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Заголовок */}
        <Header />
        
        {/* Основной контент */}
        <div className="mt-12">
          {/* Приветственный текст */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
              Добро пожаловать!
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
              Lorem ipsum dolor sit amet consectetur. Luctus nisl placecu id magna. Sed pharetra risus sed velit vestibulum mattis massa aliquam pharetra. Diam enim una lectus sapien nisi. Purus gravida eru et vulputate mauris habitant in tincidunt. In turpis sapien faucibus leculis mauris. Amet in mi tellus elit quam dia facilitis sed ac. Ultrties tellus dui diam aliquam.
            </p>
          </div>

          {/* Разделитель */}
          <div className="flex items-center justify-center my-12">
            <div className="h-px bg-gray-300 w-24"></div>
            <h2 className="text-2xl font-bold text-gray-800 mx-6">
              Приступим!
            </h2>
            <div className="h-px bg-gray-300 w-24"></div>
          </div>

          {/* Секция языков программирования */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              CODE CHECKER может проверить код на этих языках
            </h3>
            
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

          {/* Футер с названием приложения */}
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;