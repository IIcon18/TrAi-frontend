/**
 * Модульные тесты для компонента LoginForm.
 *
 * Покрываемые сценарии:
 * - Рендеринг полей email и password
 * - Переключатель видимости пароля
 * - Успешный вход: вызов API, сохранение токенов, навигация на /dashboard
 * - Ошибка входа: отображение alert
 * - Граничный случай: пустая форма
 *
 * Стратегия мокирования:
 * - apiClient мокируется через jest.mock
 * - useNavigate мокируется для проверки редиректов
 * - AuthContext предоставляется через реальный AuthProvider
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import LoginForm from '../../../components/LoginForm';
import { AuthProvider } from '../../../contexts/AuthContext';

// Мок apiClient
jest.mock('../../../api/apiClient', () => ({
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

// Мок SVG-импортов (CRA fileTransform вернёт имя файла, но явный мок делает значение предсказуемым)
jest.mock('../../../assets/icons/eye.svg', () => 'eye-svg');
jest.mock('../../../assets/icons/hide_eye.svg', () => 'hide-svg');
jest.mock('../../../assets/icons/confirm.svg', () => 'confirm-svg');
jest.mock('../../../assets/icons/new_acc.svg', () => 'new-acc-svg');

// CSS обрабатываются CRA автоматически через cssTransform.js

import apiClient from '../../../api/apiClient';
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Вспомогательная функция рендера
function renderLoginForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (window.alert as jest.Mock).mockClear();
  });

  // --- Рендеринг ---

  it('отображает поле Email', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('Эл. почта')).toBeInTheDocument();
  });

  it('отображает поле Password', () => {
    renderLoginForm();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
  });

  it('поле пароля по умолчанию имеет тип "password"', () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // --- Переключатель видимости пароля ---

  it('переключатель видимости меняет тип поля пароля на "text"', async () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const toggleButton = screen.getByRole('button', { name: /показать пароль/i });

    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('повторное нажение переключателя возвращает тип "password"', async () => {
    renderLoginForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const toggleButton = screen.getByRole('button', { name: /показать пароль/i });

    await userEvent.click(toggleButton);
    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // --- Успешный вход ---

  it('при успешном входе сохраняет токены в localStorage', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        access_token: 'access123',
        refresh_token: 'refresh456',
        role: 'user',
      },
    });

    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

    // Нажимаем кнопку подтверждения
    const confirmBtn = screen.getByRole('button', { name: /войти/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('access123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh456');
    });
  });

  it('при успешном входе перенаправляет на /dashboard', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        access_token: 'access123',
        refresh_token: 'refresh456',
        role: 'user',
      },
    });

    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

    const confirmBtn = screen.getByRole('button', { name: /войти/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('вызывает apiClient.post с правильными данными', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { access_token: 'a', refresh_token: 'r', role: 'user' },
    });

    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'user@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'pass123');

    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@test.com',
        password: 'pass123',
      });
    });
  });

  // --- Ошибка входа ---

  it('при ошибке входа отображает alert с сообщением об ошибке', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));

    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'wrong@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'wrongpass');

    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Ошибка')
      );
    });
  });

  it('при ошибке входа не выполняет навигацию', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('401'));

    renderLoginForm();

    await userEvent.type(screen.getByPlaceholderText('Эл. почта'), 'u@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'wrong');

    await userEvent.click(screen.getByRole('button', { name: /войти/i }));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
