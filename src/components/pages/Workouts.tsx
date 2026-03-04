import React, { useEffect, useState } from 'react';
import './Workouts.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import AddWorkoutModal from '../shared/AddWorkoutModal';
import WorkoutHistoryList from '../WorkoutHistoryList';
import apiClient from '../../api/apiClient';
import SEOHead from '../SEOHead';
import { ReactComponent as ConfirmIcon } from '../../assets/icons/confirm.svg';
import { ReactComponent as RedoIcon } from '../../assets/icons/free-icon-redo-3185862.svg';
import { ReactComponent as PlusIcon } from '../../assets/icons/free-icon-plus-2549959.svg';

type MuscleGroup = 'upper_body_push' | 'upper_body_pull' | 'core_stability' | 'lower_body';
type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Exercise {
  id: number;
  name: string;
  description: string;
  equipment: string;
  sets: number;
  reps: number;
  weight: number;
  intensity: string;
}

interface Workout {
  id: number;
  name: string;
  muscle_group: MuscleGroup;
  scheduled_at: string;
  completed: boolean;
  exercises: Exercise[];
}

const muscleGroups: { [key in MuscleGroup]: string } = {
  upper_body_push: 'Верхняя часть (толчок)',
  upper_body_pull: 'Верхняя часть (тяга)',
  core_stability: 'Корпус и стабильность',
  lower_body: 'Нижняя часть тела',
};

