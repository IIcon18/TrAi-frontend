/**
 * Unit tests для компонента AddMealModal.
 *
 * Покрываемые сценарии:
 * - Рендеринг: не рендерится при isOpen=false, список типов питания при isOpen=true
 * - Состояние загрузки при выборе типа питания
 * - Graceful degradation: ошибка create-meal не крашит компонент
 * - Переход на шаг поиска после успешного выбора типа питания
 * - Состояние загрузки во время поиска
 * - "Ничего не найдено" при пустых результатах
 * - Ошибка при недоступности search API (graceful degradation)
 * - Отображение результатов с источником данных
 *
 * Задание 3.2 (Lab 5): тесты пользовательских сценариев и состояний ошибок.
 * Задание 4.5 (Lab 5): проверка корректной обработки отказов стороннего API.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddMealModal from '../../../components/shared/AddMealModal';
import apiClient from '../../../api/apiClient';

// Мок apiClient — перехватываем все HTTP-запросы компонента
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

// Мок CSS — CRA обрабатывает его автоматически, но явный мок устраняет возможные ошибки
jest.mock('../../../components/shared/AddMealModal.css', () => ({}), { virtual: true });

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onMealAdded: jest.fn(),
};

// ---------------------------------------------------------------------------
// Рендеринг
// ---------------------------------------------------------------------------

describe('AddMealModal — рендеринг', () => {
  it('не рендерится когда isOpen=false', () => {
    render(<AddMealModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText('Добавить приём пищи')).toBeNull();
  });

  it('отображает заголовок и список типов питания при isOpen=true', () => {
    render(<AddMealModal {...defaultProps} />);
    expect(screen.getByText('Добавить приём пищи')).toBeInTheDocument();
    expect(screen.getByText('Завтрак')).toBeInTheDocument();
    expect(screen.getByText('Обед')).toBeInTheDocument();
    expect(screen.getByText('Ужин')).toBeInTheDocument();
    expect(screen.getByText('Перекус')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Выбор типа питания
// ---------------------------------------------------------------------------

describe('AddMealModal — выбор типа питания', () => {
  it('переходит на шаг поиска после успешного выбора типа', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, type: 'breakfast', eaten_at: new Date().toISOString(), dishes: [] },
    });

    render(<AddMealModal {...defaultProps} />);

    await userEvent.click(screen.getByText('Завтрак'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Поиск блюда...')).toBeInTheDocument();
    });
  });

  it('показывает ошибку если create-meal API недоступен — graceful degradation', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<AddMealModal {...defaultProps} />);

    await userEvent.click(screen.getByText('Завтрак'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create meal')).toBeInTheDocument();
    });
    // Компонент остаётся на шаге выбора, не крашится
    expect(screen.getByText('Добавить приём пищи')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Поиск блюд
// ---------------------------------------------------------------------------

describe('AddMealModal — поиск блюд', () => {
  beforeEach(async () => {
    // create-meal успешен — переходим на шаг поиска
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 1, type: 'breakfast', dishes: [] },
    });

    render(<AddMealModal {...defaultProps} />);
    await userEvent.click(screen.getByText('Завтрак'));
    await waitFor(() => screen.getByPlaceholderText('Поиск блюда...'));
  });

  it('показывает состояние загрузки во время поиска', async () => {
    // search зависает — симулируем долгий запрос
    let resolveSearch: (value: any) => void;
    const pendingSearch = new Promise((res) => {
      resolveSearch = res;
    });
    (mockApiClient.post as jest.Mock).mockReturnValueOnce(pendingSearch);

    await userEvent.type(screen.getByPlaceholderText('Поиск блюда...'), 'банан');
    await userEvent.click(screen.getByText('🔍'));

    expect(screen.getByText('Поиск...')).toBeInTheDocument();

    // Разрешаем промис, чтобы не было утечки
    resolveSearch!({ data: { results: [], total_count: 0, source: '' } });
  });

  it('показывает "Ничего не найдено" при пустых результатах', async () => {
    // search → пусто, analyze → тоже ошибка
    (mockApiClient.post as jest.Mock)
      .mockResolvedValueOnce({ data: { results: [], total_count: 0, source: '' } })
      .mockRejectedValueOnce(new Error('AI unavailable'));

    await userEvent.type(screen.getByPlaceholderText('Поиск блюда...'), 'несуществующее');
    await userEvent.click(screen.getByText('🔍'));

    await waitFor(() => {
      expect(screen.getByText(/Ничего не найдено/)).toBeInTheDocument();
    });
  });

  it('показывает ошибку при сетевой ошибке search API — graceful degradation', async () => {
    (mockApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await userEvent.type(screen.getByPlaceholderText('Поиск блюда...'), 'банан');
    await userEvent.click(screen.getByText('🔍'));

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
    // Компонент не упал — поле поиска всё ещё доступно
    expect(screen.getByPlaceholderText('Поиск блюда...')).toBeInTheDocument();
  });

  it('отображает результаты поиска с источником данных из БД', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
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
      },
    });

    await userEvent.type(screen.getByPlaceholderText('Поиск блюда...'), 'банан');
    await userEvent.click(screen.getByText('🔍'));

    await waitFor(() => {
      expect(screen.getByText('Банан')).toBeInTheDocument();
      expect(screen.getByText('Источник: база данных TrAi')).toBeInTheDocument();
    });
  });

  it('отображает результаты с источником OpenFoodFacts', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 0,
            name: 'Банан (Chiquita)',
            calories_per_100g: 89,
            protein_per_100g: 1.1,
            fat_per_100g: 0.3,
            carbs_per_100g: 22.8,
          },
        ],
        total_count: 1,
        source: 'openfoodfacts',
      },
    });

    await userEvent.type(screen.getByPlaceholderText('Поиск блюда...'), 'банан');
    await userEvent.click(screen.getByText('🔍'));

    await waitFor(() => {
      expect(screen.getByText('Источник: OpenFoodFacts')).toBeInTheDocument();
    });
  });

  it('поиск по Enter работает так же как по клику на иконку', async () => {
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { results: [], total_count: 0, source: '' },
    });

    const input = screen.getByPlaceholderText('Поиск блюда...');
    await userEvent.type(input, 'банан{enter}');

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/dishes/search',
        expect.objectContaining({ query: 'банан' })
      );
    });
  });
});
