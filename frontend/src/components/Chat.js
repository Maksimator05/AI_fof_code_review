import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import API, { tokenManager } from '../services/api';

function Chat() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Состояние для управления чатами и сообщениями
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');

  // Загрузка списка чатов при монтировании компонента
  useEffect(() => {
    loadConversations();
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Загружает список всех разговоров пользователя
   */
  const loadConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.getConversations();
      setChats(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      if (err.response?.status === 401) {
        tokenManager.removeToken();
        navigate('/login');
      } else {
        setError('Ошибка загрузки истории чатов');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Загружает сообщения для конкретного чата
   */
  const loadConversationMessages = async (conversationId) => {
    try {
      const { data } = await API.getConversation(conversationId);
      return data.messages || [];
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Ошибка загрузки сообщений');
      return [];
    }
  };

  /**
   * Создает новый пустой чат
   */
  const createNewChat = () => {
    setActiveChat({
      id: null,
      title: 'Новый чат',
      description: 'Начните общение...',
      messages: [],
      isNew: true
    });
    setNewMessage('');
  };

  /**
   * Переключается на выбранный чат
   */
  const selectChat = async (chat, index) => {
    if (!chat.messages || chat.messages.length === 0) {
      const messages = await loadConversationMessages(chat.id);
      const updatedChats = [...chats];
      updatedChats[index].messages = messages;
      setChats(updatedChats);
      setActiveChat({ ...chat, messages });
    } else {
      setActiveChat(chat);
    }
  };

  /**
   * Удаляет чат по ID
   */
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();

    if (!window.confirm('Вы уверены, что хотите удалить этот чат?')) {
      return;
    }

    try {
      await API.deleteConversation(chatId);
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);

      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Ошибка удаления чата');
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
  const saveEditedTitle = async (chatId, e) => {
    e.stopPropagation();

    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      await API.updateConversation(chatId, { title: editTitle.trim() });

      const updatedChats = chats.map(chat =>
        chat.id === chatId ? { ...chat, title: editTitle.trim() } : chat
      );
      setChats(updatedChats);

      if (activeChat?.id === chatId) {
        setActiveChat({ ...activeChat, title: editTitle.trim() });
      }
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError('Ошибка обновления названия');
    } finally {
      setEditingChatId(null);
      setEditTitle('');
    }
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

    if (!newMessage.trim()) return;

    setSendingMessage(true);
    setError('');

    try {
      const messageData = {
        body: newMessage.trim(),
        conversation_id: activeChat?.id || null,
        language: 'auto'
      };

      const { data } = await API.sendMessage(messageData);

      // Если это новый чат, обновляем список чатов
      if (!activeChat?.id || activeChat.isNew) {
        await loadConversations();
        // Загружаем сообщения для нового чата
        const messages = await loadConversationMessages(data.conversation_id);
        setActiveChat({
          id: data.conversation_id,
          title: newMessage.substring(0, 30) + (newMessage.length > 30 ? '...' : ''),
          messages: messages,
          isNew: false
        });
      } else {
        // Обновляем сообщения в существующем чате
        const messages = await loadConversationMessages(activeChat.id);
        setActiveChat({ ...activeChat, messages });

        // Обновляем чат в списке
        const updatedChats = chats.map(chat =>
          chat.id === activeChat.id
            ? { ...chat, messages, description: newMessage.substring(0, 40) }
            : chat
        );
        setChats(updatedChats);
      }

      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения. Попробуйте еще раз.');
    } finally {
      setSendingMessage(false);
    }
  };

  /**
   * Обрабатывает прикрепление файла
   */
  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  /**
   * Обрабатывает выбор файла
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSendingMessage(true);
    setError('');

    try {
      const { data } = await API.uploadFile(file, activeChat?.id || null);

      // Если это новый чат, обновляем список
      if (!activeChat?.id || activeChat.isNew) {
        await loadConversations();
        const messages = await loadConversationMessages(data.conversation_id);
        setActiveChat({
          id: data.conversation_id,
          title: `Анализ: ${file.name}`,
          messages: messages,
          isNew: false
        });
      } else {
        // Обновляем сообщения в существующем чате
        const messages = await loadConversationMessages(activeChat.id);
        setActiveChat({ ...activeChat, messages });

        const updatedChats = chats.map(chat =>
          chat.id === activeChat.id
            ? { ...chat, messages, description: `Загружен файл: ${file.name}` }
            : chat
        );
        setChats(updatedChats);
      }

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error uploading file:', err);
      if (err.response?.status === 400) {
        setError('Неподдерживаемый формат файла');
      } else {
        setError('Ошибка загрузки файла. Попробуйте еще раз.');
      }
    } finally {
      setSendingMessage(false);
      // Сбрасываем input для возможности загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const currentChatMessages = activeChat?.messages || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Сообщение об ошибке */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError('')} className="float-right font-bold">×</button>
          </div>
        )}

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
                  title={isSidebarCollapsed ? 'Развернуть' : 'Свернуть'}
                >
                  {isSidebarCollapsed ? '→' : '←'}
                </button>
                {!isSidebarCollapsed && (
                  <button
                    onClick={createNewChat}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                    title="Новый чат"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            {!isSidebarCollapsed && (
              <>
                {loading ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Загрузка...
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                    {chats.map((chat, index) => (
                      <div
                        key={chat.id}
                        onClick={() => selectChat(chat, index)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                          activeChat?.id === chat.id
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
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate pr-8">
                              {chat.description || 'Нет сообщений'}
                            </p>
                          </>
                        )}
                      </div>
                    ))}

                    {chats.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <p>Нет активных чатов</p>
                        <p className="text-sm">Создайте новый чат</p>
                      </div>
                    )}
                  </div>
                )}

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
            {activeChat ? (
              <>
                <div className="border-b border-gray-200 dark:border-gray-600 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeChat.description || 'Отправьте сообщение для анализа кода'}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {currentChatMessages.length > 0 ? (
                    currentChatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-2xl rounded-2xl p-4 ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : message.is_error
                              ? 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 rounded-bl-none'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          <pre className="whitespace-pre-wrap font-sans">
                            {message.content || message.body}
                          </pre>
                          <div className={`text-xs mt-2 ${
                            message.role === 'user'
                              ? 'text-blue-200'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p>Начните общение - отправьте код для анализа</p>
                      <p className="text-sm mt-2">или загрузите файл с кодом</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".py,.js,.ts,.java,.cpp,.c,.cs,.go,.rs,.html,.css,.json,.xml"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleFileAttach}
                      disabled={sendingMessage}
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
                      disabled={sendingMessage}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      {sendingMessage ? 'Отправка...' : 'Отправить'}
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