const dayNames: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Workouts: React.FC = () => {
  // Кеш тренировок по группам мышц
  const [workoutsByGroup, setWorkoutsByGroup] = useState<Partial<Record<MuscleGroup, Workout>>>({});
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>('upper_body_push');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [trainingDays, setTrainingDays] = useState<DayName[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddWorkoutOpen, setIsAddWorkoutOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);
  const [aiUnlimited, setAiUnlimited] = useState(false);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [editingWorkout, setEditingWorkout] = useState<any | null>(null);

  // Exercise technique popup
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const displayDate = selectedDate;
  const day = displayDate.getDate();
  const month = displayDate.toLocaleString('ru-RU', { month: 'long' });
  const dayName = displayDate.toLocaleString('ru-RU', { weekday: 'long' });

  const activeWorkout = workoutsByGroup[selectedGroup] || null;

  const fetchAiUsage = async () => {
    try {
      const res = await apiClient.get('/workouts/ai-usage');
      setAiUnlimited(res.data.unlimited);
      if (!res.data.unlimited) {
        setAiRemaining(res.data.remaining);
      }
    } catch (err: any) {
      console.error('Failed to fetch AI usage:', err);
    }
  };

  const generateWorkout = async (group: MuscleGroup) => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/workouts/generate-ai', {
        muscle_group: group,
      });
      setWorkoutsByGroup(prev => ({ ...prev, [group]: res.data }));
      // Обновляем счётчик AI-использований после генерации
      if (!aiUnlimited) {
        fetchAiUsage();
      }
    } catch (err: any) {
      console.error('Failed to generate workout:', err);
      if (err?.response?.status === 403) {
        const detail = err.response?.data?.detail || 'AI generation limit reached. Upgrade to Pro!';
        alert(detail);
      } else if (err?.response?.status !== 401) {
        alert('Не удалось сгенерировать тренировку. Попробуйте снова.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const fetchTrainingDays = async () => {
    try {
      const res = await apiClient.get('/goals/current');
      if (res.data.training_days) {
        setTrainingDays(res.data.training_days);
      }
    } catch (err: any) {
      console.error('Failed to fetch training days:', err);
    }
  };

  const completeWorkout = async () => {
    if (!activeWorkout || activeWorkout.completed) return;

    setCompleting(true);
    try {
      await apiClient.post(`/workouts/${activeWorkout.id}/complete`);

      // Update the workout in state
      setWorkoutsByGroup(prev => ({
        ...prev,
        [selectedGroup]: {
          ...activeWorkout,
          completed: true
        }
      }));

      alert('🎉 Тренировка завершена! Отличная работа!');
    } catch (err: any) {
      console.error('Failed to complete workout:', err);
      if (err?.response?.status !== 401) {
        alert('Не удалось завершить тренировку. Попробуйте снова.');
      }
    } finally {
      setCompleting(false);
    }
  };

  // При выборе таба — просто переключаем (без авто-генерации)
  const handleSelectGroup = (group: MuscleGroup) => {
    setSelectedGroup(group);
  };

  // Начальная загрузка — только календарь и AI usage, без авто-генерации
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTrainingDays();
      await fetchAiUsage();
      setLoading(false);
    };
    init();
  }, []);

  // Calendar helpers
  const getDayOfWeek = (date: Date): number => {
    const d = date.getDay();
    return d === 0 ? 6 : d - 1;
  };

  const isTrainingDay = (date: Date): boolean => {
    const dayIndex = getDayOfWeek(date);
    return trainingDays.includes(dayNames[dayIndex]);
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const m = date.getMonth();
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const startDayOfWeek = getDayOfWeek(firstDay);
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, m, d));
    return days;
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const isToday = (date: Date): boolean => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const getTomorrowMessage = (): string => {
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isTrainingDay(tomorrow) ? 'Завтра у вас тренировка!' : 'Завтра у вас отдых!';
  };

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); };

  const isLoading = loading || generating;

  return (
    <div className="wk-page">
      <SEOHead
        title="Тренировки"
        description="Управляйте тренировками и упражнениями в TrAi"
        noIndex={true}
      />
      <Header />
      <main className="wk-main">
        <div className="wk-container">
          <div className="wk-content">
            {/* Left Column: Plan or History */}
            <div className="wk-plan-card">
            {viewMode === 'history' ? (
              <WorkoutHistoryList
                onBack={() => setViewMode('current')}
                onEdit={(w) => { setEditingWorkout(w); setViewMode('current'); }}
              />
            ) : (<>
              <h2 className="wk-plan-title">Ваш план!</h2>
              <div className="wk-plan-tabs">
                {(Object.keys(muscleGroups) as MuscleGroup[]).map((group) => (
                  <button
                    key={group}
                    className={`wk-plan-tab ${selectedGroup === group ? 'wk-active' : ''}`}
                    onClick={() => handleSelectGroup(group)}
                    disabled={isLoading}
                  >
                    {muscleGroups[group]}
                  </button>
                ))}
              </div>

              <div className="wk-plan-table">
                <div className="wk-table-header">
                  <div className="wk-header-cell">#</div>
                  <div className="wk-header-cell">Упражнение</div>
                  <div className="wk-header-cell">Подх. x Повт.</div>
                  <div className="wk-header-cell">Вес</div>
                  <div className="wk-header-cell">Нагрузка</div>
                </div>

                {generating ? (
                  <div className="wk-table-row">
                    <div className="wk-cell wk-cell-full">Генерация тренировки...</div>
                  </div>
                ) : activeWorkout && activeWorkout.exercises.length > 0 ? (
                  activeWorkout.exercises.map((ex, idx) => (
                    <div key={ex.id} className="wk-table-row">
                      <div className="wk-cell">{idx + 1}</div>
                      <div className="wk-cell">
                        <span
                          className="wk-exercise-name"
                          onClick={() => setSelectedExercise(ex)}
                          title="Click for technique"
                        >
                          {ex.name}
                          <span className="wk-info-icon">i</span>
                        </span>
                      </div>
                      <div className="wk-cell">
                        <span className="wk-sets-reps">{ex.sets} x {ex.reps}</span>
                      </div>
                      <div className="wk-cell">
                        <div className="wk-weight-badge">{ex.weight > 0 ? `${ex.weight} kg` : 'BW'}</div>
                      </div>
                      <div className="wk-cell">
                        <div
                          className="wk-load-dot"
                          style={{
                            backgroundColor:
                              ex.intensity === 'high' ? '#FF4500' :
                              ex.intensity === 'medium' ? '#FFA500' : '#32CD32'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wk-empty-state">
                    <div className="wk-empty-icon">&#9889;</div>
                    <p className="wk-empty-text">
                      Нажмите <strong>«Сгенерировать тренировку»</strong> для создания персональной тренировки для этой группы мышц
                    </p>
                    {!aiUnlimited && aiRemaining !== null && (
                      <span className="wk-ai-counter-hint">
                        {aiRemaining > 0
                          ? `${aiRemaining}/3 бесплатных ИИ-генераций осталось в этом месяце`
                          : 'Бесплатные ИИ-генерации исчерпаны. Перейдите на Pro!'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="wk-plan-actions">
                {activeWorkout && !activeWorkout.completed && (
                  <button
                    className="wk-action-button wk-complete-workout"
                    onClick={completeWorkout}
                    disabled={isLoading || completing}
                  >
                    <ConfirmIcon className="wk-btn-icon" />
                    {completing ? 'Завершение...' : 'Завершить тренировку'}
                  </button>
                )}
                {activeWorkout && activeWorkout.completed && (
                  <div className="wk-completed-badge">
                    <ConfirmIcon className="wk-btn-icon" />
                    Тренировка завершена!
                  </div>
                )}
                <button
                  className="wk-action-button wk-add-workout"
                  onClick={() => setIsAddWorkoutOpen(true)}
                  disabled={isLoading}
                >
                  <PlusIcon className="wk-btn-icon" />
                  Добавить тренировку
                </button>
                <button
                  className={`wk-action-button wk-generate-new ${!aiUnlimited && aiRemaining !== null && aiRemaining <= 0 ? 'wk-btn-disabled' : ''}`}
                  onClick={() => generateWorkout(selectedGroup)}
                  disabled={generating || (!aiUnlimited && aiRemaining !== null && aiRemaining <= 0)}
                >
                  <RedoIcon className="wk-btn-icon" />
                  {generating ? 'Генерация...' : 'Сгенерировать тренировку'}
                  {!aiUnlimited && aiRemaining !== null && (
                    <span className="wk-ai-counter">{aiRemaining}/3</span>
                  )}
                </button>
              </div>
            </>)}
            </div>

            {/* Right Column */}
            <div className="wk-right-column">
              <div className="wk-actions-card">
                <h3 className="wk-actions-title">История тренировок</h3>
                <div className="wk-actions-buttons">
                  <button
                    className="wk-action-button wk-open-statistic"
                    onClick={() => setViewMode(viewMode === 'history' ? 'current' : 'history')}
                  >
                    <PlusIcon className="wk-btn-icon" />
                    {viewMode === 'history' ? '← К плану' : 'История →'}
                  </button>
                </div>
                <div className="bot-status bot-status--dev">
                  <div className="status-dot"></div>
                  <span>Бот в разработке</span>
                </div>
              </div>

              <div className="wk-calendar-card">
                <h3 className="wk-calendar-title">Ваш календарь</h3>
                <div className="wk-calendar-swipe-container">
                  <button className="wk-calendar-arrow wk-calendar-arrow-left" onClick={prevDay}>&#8249;</button>
                  <div
                    className={`wk-calendar-date-card ${isTrainingDay(selectedDate) ? 'wk-training-day' : 'wk-rest-day'}`}
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <div className="wk-date-day">{dayName}</div>
                    <div className="wk-date-number">{day}</div>
                    <div className="wk-date-month">{month}</div>
                  </div>
                  <button className="wk-calendar-arrow wk-calendar-arrow-right" onClick={nextDay}>&#8250;</button>
                </div>
                <div className="wk-calendar-message">{getTomorrowMessage()}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Exercise Technique Popup */}
      {selectedExercise && (
        <div className="wk-technique-backdrop" onClick={() => setSelectedExercise(null)}>
          <div className="wk-technique-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wk-technique-header">
              <h3>{selectedExercise.name}</h3>
              <button className="wk-technique-close" onClick={() => setSelectedExercise(null)}>&times;</button>
            </div>
            <div className="wk-technique-body">
              <div className="wk-technique-section">
                <h4>Техника</h4>
                <p>{selectedExercise.description || 'Описание отсутствует.'}</p>
              </div>
              <div className="wk-technique-details">
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Инвентарь</span>
                  <span className="wk-detail-value">
                    {selectedExercise.equipment === 'bodyweight' ? 'Без инвентаря' :
                     selectedExercise.equipment === 'dumbbells' ? 'Гантели' :
                     selectedExercise.equipment === 'barbell' ? 'Штанга' :
                     selectedExercise.equipment === 'resistance_band' ? 'Резинка' :
                     'Без оборудования'}
                  </span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Подх. x Повт.</span>
                  <span className="wk-detail-value">{selectedExercise.sets} x {selectedExercise.reps}</span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Вес</span>
                  <span className="wk-detail-value">{selectedExercise.weight > 0 ? `${selectedExercise.weight} кг` : 'Без инвентаря'}</span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Интенсивность</span>
                  <span className={`wk-detail-value wk-intensity-${selectedExercise.intensity}`}>
                    {selectedExercise.intensity === 'high' ? 'Высокая' :
                     selectedExercise.intensity === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="wk-calendar-modal-backdrop" onClick={() => setIsCalendarOpen(false)}>
          <div className="wk-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wk-calendar-modal-header">
              <h2>Календарь тренировок</h2>
              <button className="wk-calendar-close" onClick={() => setIsCalendarOpen(false)}>&times;</button>
            </div>
            <div className="wk-calendar-modal-nav">
              <button className="wk-nav-button" onClick={prevMonth}>&lt;</button>
              <span className="wk-calendar-month-title">
                {currentMonth.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
              </span>
              <button className="wk-nav-button" onClick={nextMonth}>&gt;</button>
            </div>
            <div className="wk-calendar-grid">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <div key={d} className="wk-calendar-day-header">{d}</div>
              ))}
              {getMonthDays(currentMonth).map((date, idx) => (
                <div
                  key={idx}
                  className={`wk-calendar-day ${
                    date === null ? 'wk-calendar-day-empty'
                      : isTrainingDay(date) ? 'wk-calendar-day-training' : 'wk-calendar-day-rest'
                  } ${date && isToday(date) ? 'wk-calendar-day-today' : ''}`}
                >
                  {date ? date.getDate() : ''}
                </div>
              ))}
            </div>
            <div className="wk-calendar-legend">
              <div className="wk-legend-item">
                <div className="wk-legend-color wk-legend-training"></div>
                <span>День тренировки</span>
              </div>
              <div className="wk-legend-item">
                <div className="wk-legend-color wk-legend-rest"></div>
                <span>День отдыха</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddWorkoutModal
        isOpen={isAddWorkoutOpen || !!editingWorkout}
        onClose={() => { setIsAddWorkoutOpen(false); setEditingWorkout(null); }}
        editWorkout={editingWorkout}
        onWorkoutAdded={() => {
          // Ручная тренировка добавлена — не генерируем AI
        }}
      />

      <Footer />
    </div>
  );
};

export default Workouts;