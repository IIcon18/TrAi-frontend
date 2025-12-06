// src/components/pages/Profile.tsx

import React from 'react';
import './Profile.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';

interface UserProfile {
    age: number;
    height: string;
    weight: string;
    lifestyle: string;
    gender: string;
    aiPlan: string;
    photoUrl?: string; // URL изображения или null для иконки по умолчанию
}

const mockUserData: UserProfile = {
    age: 20,
    height: '175cm',
    weight: '73kg',
    lifestyle: 'Medium',
    gender: 'Male',
    aiPlan: '-400kcal',
    photoUrl: undefined // пока без фото — покажем иконку
};

const Profile: React.FC = () => {
    const [isTelegramConnected, setIsTelegramConnected] = React.useState(true);

    const handleRefreshTips = () => {
        alert("AI tips refreshed! 🤖");
        // Здесь можно добавить логику обновления советов через API
    };

    const handleLinkTelegram = () => {
        alert("Connecting to Telegram... (mock)");
        // Здесь логика подключения к Telegram
    };

    return (
        <div className="profile-page">
            <Header />

            <main className="profile-main">
                <div className="profile-wrapper"> {/* ← новый контейнер */}
                    <div className="profile-container">
                    <div className="profile-card">
                        <div className="avatar-wrapper">
                            {mockUserData.photoUrl ? (
                                <img src={mockUserData.photoUrl} alt="Profile" className="avatar-image" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9D2628" strokeWidth="2">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M12 12c-2.8 0-5.2 1.6-6 4h12c-.8-2.4-3.2-4-6-4z" />
                                    </svg>
                                </div>
                            )}
                            <button className="choose-photo-btn">✏️ Choose a photo</button>
                        </div>

                        <div className="profile-info-grid">
                            <div className="info-row">
                                <span className="label">Age:</span>
                                <span className="value">{mockUserData.age} age</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Height:</span>
                                <span className="value">{mockUserData.height}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Weight:</span>
                                <span className="value">{mockUserData.weight}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Lifestyle:</span>
                                <span className="value">{mockUserData.lifestyle}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Gender:</span>
                                <span className="value">{mockUserData.gender}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">AI plan:</span>
                                <span className="value">{mockUserData.aiPlan}</span>
                            </div>
                        </div>

                        <button className="change-btn">✏️ Change</button>
                    </div>

                    {/* Правая колонка: Telegram + AI Tips */}
                    <div className="side-cards">
                        {/* Connect Telegram */}
                        <div className="telegram-card">
                            <h3>Connect Telegram</h3>
                            <button
                                className="link-telegram-btn"
                                onClick={handleLinkTelegram}
                            >
                                Link Telegram
                            </button>
                            {isTelegramConnected && (
                                <div className="status-connected">
                                    <div className="dot"></div>
                                    Connected
                                </div>
                            )}
                        </div>

                        {/* AI Tips */}
                        <div className="ai-tips-card">
                            <h3>
                                <span className="ai-icon">🤖</span> AI tips
                            </h3>
                            <p className="tip-text">
                                Try reducing your rest time to 45s
                            </p>
                            <button
                                className="refresh-tips-btn"
                                onClick={handleRefreshTips}
                            >
                                ↻ Refresh tips
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

export default Profile;