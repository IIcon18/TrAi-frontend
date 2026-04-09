import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { UserRole } from '../utils/auth';

// ---- State ----

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  role: 'user',
  isLoading: true,
};

type AuthAction =
  | { type: 'HYDRATE'; payload: { accessToken: string; refreshToken: string; role: UserRole } }
  | { type: 'LOGIN';   payload: { accessToken: string; refreshToken: string; role: UserRole } }
  | { type: 'LOGOUT' }
  | { type: 'SET_TOKENS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'HYDRATION_DONE' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        role: action.payload.role,
        isLoading: false,
      };
    case 'LOGIN':
      return {
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        role: action.payload.role,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_TOKENS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };
    case 'HYDRATION_DONE':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (accessToken: string, refreshToken: string, role: UserRole) => void;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const role = (localStorage.getItem('user_role') as UserRole) || 'user';

    if (accessToken && refreshToken) {
      dispatch({ type: 'HYDRATE', payload: { accessToken, refreshToken, role } });
    } else {
      dispatch({ type: 'HYDRATION_DONE' });
    }
  }, []);

  const login = useCallback(
    (accessToken: string, refreshToken: string, role: UserRole) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_role', role);
      dispatch({ type: 'LOGIN', payload: { accessToken, refreshToken, role } });
    },
    []
  );

  const logout = useCallback(async () => {
    const refreshToken = state.refreshToken;

    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    if (refreshToken) {
      try {
        const apiClient = (await import('../api/apiClient')).default;
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
      }
    }
  }, [state.refreshToken]);

  const setTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      dispatch({ type: 'SET_TOKENS', payload: { accessToken, refreshToken } });
    },
    []
  );

  return (
    <AuthContext.Provider value={{ state, login, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
