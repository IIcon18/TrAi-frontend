import React, { useEffect, useState } from 'react';
import './Profile.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import apiClient from '../../api/apiClient';

interface AITip {
  tip: string;
}

interface ProfileResponse {
  id: number;
  email: string;
  age: number;
  height: number;
  weight: number;
  lifestyle: string;
  gender: string | null;
  ai_calorie_plan: string | null;
  avatar: string | null;
  telegram_connected: boolean;
  telegram_chat_id?: string | null;
  ai_tips: AITip[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingTips, setRefreshingTips] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get<ProfileResponse>('/profile/profile/');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRefreshTips = async () => {
    if (!profile) return;
    setRefreshingTips(true);
    try {
      const res = await apiClient.post('/profile/refresh-ai-tips');
      setProfile((prev) =>
        prev ? { ...prev, ai_tips: res.data.ai_tips } : prev
      );
    } catch (err) {
      console.error('Failed to refresh AI tips:', err);
    } finally {
      setRefreshingTips(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!profile) return;
    try {
      const telegramChatId = prompt('Enter your Telegram chat ID:');
      if (!telegramChatId) return;
      await apiClient.post('/profile/connect-telegram', {
        telegram_chat_id: telegramChatId,
      });
      setProfile({ ...profile, telegram_connected: true, telegram_chat_id: telegramChatId });
    } catch (err) {
      console.error('Failed to connect Telegram:', err);
    }
  };

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Loading profile...</p>
        ) : profile ? (
          <div className="profile-wrapper">
            {/* Левая карточка */}
            <div className="profile-card">
              <div className="avatar-wrapper">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="avatar-image" />
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
                  <span className="value">{profile.age} years</span>
                </div>
                <div className="info-row">
                  <span className="label">Height:</span>
                  <span className="value">{profile.height} cm</span>
                </div>
                <div className="info-row">
                  <span className="label">Weight:</span>
                  <span className="value">{profile.weight} kg</span>
                </div>
                <div className="info-row">
                  <span className="label">Lifestyle:</span>
                  <span className="value">{profile.lifestyle}</span>
                </div>
                {profile.gender && (
                  <div className="info-row">
                    <span className="label">Gender:</span>
                    <span className="value">{profile.gender}</span>
                  </div>
                )}
                {profile.ai_calorie_plan && (
                  <div className="info-row">
                    <span className="label">AI plan:</span>
                    <span className="value">{profile.ai_calorie_plan}</span>
                  </div>
                )}
              </div>

              <button className="change-btn">✏️ Change</button>
            </div>

            {/* Правая колонка: Telegram + AI Tips */}
            <div className="side-cards">
              <div className="telegram-card">
                <h3>Connect Telegram</h3>
                <button
                  className="link-telegram-btn"
                  onClick={handleLinkTelegram}
                >
                  Link Telegram
                </button>
                {profile.telegram_connected && (
                  <div className="status-connected">
                    <div className="dot"></div>
                    Connected
                  </div>
                )}
              </div>

              <div className="ai-tips-card">
                <h3>
                  <span className="ai-icon">🤖</span> AI tips
                </h3>
                {profile.ai_tips && profile.ai_tips.length > 0 ? (
                  profile.ai_tips.map((tipObj, i) => (
                    <p key={i} className="tip-text">{tipObj.tip}</p>
                  ))
                ) : (
                  <p className="tip-text">No tips yet</p>
                )}
                <button
                  className="refresh-tips-btn"
                  onClick={handleRefreshTips}
                  disabled={refreshingTips}
                >
                  ↻ {refreshingTips ? 'Refreshing...' : 'Refresh tips'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'white', textAlign: 'center' }}>Profile not found</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;