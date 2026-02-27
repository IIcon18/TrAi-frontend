import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../utils/auth';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole;
  accessToken: string | null;
  refreshToken: string | null;
  login: (accessToken: string, refreshToken: string, role: UserRole) => void;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  isAdmin: () => boolean;
  isPro: () => boolean;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  const { state, login, logout, setTokens } = context;

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    role: state.role,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    login,
    logout,
    setTokens,
    isAdmin: () => state.role === 'admin',
    isPro: () => state.role === 'pro' || state.role === 'admin',
  };
}
