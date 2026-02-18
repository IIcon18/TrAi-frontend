import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Если получили 401 (Unauthorized), значит токен невалидный или истек
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
      // Перенаправляем на логин только если мы не на странице логина/регистрации
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    // Обработка 403 — недостаточно прав
    if (error.response?.status === 403) {
      const detail = (error.response?.data as any)?.detail || 'Недостаточно прав для выполнения этого действия';
      alert(detail);
    }
    return Promise.reject(error);
  }
);

export default apiClient;