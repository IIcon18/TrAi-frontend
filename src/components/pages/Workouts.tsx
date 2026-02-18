import React, { useEffect, useState } from 'react';
import './Workouts.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import AddWorkoutModal from '../shared/AddWorkoutModal';
import apiClient from '../../api/apiClient';
import { isPro } from '../../utils/auth';
import { ReactComponent as ConfirmIcon } from '../../assets/icons/confirm.svg';
import { ReactComponent as RedoIcon } from '../../assets/icons/free-icon-redo-3185862.svg';
import { ReactComponent as PlusIcon } from '../../assets/icons/free-icon-plus-2549959.svg';
import { ReactComponent as GraphIcon } from '../../assets/icons/free-icon-graph-2567990.svg';
import { ReactComponent as DartboardIcon } from '../../assets/icons/free-icon-dartboard-1654809.svg';

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
  upper_body_push: 'Upper body push',
  upper_body_pull: 'Upper body pull',
  core_stability: 'Core & stability',
  lower_body: 'Lower body',
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

  // Exercise technique popup
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const displayDate = selectedDate;
  const day = displayDate.getDate();
  const month = displayDate.toLocaleString('default', { month: 'long' });
  const dayName = displayDate.toLocaleString('default', { weekday: 'long' });

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
        alert('Failed to generate workout. Try again.');
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

      alert('🎉 Workout completed! Great job!');
    } catch (err: any) {
      console.error('Failed to complete workout:', err);
      if (err?.response?.status !== 401) {
        alert('Failed to complete workout. Try again.');
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
    return isTrainingDay(tomorrow) ? 'Tomorrow you have workout!' : 'Tomorrow you have rest!';
  };

  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); };

  const isLoading = loading || generating;

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
                  <div className="wk-header-cell">Exercise</div>
                  <div className="wk-header-cell">Sets x Reps</div>
                  <div className="wk-header-cell">Weight</div>
                  <div className="wk-header-cell">Load</div>
                </div>

                {generating ? (
                  <div className="wk-table-row">
                    <div className="wk-cell wk-cell-full">Generating workout...</div>
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
                      Click <strong>"Generate AI Workout"</strong> to create a personalized workout for this muscle group
                    </p>
                    {!aiUnlimited && aiRemaining !== null && (
                      <span className="wk-ai-counter-hint">
                        {aiRemaining > 0
                          ? `${aiRemaining}/3 free AI generations left this month`
                          : 'Free AI generations used up. Upgrade to Pro!'}
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
                    {completing ? 'Completing...' : 'Complete Workout'}
                  </button>
                )}
                {activeWorkout && activeWorkout.completed && (
                  <div className="wk-completed-badge">
                    <ConfirmIcon className="wk-btn-icon" />
                    Workout Completed!
                  </div>
                )}
                <button
                  className="wk-action-button wk-add-workout"
                  onClick={() => setIsAddWorkoutOpen(true)}
                  disabled={isLoading}
                >
                  <PlusIcon className="wk-btn-icon" />
                  Add Workout
                </button>
                <button
                  className={`wk-action-button wk-generate-new ${!aiUnlimited && aiRemaining !== null && aiRemaining <= 0 ? 'wk-btn-disabled' : ''}`}
                  onClick={() => generateWorkout(selectedGroup)}
                  disabled={generating || (!aiUnlimited && aiRemaining !== null && aiRemaining <= 0)}
                >
                  <RedoIcon className="wk-btn-icon" />
                  {generating ? 'Generating...' : 'Generate AI Workout'}
                  {!aiUnlimited && aiRemaining !== null && (
                    <span className="wk-ai-counter">{aiRemaining}/3</span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="wk-right-column">
              <div className="wk-actions-card">
                <h3 className="wk-actions-title">Actions</h3>
                <div className="wk-actions-buttons">
                  <button className="wk-action-button wk-open-statistic" onClick={() => window.location.href = '/progress'}>
                    <GraphIcon className="wk-btn-icon" />
                    Open statistic
                  </button>
                  <button className="wk-action-button wk-change-goal" onClick={() => window.location.href = '/dashboard'}>
                    <DartboardIcon className="wk-btn-icon" />
                    Change goal
                  </button>
                </div>
                <div className="bot-status bot-status--dev">
                  <div className="status-dot"></div>
                  <span>Bot in development</span>
                </div>
              </div>

              <div className="wk-calendar-card">
                <h3 className="wk-calendar-title">Your Calendar</h3>
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
                <h4>Technique</h4>
                <p>{selectedExercise.description || 'No description available.'}</p>
              </div>
              <div className="wk-technique-details">
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Equipment</span>
                  <span className="wk-detail-value">
                    {selectedExercise.equipment === 'bodyweight' ? 'Bodyweight' :
                     selectedExercise.equipment === 'dumbbells' ? 'Dumbbells' :
                     selectedExercise.equipment === 'barbell' ? 'Barbell' :
                     selectedExercise.equipment === 'resistance_band' ? 'Resistance band' :
                     'None'}
                  </span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Sets x Reps</span>
                  <span className="wk-detail-value">{selectedExercise.sets} x {selectedExercise.reps}</span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Weight</span>
                  <span className="wk-detail-value">{selectedExercise.weight > 0 ? `${selectedExercise.weight} kg` : 'Bodyweight'}</span>
                </div>
                <div className="wk-technique-detail">
                  <span className="wk-detail-label">Intensity</span>
                  <span className={`wk-detail-value wk-intensity-${selectedExercise.intensity}`}>
                    {selectedExercise.intensity === 'high' ? 'High' :
                     selectedExercise.intensity === 'medium' ? 'Medium' : 'Low'}
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
              <h2>Training Calendar</h2>
              <button className="wk-calendar-close" onClick={() => setIsCalendarOpen(false)}>&times;</button>
            </div>
            <div className="wk-calendar-modal-nav">
              <button className="wk-nav-button" onClick={prevMonth}>&lt;</button>
              <span className="wk-calendar-month-title">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button className="wk-nav-button" onClick={nextMonth}>&gt;</button>
            </div>
            <div className="wk-calendar-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
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

      <AddWorkoutModal
        isOpen={isAddWorkoutOpen}
        onClose={() => setIsAddWorkoutOpen(false)}
        onWorkoutAdded={() => {
          // Ручная тренировка добавлена — не генерируем AI
        }}
      />

      <Footer />
    </div>
  );
};

export default Workouts;