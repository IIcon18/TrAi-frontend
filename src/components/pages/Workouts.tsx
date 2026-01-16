import React, { useEffect, useState } from 'react';
import './Workouts.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import apiClient from '../../api/apiClient';

// Значения должны совпадать с backend enum MuscleGroup:
// upper_body_push | upper_body_pull | core_stability | lower_body
type MuscleGroup = 'upper_body_push' | 'upper_body_pull' | 'core_stability' | 'lower_body';
type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Exercise {
  id: number;
  name: string;
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
  upper_body_push: 'Upper body push',
  upper_body_pull: 'Upper body pull',
  core_stability: 'Core & stability',
  lower_body: 'Lower body',
};

const dayNames: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Workouts: React.FC = () => {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  // Значение по умолчанию также должно соответствовать enum на бэке
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>('lower_body');
  const [loading, setLoading] = useState(true); // Начальное состояние - загрузка
  const [trainingDays, setTrainingDays] = useState<DayName[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Дата
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const dayName = today.toLocaleString('default', { weekday: 'long' });

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/workouts/page');
      if (res.data.workout) {
        setActiveWorkout(res.data.workout);
      } else {
        setActiveWorkout(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch workout:', err);
      setActiveWorkout(null);
      // Если ошибка 401, apiClient уже перенаправит на логин
      if (err?.response?.status !== 401) {
        // Для других ошибок можно показать уведомление
      }
    } finally {
      setLoading(false);
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

  // Получить день недели для даты (0 = Monday, 6 = Sunday)
  const getDayOfWeek = (date: Date): number => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Преобразуем: Вс=6, Пн=0, Вт=1...
  };

  // Проверить является ли дата тренировочным днём
  const isTrainingDay = (date: Date): boolean => {
    const dayIndex = getDayOfWeek(date);
    const dayName = dayNames[dayIndex];
    return trainingDays.includes(dayName);
  };

  // Получить дни месяца для отображения в календаре
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = getDayOfWeek(firstDay);

    const days: (Date | null)[] = [];

    // Добавляем пустые ячейки для дней до начала месяца
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Добавляем дни месяца
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  // Навигация по месяцам
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Проверить является ли дата сегодняшней
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Получить сообщение о завтрашнем дне
  const getTomorrowMessage = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isTrainingDay(tomorrow) ? 'Tomorrow is training day!' : 'Tomorrow you have rest!';
  };

  const generateWorkout = async (group: MuscleGroup) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/workouts/generate-ai', {
        muscle_group: group,
      });
      setActiveWorkout(res.data);
    } catch (err: any) {
      console.error('Failed to generate workout:', err);
      // Если ошибка 401, apiClient уже перенаправит на логин
      if (err?.response?.status !== 401) {
        alert('Не удалось сгенерировать тренировку. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
    fetchTrainingDays();
  }, []);

  return (
    <div className="wk-page">
      <Header />
      <main className="wk-main">
        <div className="wk-container">
          <div className="wk-content">
            {/* Left Column: Plan */}
            <div className="wk-plan-card">
              <h2 className="wk-plan-title">Your Plan!</h2>
              <div className="wk-plan-tabs">
                {(Object.keys(muscleGroups) as MuscleGroup[]).map((group) => (
                  <button
                    key={group}
                    className={`wk-plan-tab ${selectedGroup === group ? 'wk-active' : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    {muscleGroups[group]}
                  </button>
                ))}
              </div>

              <div className="wk-plan-table">
                <div className="wk-table-header">
                  <div className="wk-header-cell">Number</div>
                  <div className="wk-header-cell">Exercises</div>
                  <div className="wk-header-cell">Your work weight</div>
                  <div className="wk-header-cell">Load</div>
                </div>

                {loading ? (
                  <div className="wk-table-row">
                    <div className="wk-cell wk-cell-full">Loading...</div>
                  </div>
                ) : activeWorkout && activeWorkout.exercises.length > 0 ? (
                  activeWorkout.exercises.map((ex, idx) => (
                    <div key={ex.id} className="wk-table-row">
                      <div className="wk-cell">{idx + 1}:</div>
                      <div className="wk-cell">{ex.name}</div>
                      <div className="wk-cell">
                        <div className="wk-weight-badge">{ex.weight}kg</div>
                      </div>
                      <div className="wk-cell">
                        <div
                          className="wk-load-dot"
                          style={{ backgroundColor: ex.intensity === 'high' ? '#FF4500' : '#32CD32' }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wk-table-row">
                    <div className="wk-cell wk-cell-full">No active workout</div>
                  </div>
                )}
              </div>

              <div className="wk-plan-actions">
                <button className="wk-action-button wk-end-workout" onClick={() => alert('End workout')}>
                  ✓ End workout
                </button>
                <button
                  className="wk-action-button wk-generate-new"
                  onClick={() => generateWorkout(selectedGroup)}
                >
                  🔄 Generate new
                </button>
                <button className="wk-action-button wk-add-workout" onClick={() => alert('Add your workout')}>
                  + Add your workout
                </button>
              </div>
            </div>

            {/* Right Column: Calendar + Actions */}
            <div className="wk-right-column">
              <div className="wk-actions-card">
                <h3 className="wk-actions-title">Actions</h3>
                <div className="wk-actions-buttons">
                  <button className="wk-action-button wk-open-statistic" onClick={() => alert('Open statistics')}>
                    📊 Open statistic
                  </button>
                  <button className="wk-action-button wk-change-goal" onClick={() => alert('Change goal')}>
                    🎯 Change goal
                  </button>
                </div>
                <div className="bot-status bot-status--dev">
                  <div className="status-dot"></div>
                  <span>Бот в разработке</span>
                </div>
              </div>

              <div
                className={`wk-calendar-card wk-calendar-clickable ${isTrainingDay(today) ? 'wk-training-day' : 'wk-rest-day'}`}
                onClick={() => setIsCalendarOpen(true)}
              >
                <h3 className="wk-calendar-title">Your Calendar</h3>
                <div className="wk-calendar-wrapper">
                  <div className="wk-calendar-date-display">
                    <div className="wk-date-day">{dayName}</div>
                    <div className="wk-date-number">{day}</div>
                    <div className="wk-date-month">{month}</div>
                  </div>
                  <div className="wk-calendar-message">{getTomorrowMessage()}</div>
                  <div className="wk-calendar-hint">Click to view full calendar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="wk-calendar-modal-backdrop" onClick={() => setIsCalendarOpen(false)}>
          <div className="wk-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wk-calendar-modal-header">
              <h2>Training Calendar</h2>
              <button className="wk-calendar-close" onClick={() => setIsCalendarOpen(false)}>
                &times;
              </button>
            </div>

            <div className="wk-calendar-modal-nav">
              <button className="wk-nav-button" onClick={prevMonth}>&lt;</button>
              <span className="wk-calendar-month-title">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button className="wk-nav-button" onClick={nextMonth}>&gt;</button>
            </div>

            <div className="wk-calendar-grid">
              {/* Заголовки дней недели */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="wk-calendar-day-header">{d}</div>
              ))}

              {/* Дни месяца */}
              {getMonthDays(currentMonth).map((date, idx) => (
                <div
                  key={idx}
                  className={`wk-calendar-day ${
                    date === null
                      ? 'wk-calendar-day-empty'
                      : isTrainingDay(date)
                        ? 'wk-calendar-day-training'
                        : 'wk-calendar-day-rest'
                  } ${date && isToday(date) ? 'wk-calendar-day-today' : ''}`}
                >
                  {date ? date.getDate() : ''}
                </div>
              ))}
            </div>

            <div className="wk-calendar-legend">
              <div className="wk-legend-item">
                <div className="wk-legend-color wk-legend-training"></div>
                <span>Training day</span>
              </div>
              <div className="wk-legend-item">
                <div className="wk-legend-color wk-legend-rest"></div>
                <span>Rest day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Workouts;