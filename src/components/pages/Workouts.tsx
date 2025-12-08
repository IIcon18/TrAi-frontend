// src/components/pages/Workouts.tsx
import React from 'react';
import './Workouts.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';

interface Workout {
    number: number;
    exercise: string;
    weight: string;
    loadColor: string;
}

const Workouts: React.FC = () => {
    const currentWorkout: Workout[] = [
        {
            number: 1,
            exercise: "Приседания в тренажере Гакк - 3 подхода по 8 повторений",
            weight: "60kg",
            loadColor: "#FFD700"
        },
        {
            number: 2,
            exercise: "Суперсет - 3 подхода\n|--Разгибания ног в тренажере - 12 повторений\n|-- Сгибания ног в тренажере -12 повторений",
            weight: "35kg / 40kg",
            loadColor: "#FF4500"
        },
        {
            number: 3,
            exercise: "Подъем носков на икры - 4 подхода",
            weight: "35kg",
            loadColor: "#32CD32"
        }
    ];

    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString('default', { month: 'long' });
    const dayName = today.toLocaleString('default', { weekday: 'long' });

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
                                <button className="wk-plan-tab">Upper body push</button>
                                <button className="wk-plan-tab">Upper body pull</button>
                                <button className="wk-plan-tab">Core & stability</button>
                                <button className="wk-plan-tab wk-active">Lower body</button>
                            </div>
                            <div className="wk-plan-table">
                                <div className="wk-table-header">
                                    <div className="wk-header-cell">Number</div>
                                    <div className="wk-header-cell">Exercises</div>
                                    <div className="wk-header-cell">Your work weight</div>
                                    <div className="wk-header-cell">Load</div>
                                </div>
                                {currentWorkout.map((item, index) => (
                                    <div key={index} className="wk-table-row">
                                        <div className="wk-cell">{item.number}:</div>
                                        <div className="wk-cell">{item.exercise}</div>
                                        <div className="wk-cell">
                                            <div className="wk-weight-badge">{item.weight}</div>
                                        </div>
                                        <div className="wk-cell">
                                            <div className="wk-load-dot" style={{ backgroundColor: item.loadColor }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="wk-plan-actions">
                                <button className="wk-action-button wk-end-workout">✓ End workout</button>
                                <button className="wk-action-button wk-generate-new">🔄 Generate new</button>
                                <button className="wk-action-button wk-add-workout">+ Add your workout</button>
                            </div>
                        </div>

                        {/* Right Column: Actions + Calendar */}
                        <div className="wk-right-column">
                            <div className="wk-actions-card">
                                <h3 className="wk-actions-title">Actions</h3>
                                <div className="wk-actions-buttons">
                                    <button className="wk-action-button wk-open-statistic">📊 Open statistic</button>
                                    <button className="wk-action-button wk-change-goal">🎯 Change goal</button>
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
                                    <div className="wk-calendar-message">
                                        Tomorrow you have rest!
                                    </div>
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