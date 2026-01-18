import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Chat() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
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
  const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

  /**
   * Загружает беседы с сервера
   */
  const loadConversations = async () => {
    try {
      // TODO: Добавить endpoint для получения списка бесед
      // const response = await axios.get('/conversations');
      // setChats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки бесед:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

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
   */
  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (updatedChats.length === 0) {
      setActiveChat(null);
    } else if (activeChat >= updatedChats.length) {
      setActiveChat(updatedChats.length - 1);
    }
  };

  /**
   * Начинает редактирование названия чата
   */
  const startEditingTitle = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  /**
   * Сохраняет измененное название чата
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
   */
  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  /**
   * Отправляет сообщение на сервер
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chats[activeChat] || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const currentChat = chats[activeChat];
      
      // Создаем временное сообщение пользователя
      const tempUserMessage = {
        id: Date.now(),
        type: 'user',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Обновляем UI сразу
      const updatedChats = [...chats];
      updatedChats[activeChat].messages.push(tempUserMessage);
      
      // Если это первое сообщение в чате, обновляем название
      if (currentChat.messages.length === 0) {
        updatedChats[activeChat].title = generateChatTitle(newMessage);
      }
      updatedChats[activeChat].description = newMessage.substring(0, 40) + (newMessage.length > 40 ? '...' : '');
      
      setChats(updatedChats);
      const messageText = newMessage;
      setNewMessage(''); // Очищаем поле ввода

      // Отправляем на сервер
      const response = await axios.post('/message', {
        body: messageText,
        language: 'python'
      });

      // Обновляем с ответом от сервера
      const finalChats = [...updatedChats];
      finalChats[activeChat].messages.push({
        id: response.data.id,
        type: 'assistant',
        content: response.data.body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      
      // Если это новый чат (без conversation_id), обновляем ID
      if (!currentChat.conversationId && response.data.conversation_id) {
        finalChats[activeChat].conversationId = response.data.conversation_id;
      }
      
      setChats(finalChats);
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      
      // Показываем сообщение об ошибке
      const errorChats = [...chats];
      errorChats[activeChat].messages.push({
        id: Date.now() + 1,
        type: 'assistant',
        content: `Ошибка: ${error.response?.data?.detail || error.message || 'Неизвестная ошибка'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      });
      setChats(errorChats);
      
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обрабатывает загрузку файла
   */
  const handleFileAttach = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.js,.ts,.java,.cpp,.c,.cs,.go,.rs,.html,.css,.json,.xml';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      // Проверка расширения
      const allowedExt = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.html', '.css', '.json', '.xml'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedExt.includes(fileExt)) {
        alert('Неподдерживаемый тип файла. Пожалуйста, загрузите файл с кодом.');
        return;
      }
      
      setIsLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post('/load_file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Создаем новый чат или обновляем существующий
        if (response.data.conversation_id) {
          const newChat = {
            id: Date.now(),
            conversationId: response.data.conversation_id,
            title: `Анализ: ${file.name}`,
            description: `Файл: ${file.name}`,
            unreadCount: 1,
            messages: [
              {
                id: response.data.message.id,
                type: 'assistant',
                content: response.data.message.body,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          
          setChats([...chats, newChat]);
          setActiveChat(chats.length);
        }
        
      } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        alert(`Ошибка загрузки файла: ${error.response?.data?.detail || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    input.click();
  };

  /**
   * Генерирует название чата на основе содержания первого сообщения
   */
  const generateChatTitle = (message) => {
    const messageText = message.trim();
    
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
    
    const words = messageText.split(' ').slice(0, 3).join(' ');
    return words || 'Новый чат';
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
                              : message.isError
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-bl-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          {/* Текст сообщения с сохранением форматирования */}
                          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>

                          {/* Время отправки сообщения */}
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' 
                              ? 'text-blue-200' 
                              : message.isError
                              ? 'text-red-600 dark:text-red-300'
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
                      disabled={isLoading}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 w-12 h-12 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />
                    
                    {/* Кнопка отправки сообщения */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors relative"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Отправка...
                        </span>
                      ) : 'Отправить'}
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