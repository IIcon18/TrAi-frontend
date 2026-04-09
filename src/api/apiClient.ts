import axios, {
  InternalAxiosRequestConfig,
  AxiosHeaders,
  AxiosError,
  AxiosResponse,
} from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
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

let isRefreshing = false;
let refreshSubscribers: Array<(accessToken: string) => void> = [];
let refreshFailedCallbacks: Array<() => void> = [];

function subscribeTokenRefresh(callback: (accessToken: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshFailed(callback: () => void) {
  refreshFailedCallbacks.push(callback);
}

function notifySubscribers(newAccessToken: string) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
  refreshFailedCallbacks = [];
}

function notifyRefreshFailed() {
  refreshFailedCallbacks.forEach((cb) => cb());
  refreshSubscribers = [];
  refreshFailedCallbacks = [];
}

function clearAuthAndRedirect() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  if (
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/register'
  ) {
    window.location.href = '/login';
  }
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/logout') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          subscribeTokenRefresh((newAccessToken) => {
            if (originalRequest.headers) {
              (originalRequest.headers as AxiosHeaders).set(
                'Authorization',
                `Bearer ${newAccessToken}`
              );
            }
            resolve(apiClient(originalRequest));
          });
          onRefreshFailed(() => reject(error));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        notifyRefreshFailed();
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        if (originalRequest.headers) {
          (originalRequest.headers as AxiosHeaders).set(
            'Authorization',
            `Bearer ${access_token}`
          );
        }

        notifySubscribers(access_token);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        notifyRefreshFailed();
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.status === 403) {
      const detail =
        (error.response?.data as any)?.detail ||
        'Недостаточно прав для выполнения этого действия';
      alert(detail);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
