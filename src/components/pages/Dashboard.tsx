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
import type { DashboardResponse } from '../../types/dashboard';

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
  
  console.log('AI Plan data:', aiPlan);
  console.log('Current nutrition:', data.current_nutrition);
  console.log('Nutrition plan:', data.nutrition_plan);

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
                    <svg width="100%" height="160" viewBox="0 0 400 200" className="chart-svg">
                      {[0, 2, 4, 6, 8, 10].map((value) => (
                        <g key={value}>
                          <line
                            x1={0}
                            y1={200 - 40 - (value / 10) * 120}
                            x2={400}
                            y2={200 - 40 - (value / 10) * 120}
                            className="grid-line"
                          />
                          <text x={-10} y={200 - 40 - (value / 10) * 120} className="grid-text">{value}</text>
                        </g>
                      ))}
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

                  <div className="ai-plan-section">
                    <h3>AI Plan</h3>
                    <div className="ai-plan-grid">
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
                    <button className="add-meal-button" onClick={onOpenAddMeal}>+ Add meal</button>
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
                <div className="action-buttons">
                  <button className="action-btn red-btn" onClick={onGoProgress}>
                    <span className="action-icon">📊</span>Open statistic
                  </button>
                  <button className="action-btn red-btn" onClick={onOpenChangeGoal}>
                    <span className="action-icon">🎯</span>Change goal
                  </button>
                </div>
                <button className="action-btn start-training-btn" onClick={onStartTraining}>
                  <span className="action-icon">▶️</span>Start training
                </button>
                <div className="bot-status">
                  <div className="status-dot"></div>
                  <span>Bot status</span>
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

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get<DashboardResponse>('/dashboard');
        console.log('Dashboard response:', res.data);
        console.log('Current nutrition:', res.data.current_nutrition);
        console.log('Nutrition plan:', res.data.nutrition_plan);
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        console.error('Error details:', err?.response?.data);
        if (err?.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <p style={{ color: 'white', textAlign: 'center' }}>Загрузка...</p>
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
        onStartTraining={() => alert('Запуск тренировки...')}
        onGoProgress={() => navigate('/progress')}
      />
      <AddMealModal isOpen={isAddMealOpen} onClose={() => setIsAddMealOpen(false)} />
      <ChangeGoalModal isOpen={isChangeGoalOpen} onClose={() => setIsChangeGoalOpen(false)} />
    </>
  );
};

export default Dashboard;