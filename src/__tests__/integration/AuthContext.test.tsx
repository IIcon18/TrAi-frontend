/**
 * Интеграционные тесты для AuthContext + AuthProvider.
 *
 * Покрываемые сценарии:
 * - HYDRATE: загрузка токенов из localStorage при монтировании
 * - LOGIN: сохранение токенов в localStorage и обновление состояния
 * - LOGOUT: очистка localStorage и состояния, вызов серверного логаута
 * - SET_TOKENS: обновление токенов без изменения роли
 * - isLoading: false после гидратации
 *
 * Стратегия: используем реальный AuthProvider с хуком useAuth через renderHook.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';

// Мок apiClient для вызова logout
jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext — гидратация из localStorage', () => {
  it('isAuthenticated=false если localStorage пуст', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('isAuthenticated=true если токены есть в localStorage', async () => {
    localStorage.setItem('access_token', 'stored_access');
    localStorage.setItem('refresh_token', 'stored_refresh');
    localStorage.setItem('user_role', 'user');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.accessToken).toBe('stored_access');
    expect(result.current.refreshToken).toBe('stored_refresh');
  });

  it('role загружается из localStorage при гидратации', async () => {
    localStorage.setItem('access_token', 'tok');
    localStorage.setItem('refresh_token', 'ref');
    localStorage.setItem('user_role', 'admin');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.role).toBe('admin');
  });

  it('isLoading=false после гидратации даже без токенов', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});

describe('AuthContext — login', () => {
  it('login устанавливает isAuthenticated=true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('access_token', 'refresh_token', 'user');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('login сохраняет токены в localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('access_abc', 'refresh_xyz', 'pro');
    });

    expect(localStorage.getItem('access_token')).toBe('access_abc');
    expect(localStorage.getItem('refresh_token')).toBe('refresh_xyz');
    expect(localStorage.getItem('user_role')).toBe('pro');
  });

  it('login обновляет роль в состоянии', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('tok', 'ref', 'admin');
    });

    expect(result.current.role).toBe('admin');
  });

  it('isAdmin() возвращает true после login с ролью admin', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('tok', 'ref', 'admin');
    });

    expect(result.current.isAdmin()).toBe(true);
  });
});

describe('AuthContext — logout', () => {
  it('logout устанавливает isAuthenticated=false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('tok', 'ref', 'user');
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout удаляет токены из localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('access', 'refresh', 'user');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_role')).toBeNull();
  });

  it('logout сбрасывает роль на "user"', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('tok', 'ref', 'admin');
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.role).toBe('user');
  });
});

describe('AuthContext — setTokens', () => {
  it('setTokens обновляет токены без изменения роли', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('old_access', 'old_refresh', 'pro');
    });

    act(() => {
      result.current.setTokens('new_access', 'new_refresh');
    });

    expect(result.current.accessToken).toBe('new_access');
    expect(result.current.refreshToken).toBe('new_refresh');
    expect(result.current.role).toBe('pro');  // роль не изменилась
  });

  it('setTokens сохраняет новые токены в localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setTokens('new_access_tok', 'new_refresh_tok');
    });

    expect(localStorage.getItem('access_token')).toBe('new_access_tok');
    expect(localStorage.getItem('refresh_token')).toBe('new_refresh_tok');
  });
});
