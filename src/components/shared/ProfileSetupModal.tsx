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
                        <h3>Complete Your Profile</h3>
                        <p className="profile-setup-subtitle">
                            Please fill in your details to personalize your experience
                        </p>

                        <div className="profile-setup-form">
                            {/* Block 1: Basic Info */}
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Age *</label>
                                        <input
                                            ref={ageInputRef}
                                            type="number"
                                            placeholder="e.g. 25"
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
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Block 2: Body Metrics */}
                            <div className="form-section">
                                <div className="form-row">
                                    <div className="form-field">
                                        <label>Height *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 175 cm"
                                            value={formData.height}
                                            onChange={(e) => handleInputChange('height', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label>Weight *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 70 kg"
                                            value={formData.weight}
                                            onChange={(e) => handleInputChange('weight', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Block 3: Activity & Experience */}
                            <div className="form-section">
                                <div className="form-field full-width">
                                    <label>Activity Level *</label>
                                    <select
                                        value={formData.lifestyle}
                                        onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                                    >
                                        <option value="">Select activity level</option>
                                        <option value="low">Sedentary (low activity)</option>
                                        <option value="medium">Lightly active</option>
                                        <option value="high">Very active</option>
                                    </select>
                                </div>

                                <div className="form-field full-width">
                                    <label>Fitness Level</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => handleInputChange('level', e.target.value)}
                                    >
                                        <option value="">Select fitness level</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="amateur">Intermediate</option>
                                        <option value="professional">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Block 4: Goals */}
                            <div className="form-section">
                                <div className="form-field full-width">
                                    <label>Target Weight</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 65 kg"
                                        value={formData.target_weight}
                                        onChange={(e) => handleInputChange('target_weight', e.target.value)}
                                    />
                                    <span className="form-field-helper">Optional. Helps us personalize your plan</span>
                                </div>

                                <div className="form-field full-width">
                                    <label>Weekly Training Goal</label>
                                    <select
                                        value={formData.weekly_training_goal}
                                        onChange={(e) => handleInputChange('weekly_training_goal', e.target.value)}
                                    >
                                        <option value="">Choose workouts per week</option>
                                        <option value="2">2 workouts / week</option>
                                        <option value="3">3 workouts / week</option>
                                        <option value="4">4 workouts / week</option>
                                        <option value="5">5+ workouts / week</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            className="profile-setup-button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                        <p className="button-helper-text">You can update these details anytime in settings</p>
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
