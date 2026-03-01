// src/components/pages/Progress.tsx
import React, { useState, useEffect } from 'react';
import './Progress.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import GoalOverviewCircle from '../shared/GoalOverviewCircle';
import ProgressPhotos from '../ProgressPhotos';
import apiClient from '../../api/apiClient';
import SEOHead from '../SEOHead';

// Интерфейс для данных страницы
interface ProgressData {
    username: string;
    activityData: {
        day: string;
        mood: number;
        energy: number;
    }[];
    goalOverview: {
        percentage: number;
        weightChange: string;
        caloriesChange: string;
        streak: number;
    };
    nutritionProgress: {
        proteins: { current: number; total: number };
        carbohydrates: { current: number; total: number };
        fats: { current: number; total: number };
    };
    aiMessage?: string;
}

// Пустой прогресс (по умолчанию)
const emptyProgressData: ProgressData = {
    username: "@username",
    activityData: [
        { day: "Monday", mood: 0, energy: 0 },
        { day: "Tuesday", mood: 0, energy: 0 },
        { day: "Wednesday", mood: 0, energy: 0 },
        { day: "Thursday", mood: 0, energy: 0 },
        { day: "Friday", mood: 0, energy: 0 },
        { day: "Saturday", mood: 0, energy: 0 },
        { day: "Sunday", mood: 0, energy: 0 }
    ],
    goalOverview: {
        percentage: 0,
        weightChange: "-",
        caloriesChange: "-",
        streak: 0
    },
    nutritionProgress: {
        proteins: { current: 0, total: 0 },
        carbohydrates: { current: 0, total: 0 },
        fats: { current: 0, total: 0 }
    },
    aiMessage: ''
};

// Функция для создания плавных кривых Безье
const createSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return '';
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let path = `M ${points[0].x},${points[0].y}`;
  const smoothing = 0.2;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = i > 0 ? points[i - 1] : current;
    const afterNext = i < points.length - 2 ? points[i + 2] : next;

    const dx1 = next.x - prev.x;
    const dy1 = next.y - prev.y;
    const dx2 = afterNext.x - current.x;
    const dy2 = afterNext.y - current.y;

    const cp1x = current.x + dx1 * smoothing;
    const cp1y = current.y + dy1 * smoothing;
    const cp2x = next.x - dx2 * smoothing;
    const cp2y = next.y - dy2 * smoothing;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
  }

  return path;
};

interface WorkoutStatsData {
  date: string;
  day: string;
  completed_workouts: number;
  total_weight: number;
}

interface WorkoutStatsResponse {
  chart_data: WorkoutStatsData[];
  total_workouts_week: number;
  total_weight_week: number;
}

