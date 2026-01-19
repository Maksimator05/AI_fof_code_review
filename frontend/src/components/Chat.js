import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
//import Header from './Header';
import { sendMessage, uploadCodeFile } from '../api';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../api/config';

function Chat() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Состояние для управления чатами и сообщениями
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

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

  /**
   * Создает новый пустой чат
   */
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      conversation_id: null, // Будет установлен после первого сообщения
      title: 'Новый чат',
      description: 'Начните общение...',
      unreadCount: 0,
      messages: []
    };
    setChats([...chats, newChat]);
    setActiveChat(chats.length);
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
   * Обрабатывает отправку нового сообщения
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading || activeChat === null) return;

    const currentChatIndex = activeChat;
    const updatedChats = [...chats];
    const currentChat = updatedChats[currentChatIndex];

    // Создаем сообщение пользователя
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    currentChat.messages.push(userMessage);

    // Если первое сообщение - генерируем название
    if (currentChat.messages.length === 1) {
      currentChat.title = generateChatTitle(newMessage);
      currentChat.description = newMessage.substring(0, 40) + (newMessage.length > 40 ? '...' : '');
    } else {
      currentChat.description = newMessage.substring(0, 40) + (newMessage.length > 40 ? '...' : '');
    }

    setChats(updatedChats);
    const messageText = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // Отправляем запрос на бекенд
      const response = await sendMessage({
        body: messageText,
        conversation_id: currentChat.conversation_id || null,
        language: 'auto'
      });

      // Обновляем conversation_id если это был новый чат
      if (!currentChat.conversation_id) {
        currentChat.conversation_id = response.conversation_id;
      }

      // Добавляем ответ ассистента
      const aiMessage = {
        id: response.id,
        type: 'assistant',
        content: response.content || response.body,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalChats = [...updatedChats];
      finalChats[currentChatIndex].messages.push(aiMessage);
      setChats(finalChats);

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);

      // Добавляем сообщение об ошибке
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `❌ Ошибка: ${error.message}\n\nПопробуйте еще раз или проверьте подключение к серверу.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalChats = [...updatedChats];
      finalChats[currentChatIndex].messages.push(errorMessage);
      setChats(finalChats);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Обрабатывает прикрепление файла
   */
  const handleFileAttach = () => {
    if (activeChat === null) {
      alert('Пожалуйста, создайте или выберите чат перед загрузкой файла');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.js,.ts,.java,.cpp,.c,.cs,.go,.rs,.html,.css,.json,.xml';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsLoading(true);
      const currentChatIndex = activeChat;
      const updatedChats = [...chats];
      const currentChat = updatedChats[currentChatIndex];

      // Сообщение о загрузке файла
      const uploadMessage = {
        id: Date.now(),
        type: 'user',
        content: `📎 Загружен файл: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      currentChat.messages.push(uploadMessage);
      setChats(updatedChats);

      try {
        const response = await uploadCodeFile(
          file,
          currentChat.conversation_id || null
        );

        // Обновляем conversation_id
        if (!currentChat.conversation_id) {
          currentChat.conversation_id = response.conversation_id;
          currentChat.title = `Анализ: ${file.name}`;
        }

        // Добавляем ответ
        const aiMessage = {
          id: response.message.id,
          type: 'assistant',
          content: response.message.content || response.message.body,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalChats = [...updatedChats];
        finalChats[currentChatIndex].messages.push(aiMessage);
        setChats(finalChats);

      } catch (error) {
        console.error('Ошибка загрузки файла:', error);

        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `❌ Ошибка загрузки файла: ${error.message}\n\nПроверьте формат файла и попробуйте еще раз.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalChats = [...updatedChats];
        finalChats[currentChatIndex].messages.push(errorMessage);
        setChats(finalChats);
      } finally {
        setIsLoading(false);
      }
    };

    input.click();
  };

  const currentChat = activeChat !== null ? chats[activeChat] : null;

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
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                >
                  {isSidebarCollapsed ? '→' : '←'}
                </button>
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

            {!isSidebarCollapsed && (
              <>
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
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={(e) => startEditingTitle(chat, e)}
                          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 w-6 h-6 rounded text-xs flex items-center justify-center transition-colors"
                          title="Редактировать название"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="bg-red-200 hover:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 text-red-700 dark:text-red-300 w-6 h-6 rounded text-xs flex items-center justify-center transition-colors"
                          title="Удалить чат"
                        >
                          🗑️
                        </button>
                      </div>

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

                  {chats.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <p>Нет активных чатов</p>
                      <p className="text-sm">Создайте новый чат чтобы начать общение</p>
                    </div>
                  )}
                </div>

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
                <div className="border-b border-gray-200 dark:border-gray-600 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">{currentChat.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentChat.description}</p>
                </div>

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
                          <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>

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
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p>Начните общение - отправьте первое сообщение</p>
                      <p className="text-sm mt-2">Чат получит автоматическое название на основе вашего запроса</p>
                    </div>
                  )}

                  {/* Индикатор загрузки */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 rounded-bl-none">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleFileAttach}
                      disabled={isLoading}
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 w-12 h-12 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Прикрепить файл"
                    >
                      📎
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Написать сообщение..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? 'Отправка...' : 'Отправить'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
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