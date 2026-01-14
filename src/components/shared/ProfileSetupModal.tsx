// src/components/shared/ProfileSetupModal.tsx
import React, { useState } from 'react';
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
            await apiClient.post('/profile/profile/setup', {
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
                        <h3>Complete Your Profile</h3>
                        <p className="profile-setup-subtitle">
                            Please fill in your details to personalize your experience
                        </p>

                        <div className="profile-setup-form">
                            <div className="form-row">
                                <div className="form-field">
                                    <label>Age *</label>
                                    <input
                                        type="number"
                                        placeholder="25"
                                        value={formData.age}
                                        onChange={(e) => handleInputChange('age', e.target.value)}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Gender *</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Height (cm) *</label>
                                    <input
                                        type="number"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={(e) => handleInputChange('height', e.target.value)}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Weight (kg) *</label>
                                    <input
                                        type="number"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={(e) => handleInputChange('weight', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-field full-width">
                                <label>Lifestyle *</label>
                                <select
                                    value={formData.lifestyle}
                                    onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                                >
                                    <option value="">Select your activity level</option>
                                    <option value="low">Low (sedentary work)</option>
                                    <option value="medium">Medium (moderate activity)</option>
                                    <option value="high">High (active lifestyle)</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Target Weight (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="65"
                                        value={formData.target_weight}
                                        onChange={(e) => handleInputChange('target_weight', e.target.value)}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Fitness Level</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => handleInputChange('level', e.target.value)}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="amateur">Amateur</option>
                                        <option value="professional">Professional</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-field full-width">
                                <label>Weekly Training Goal</label>
                                <select
                                    value={formData.weekly_training_goal}
                                    onChange={(e) => handleInputChange('weekly_training_goal', e.target.value)}
                                >
                                    <option value="1">1 workout per week</option>
                                    <option value="2">2 workouts per week</option>
                                    <option value="3">3 workouts per week</option>
                                    <option value="4">4 workouts per week</option>
                                    <option value="5">5 workouts per week</option>
                                    <option value="6">6 workouts per week</option>
                                    <option value="7">7 workouts per week</option>
                                </select>
                            </div>
                        </div>

                        <button
                            className="profile-setup-button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">Profile completed!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSetupModal;
