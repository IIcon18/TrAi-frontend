import React from 'react';
import './Dashboard.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import CircularProgress from '../shared/CircularProgress';
import AddMealModal from "../shared/AddMealModal"; // предполагается, что он у вас есть

// Типы остаются как у вас
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

// ← Добавлен импорт модального окна

const Dashboard: React.FC<DashboardProps> = ({
                                                 username,
                                                 lastTraining,
                                                 activityData,
                                                 weeklyProgress,
                                                 aiPlan,
                                                 quickStats
                                             }) => {
    // ← Добавлено состояние для модалки
    const [isAddMealOpen, setIsAddMealOpen] = React.useState(false);

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
                            <div className="card main-dashboard-card">
                                <div className="activity-section">
                                    <h3 className="chart-title">Your activity!</h3>
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
                                                    height="200"
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
                                                        points={activityData
                                                            .map((point, index) => {
                                                                const x = START_X + (index / (activityData.length - 1)) * (END_X - START_X);
                                                                const y = 200 - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                                                                return `${x},${y}`;
                                                            })
                                                            .join(' ')}
                                                        className="mood-line"
                                                        strokeLinejoin="round"
                                                    />
                                                    <polyline
                                                        points={activityData
                                                            .map((point, index) => {
                                                                const x = START_X + (index / (activityData.length - 1)) * (END_X - START_X);
                                                                const y = 200 - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                                                                return `${x},${y}`;
                                                            })
                                                            .join(' ')}
                                                        className="energy-line"
                                                        strokeLinejoin="round"
                                                    />
                                                    {activityData.map((point, index) => {
                                                        const x = START_X + (index / (activityData.length - 1)) * (END_X - START_X);
                                                        return (
                                                            <text
                                                                key={point.day}
                                                                x={x}
                                                                y="180"
                                                                className="axis-label"
                                                                textAnchor="middle"
                                                            >
                                                                {point.day}
                                                            </text>
                                                        );
                                                    })}
                                                    {activityData.map((point, index) => {
                                                        const x = START_X + (index / (activityData.length - 1)) * (END_X - START_X);
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
                                                    {activityData.map((point, index) => {
                                                        const x = START_X + (index / (activityData.length - 1)) * (END_X - START_X);
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
                                            Perfect, you need last step! 💪
                                        </p>
                                    </div>

                                    <div className="ai-plan-section">
                                        <h3>AI Plan</h3>
                                        <div className="ai-plan-grid">
                                            {aiPlan.map((item, index) => (
                                                <CircularProgress
                                                    key={index}
                                                    progress={(item.current / item.total) * 100}
                                                    color="#9D2628"
                                                    label={item.label}
                                                    current={item.current}
                                                    total={item.total}
                                                />
                                            ))}
                                        </div>
                                        {/* ← Обновлённая кнопка с обработчиком */}
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
                                <h3 className="section-title">Quick stats</h3>
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
                                <h3 className="section-title">Actions</h3>
                                <div className="action-buttons">
                                    <button className="action-btn red-btn">
                                        <span className="action-icon">📊</span>
                                        Open statistic
                                    </button>
                                    <button className="action-btn red-btn">
                                        <span className="action-icon">🎯</span>
                                        Change goal
                                    </button>
                                </div>
                                <button className="action-btn start-training-btn">
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

            {/* ← Модальное окно в самом конце */}
            <   AddMealModal
                isOpen={isAddMealOpen}
                onClose={() => setIsAddMealOpen(false)}
            />
        </div>
    );
};

export default Dashboard;