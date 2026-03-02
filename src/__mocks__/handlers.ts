/**
 * MSW-обработчики для мокирования API запросов в тестах.
 *
 * Покрывают эндпоинты:
 * - POST /auth/login
 * - POST /auth/register
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET /auth/me
 *
 * Использование: импортировать server.ts в тестах и при необходимости
 * переопределять обработчики через server.use(rest.post(...)) для конкретных сценариев.
 */

import { rest } from 'msw';

const BASE_URL = 'http://localhost:8000/api/v1';

export const handlers = [
  // POST /auth/login — успешный логин
  rest.post(`${BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'bearer',
        role: 'user',
      })
    );
  }),

  // POST /auth/register — успешная регистрация
  rest.post(`${BASE_URL}/auth/register`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        token_type: 'bearer',
        role: 'user',
      })
    );
  }),

  // POST /auth/refresh — успешное обновление токена
  rest.post(`${BASE_URL}/auth/refresh`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        token_type: 'bearer',
        role: 'user',
      })
    );
  }),

  // POST /auth/logout — успешный выход
  rest.post(`${BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // GET /auth/me — текущий пользователь
  rest.get(`${BASE_URL}/auth/me`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'test@example.com',
        nickname: 'tester',
        role: 'user',
        profile_completed: false,
      })
    );
  }),
];
