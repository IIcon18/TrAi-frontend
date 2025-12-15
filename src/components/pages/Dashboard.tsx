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

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [isChangeGoalOpen, setIsChangeGoalOpen] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await apiClient.get<DashboardResponse>('/dashboard');
                setData(res.data);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                alert('Не удалось загрузить дашборд. Попробуйте войти снова.');
                localStorage.removeItem('access_token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
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

    const username = data.user_greeting.replace('Привет, ', '').replace('!', '') || '@user';
    const lastTraining = 'недавно';

    const handleStartTraining = () => {
        alert('Запуск тренировки...');
        // Можно добавить /workouts/generate-ai или редирект
    };

    // Преобразуем weekly_progress в формат ProgressItem
    const weeklyProgress = {
        label: 'Trainings',
        current: data.weekly_progress.completed_workouts,
        total: data.weekly_progress.planned_workouts,
        color: '#FF3B30',
    };

    // AI Plan — макронутриенты
    const aiPlan = [
        {
            label: 'Proteins',
            current: data.nutrition_plan.protein,
            total: 120,
            color: '#FF3B30',
        },
        {
            label: 'Carbohydrates',
            current: data.nutrition_plan.carbs,
            total: 120,
            color: '#FF9800',
        },
        {
            label: 'Fats',
            current: data.nutrition_plan.fat,
            total: 80,
            color: '#FFEB3B',
        },
    ];

    // Quick stats
    const quickStats = [
        { label: 'Weekly Volume:', value: `${data.quick_stats.planned_workouts} trainings` },
        { label: 'Average Weight:', value: `${data.quick_stats.total_weight_lifted} kg` },
        { label: 'Average Recovery:', value: `${data.quick_stats.recovery_score}%` },
        { label: 'AI Goal Progress:', value: `${data.quick_stats.weight_change} kg` },
    ];

    return (
        <div className="dashboard-page">
            <Header />
            <main className="dashboard-main">
                <div className="dashboard-container">
                    <section className="welcome-section">
                        <h1 className="welcome-title">Welcome back, {username}</h1>
                        <p className="welcome-subtitle">
                            your last training was {lastTraining} - perfect distance!
                        </p>
                    </section>
                    <div className="dashboard-content">
                        <div className="left-column">
                            <div className="main-dashboard-card">
                                <div className="activity-section">
                                    <h3>Your activity!</h3>
                                    <div className="activity-chart-wrapper">
                                        {(() => {
                                            const GRAPH_WIDTH_PCT = 92;
                                            const START_X = -100;
                                            const END_X = 500;
                                            const Y_OFFSET = 40;
                                            const Y_SCALE = 120;
                                            return (
                                                <svg
                                                    width={`${GRAPH_WIDTH_PCT}%`}
                                                    height="160"
                                                    className="chart-svg"
                                                    viewBox="0 0 400 200"
                                                    style={{ margin: '0 auto' }}
                                                >
                                                    {[0, 2, 4, 6, 8, 10].map((value) => (
                                                        <g key={value}>
                                                            <line
                                                                x1={START_X}
                                                                y1={200 - Y_OFFSET - (value / 10) * Y_SCALE}
                                                                x2={END_X}
                                                                y2={200 - Y_OFFSET - (value / 10) * Y_SCALE}
                                                                className="grid-line"
                                                            />
                                                            <text
                                                                x={START_X - 10}
                                                                y={200 - Y_OFFSET - (value / 10) * Y_SCALE}
                                                                className="grid-text"
                                                            >
                                                                {value}
                                                            </text>
                                                        </g>
                                                    ))}
                                                    <polyline
                                                        points={data.energy_chart
                                                            .map((point, index) => {
                                                                const x = START_X + (index / (data.energy_chart.length - 1)) * (END_X - START_X);
                                                                const y = 200 - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                                                                return `${x},${y}`;
                                                            })
                                                            .join(' ')}
                                                        className="mood-line"
                                                        strokeLinejoin="round"
                                                    />
                                                    <polyline
                                                        points={data.energy_chart
                                                            .map((point, index) => {
                                                                const x = START_X + (index / (data.energy_chart.length - 1)) * (END_X - START_X);
                                                                const y = 200 - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                                                                return `${x},${y}`;
                                                            })
                                                            .join(' ')}
                                                        className="energy-line"
                                                        strokeLinejoin="round"
                                                    />
                                                    {data.energy_chart.map((point, index) => {
                                                        const x = START_X + (index / (data.energy_chart.length - 1)) * (END_X - START_X);
                                                        return (
                                                            <text
                                                                key={point.date}
                                                                x={x}
                                                                y="180"
                                                                className="axis-label"
                                                                textAnchor="middle"
                                                            >
                                                                {point.date}
                                                            </text>
                                                        );
                                                    })}
                                                    {data.energy_chart.map((point, index) => {
                                                        const x = START_X + (index / (data.energy_chart.length - 1)) * (END_X - START_X);
                                                        const y = 200 - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                                                        return (
                                                            <circle
                                                                key={`mood-${index}`}
                                                                cx={x}
                                                                cy={y}
                                                                r="4"
                                                                fill="#4CAF50"
                                                                stroke="#000"
                                                                strokeWidth="2"
                                                            />
                                                        );
                                                    })}
                                                    {data.energy_chart.map((point, index) => {
                                                        const x = START_X + (index / (data.energy_chart.length - 1)) * (END_X - START_X);
                                                        const y = 200 - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                                                        return (
                                                            <circle
                                                                key={`energy-${index}`}
                                                                cx={x}
                                                                cy={y}
                                                                r="4"
                                                                fill="#FF3B30"
                                                                stroke="#000"
                                                                strokeWidth="2"
                                                            />
                                                        );
                                                    })}
                                                </svg>
                                            );
                                        })()}
                                        <div className="chart-legend">
                                            <div className="legend-item">
                                                <div className="legend-color mood-color"></div>
                                                <span>Mood</span>
                                            </div>
                                            <div className="legend-item">
                                                <div className="legend-color energy-color"></div>
                                                <span>Energy</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="combined-bottom-section">
                                    <div className="weekly-progress-section">
                                        <h3>Your Weekly Progress</h3>
                                        <div className="trainings-card">
                                            <h4>Trainings</h4>
                                            <div className="progress-bar-container">
                                                <div className="progress-fill-background">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${(weeklyProgress.current / weeklyProgress.total) * 100}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="progress-value">
                          {weeklyProgress.current}/{weeklyProgress.total}
                        </span>
                                            </div>
                                            <p className="workouts-left">
                                                {weeklyProgress.total - weeklyProgress.current} workout
                                                {weeklyProgress.total - weeklyProgress.current !== 1 ? 's' : ''} left!
                                            </p>
                                        </div>
                                        <p className="progress-message">
                                            {data.progress_fact}
                                        </p>
                                    </div>
                                    <div className="ai-plan-section">
                                        <h3>AI Plan</h3>
                                        <div className="ai-plan-grid">
                                            {aiPlan.map((item, index) => (
                                                <CircularProgress
                                                    key={index}
                                                    progress={(item.current / item.total) * 100}
                                                    color={item.color}
                                                    label={item.label}
                                                    current={item.current}
                                                    total={item.total}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            className="add-meal-button"
                                            onClick={() => setIsAddMealOpen(true)}
                                        >
                                            + Add meal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right-column">
                            <div className="stats-card">
                                <h3>Quick stats</h3>
                                <div className="quick-stats-list">
                                    {quickStats.map((stat, index) => (
                                        <div key={index} className="quick-stat-item">
                                            <span className="stat-label">{stat.label}</span>
                                            <span className="stat-value">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="actions-card">
                                <h3>Actions</h3>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn red-btn"
                                        onClick={() => navigate('/progress')}
                                    >
                                        <span className="action-icon">📊</span>
                                        Open statistic
                                    </button>
                                    <button
                                        className="action-btn red-btn"
                                        onClick={() => setIsChangeGoalOpen(true)}
                                    >
                                        <span className="action-icon">🎯</span>
                                        Change goal
                                    </button>
                                </div>
                                <button
                                    className="action-btn start-training-btn"
                                    onClick={handleStartTraining}
                                >
                                    <span className="action-icon">▶️</span>
                                    Start training
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
            <AddMealModal
                isOpen={isAddMealOpen}
                onClose={() => setIsAddMealOpen(false)}
            />
            <ChangeGoalModal
                isOpen={isChangeGoalOpen}
                onClose={() => setIsChangeGoalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;