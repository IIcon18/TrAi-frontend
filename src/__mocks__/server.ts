/**
 * MSW Node.js сервер для тестов.
 * Перехватывает HTTP-запросы на уровне Node.js без браузера.
 *
 * Использование в тестах:
 *   import { server } from '../../__mocks__/server';
 *
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 *
 * Для переопределения поведения в конкретном тесте:
 *   server.use(
 *     rest.post('http://localhost:8000/api/v1/auth/login', (req, res, ctx) =>
 *       res(ctx.status(401), ctx.json({ detail: 'Неверные данные' }))
 *     )
 *   );
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
