import { API_BASE_URL, getAuthToken } from './config';
import { refreshAccessToken } from './auth';

/**
 * Отправить сообщение в чат
 * @param {Object} messageData - данные сообщения
 * @param {string} messageData.body - текст сообщения
 * @param {number|null} messageData.conversation_id - ID беседы (null для новой)
 * @param {string} messageData.language - язык программирования
 * @returns {Promise<Object>} - ответ от сервера с сообщением ассистента
 */
export const sendMessage = async (messageData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Пользователь не авторизован');
    }

    const response = await fetch(`${API_BASE_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        body: messageData.body,
        conversation_id: messageData.conversation_id || null,
        language: messageData.language || 'auto'
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Попытка обновить токен
        await refreshAccessToken();
        // Повторный запрос
        return sendMessage(messageData);
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка отправки сообщения');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

/**
 * Загрузить файл с кодом для анализа
 * @param {File} file - файл с кодом
 * @param {number|null} conversationId - ID беседы (null для новой)
 * @returns {Promise<Object>} - результат анализа
 */
export const uploadCodeFile = async (file, conversationId = null) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Пользователь не авторизован');
    }

    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

    const response = await fetch(`${API_BASE_URL}/load_file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // НЕ указываем Content-Type - браузер сам установит с boundary
      },
      body: formData
    });

    if (!response.ok) {
      if (response.status === 401) {
        await refreshAccessToken();
        return uploadCodeFile(file, conversationId);
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка загрузки файла');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload file error:', error);
    throw error;
  }
};

/**
 * Проверить здоровье API
 * @returns {Promise<Object>}
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-api`);

    if (!response.ok) {
      throw new Error('API недоступен');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API health check error:', error);
    throw error;
  }
};

/**
 * Проверить здоровье ML сервиса
 * @returns {Promise<Object>}
 */
export const checkMlHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health-ml`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('ML health check error:', error);
    throw error;
  }
};