import { API_BASE_URL, setAuthToken, removeAuthToken, getAuthToken } from './config';

/**
 * Регистрация нового пользователя
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка регистрации');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Вход пользователя в систему
 */
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка входа');
    }

    const data = await response.json();

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Выход пользователя из системы
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    removeAuthToken();

    if (!response.ok) {
      console.warn('Logout request failed, but token removed locally');
    }
  } catch (error) {
    console.error('Logout error:', error);
    removeAuthToken();
    throw error;
  }
};

/**
 * Обновление access token с помощью refresh token
 */
export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      removeAuthToken();
      throw new Error('Не удалось обновить токен');
    }

    const data = await response.json();

    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

/**
 * Получить данные текущего пользователя
 */
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Токен не найден');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await refreshAccessToken();
        return getCurrentUser();
      }
      throw new Error('Не удалось получить данные пользователя');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};