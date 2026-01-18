import React from 'react';

function LanguageCard({ name, description }) {
  const getLanguageIcon = (langName) => {
    switch(langName.toLowerCase()) {
      case 'python':
        return '🐍';
      case 'js':
        return '🟨';
      default:
        return '💻';
    }
  };

  const getLanguageColor = (langName) => {
    switch(langName.toLowerCase()) {
      case 'python':
        return 'from-blue-500 to-green-500';
      case 'js':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="flex items-center mb-6">
        <div className={`w-16 h-16 bg-gradient-to-r ${getLanguageColor(name)} rounded-2xl flex items-center justify-center text-2xl mr-4`}>
          {getLanguageIcon(name)}
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{name}</h4>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <p className="text-gray-700 leading-relaxed text-justify">
            {description}
          </p>
        </div>
      </div>
      
      <button className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200">
        Проверить {name} код
      </button>
    </div>
  );
}

export default LanguageCard;