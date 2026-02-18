// src/components/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import CircularProgress from '../shared/CircularProgress';
import AddMealModal from '../shared/AddMealModal';
import ChangeGoalModal from '../shared/ChangeGoalModal';
import apiClient from '../../api/apiClient';
import { isPro } from '../../utils/auth';
import type { DashboardResponse } from '../../types/dashboard';
import { ReactComponent as GraphIcon } from '../../assets/icons/free-icon-graph-2567990.svg';
import { ReactComponent as DartboardIcon } from '../../assets/icons/free-icon-dartboard-1654809.svg';
import { ReactComponent as PlayIcon } from '../../assets/icons/free-icon-play-button-153770_1.svg';

// Функция для создания плавных кривых Безье с учетом соседних точек
const createSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let path = `M ${points[0].x},${points[0].y}`;

  // Параметр сглаживания (0-1, где 0 - прямые линии, 1 - максимальное сглаживание)
  const smoothing = 0.2;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = i > 0 ? points[i - 1] : current;
    const afterNext = i < points.length - 2 ? points[i + 2] : next;

    // Вычисляем направление для текущей точки
    const dx1 = next.x - prev.x;
    const dy1 = next.y - prev.y;

    // Вычисляем направление для следующей точки
    const dx2 = afterNext.x - current.x;
    const dy2 = afterNext.y - current.y;

    // Создаем контрольные точки на основе направлений
    const cp1x = current.x + dx1 * smoothing;
    const cp1y = current.y + dy1 * smoothing;
    const cp2x = next.x - dx2 * smoothing;
    const cp2y = next.y - dy2 * smoothing;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }

  return path;
};

