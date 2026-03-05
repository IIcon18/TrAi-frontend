/**
 * Модульные тесты для компонента RegistrationForm.
 *
 * Покрываемые сценарии:
 * - Рендеринг полей nickname, email, password
 * - Индикатор надёжности пароля (weak/medium/strong)
 * - Валидация: пустые поля, короткий пароль (< 6 символов)
 * - Успешная регистрация: вызов API, навигация на /profile
 * - Ошибка регистрации (дубликат email): отображение alert
 * - Переключатель видимости пароля
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import apiClient from '../../../api/apiClient';

import RegistrationForm from '../../../components/RegistrationForm';
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

// Мок SVG-импортов
jest.mock('../../../assets/icons/eye.svg', () => 'eye-svg');
jest.mock('../../../assets/icons/hide_eye.svg', () => 'hide-svg');

// CSS обрабатываются CRA автоматически через cssTransform.js

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

function renderRegistrationForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <RegistrationForm />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('RegistrationForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (window.alert as jest.Mock).mockClear();
  });

  // --- Рендеринг ---

  it('отображает поле Nickname', () => {
    renderRegistrationForm();
    expect(screen.getByPlaceholderText('Ваш никнейм')).toBeInTheDocument();
  });

  it('отображает поле Email', () => {
    renderRegistrationForm();
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
  });

  it('отображает поле Password', () => {
    renderRegistrationForm();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
  });

  it('отображает кнопку Confirm', () => {
    renderRegistrationForm();
    expect(screen.getByRole('button', { name: /зарегистрироваться/i })).toBeInTheDocument();
  });

  // --- Индикатор надёжности пароля ---

  it('индикатор "weak" отображается для пароля длиной < 6 символов', async () => {
    const { container } = renderRegistrationForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');

    await userEvent.type(passwordInput, 'abc');

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const indicator = container.querySelector('.password-strength-progress');
    expect(indicator).toHaveClass('weak');
  });

  it('индикатор "medium" отображается для пароля длиной 6-9 символов', async () => {
    const { container } = renderRegistrationForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');

    await userEvent.type(passwordInput, 'pass12');

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const indicator = container.querySelector('.password-strength-progress');
    expect(indicator).toHaveClass('medium');
  });

  it('индикатор "strong" отображается для пароля длиной >= 10 символов', async () => {
    const { container } = renderRegistrationForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');

    await userEvent.type(passwordInput, 'strongpassword');

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const indicator = container.querySelector('.password-strength-progress');
    expect(indicator).toHaveClass('strong');
  });

  it('индикатор не отображается для пустого пароля', () => {
    const { container } = renderRegistrationForm();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const indicator = container.querySelector('.password-strength-bar');
    expect(indicator).not.toBeInTheDocument();
  });

  // --- Валидация ---

  it('при отправке пустой формы отображает alert', async () => {
    renderRegistrationForm();
    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Все поля обязательны!');
    });
  });

  it('при пароле < 6 символов отображает alert о минимальной длине', async () => {
    renderRegistrationForm();

    await userEvent.type(screen.getByPlaceholderText('Ваш никнейм'), 'user');
    await userEvent.type(screen.getByPlaceholderText('user@example.com'), 'u@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), '12345');

    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('6 символов')
      );
    });
  });

  it('при коротком пароле не вызывает apiClient.post', async () => {
    renderRegistrationForm();

    await userEvent.type(screen.getByPlaceholderText('Ваш никнейм'), 'user');
    await userEvent.type(screen.getByPlaceholderText('user@example.com'), 'u@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'abc');

    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });
  });

  // --- Успешная регистрация ---

  it('при успешной регистрации перенаправляет на /profile', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_456',
        role: 'user',
      },
    });

    renderRegistrationForm();

    await userEvent.type(screen.getByPlaceholderText('Ваш никнейм'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('user@example.com'), 'new@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'securepass');

    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  it('при успешной регистрации вызывает /auth/register с правильными данными', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { access_token: 'a', refresh_token: 'r', role: 'user' },
    });

    renderRegistrationForm();

    await userEvent.type(screen.getByPlaceholderText('Ваш никнейм'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('user@example.com'), 'new@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'securepass');

    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        nickname: 'newuser',
        email: 'new@test.com',
        password: 'securepass',
      });
    });
  });

  // --- Ошибка регистрации ---

  it('при ошибке API отображает сообщение из detail', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce({
      response: { data: { detail: 'Пользователь с таким email уже существует' } },
    });

    renderRegistrationForm();

    await userEvent.type(screen.getByPlaceholderText('Ваш никнейм'), 'u');
    await userEvent.type(screen.getByPlaceholderText('user@example.com'), 'exists@test.com');
    await userEvent.type(screen.getByPlaceholderText('Пароль'), 'password123');

    await userEvent.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('уже существует')
      );
    });
  });

  // --- Переключатель видимости пароля ---

  it('переключатель изменяет тип поля пароля', async () => {
    renderRegistrationForm();
    const passwordInput = screen.getByPlaceholderText('Пароль');
    const toggleButton = screen.getByRole('button', { name: /показать пароль/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
