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

  // POST /dishes/create-meal — создание приёма пищи
  rest.post(`${BASE_URL}/dishes/create-meal`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        user_id: 1,
        type: 'breakfast',
        eaten_at: new Date().toISOString(),
        dishes: [],
      })
    );
  }),

  // POST /dishes/search — поиск блюд (результат из БД)
  rest.post(`${BASE_URL}/dishes/search`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        query: 'банан',
        results: [
          {
            id: 1,
            name: 'Банан',
            calories_per_100g: 89,
            protein_per_100g: 1.1,
            fat_per_100g: 0.3,
            carbs_per_100g: 22.8,
          },
        ],
        total_count: 1,
        source: 'database',
      })
    );
  }),

  // POST /dishes/analyze — AI-анализ блюда
  rest.post(`${BASE_URL}/dishes/analyze`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        dish_name: 'банан',
        grams: 100,
        nutrition: {
          calories: 89,
          protein: 1.1,
          fat: 0.3,
          carbs: 22.8,
        },
        source: 'ai',
      })
    );
  }),

  // POST /dishes/add-to-meal/:meal_id — добавление блюда в приём пищи
  rest.post(`${BASE_URL}/dishes/add-to-meal/:mealId`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        meal_id: 1,
        name: 'Банан',
        grams: 100,
        calories: 89,
        protein: 1.1,
        fat: 0.3,
        carbs: 22.8,
      })
    );
  }),
];
