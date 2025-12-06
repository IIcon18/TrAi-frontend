import React from 'react';
import './Dashboard.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';

interface ActivityData {
    day: string;
    mood: number;
    energy: number;
}

interface ProgressItem {
    label: string;
    current: number;
    total: number;
    color: string;
}

interface QuickStat {
    label: string;
    value: string;
}

interface DashboardProps {
    username: string;
    lastTraining: string;
    activityData: ActivityData[];
    weeklyProgress: ProgressItem;
    aiPlan: ProgressItem[];
    quickStats: QuickStat[];
}

const Dashboard: React.FC<DashboardProps> = ({
                                                 username,
                                                 lastTraining,
                                                 activityData,
                                                 weeklyProgress,
                                                 aiPlan,
                                                 quickStats
                                             }) => {
    // Компонент линейного прогресс-бара
    const ProgressBar = ({ progress, color = '#9d2628' }: { progress: number; color?: string }) => {
        const clampedProgress = Math.min(Math.max(progress, 0), 100);

        return (
            <div className="progress-bar-container">
                <span className="progress-value">{weeklyProgress.current}/{weeklyProgress.total}</span>
                <div
                    className="progress-bar-background"
                    style={{ height: '8px' }}
                >
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${clampedProgress}%`,
                            backgroundColor: color,
                            height: '8px'
                        }}
                    />
                </div>
            </div>
        );
    };

    // Компонент кругового прогресса
    const CircularProgress = ({
                                  progress,
                                  color = '#9D2628',
                                  label,
                                  current,
                                  total
                              }: {
        progress: number;
        color?: string;
        label: string;
        current: number;
        total: number;
    }) => {
        const size = 80;
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        return (
            <div className="circular-progress">
                <svg width={size} height={size} className="progress-svg">
                    <circle
                        className="progress-bg"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        className="progress-fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        stroke={color}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>
                <div className="progress-text">
                    <div className="progress-numbers">{current}/{total}</div>
                    <div className="progress-label">{label}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <Header />

            <main className="dashboard-main">
                {/* Welcome Section — ЦЕНТРАЛЬНЫЙ БЛОК НАД ВСЕМ */}
                <section className="welcome-section">
                    <h1 className="welcome-title">Welcome back, {username}</h1>
                    <p className="welcome-subtitle">your last training was {lastTraining} - perfect distance!</p>
                </section>

                {/* ОСНОВНАЯ СЕТКА: ДВЕ КОЛОНКИ */}
                <div className="dashboard-content">
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div className="left-column">
                        {/* Your Activity */}
                        <div className="activity-card">
                            <h2 className="section-title">Your activity!</h2>
                            <div className="activity-chart-wrapper">
                                <svg width="400" height="200" className="chart-svg">
                                    {/* Grid lines */}
                                    {[0, 2, 4, 6, 8, 10].map((value) => (
                                        <g key={value}>
                                            <line
                                                x1="40"
                                                y1={200 - 40 - (value / 10) * (200 - 80)}
                                                x2="360"
                                                y2={200 - 40 - (value / 10) * (200 - 80)}
                                                className="grid-line"
                                            />
                                            <text x="30" y={200 - 40 - (value / 10) * (200 - 80)} className="grid-text">
                                                {value}
                                            </text>
                                        </g>
                                    ))}

                                    {/* Mood line */}
                                    <polyline
                                        points={activityData.map((point, index) => {
                                            const x = 40 + (index / (activityData.length - 1)) * 320;
                                            const y = 200 - 40 - (point.mood / 10) * (200 - 80);
                                            return `${x},${y}`;
                                        }).join(' ')}
                                        className="mood-line"
                                    />

                                    {/* Energy line */}
                                    <polyline
                                        points={activityData.map((point, index) => {
                                            const x = 40 + (index / (activityData.length - 1)) * 320;
                                            const y = 200 - 40 - (point.energy / 10) * (200 - 80);
                                            return `${x},${y}`;
                                        }).join(' ')}
                                        className="energy-line"
                                    />

                                    {/* X-axis labels */}
                                    {activityData.map((point, index) => {
                                        const x = 40 + (index / (activityData.length - 1)) * 320;
                                        return (
                                            <text
                                                key={point.day}
                                                x={x}
                                                y="180"
                                                className="axis-label"
                                            >
                                                {point.day}
                                            </text>
                                        );
                                    })}
                                </svg>

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

                        {/* Weekly Progress */}
                        <div className="progress-card">
                            <h3 className="progress-card-title">Your Weekly Progress</h3>
                            <div className="weekly-progress-card">
                                <h4 className="progress-title">Trainings</h4>
                                <div className="progress-bar-wrapper">
                                    <ProgressBar progress={(weeklyProgress.current / weeklyProgress.total) * 100} />
                                </div>
                                <p className="progress-message">Perfect, you need last step! 🚀</p>
                            </div>
                        </div>

                        {/* AI Plan */}
                        <div className="progress-card">
                            <h3 className="progress-card-title">AI Plan</h3>
                            <div className="ai-plan-grid">
                                {aiPlan.map((item, index) => (
                                    <div key={index} className="ai-plan-item">
                                        <CircularProgress
                                            progress={(item.current / item.total) * 100}
                                            color={item.color}
                                            label={item.label}
                                            current={item.current}
                                            total={item.total}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button className="add-meal-button">
                                + Add meal
                            </button>
                        </div>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА */}
                    <div className="right-column">
                        {/* Quick Stats */}
                        <div className="stats-card">
                            <h3 className="section-title">Quick stats</h3>
                            <div className="stats-grid">
                                {quickStats.map((stat, index) => (
                                    <div key={index} className="stat-item">
                                        <span className="stat-label">{stat.label}</span>
                                        <span className="stat-value">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="actions-card">
                            <h3 className="section-title">Actions</h3>
                            <div className="actions-grid">
                                <button className="action-button">
                                    <span className="action-icon">📊</span>
                                    Open statistic
                                </button>
                                <button className="action-button">
                                    <span className="action-icon">🎯</span>
                                    Change goal
                                </button>
                                <button className="action-button primary-action">
                                    <span className="action-icon">▶️</span>
                                    Start training
                                </button>
                            </div>
                            <div className="bot-status">
                                <div className="status-indicator"></div>
                                <span>Bot status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;