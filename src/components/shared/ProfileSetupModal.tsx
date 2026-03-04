// src/components/shared/ProfileSetupModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/apiClient';
import './ProfileSetupModal.css';

interface ProfileSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        lifestyle: '',
        height: '',
        weight: '',
        target_weight: '',
        level: 'beginner',
        weekly_training_goal: '3'
    });

    const ageInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on first field when modal opens
    useEffect(() => {
        if (isOpen && step === 'form') {
            setTimeout(() => {
                ageInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, step]);

    if (!isOpen) return null;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.age || !formData.gender || !formData.lifestyle || !formData.height || !formData.weight) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/profile/setup', {
                age: Number(formData.age),
                gender: formData.gender,
                lifestyle: formData.lifestyle,
                height: Number(formData.height),
                weight: Number(formData.weight),
                target_weight: formData.target_weight ? Number(formData.target_weight) : null,
                level: formData.level,
                weekly_training_goal: Number(formData.weekly_training_goal)
            });

            setStep('success');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Ошибка при сохранении профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleClickBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            // Не закрываем модалку при клике на backdrop - профиль должен быть заполнен
        }
    };

    return (
        <div className="profile-setup-backdrop" onClick={handleClickBackdrop}>
            <div className="profile-setup-modal">
                {step === 'form' && (
                    <>
                        <h3>Заполните профиль</h3>
                        <p className="profile-setup-subtitle">
                            Заполните данные для персонализации опыта
                        </p>

                        <div className="profile-setup-form">
                            {/* Block 1: Basic Info */}
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Возраст *</label>
                                        <input
                                            ref={ageInputRef}
                                            type="number"
                                            placeholder="напр. 25"
                                            value={formData.age}
                                            onChange={(e) => handleInputChange('age', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Пол *</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                        >
                                            <option value="">Выберите пол</option>
                                            <option value="male">Мужской</option>
                                            <option value="female">Женский</option>
                                            <option value="other">Не указывать</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Block 2: Body Metrics */}
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Рост *</label>
                                        <input
                                            type="number"
                                            placeholder="напр. 175 см"
                                            value={formData.height}
                                            onChange={(e) => handleInputChange('height', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Вес *</label>
                                        <input
                                            type="number"
                                            placeholder="напр. 70 кг"
                                            value={formData.weight}
                                            onChange={(e) => handleInputChange('weight', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Block 3: Activity & Experience */}
                            <div className="form-section">
                                <div className="form-field full-width">
                                    <label>Уровень активности *</label>
                                    <select
                                        value={formData.lifestyle}
                                        onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                                    >
                                        <option value="">Выберите уровень активности</option>
                                        <option value="low">Малоподвижный</option>
                                        <option value="medium">Умеренно активный</option>
                                        <option value="high">Очень активный</option>
                                    </select>
                                </div>

                                <div className="form-field full-width">
                                    <label>Уровень физподготовки</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => handleInputChange('level', e.target.value)}
                                    >
                                        <option value="">Выберите уровень</option>
                                        <option value="beginner">Начинающий</option>
                                        <option value="amateur">Средний</option>
                                        <option value="professional">Продвинутый</option>
                                    </select>
                                </div>
                            </div>

                            {/* Block 4: Goals */}
                            <div className="form-section">
                                <div className="form-field full-width">
                                    <label>Целевой вес</label>
                                    <input
                                        type="number"
                                        placeholder="напр. 65 кг"
                                        value={formData.target_weight}
                                        onChange={(e) => handleInputChange('target_weight', e.target.value)}
                                    />
                                    <span className="form-field-helper">Необязательно. Помогает персонализировать план</span>
                                </div>

                                <div className="form-field full-width">
                                    <label>Цель тренировок в неделю</label>
                                    <select
                                        value={formData.weekly_training_goal}
                                        onChange={(e) => handleInputChange('weekly_training_goal', e.target.value)}
                                    >
                                        <option value="">Выберите количество тренировок</option>
                                        <option value="2">2 тренировки в неделю</option>
                                        <option value="3">3 тренировки в неделю</option>
                                        <option value="4">4 тренировки в неделю</option>
                                        <option value="5">5+ тренировок в неделю</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            className="profile-setup-button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : 'Сохранить профиль'}
                        </button>
                        <p className="button-helper-text">Вы можете изменить данные в настройках</p>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">Профиль заполнен!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSetupModal;
