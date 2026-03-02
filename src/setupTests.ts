// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Мокирование localStorage
const localStorageMock: Storage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Сброс localStorage перед каждым тестом
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// Мокирование window.alert (используется в компонентах для уведомлений об ошибках)
window.alert = jest.fn();

// SVG-файлы обрабатываются CRA через fileTransform.js (возвращает имя файла).
// Дополнительные моки задаются в отдельных тест-файлах через jest.mock().
