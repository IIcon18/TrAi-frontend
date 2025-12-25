// src/components/pages/Progress.tsx
import React, { useState, useEffect } from 'react';
import './Progress.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import GoalOverviewCircle from '../shared/GoalOverviewCircle';
import apiClient from '../../api/apiClient';

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

const Progress: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'weight' | 'bodyFat' | 'workouts' | 'recovery'>('weight');
    const [progressData, setProgressData] = useState<ProgressData>(emptyProgressData);
    const [aiMessage, setAiMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

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

    useEffect(() => {
        const metric = metricMap[activeTab] || 'weight';
        fetchProgressData(metric);
    }, [activeTab]);

    if (loading) {
        return (
            <div className="progress-page">
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

                                {/* График активности */}
                                <div className="progress-activity-chart-wrapper">
                                    {progressData.activityData.length > 0 ? (
                                        <svg width="92%" height="200" className="chart-svg" viewBox="0 0 400 200" style={{ margin: '0 auto' }}>
                                            {[0, 2, 4, 6, 8, 10].map(value => (
                                                <g key={value}>
                                                    <line
                                                        x1={-100}
                                                        y1={200 - 40 - (value / 10) * 120}
                                                        x2={500}
                                                        y2={200 - 40 - (value / 10) * 120}
                                                        className="grid-line"
                                                    />
                                                    <text x={-110} y={200 - 40 - (value / 10) * 120} className="grid-text">
                                                        {value}
                                                    </text>
                                                </g>
                                            ))}
                                            {/* Mood Line */}
                                            <polyline
                                                points={progressData.activityData.map((point, i) => {
                                                    const x = -100 + (i / (progressData.activityData.length - 1)) * 600;
                                                    const y = 200 - 40 - (point.mood / 10) * 120;
                                                    return `${x},${y}`;
                                                }).join(' ')}
                                                className="mood-line"
                                                strokeLinejoin="round"
                                            />
                                            {/* Energy Line */}
                                            <polyline
                                                points={progressData.activityData.map((point, i) => {
                                                    const x = -100 + (i / (progressData.activityData.length - 1)) * 600;
                                                    const y = 200 - 40 - (point.energy / 10) * 120;
                                                    return `${x},${y}`;
                                                }).join(' ')}
                                                className="energy-line"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <p>No activity data yet</p>
                                    )}
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

                            {/* Nutrition */}
                            <div className="progress-nutrition-card">
                                <h3 className="progress-card-title">Your Nutrition Progress</h3>
                                <div className="nutrition-progress-list">
                                    {['proteins', 'carbohydrates', 'fats'].map((macro) => {
                                        const current = progressData.nutritionProgress[macro as keyof ProgressData['nutritionProgress']].current;
                                        const total = progressData.nutritionProgress[macro as keyof ProgressData['nutritionProgress']].total;
                                        return (
                                            <div key={macro} className="nutrition-item">
                                                <div className="nutrition-label">{macro.charAt(0).toUpperCase() + macro.slice(1)}</div>
                                                <div className="nutrition-bar">
                                                    <div
                                                        className="nutrition-fill"
                                                        style={{ width: total ? `${(current / total) * 100}%` : '0%', backgroundColor: '#9D2628' }}
                                                    ></div>
                                                </div>
                                                <div className="nutrition-value">{current}/{total}g</div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button className="progress-add-meal-button">+ Add meal</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Progress;