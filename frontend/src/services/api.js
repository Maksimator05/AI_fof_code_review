// frontend/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';

class ApiService {
    constructor() {
        this.baseURL = API_URL;
    }

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include', // Для кук refresh_token
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                detail: `HTTP ${response.status}: ${response.statusText}`
            }));
            throw new Error(error.detail || 'Ошибка сети');
        }

        return response.json();
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(userData) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async logout() {
        return this.request('/logout', {
            method: 'POST',
        });
    }

    async refreshToken() {
        return this.request('/refresh', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/users/me');
    }

    // Chat endpoints
    async sendMessage(messageData) {
        return this.request('/message', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    }

    async uploadFile(formData) {
        // Note: Content-Type будет multipart/form-data автоматически
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${this.baseURL}/load_file`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
            credentials: 'include',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
    }

    // Health checks
    async checkApiHealth() {
        return this.request('/health-api');
    }

    async checkMlHealth() {
        return this.request('/health-ml');
    }
}

export const api = new ApiService();