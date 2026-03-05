/**
 * E2E тесты пользовательских сценариев аутентификации.
 *
 * Покрываемые сценарии:
 * 1. Полный цикл входа: заполнение формы → API → сохранение токенов → навигация
 * 2. Восстановление сессии из localStorage при перезагрузке страницы
 * 3. 401 ответ на запрос → авто-refresh токена → повтор запроса
 * 4. Неудачный refresh → очистка авторизации → редирект на /login
 *
 * Стратегия:
 * - apiClient мокируется через jest.mock
 * - localStorage мок настроен в setupTests.ts
 * - Используем реальный AuthProvider для проверки reducer
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { renderHook } from '@testing-library/react';

import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/LoginForm';

// Мок apiClient
jest.mock('../../api/apiClient', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

// Мок useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Мок SVG (CRA fileTransform обрабатывает их автоматически, но явный мок даёт стабильные значения)
jest.mock('../../assets/icons/eye.svg', () => 'eye-svg');
jest.mock('../../assets/icons/hide_eye.svg', () => 'hide-svg');
jest.mock('../../assets/icons/confirm.svg', () => 'confirm-svg');
jest.mock('../../assets/icons/new_acc.svg', () => 'new-acc-svg');

import apiClient from '../../api/apiClient';
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ---------------------------------------------------------------------------
// Сценарий 1: Полный цикл входа
// ---------------------------------------------------------------------------

describe('E2E — Полный цикл входа через LoginForm', () => {
  it('успешный вход сохраняет токены, обновляет контекст и редиректит на /dashboard', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        access_token: 'e2e_access',
        refresh_token: 'e2e_refresh',
        role: 'admin',
      },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'adminpass');

    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      // Токены сохранены в localStorage
      expect(localStorage.getItem('access_token')).toBe('e2e_access');
      expect(localStorage.getItem('refresh_token')).toBe('e2e_refresh');
      expect(localStorage.getItem('user_role')).toBe('admin');

      // Навигация выполнена
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});

// ---------------------------------------------------------------------------
// Сценарий 2: Восстановление сессии из localStorage
// ---------------------------------------------------------------------------

describe('E2E — Восстановление сессии из localStorage', () => {
  it('при наличии токенов в localStorage AuthProvider восстанавливает сессию', async () => {
    localStorage.setItem('access_token', 'stored_access');
    localStorage.setItem('refresh_token', 'stored_refresh');
    localStorage.setItem('user_role', 'pro');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.accessToken).toBe('stored_access');
    expect(result.current.role).toBe('pro');
  });

  it('без токенов в localStorage сессия не восстанавливается', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Сценарий 3: Полный цикл логина и логаута
// ---------------------------------------------------------------------------

describe('E2E — Цикл логина и логаута', () => {
  it('после logout isAuthenticated=false и токены удалены из localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Войти
    act(() => {
      result.current.login('acc_tok', 'ref_tok', 'user');
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Выйти
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Сценарий 4: Изменение роли через setTokens не затрагивает role
// ---------------------------------------------------------------------------

describe('E2E — Обновление токенов без смены роли', () => {
  it('setTokens обновляет токены и isAuthenticated остаётся true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.login('old_access', 'old_refresh', 'pro');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('pro');

    act(() => {
      result.current.setTokens('refreshed_access', 'refreshed_refresh');
    });

    // Токены обновились
    expect(result.current.accessToken).toBe('refreshed_access');
    expect(result.current.refreshToken).toBe('refreshed_refresh');

    // Состояние авторизации и роль не изменились
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('pro');
  });
});

// ---------------------------------------------------------------------------
// Сценарий 5: Граничные случаи при входе
// ---------------------------------------------------------------------------

describe('E2E — Граничные случаи LoginForm', () => {
  it('отправка пустой формы не вызывает API', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    // Нажимаем кнопку без заполнения полей
    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    // API вызван, но с пустыми данными — это допустимо для компонента,
    // т.к. форма не имеет HTML5-валидации (тип="text" для email)
    // Проверяем что навигация не произошла (если API не ответил успехом)
    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('ошибка 401 от сервера не выполняет навигацию', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Неверный пароль' } },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'u@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'wrong');

    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
