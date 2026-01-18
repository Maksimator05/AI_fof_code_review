import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Настройка axios
    useEffect(() => {
        axios.defaults.baseURL = API_URL;
        axios.defaults.withCredentials = true;
        
        // Интерцептор для добавления токена
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            }
        );

        // Проверяем токен при загрузке
        const token = localStorage.getItem('access_token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await axios.get('/users/me');
            setUser(response.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователя:', err);
            localStorage.removeItem('access_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await axios.post('/login', { username, password });
            
            localStorage.setItem('access_token', response.data.access_token);
            await loadUser();
            
            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Ошибка входа';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await axios.post('/register', userData);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.message || 'Ошибка регистрации';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (err) {
            console.error('Ошибка выхода:', err);
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};