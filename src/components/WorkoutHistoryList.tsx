// src/components/WorkoutHistoryList.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import './WorkoutHistoryList.css';

interface WorkoutItem {
  id: number;
  name: string;
  muscle_group: string | null;
  difficulty: string | null;
  scheduled_at: string;
  completed: boolean;
  ai_generated: boolean;
  total_weight_lifted: number;
}

interface WorkoutListResponse {
  items: WorkoutItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  upper_body_push: 'Верхняя часть (толчок)',
  upper_body_pull: 'Верхняя часть (тяга)',
  core_stability: 'Корпус и стабильность',
  lower_body: 'Нижняя часть тела',
};

interface WorkoutHistoryListProps {
  onBack: () => void;
  onEdit: (workout: WorkoutItem) => void;
}

const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ onBack, onEdit }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<WorkoutListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  // Read filters from URL
  const search = searchParams.get('search') || '';
  const muscleGroup = searchParams.get('muscle_group') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const completed = searchParams.get('completed') || '';
  const sortBy = searchParams.get('sort_by') || 'scheduled_at';
  const sortOrder = searchParams.get('sort_order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), page_size: '10', sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      if (muscleGroup) params.muscle_group = muscleGroup;
      if (difficulty) params.difficulty = difficulty;
      if (completed !== '') params.completed = completed;

      const res = await apiClient.get<WorkoutListResponse>('/workouts/list', { params });
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [search, muscleGroup, difficulty, completed, sortBy, sortOrder, page]);

  useEffect(() => { fetchWorkouts(); }, [fetchWorkouts]);

  const handleComplete = async (id: number) => {
    setCompletingId(id);
    try {
      await apiClient.post(`/workouts/${id}/complete`);
      fetchWorkouts();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Не удалось завершить тренировку');
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить эту тренировку?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/workouts/${id}`);
      fetchWorkouts();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Не удалось удалить тренировку');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSort = (col: string) => {
    const next = new URLSearchParams(searchParams);
    if (sortBy === col) {
      next.set('sort_order', sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      next.set('sort_by', col);
      next.set('sort_order', 'desc');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const SortArrow = ({ col }: { col: string }) => {
    if (sortBy !== col) return <span className="wh-sort-arrow wh-sort-neutral">↕</span>;
    return <span className="wh-sort-arrow wh-sort-active">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="wh-container">
      {/* Header */}
      <div className="wh-header">
        <button className="wh-back-btn" onClick={onBack}>← К плану</button>
        <h2 className="wh-title">История тренировок</h2>
      </div>

      {/* Filter bar */}
      <div className="wh-filters">
        <input
          className="wh-search"
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setParam('search', e.target.value)}
        />
        <select className="wh-select" value={muscleGroup} onChange={(e) => setParam('muscle_group', e.target.value)}>
          <option value="">Все мышцы</option>
          {Object.entries(MUSCLE_GROUP_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select className="wh-select" value={difficulty} onChange={(e) => setParam('difficulty', e.target.value)}>
          <option value="">Любая сложность</option>
          <option value="easy">Лёгкая</option>
          <option value="medium">Средняя</option>
          <option value="hard">Тяжёлая</option>
        </select>
        <label className="wh-checkbox-label">
          <input
            type="checkbox"
            checked={completed === 'true'}
            onChange={(e) => setParam('completed', e.target.checked ? 'true' : '')}
          />
          Только завершённые
        </label>
        {(search || muscleGroup || difficulty || completed) && (
          <button className="wh-reset-btn" onClick={() => setSearchParams({ page: '1' })}>Сбросить</button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="wh-loading">Загрузка...</p>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="wh-table">
            <div className="wh-table-head">
              <span className="wh-th wh-th-name wh-sortable" onClick={() => toggleSort('name')}>
                Название <SortArrow col="name" />
              </span>
              <span className="wh-th">Мышцы</span>
              <span className="wh-th wh-sortable" onClick={() => toggleSort('difficulty')}>
                Сложность <SortArrow col="difficulty" />
              </span>
              <span className="wh-th wh-sortable" onClick={() => toggleSort('scheduled_at')}>
                Дата <SortArrow col="scheduled_at" />
              </span>
              <span className="wh-th">Статус</span>
              <span className="wh-th">Действия</span>
            </div>
            {data.items.map((w) => (
              <div key={w.id} className="wh-table-row">
                <span className="wh-td wh-td-name">
                  {w.name}
                  {w.ai_generated && <span className="wh-ai-badge">AI</span>}
                </span>
                <span className="wh-td">{MUSCLE_GROUP_LABELS[w.muscle_group || ''] || w.muscle_group || '—'}</span>
                <span className="wh-td">{w.difficulty || '—'}</span>
                <span className="wh-td">{new Date(w.scheduled_at).toLocaleDateString()}</span>
                <span className="wh-td">
                  {w.completed
                    ? <span className="wh-status-done">✓ Выполнено</span>
                    : <span className="wh-status-pending">В ожидании</span>}
                </span>
                <span className="wh-td wh-actions-cell">
                  {!w.completed && (
                    <button
                      className="wh-btn-done"
                      onClick={() => handleComplete(w.id)}
                      disabled={completingId === w.id}
                      title="Mark as done"
                    >
                      {completingId === w.id ? '...' : '✓'}
                    </button>
                  )}
                  <button className="wh-btn-edit" onClick={() => onEdit(w)}>Ред.</button>
                  <button
                    className="wh-btn-delete"
                    onClick={() => handleDelete(w.id)}
                    disabled={deletingId === w.id}
                  >
                    {deletingId === w.id ? '...' : 'Удал.'}
                  </button>
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="wh-pagination">
            <button
              className="wh-page-btn"
              disabled={page <= 1}
              onClick={() => setParam('page', String(page - 1))}
            >
              ‹ Назад
            </button>
            <span className="wh-page-info">{page} / {data.pages}</span>
            <button
              className="wh-page-btn"
              disabled={page >= data.pages}
              onClick={() => setParam('page', String(page + 1))}
            >
              Вперёд ›
            </button>
          </div>
        </>
      ) : (
        <p className="wh-empty">Тренировки не найдены. Измените фильтры.</p>
      )}
    </div>
  );
};

export default WorkoutHistoryList;
