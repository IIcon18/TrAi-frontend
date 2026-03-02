/**
 * Модульные тесты для src/utils/auth.ts
 *
 * Покрываемые функции:
 * - getUserRole(): чтение из localStorage, обработка unknown значений
 * - isAdmin(): проверка роли admin
 * - isPro(): проверка ролей pro и admin
 */

import { getUserRole, isAdmin, isPro } from '../../../utils/auth';

describe('getUserRole', () => {
  it('возвращает "user" если localStorage пуст', () => {
    expect(getUserRole()).toBe('user');
  });

  it('возвращает "admin" если user_role=admin в localStorage', () => {
    localStorage.setItem('user_role', 'admin');
    expect(getUserRole()).toBe('admin');
  });

  it('возвращает "pro" если user_role=pro в localStorage', () => {
    localStorage.setItem('user_role', 'pro');
    expect(getUserRole()).toBe('pro');
  });

  it('возвращает "user" для неизвестного значения роли', () => {
    localStorage.setItem('user_role', 'superadmin');
    expect(getUserRole()).toBe('user');
  });

  it('возвращает "user" если user_role=null', () => {
    localStorage.removeItem('user_role');
    expect(getUserRole()).toBe('user');
  });

  it('возвращает "user" для пустой строки', () => {
    localStorage.setItem('user_role', '');
    expect(getUserRole()).toBe('user');
  });
});

describe('isAdmin', () => {
  it('возвращает true только для роли admin', () => {
    localStorage.setItem('user_role', 'admin');
    expect(isAdmin()).toBe(true);
  });

  it('возвращает false для роли pro', () => {
    localStorage.setItem('user_role', 'pro');
    expect(isAdmin()).toBe(false);
  });

  it('возвращает false для роли user', () => {
    localStorage.setItem('user_role', 'user');
    expect(isAdmin()).toBe(false);
  });

  it('возвращает false если localStorage пуст', () => {
    expect(isAdmin()).toBe(false);
  });
});

describe('isPro', () => {
  it('возвращает true для роли pro', () => {
    localStorage.setItem('user_role', 'pro');
    expect(isPro()).toBe(true);
  });

  it('возвращает true для роли admin', () => {
    localStorage.setItem('user_role', 'admin');
    expect(isPro()).toBe(true);
  });

  it('возвращает false для роли user', () => {
    localStorage.setItem('user_role', 'user');
    expect(isPro()).toBe(false);
  });

  it('возвращает false если localStorage пуст', () => {
    expect(isPro()).toBe(false);
  });
});
