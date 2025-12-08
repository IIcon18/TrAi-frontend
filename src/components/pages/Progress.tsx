// src/components/pages/Progress.tsx
import React, { useState } from 'react';
import './Progress.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import GoalOverviewCircle from '../shared/GoalOverviewCircle';

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
}

// Пример моковых данных — можно заменить на реальные из API
const mockProgressData: ProgressData = {
    username: "@username",
    activityData: [
        { day: "Monday", mood: 7, energy: 6 },
        { day: "Tuesday", mood: 8, energy: 7 },
        { day: "Wednesday", mood: 6, energy: 8 },
        { day: "Thursday", mood: 9, energy: 5 },
        { day: "Friday", mood: 8, energy: 9 },
        { day: "Saturday", mood: 7, energy: 7 },
        { day: "Sunday", mood: 9, energy: 8 }
    ],
    goalOverview: {
        percentage: 65,
        weightChange: "-1,8 kg",
        caloriesChange: "-370kcal",
        streak: 2
    },
    nutritionProgress: {
        proteins: { current: 65, total: 120 },
        carbohydrates: { current: 30, total: 120 },
        fats: { current: 40, total: 80 }
    }
};

const Progress: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'weight' | 'bodyFat' | 'workouts' | 'recovery'>('weight');

    // Здесь вы можете изменять данные динамически
    const [progressData, setProgressData] = useState<ProgressData>(mockProgressData);

    // Функция для изменения данных (например, при клике на кнопку или из API)
    const updateProgressData = (newData: Partial<ProgressData>) => {
        setProgressData(prev => ({ ...prev, ...newData }));
    };

    return (
        <div className="progress-page">
            <Header />
            <main className="progress-main">
                <div className="progress-container">
                    {/* Основная сетка */}
                    <div className="progress-content">
                        {/* Левая колонка: График */}
                        <div className="progress-left-column">
                            <div className="progress-card">
                                <h1 className="progress-page-title">Your Progress</h1>

                                {/* Вкладки */}
                                <div className="progress-tabs-container">
                                    <button
                                        className={`progress-tab-button ${activeTab === 'weight' ? 'progress-active' : ''}`}
                                        onClick={() => setActiveTab('weight')}
                                    >
                                        Weight
                                    </button>
                                    <button
                                        className={`progress-tab-button ${activeTab === 'bodyFat' ? 'progress-active' : ''}`}
                                        onClick={() => setActiveTab('bodyFat')}
                                    >
                                        Body Fat
                                    </button>
                                    <button
                                        className={`progress-tab-button ${activeTab === 'workouts' ? 'progress-active' : ''}`}
                                        onClick={() => setActiveTab('workouts')}
                                    >
                                        Workouts
                                    </button>
                                    <button
                                        className={`progress-tab-button ${activeTab === 'recovery' ? 'progress-active' : ''}`}
                                        onClick={() => setActiveTab('recovery')}
                                    >
                                        Recovery
                                    </button>
                                </div>

                                {/* График активности */}
                                <div className="progress-activity-chart-wrapper">
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
                                                    points={progressData.activityData
                                                        .map((point, index) => {
                                                            const x = START_X + (index / (progressData.activityData.length - 1)) * (END_X - START_X);
                                                            const y = 200 - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                                                            return `${x},${y}`;
                                                        })
                                                        .join(' ')}
                                                    className="mood-line"
                                                    strokeLinejoin="round"
                                                />
                                                <polyline
                                                    points={progressData.activityData
                                                        .map((point, index) => {
                                                            const x = START_X + (index / (progressData.activityData.length - 1)) * (END_X - START_X);
                                                            const y = 200 - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                                                            return `${x},${y}`;
                                                        })
                                                        .join(' ')}
                                                    className="energy-line"
                                                    strokeLinejoin="round"
                                                />
                                                {progressData.activityData.map((point, index) => {
                                                    const x = START_X + (index / (progressData.activityData.length - 1)) * (END_X - START_X);
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
                                                {progressData.activityData.map((point, index) => {
                                                    const x = START_X + (index / (progressData.activityData.length - 1)) * (END_X - START_X);
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
                                                {progressData.activityData.map((point, index) => {
                                                    const x = START_X + (index / (progressData.activityData.length - 1)) * (END_X - START_X);
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

                                {/* Сообщение от AI */}
                                <div className="progress-ai-message">
                                    <div className="progress-ai-icon">🤖</div>
                                    <p className="progress-message-text">
                                        Great consistency this month! You're 2 weeks ahead of plan 🔥
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка: Статистика */}
                        <div className="progress-right-column">
                            {/* Goal Overview */}
                            <div className="progress-goal-overview-card">
                                <h3 className="progress-card-title">Goal Overview</h3>
                                <div className="progress-goal-circle-wrapper">
                                    <GoalOverviewCircle
                                        percentage={progressData.goalOverview.percentage}
                                        size={100}          // ← Изменено по вашему запросу
                                        strokeWidth={10}    // ← Изменено по вашему запросу
                                        filledColor="#4CAF50"   // ← Зелёный — заполненная часть
                                        emptyColor="#9D2628"    // ← Красный — незаполненная часть
                                        textColor="white"
                                        textSize={20}       // ← Изменено по вашему запросу
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

                            {/* Your Nutrition Progress — НОВЫЙ БЛОК */}
                            <div className="progress-nutrition-card">
                                <h3 className="progress-card-title">Your Nutrition Progress</h3>
                                <div className="nutrition-progress-list">
                                    {/* Proteins */}
                                    <div className="nutrition-item">
                                        <div className="nutrition-label">Proteins</div>
                                        <div className="nutrition-bar">
                                            <div
                                                className="nutrition-fill"
                                                style={{
                                                    width: `${(progressData.nutritionProgress.proteins.current / progressData.nutritionProgress.proteins.total) * 100}%`,
                                                    backgroundColor: '#9D2628'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="nutrition-value">
                                            {progressData.nutritionProgress.proteins.current}/{progressData.nutritionProgress.proteins.total}g
                                        </div>
                                    </div>

                                    {/* Carbohydrates */}
                                    <div className="nutrition-item">
                                        <div className="nutrition-label">Carbohydrates</div>
                                        <div className="nutrition-bar">
                                            <div
                                                className="nutrition-fill"
                                                style={{
                                                    width: `${(progressData.nutritionProgress.carbohydrates.current / progressData.nutritionProgress.carbohydrates.total) * 100}%`,
                                                    backgroundColor: '#9D2628'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="nutrition-value">
                                            {progressData.nutritionProgress.carbohydrates.current}/{progressData.nutritionProgress.carbohydrates.total}g
                                        </div>
                                    </div>

                                    {/* Fats */}
                                    <div className="nutrition-item">
                                        <div className="nutrition-label">Fats</div>
                                        <div className="nutrition-bar">
                                            <div
                                                className="nutrition-fill"
                                                style={{
                                                    width: `${(progressData.nutritionProgress.fats.current / progressData.nutritionProgress.fats.total) * 100}%`,
                                                    backgroundColor: '#9D2628'
                                                }}
                                            ></div>
                                        </div>
                                        <div className="nutrition-value">
                                            {progressData.nutritionProgress.fats.current}/{progressData.nutritionProgress.fats.total}g
                                        </div>
                                    </div>
                                </div>
                                <button className="progress-add-meal-button">
                                    + Add meal
                                </button>
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