const Progress: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'weight' | 'bodyFat' | 'workouts' | 'recovery'>('weight');
    const [progressData, setProgressData] = useState<ProgressData>(emptyProgressData);
    const [aiMessage, setAiMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [workoutStats, setWorkoutStats] = useState<WorkoutStatsResponse | null>(null);

    const metricMap: Record<string, string> = {
        'weight': 'weight',
        'bodyFat': 'body_fat',
        'workouts': 'workouts',
        'recovery': 'recovery'
    };

    // Загрузка данных прогресса
    const fetchProgressData = async (metric: string) => {
        setLoading(true);
        try {
            const [progressRes, activityRes] = await Promise.all([
                apiClient.get(`/progress?metric=${metric}`),
                apiClient.get('/progress/activity')
            ]);

            const progress = progressRes.data;
            const activity = activityRes.data;

            setProgressData({
                username: "@user",
                activityData: activity.activityData || emptyProgressData.activityData,
                goalOverview: {
                    percentage: progress.goal_progress?.completion_percentage || 0,
                    weightChange: progress.goal_progress?.weight_lost != null
                        ? `${progress.goal_progress.weight_lost >= 0 ? '-' : '+'}${Math.abs(progress.goal_progress.weight_lost).toFixed(1)} kg`
                        : '-',
                    caloriesChange: progress.goal_progress?.daily_calorie_deficit != null
                        ? `-${progress.goal_progress.daily_calorie_deficit} kcal`
                        : '-',
                    streak: progress.goal_progress?.streak_weeks || 0
                },
                nutritionProgress: {
                    proteins: {
                        current: progress.current_nutrition?.protein || 0,
                        total: progress.nutrition_plan?.protein || 0
                    },
                    carbohydrates: {
                        current: progress.current_nutrition?.carbs || 0,
                        total: progress.nutrition_plan?.carbs || 0
                    },
                    fats: {
                        current: progress.current_nutrition?.fat || 0,
                        total: progress.nutrition_plan?.fat || 0
                    }
                },
                aiMessage: progress.ai_fact || ''
            });

            setAiMessage(progress.ai_fact || '');
        } catch (err: any) {
            console.error('Failed to load progress:', err);
            // Если ошибка 401, apiClient уже перенаправит на логин
            // Для других ошибок оставляем пустые данные
            if (err?.response?.status !== 401) {
                // Можно показать уведомление об ошибке
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkoutStats = async () => {
        try {
            const res = await apiClient.get<WorkoutStatsResponse>('/profile/workout-stats');
            setWorkoutStats(res.data);
        } catch (err: any) {
            console.error('Failed to fetch workout stats:', err);
        }
    };

    useEffect(() => {
        const metric = metricMap[activeTab] || 'weight';
        fetchProgressData(metric);

        // Load workout stats when workouts tab is selected
        if (activeTab === 'workouts') {
            fetchWorkoutStats();
        }
    }, [activeTab]);

    if (loading) {
        return (
            <div className="progress-page">
                <SEOHead
                    title="Прогресс"
                    description="Отслеживание прогресса и физических показателей в TrAi"
                    noIndex={true}
                />
                <Header />
                <main className="progress-main">
                    <div className="progress-container">
                        <p style={{ color: 'white', textAlign: 'center' }}>Загрузка...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="progress-page">
            <Header />
            <main className="progress-main">
                <div className="progress-container">
                    <div className="progress-content">
                        {/* Левая колонка */}
                        <div className="progress-left-column">
                            <div className="progress-card">
                                <h1 className="progress-page-title">Your Progress</h1>
                                <div className="progress-tabs-container">
                                    {['weight', 'bodyFat', 'workouts', 'recovery'].map(tab => (
                                        <button
                                            key={tab}
                                            className={`progress-tab-button ${activeTab === tab ? 'progress-active' : ''}`}
                                            onClick={() => setActiveTab(tab as any)}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* График активности / тренировок */}
                                <div className="progress-activity-chart-wrapper">
                                    {activeTab === 'workouts' && workoutStats ? (
                                        <>
                                            <svg width="100%" height="200" viewBox="0 0 700 200" className="progress-chart-svg" preserveAspectRatio="none">
                                                {/* Grid lines */}
                                                {[0, 2, 4, 6, 8, 10].map((value) => (
                                                    <g key={value}>
                                                        <line
                                                            x1={60}
                                                            y1={170 - (value / 10) * 150}
                                                            x2={660}
                                                            y2={170 - (value / 10) * 150}
                                                            className="progress-grid-line"
                                                        />
                                                        <text x={35} y={175 - (value / 10) * 150} className="progress-grid-text">{value}</text>
                                                    </g>
                                                ))}

                                                {/* X-axis labels (days) */}
                                                {workoutStats.chart_data.map((point, i) => {
                                                    const x = 60 + (i / Math.max(workoutStats.chart_data.length - 1, 1)) * 600;
                                                    return (
                                                        <text key={i} x={x} y={190} className="progress-axis-label">{point.day}</text>
                                                    );
                                                })}

                                                {/* Completed Workouts Line - плавная кривая */}
                                                {workoutStats.chart_data.length > 1 && (() => {
                                                    const maxWorkouts = Math.max(...workoutStats.chart_data.map(d => d.completed_workouts), 10);
                                                    const workoutPoints = workoutStats.chart_data.map((point, i) => ({
                                                        x: 60 + (i / Math.max(workoutStats.chart_data.length - 1, 1)) * 600,
                                                        y: 170 - (point.completed_workouts / maxWorkouts) * 150
                                                    }));
                                                    return <path d={createSmoothPath(workoutPoints)} className="progress-workout-line" />;
                                                })()}

                                                {/* Total Weight Line - плавная кривая */}
                                                {workoutStats.chart_data.length > 1 && (() => {
                                                    const maxWeight = Math.max(...workoutStats.chart_data.map(d => d.total_weight), 10);
                                                    const weightPoints = workoutStats.chart_data.map((point, i) => ({
                                                        x: 60 + (i / Math.max(workoutStats.chart_data.length - 1, 1)) * 600,
                                                        y: 170 - (point.total_weight / maxWeight) * 150
                                                    }));
                                                    return <path d={createSmoothPath(weightPoints)} className="progress-weight-line" />;
                                                })()}

                                                {/* Data points for workouts */}
                                                {workoutStats.chart_data.map((point, i) => {
                                                    const maxWorkouts = Math.max(...workoutStats.chart_data.map(d => d.completed_workouts), 10);
                                                    const x = 60 + (i / Math.max(workoutStats.chart_data.length - 1, 1)) * 600;
                                                    const y = 170 - (point.completed_workouts / maxWorkouts) * 150;
                                                    return (
                                                        <circle key={`workout-${i}`} cx={x} cy={y} r="4" className="progress-workout-point" />
                                                    );
                                                })}

                                                {/* Data points for weight */}
                                                {workoutStats.chart_data.map((point, i) => {
                                                    const maxWeight = Math.max(...workoutStats.chart_data.map(d => d.total_weight), 10);
                                                    const x = 60 + (i / Math.max(workoutStats.chart_data.length - 1, 1)) * 600;
                                                    const y = 170 - (point.total_weight / maxWeight) * 150;
                                                    return (
                                                        <circle key={`weight-${i}`} cx={x} cy={y} r="4" className="progress-weight-point" />
                                                    );
                                                })}
                                            </svg>
                                            <div className="progress-chart-legend">
                                                <div className="progress-legend-item">
                                                    <div className="progress-legend-color progress-workout-color"></div>
                                                    <span>Workouts</span>
                                                </div>
                                                <div className="progress-legend-item">
                                                    <div className="progress-legend-color progress-weight-color"></div>
                                                    <span>Weight (kg)</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : activeTab !== 'workouts' && progressData.activityData.length > 0 ? (
                                        <>
                                            <svg width="100%" height="200" viewBox="0 0 700 200" className="progress-chart-svg" preserveAspectRatio="none">
                                                {/* Grid lines */}
                                                {[0, 2, 4, 6, 8, 10].map((value) => (
                                                    <g key={value}>
                                                        <line
                                                            x1={60}
                                                            y1={170 - (value / 10) * 150}
                                                            x2={660}
                                                            y2={170 - (value / 10) * 150}
                                                            className="progress-grid-line"
                                                        />
                                                        <text x={35} y={175 - (value / 10) * 150} className="progress-grid-text">{value}</text>
                                                    </g>
                                                ))}

                                                {/* X-axis labels (days) */}
                                                {progressData.activityData.map((point, i) => {
                                                    const x = 60 + (i / Math.max(progressData.activityData.length - 1, 1)) * 600;
                                                    return (
                                                        <text key={i} x={x} y={190} className="progress-axis-label">{point.day}</text>
                                                    );
                                                })}

                                                {/* Mood line - плавная кривая */}
                                                {progressData.activityData.length > 1 && (() => {
                                                    const moodPoints = progressData.activityData.map((point, i) => ({
                                                        x: 60 + (i / Math.max(progressData.activityData.length - 1, 1)) * 600,
                                                        y: 170 - (point.mood / 10) * 150
                                                    }));
                                                    return <path d={createSmoothPath(moodPoints)} className="progress-mood-line" />;
                                                })()}

                                                {/* Energy line - плавная кривая */}
                                                {progressData.activityData.length > 1 && (() => {
                                                    const energyPoints = progressData.activityData.map((point, i) => ({
                                                        x: 60 + (i / Math.max(progressData.activityData.length - 1, 1)) * 600,
                                                        y: 170 - (point.energy / 10) * 150
                                                    }));
                                                    return <path d={createSmoothPath(energyPoints)} className="progress-energy-line" />;
                                                })()}

                                                {/* Data points for mood */}
                                                {progressData.activityData.map((point, i) => {
                                                    const x = 60 + (i / Math.max(progressData.activityData.length - 1, 1)) * 600;
                                                    const y = 170 - (point.mood / 10) * 150;
                                                    return (
                                                        <circle key={`mood-${i}`} cx={x} cy={y} r="4" className="progress-mood-point" />
                                                    );
                                                })}

                                                {/* Data points for energy */}
                                                {progressData.activityData.map((point, i) => {
                                                    const x = 60 + (i / Math.max(progressData.activityData.length - 1, 1)) * 600;
                                                    const y = 170 - (point.energy / 10) * 150;
                                                    return (
                                                        <circle key={`energy-${i}`} cx={x} cy={y} r="4" className="progress-energy-point" />
                                                    );
                                                })}
                                            </svg>
                                            <div className="progress-chart-legend">
                                                <div className="progress-legend-item">
                                                    <div className="progress-legend-color progress-mood-color"></div>
                                                    <span>Mood</span>
                                                </div>
                                                <div className="progress-legend-item">
                                                    <div className="progress-legend-color progress-energy-color"></div>
                                                    <span>Energy</span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p>No data yet</p>
                                    )}
                                </div>

                                {/* Сообщение AI */}
                                <div className="progress-ai-message">
                                    <div className="progress-ai-icon">🤖</div>
                                    <p className="progress-message-text">
                                        {aiMessage || progressData.aiMessage || 'No AI data yet'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка */}
                        <div className="progress-right-column">
                            {/* Goal Overview */}
                            <div className="progress-goal-overview-card">
                                <h3 className="progress-card-title">Goal Overview</h3>
                                <div className="progress-goal-circle-wrapper">
                                    <GoalOverviewCircle
                                        percentage={progressData.goalOverview.percentage}
                                        size={100}
                                        strokeWidth={10}
                                        filledColor="#4CAF50"
                                        emptyColor="#9D2628"
                                        textColor="white"
                                        textSize={20}
                                        label="%"
                                    />
                                </div>
                                <div className="progress-stats-grid">
                                    <div className="progress-stat-item">
                                        <span className="progress-stat-label">Weight</span>
                                        <span className="progress-stat-value">{progressData.goalOverview.weightChange}</span>
                                        <span className="progress-stat-sublabel">average</span>
                                    </div>
                                    <div className="progress-stat-item">
                                        <span className="progress-stat-label">Calories</span>
                                        <span className="progress-stat-value">{progressData.goalOverview.caloriesChange}</span>
                                        <span className="progress-stat-sublabel">every day</span>
                                    </div>
                                    <div className="progress-stat-item">
                                        <span className="progress-stat-label">Streak 🔥</span>
                                        <span className="progress-stat-value">{progressData.goalOverview.streak}</span>
                                        <span className="progress-stat-sublabel">weeks</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Photos */}
                            <ProgressPhotos />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Progress;