// -----------------------------
// Presentational component
// -----------------------------
export type DashboardViewProps = {
  data: DashboardResponse;
  onOpenAddMeal: () => void;
  onOpenChangeGoal: () => void;
  onStartTraining: () => void;
  onGoProgress: () => void;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onOpenAddMeal,
  onOpenChangeGoal,
  onStartTraining,
  onGoProgress,
}) => {
  const username = data.user_greeting.replace('Привет, ', '').replace('!', '') || '@user';
  const lastTraining = data.last_training_message || '—';

  const weeklyProgress = {
    label: 'Trainings',
    current: data.weekly_progress?.completed_workouts || 0,
    total: data.weekly_progress?.planned_workouts || 0,
    color: '#FF3B30',
  };

  // Используем реальные данные из current_nutrition
  // Проверяем что данные есть, иначе используем 0
  const currentProtein = data.current_nutrition?.protein ?? 0;
  const currentCarbs = data.current_nutrition?.carbs ?? 0;
  const currentFat = data.current_nutrition?.fat ?? 0;
  
  const aiPlan = [
    { 
      label: 'Proteins', 
      current: Math.round(currentProtein), 
      total: data.nutrition_plan?.protein || 0, 
      color: '#FF3B30' 
    },
    { 
      label: 'Carbohydrates', 
      current: Math.round(currentCarbs), 
      total: data.nutrition_plan?.carbs || 0, 
      color: '#FF9800' 
    },
    { 
      label: 'Fats', 
      current: Math.round(currentFat), 
      total: data.nutrition_plan?.fat || 0, 
      color: '#FFEB3B' 
    },
  ];
  
  const quickStats = [
    { label: 'Weekly Volume:', value: `${data.quick_stats?.planned_workouts || 0} trainings` },
    { label: 'Average Weight:', value: `${data.quick_stats?.total_weight_lifted || 0} kg` },
    { label: 'Average Recovery:', value: `${data.quick_stats?.recovery_score || 0}%` },
    { label: 'AI Goal Progress:', value: `${data.quick_stats?.weight_change || 0} kg` },
  ];

  return (
    <div className="dashboard-page">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <section className="welcome-section">
            <h1 className="welcome-title">Welcome back, {username}</h1>
            <p className="welcome-subtitle">your last training was {lastTraining}</p>
          </section>

          <div className="dashboard-content">
            <div className="left-column">
              <div className="main-dashboard-card">
                {/* Activity Chart */}
                <div className="activity-section">
                  <h3>Your activity!</h3>
                  <div className="activity-chart-wrapper">
                    <svg width="100%" height="200" viewBox="0 0 700 200" className="chart-svg" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {[0, 2, 4, 6, 8, 10].map((value) => (
                        <g key={value}>
                          <line
                            x1={60}
                            y1={170 - (value / 10) * 150}
                            x2={660}
                            y2={170 - (value / 10) * 150}
                            className="grid-line"
                          />
                          <text x={35} y={175 - (value / 10) * 150} className="grid-text">{value}</text>
                        </g>
                      ))}

                      {/* X-axis labels (days) */}
                      {data.energy_chart.map((point, i) => {
                        const x = 60 + (i / Math.max(data.energy_chart.length - 1, 1)) * 600;
                        const dayLabel = new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <text key={i} x={x} y={190} className="axis-label">{dayLabel}</text>
                        );
                      })}

                      {/* Mood line - плавная кривая */}
                      {data.energy_chart.length > 1 && (() => {
                        const moodPoints = data.energy_chart.map((point, i) => ({
                          x: 60 + (i / Math.max(data.energy_chart.length - 1, 1)) * 600,
                          y: 170 - (point.mood / 10) * 150
                        }));
                        return <path d={createSmoothPath(moodPoints)} className="mood-line" />;
                      })()}

                      {/* Energy line - плавная кривая */}
                      {data.energy_chart.length > 1 && (() => {
                        const energyPoints = data.energy_chart.map((point, i) => ({
                          x: 60 + (i / Math.max(data.energy_chart.length - 1, 1)) * 600,
                          y: 170 - (point.energy / 10) * 150
                        }));
                        return <path d={createSmoothPath(energyPoints)} className="energy-line" />;
                      })()}

                      {/* Data points for mood */}
                      {data.energy_chart.map((point, i) => {
                        const x = 60 + (i / Math.max(data.energy_chart.length - 1, 1)) * 600;
                        const y = 170 - (point.mood / 10) * 150;
                        return (
                          <circle key={`mood-${i}`} cx={x} cy={y} r="4" className="mood-point" />
                        );
                      })}

                      {/* Data points for energy */}
                      {data.energy_chart.map((point, i) => {
                        const x = 60 + (i / Math.max(data.energy_chart.length - 1, 1)) * 600;
                        const y = 170 - (point.energy / 10) * 150;
                        return (
                          <circle key={`energy-${i}`} cx={x} cy={y} r="4" className="energy-point" />
                        );
                      })}
                    </svg>
                    <div className="chart-legend">
                      <div className="legend-item"><div className="legend-color mood-color"></div><span>Mood</span></div>
                      <div className="legend-item"><div className="legend-color energy-color"></div><span>Energy</span></div>
                    </div>
                  </div>
                </div>

                {/* Weekly Progress + AI Plan */}
                <div className="combined-bottom-section">
                  <div className="weekly-progress-section">
                    <h3>Your Weekly Progress</h3>
                    <div className="trainings-card">
                      <h4>Trainings</h4>
                      <div className="progress-bar-container">
                        <div className="progress-fill-background">
                          <div
                            className="progress-fill"
                            style={{ width: weeklyProgress.total ? `${(weeklyProgress.current / weeklyProgress.total) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="progress-value">{weeklyProgress.current}/{weeklyProgress.total}</span>
                      </div>
                      <p className="workouts-left">{weeklyProgress.total - weeklyProgress.current} workout{weeklyProgress.total - weeklyProgress.current !== 1 ? 's' : ''} left!</p>
                    </div>
                    <p className="progress-message">{data.weekly_progress_message || ''}</p>
                  </div>

                  <div className={`ai-plan-section ${!isPro() ? 'nutrition-locked-wrapper' : ''}`}>
                    <h3>AI Plan</h3>
                    <div className={`ai-plan-grid ${!isPro() ? 'nutrition-blurred' : ''}`}>
                      {aiPlan.map((item, i) => (
                        <CircularProgress
                          key={i}
                          progress={item.total ? (item.current / item.total) * 100 : 0}
                          color={item.color}
                          label={item.label}
                          current={item.current}
                          total={item.total}
                        />
                      ))}
                    </div>
                    {isPro() ? (
                      <button className="add-meal-button" onClick={onOpenAddMeal}>+ Add meal</button>
                    ) : (
                      <div className="nutrition-locked-overlay">
                        <div className="nutrition-lock-icon">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                          </svg>
                        </div>
                        <span className="nutrition-lock-text">Nutrition tracking available in Pro</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="right-column">
              {/* Quick Stats */}
              <div className="stats-card">
                <h3>Quick stats</h3>
                <div className="quick-stats-list">
                  {quickStats.map((s, i) => (
                    <div key={i} className="quick-stat-item">
                      <span className="stat-label">{s.label}</span>
                      <span className="stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="actions-card">
                <h3>Actions</h3>
                <div className="actions-content">
                  <div className="action-buttons">
                    <button className="action-btn red-btn" onClick={onGoProgress}>
                      <GraphIcon className="action-icon-svg" />Open statistic
                    </button>
                    <button className="action-btn red-btn" onClick={onOpenChangeGoal}>
                      <DartboardIcon className="action-icon-svg" />Change goal
                    </button>
                  </div>
                  <button className="action-btn start-training-btn" onClick={onStartTraining}>
                    <PlayIcon className="action-icon-svg" />Start training
                  </button>
                </div>
                <div className="bot-status bot-status--dev">
                  <div className="status-dot"></div>
                  <span>Бот в разработке</span>
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

// -----------------------------
// Container component
// -----------------------------
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isChangeGoalOpen, setIsChangeGoalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await apiClient.get<DashboardResponse>('/dashboard');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [navigate]);

  const handleMealAdded = () => {
    // Обновляем данные дашборда после добавления еды
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <DashboardView
        data={data}
        onOpenAddMeal={() => setIsAddMealOpen(true)}
        onOpenChangeGoal={() => setIsChangeGoalOpen(true)}
        onStartTraining={() => navigate('/workouts')}
        onGoProgress={() => navigate('/progress')}
      />
      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onMealAdded={handleMealAdded}
      />
      <ChangeGoalModal isOpen={isChangeGoalOpen} onClose={() => setIsChangeGoalOpen(false)} />
    </>
  );
};

export default Dashboard;