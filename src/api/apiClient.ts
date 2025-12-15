// src/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/', // ← важно! Nginx сам перенаправит /auth/register → backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем JWT-токен, если он есть
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;