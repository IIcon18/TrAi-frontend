import React, { useEffect, useState } from 'react';
import './Workouts.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import apiClient from '../../api/apiClient';

// Значения должны совпадать с backend enum MuscleGroup:
// upper_body_push | upper_body_pull | core_stability | lower_body
type MuscleGroup = 'upper_body_push' | 'upper_body_pull' | 'core_stability' | 'lower_body';

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

const Workouts: React.FC = () => {
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  // Значение по умолчанию также должно соответствовать enum на бэке
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>('lower_body');
  const [loading, setLoading] = useState(false);

  // Дата
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('default', { month: 'long' });
  const dayName = today.toLocaleString('default', { weekday: 'long' });

  const fetchWorkout = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/workouts/workouts/page');
      if (res.data.workout) {
        setActiveWorkout(res.data.workout);
      } else {
        setActiveWorkout(null);
      }
    } catch (err) {
      console.error(err);
      setActiveWorkout(null);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkout = async (group: MuscleGroup) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/workouts/workouts/generate-ai', {
        muscle_group: group,
      });
      setActiveWorkout(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
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
                <div className="wk-bot-status">
                  <div className="wk-status-dot"></div>
                  <span>Bot status</span>
                </div>
              </div>

              <div className="wk-calendar-card">
                <h3 className="wk-calendar-title">Your Calendar</h3>
                <div className="wk-calendar-wrapper">
                  <div className="wk-calendar-navigation">
                    <button className="wk-nav-button">&lt;</button>
                    <div className="wk-calendar-date-display">
                      <div className="wk-date-day">{dayName}</div>
                      <div className="wk-date-number">{day}</div>
                      <div className="wk-date-month">{month}</div>
                    </div>
                    <button className="wk-nav-button">&gt;</button>
                  </div>
                  <div className="wk-calendar-message">Tomorrow you have rest!</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Workouts;