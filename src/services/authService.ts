import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  age: number;
  lifestyle: 'low' | 'medium' | 'high';
  height: number;
  weight: number;
  initial_weight?: number;
  target_weight?: number;
  level?: string;
  weekly_training_goal?: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/login', loginData);
      this.saveTokens(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/v1/auth/register', registerData);
      this.saveTokens(response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  saveTokens(tokens: AuthResponse): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();