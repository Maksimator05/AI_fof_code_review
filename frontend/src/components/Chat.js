import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from './Header';

function Chat() {
  // Получаем текущую тему для применения dark mode классов
  const { theme } = useTheme();
  
  // Состояние для управления чатами и сообщениями
  const [chats, setChats] = useState([
    {
      id: 1,
      title: 'Анализ Python кода',
      description: 'print "Hello, World!"',
      unreadCount: 12,
      messages: [
        {
          id: 1,
          type: 'user',
          content: 'Помоги с кодом\nprint "Hello, World!"',
          timestamp: '12:30'
        },
        {
          id: 2,
          type: 'assistant',
          content: `В вашем коде есть несколько ошибок. Вот правильный вариант:\n\nОценивание направления:\n• Python 3 требует скобок вокруг аргументов функции print\n• Отсутствует пробел между print и кавычкой\n• Кавычки должны быть прямыми, а не фигурными (как в "")`,
          timestamp: '12:31'
        }
      ]
    }
  ]);

  const [activeChat, setActiveChat] = useState(0); // Индекс активного чата
  const [newMessage, setNewMessage] = useState(''); // Текст нового сообщения
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Состояние боковой панели
  const [editingChatId, setEditingChatId] = useState(null); // ID чата в режиме редактирования
  const [editTitle, setEditTitle] = useState(''); // Временное значение для редактирования названия

  /**
   * Генерирует название чата на основе содержания первого сообщения
   * @param {string} message - текст сообщения
   * @returns {string} - сгенерированное название чата
   */
  const generateChatTitle = (message) => {
    const messageText = message.trim();
    
    // Определяем тему чата по ключевым словам в сообщении
    if (messageText.includes('python') || messageText.includes('Python') || messageText.includes('print')) {
      return 'Анализ Python кода';
    } else if (messageText.includes('javascript') || messageText.includes('JavaScript') || messageText.includes('js') || messageText.includes('JS')) {
      return 'Анализ JavaScript кода';
    } else if (messageText.includes('java') || messageText.includes('Java')) {
      return 'Анализ Java кода';
    } else if (messageText.includes('html') || messageText.includes('HTML') || messageText.includes('<div>')) {
      return 'Анализ HTML кода';
    } else if (messageText.includes('css') || messageText.includes('CSS') || messageText.includes('{')) {
      return 'Анализ CSS кода';
    } else if (messageText.includes('sql') || messageText.includes('SQL') || messageText.includes('SELECT')) {
      return 'Анализ SQL запроса';
    } else if (messageText.includes('ошибка') || messageText.includes('error') || messageText.includes('bug')) {
      return 'Поиск ошибок';
    } else if (messageText.includes('оптимизация') || messageText.includes('optimize') || messageText.includes('улучшить')) {
      return 'Оптимизация кода';
    }
    
    // Если не удалось определить тему, берем первые слова сообщения
    const words = messageText.split(' ').slice(0, 3).join(' ');
    return words || 'Новый чат';
  };

  /**
   * Создает новый пустой чат
   */
  const createNewChat = () => {
    const newChat = {
      id: Date.now(), // Используем timestamp как уникальный ID
      title: 'Новый чат',
      description: 'Начните общение...',
      unreadCount: 0,
      messages: []
    };
    setChats([...chats, newChat]);
    setActiveChat(chats.length); // Активируем новый чат
  };

  /**
   * Удаляет чат по ID
   * @param {number} chatId - ID чата для удаления
   * @param {Event} e - событие клика
   */
  const deleteChat = (chatId, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    // Корректируем активный чат после удаления
    if (updatedChats.length === 0) {
      setActiveChat(null);
    } else if (activeChat >= updatedChats.length) {
      setActiveChat(updatedChats.length - 1);
    }
  };

  /**
   * Начинает редактирование названия чата
   * @param {Object} chat - объект чата
   * @param {Event} e - событие клика
   */
  const startEditingTitle = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  /**
   * Сохраняет измененное название чата
   * @param {number} chatId - ID чата
   * @param {Event} e - событие клика
   */
  const saveEditedTitle = (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      const updatedChats = chats.map(chat => 
        chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
      );
      setChats(updatedChats);
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  /**
   * Отменяет редактирование названия
   * @param {Event} e - событие клика
   */
  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  /**
   * Обрабатывает отправку нового сообщения
   * @param {Event} e - событие отправки формы
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && chats[activeChat]) {
      const updatedChats = [...chats];
      const currentChat = updatedChats[activeChat];
      
      // Создаем новое сообщение пользователя
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [] // Заготовка для будущих вложений
      };

      currentChat.messages.push(userMessage);
      
      // Если это первое сообщение в чате, генерируем название и описание
      if (currentChat.messages.length === 1) {
        currentChat.title = generateChatTitle(newMessage);
        currentChat.description = newMessage.substring(0, 40) + (newMessage.length > 40 ? '...' : '');
      } else {
        // Обновляем описание последним сообщением
        currentChat.description = newMessage.substring(0, 40) + (newMessage.length > 40 ? '...' : '');
      }

      setChats(updatedChats);
      setNewMessage(''); // Очищаем поле ввода

      // Имитация ответа AI с задержкой
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'assistant',
          content: getAIResponse(newMessage),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const finalChats = [...updatedChats];
        finalChats[activeChat].messages.push(aiResponse);
        finalChats[activeChat].unreadCount += 1;
        setChats(finalChats);
      }, 1000);
    }
  };

  /**
   * Генерирует ответ AI на основе сообщения пользователя
   * @param {string} userMessage - сообщение пользователя
   * @returns {string} - ответ AI
   */
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Генерируем контекстные ответы в зависимости от содержания сообщения
    if (message.includes('python') || message.includes('print')) {
      return `Проанализировал ваш Python код. Заметил несколько моментов для улучшения:\n\n• Рекомендую использовать современный синтаксис Python\n• Обратите внимание на отступы и стиль кода\n• Рассмотрите обработку исключений\n\nХотите более детальный анализ?`;
    } else if (message.includes('javascript') || message.includes('js')) {
      return `Анализ JavaScript кода выполнен. Основные рекомендации:\n\n• Проверьте области видимости переменных\n• Рекомендую использовать const/let вместо var\n• Обратите внимание на асинхронные операции\n\nНужна помощь с конкретной ошибкой?`;
    } else if (message.includes('ошибка') || message.includes('error')) {
      return `Помогу найти ошибку в вашем коде. Для более точного анализа:\n\n• Прикрепите полный код файла\n• Укажите текст ошибки\n• Опишите ожидаемое поведение\n\nЧто именно не работает?`;
    } else {
      return `Проанализировал ваш запрос. Готов помочь с:\n\n• Поиском и исправлением ошибок\n• Оптимизацией производительности\n• Улучшением архитектуры кода\n• Code review лучших практик\n\nЧто конкретно вас интересует?`;
    }
  };

  /**
   * Обрабатывает прикрепление файла (заглушка для будущей реализации)
   */
  const handleFileAttach = () => {
    console.log('Функция прикрепления файла будет реализована позже');
    // TODO: Реализовать логику выбора и прикрепления файлов
  };

  const currentChat = chats[activeChat];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Боковая панель со списком чатов */}
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-20' : 'w-80'
          }`}>
            <div className="flex justify-between items-center mb-6">
              {!isSidebarCollapsed && (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Чаты</h2>
              )}
              <div className="flex space-x-2">
                {/* Кнопка сворачивания/разворачивания боковой панели */}
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                >
                  {isSidebarCollapsed ? '→' : '←'}
                </button>
                {/* Кнопка создания нового чата (видна только в развернутом состоянии) */}
                {!isSidebarCollapsed && (
                  <button 
                    onClick={createNewChat}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
            
            {/* Контент боковой панели (скрывается при сворачивании) */}
            {!isSidebarCollapsed && (
              <>
                {/* Список чатов */}
                <div className="space-y-3">
                  {chats.map((chat, index) => (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChat(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                        activeChat === index
                          ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
                      }`}
                    >
                      {/* Кнопки управления чатом (появляются при наведении) */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        {/* Кнопка редактирования названия */}
                        <button
                          onClick={(e) => startEditingTitle(chat, e)}
                          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 w-6 h-6 rounded text-xs flex items-center justify-center transition-colors"
                          title="Редактировать название"
                        >
                          ✏️
                        </button>
                        
                        {/* Кнопка удаления чата */}
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="bg-red-200 hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 text-red-700 dark:text-red-300 w-6 h-6 rounded text-xs flex items-center justify-center transition-colors"
                          title="Удалить чат"
                        >
                          🗑️
                        </button>
                      </div>

                      {/* Режим редактирования названия чата */}
                      {editingChatId === chat.id ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditedTitle(chat.id, e)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <div className="flex space-x-1 mt-1">
                            <button
                              onClick={(e) => saveEditedTitle(chat.id, e)}
                              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2 pr-8">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {chat.title}
                            </span>
                            {/* Бейдж с количеством непрочитанных сообщений */}
                            {chat.unreadCount > 0 && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full min-w-6 text-center">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-8">
                            {chat.description}
                          </p>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Сообщение при отсутствии чатов */}
                  {chats.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <p>Нет активных чатов</p>
                      <p className="text-sm">Создайте новый чат чтобы начать общение</p>
                    </div>
                  )}
                </div>

                {/* Кнопка создания нового чата внизу панели */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={createNewChat}
                    className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>+</span>
                    <span>Новый чат</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Основная область чата */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            {currentChat ? (
              <>
                {/* Заголовок активного чата */}
                <div className="border-b border-gray-200 dark:border-gray-600 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">{currentChat.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentChat.description}</p>
                </div>

                {/* Область сообщений */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {currentChat.messages.length > 0 ? (
                    currentChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-2xl rounded-2xl p-4 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          {/* Текст сообщения с сохранением форматирования */}
                          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                          
                          {/* Индикатор прикрепленных файлов */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs opacity-75">
                                Прикрепленные файлы: {message.attachments.length}
                              </div>
                            </div>
                          )}
                          
                          {/* Время отправки сообщения */}
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' 
                              ? 'text-blue-200' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Сообщение при отсутствии сообщений в чате */
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p>Начните общение - отправьте первое сообщение</p>
                      <p className="text-sm mt-2">Чат получит автоматическое название на основе вашего запроса</p>
                    </div>
                  )}
                </div>

                {/* Поле ввода нового сообщения */}
                <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    {/* Кнопка прикрепления файла */}
                    <button
                      type="button"
                      onClick={handleFileAttach}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                      title="Прикрепить файл"
                    >
                      📎
                    </button>
                    
                    {/* Поле ввода текста сообщения */}
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Написать сообщение..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    
                    {/* Кнопка отправки сообщения */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Отправить
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Сообщение при отсутствии активного чата */
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Выберите чат или создайте новый</p>
                  <p>Начните общение с AI для анализа вашего кода</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;