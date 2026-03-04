import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import Header from '../shared/Header/Header';
import Footer from '../shared/Footer/Footer';
import apiClient from '../../api/apiClient';
import ProfileSetupModal from '../shared/ProfileSetupModal';
import { useAuth } from '../../hooks/useAuth';
import SEOHead from '../SEOHead';

interface AITip {
  tip: string;
}

interface ProfileResponse {
  id: number;
  nickname: string;
  email: string;
  profile_completed: boolean;
  age: number | null;
  height: number | null;
  weight: number | null;
  lifestyle: string | null;
  gender: string | null;
  ai_calorie_plan: string | null;
  avatar: string | null;
  telegram_connected: boolean;
  telegram_chat_id?: string | null;
  ai_tips: AITip[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingTips, setRefreshingTips] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get<ProfileResponse>('/profile/');
      const profileData = res.data;
      if (profileData.ai_tips && profileData.ai_tips.length > 0) {
        profileData.ai_tips = [profileData.ai_tips[0]];
      }
      setProfile(profileData);

      // Показываем модалку если профиль не заполнен
      if (!profileData.profile_completed) {
        setShowSetupModal(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      if (err?.response?.status !== 401) {
        // Можно показать уведомление об ошибке
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefreshTips = async () => {
    if (!profile) return;
    setRefreshingTips(true);
    try {
      const res = await apiClient.post('/profile/refresh-ai-tips');

      if (res.data && res.data.ai_tips && Array.isArray(res.data.ai_tips) && res.data.ai_tips.length > 0) {
        const newTip = [res.data.ai_tips[0]];
        setProfile((prev) =>
          prev ? { ...prev, ai_tips: newTip } : prev
        );
      } else {
        alert('Не удалось получить новый совет. Попробуйте еще раз.');
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        const errorMessage = err?.response?.data?.detail || err?.message || 'Не удалось обновить совет';
        alert(`Ошибка: ${errorMessage}. Попробуйте еще раз.`);
      }
    } finally {
      setRefreshingTips(false);
    }
  };

  const handleLinkTelegram = async () => {
    if (!profile) return;
    try {
      const telegramChatId = prompt('Введите ваш Telegram chat ID:');
      if (!telegramChatId) return;
      await apiClient.post('/profile/connect-telegram', {
        telegram_chat_id: telegramChatId,
      });
      setProfile({ ...profile, telegram_connected: true, telegram_chat_id: telegramChatId });
    } catch (err) {
      console.error('Failed to connect Telegram:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSetupSuccess = () => {
    setShowSetupModal(false);
    fetchProfile(); // Перезагружаем профиль после заполнения
  };

  return (
    <div className="profile-page">
      <SEOHead
        title="Профиль"
        description="Управление профилем и настройками TrAi"
        noIndex={true}
      />
      <Header />
      <main className="profile-main">
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Загрузка профиля...</p>
        ) : profile ? (
          <div className="profile-wrapper">
            {/* Левая колонка: Профиль */}
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
                <button className="choose-photo-btn">Выбрать фото</button>
              </div>

              <div className="profile-info-grid">
                <div className="info-row">
                  <span className="label">Никнейм:</span>
                  <span className="value">{profile.nickname}</span>
                </div>
                {profile.age && (
                  <div className="info-row">
                    <span className="label">Возраст:</span>
                    <span className="value">{profile.age} лет</span>
                  </div>
                )}
                {profile.height && (
                  <div className="info-row">
                    <span className="label">Рост:</span>
                    <span className="value">{profile.height} см</span>
                  </div>
                )}
                {profile.weight && (
                  <div className="info-row">
                    <span className="label">Вес:</span>
                    <span className="value">{profile.weight} кг</span>
                  </div>
                )}
                {profile.lifestyle && (
                  <div className="info-row">
                    <span className="label">Активность:</span>
                    <span className="value">{profile.lifestyle}</span>
                  </div>
                )}
                {profile.gender && (
                  <div className="info-row">
                    <span className="label">Пол:</span>
                    <span className="value">{profile.gender}</span>
                  </div>
                )}
                {profile.ai_calorie_plan && (
                  <div className="info-row">
                    <span className="label">ИИ-план:</span>
                    <span className="value">{profile.ai_calorie_plan}</span>
                  </div>
                )}
              </div>

              {!profile.profile_completed && (
                <button
                  className="complete-profile-btn"
                  onClick={() => setShowSetupModal(true)}
                >
                  Заполнить профиль
                </button>
              )}

              <button className="change-btn">Изменить</button>

              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </div>

            {/* Правая колонка: Telegram + AI Tips */}
            <div className="side-cards">
              <div className="telegram-card">
                <h3>Подключить Telegram</h3>
                <button
                  className="link-telegram-btn"
                  onClick={handleLinkTelegram}
                >
                  Привязать Telegram
                </button>
                {profile.telegram_connected && (
                  <div className="status-connected">
                    <div className="dot"></div>
                    Подключено
                  </div>
                )}
              </div>

              <div className="ai-tips-card">
                <h3>
                  <span className="ai-icon">AI</span> подсказка
                </h3>
                {profile.ai_tips && profile.ai_tips.length > 0 ? (
                  <p className="tip-text">{profile.ai_tips[0].tip}</p>
                ) : (
                  <p className="tip-text">{profile.profile_completed ? 'Пока нет подсказок' : 'Заполните профиль для получения ИИ-подсказок'}</p>
                )}
                <button
                  className="refresh-tips-btn"
                  onClick={handleRefreshTips}
                  disabled={refreshingTips || !profile.profile_completed}
                >
                  {refreshingTips ? 'Генерация...' : 'Сгенерировать новую'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'white', textAlign: 'center' }}>Профиль не найден</p>
        )}
      </main>
      <Footer />

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={handleSetupSuccess}
      />
    </div>
  );
};

export default Profile;