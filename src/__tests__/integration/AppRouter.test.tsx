/**
 * Интеграционные тесты для AppRouter + PrivateRoute.
 *
 * Покрываемые сценарии:
 * - Неавторизованный пользователь → редирект на /login при доступе к /dashboard
 * - Неавторизованный пользователь → редирект на /login при доступе к /profile
 * - Авторизованный пользователь → доступ к защищённым маршрутам
 * - Не-admin пользователь → редирект на /dashboard при попытке доступа к /admin
 * - Admin пользователь → доступ к /admin
 * - Маршрут / → редирект на /login
 *
 * Стратегия: MemoryRouter с начальным URL + мок AuthContext.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from '../../components/shared/PrivateRoute';
import { AuthContext, AuthState } from '../../contexts/AuthContext';

// Вспомогательная функция для создания мок AuthContext с нужным состоянием
function createAuthContext(overrides: Partial<AuthState> = {}) {
  const state: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    role: 'user',
    isLoading: false,
    ...overrides,
  };

  return {
    state,
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    setTokens: jest.fn(),
  };
}

// Вспомогательный компонент для тестирования маршрутов
function TestApp({
  initialPath,
  authOverrides = {},
}: {
  initialPath: string;
  authOverrides?: Partial<AuthState>;
}) {
  const authValue = createAuthContext(authOverrides);

  return (
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div>Dashboard Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <div>Profile Page</div>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRoles={['admin']}>
                <div>Admin Panel</div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('PrivateRoute — неавторизованный пользователь', () => {
  it('редиректит с /dashboard на /login для неавторизованного пользователя', () => {
    render(<TestApp initialPath="/dashboard" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('редиректит с /profile на /login для неавторизованного пользователя', () => {
    render(<TestApp initialPath="/profile" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('редиректит с /admin на /login для неавторизованного пользователя', () => {
    render(<TestApp initialPath="/admin" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('показывает null во время загрузки (isLoading=true)', () => {
    const { container } = render(
      <TestApp initialPath="/dashboard" authOverrides={{ isLoading: true }} />
    );
    // PrivateRoute возвращает null во время загрузки — контейнер пустой
    expect(container).toBeEmptyDOMElement();
  });
});

describe('PrivateRoute — авторизованный пользователь (роль user)', () => {
  it('разрешает доступ к /dashboard для авторизованного пользователя', () => {
    render(
      <TestApp
        initialPath="/dashboard"
        authOverrides={{ isAuthenticated: true, role: 'user' }}
      />
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('разрешает доступ к /profile для авторизованного пользователя', () => {
    render(
      <TestApp
        initialPath="/profile"
        authOverrides={{ isAuthenticated: true, role: 'user' }}
      />
    );
    expect(screen.getByText('Profile Page')).toBeInTheDocument();
  });

  it('редиректит с /admin на /dashboard для пользователя с ролью user', () => {
    render(
      <TestApp
        initialPath="/admin"
        authOverrides={{ isAuthenticated: true, role: 'user' }}
      />
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('редиректит с /admin на /dashboard для пользователя с ролью pro', () => {
    render(
      <TestApp
        initialPath="/admin"
        authOverrides={{ isAuthenticated: true, role: 'pro' }}
      />
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});

describe('PrivateRoute — admin пользователь', () => {
  it('разрешает доступ к /admin для пользователя с ролью admin', () => {
    render(
      <TestApp
        initialPath="/admin"
        authOverrides={{ isAuthenticated: true, role: 'admin' }}
      />
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('admin может также заходить на /dashboard', () => {
    render(
      <TestApp
        initialPath="/dashboard"
        authOverrides={{ isAuthenticated: true, role: 'admin' }}
      />
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});

describe('AppRouter — публичные маршруты', () => {
  it('/ редиректит на /login', () => {
    render(<TestApp initialPath="/" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('/login доступен без авторизации', () => {
    render(<TestApp initialPath="/login" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('/register доступен без авторизации', () => {
    render(<TestApp initialPath="/register" authOverrides={{ isAuthenticated: false }} />);
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });
});
