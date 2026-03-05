// src/components/shared/ChangeGoalModal.tsx
import React, { useState } from 'react';
import './ChangeGoalModal.css';
import apiClient from '../../api/apiClient';

interface ChangeGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type DayName = 'Понедельник' | 'Вторник' | 'Среда' | 'Четверг' | 'Пятница' | 'Суббота' | 'Воскресенье';

const goalTypeMap: Record<string, string> = {
    'lose weight': 'weight_loss',
    'gain muscle': 'muscle_gain',
    'maintain weight': 'maintenance',
};

const levelMap: Record<string, string> = {
    'beginner': 'beginner',
    'intermediate': 'amateur',
    'advanced': 'professional',
};

const ChangeGoalModal: React.FC<ChangeGoalModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'goal' | 'days' | 'success'>('goal');
    const [goal, setGoal] = useState<string>('lose weight');
    const [level, setLevel] = useState<string>('beginner');
    const [daysCount, setDaysCount] = useState<number>(3);
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedDays, setSelectedDays] = useState<Record<DayName, boolean>>({
        Понедельник: true,
        Вторник: false,
        Среда: true,
        Четверг: false,
        Пятница: true,
        Суббота: false,
        Воскресенье: false,
    });

    if (!isOpen) return null;

    const handleConfirmGoal = () => {
        setStep('days');
    };

    const handleConfirmDays = async () => {
        const selectedDaysList = (Object.keys(selectedDays) as DayName[])
            .filter(day => selectedDays[day]);

        if (selectedDaysList.length !== daysCount) {
            alert(`Пожалуйста, выберите ровно ${daysCount} дней.`);
            return;
        }

        setSaving(true);
        try {
            await apiClient.put('/goals/complete', {
                goal_type: goalTypeMap[goal] || 'weight_loss',
                level: levelMap[level] || 'beginner',
                training_days_per_week: daysCount,
                training_days: selectedDaysList,
            });

            setStep('success');
            setTimeout(() => {
                onClose();
                onSuccess?.();
            }, 2000);
        } catch (error: any) {
            console.error('Failed to save goal:', error);
            const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error';
            alert(`Не удалось сохранить цель: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day: keyof typeof selectedDays) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const handleSkip = () => {
        setStep('success');
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    const handleClickBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="change-goal-backdrop" onClick={handleClickBackdrop}>
            <div className="change-goal-modal">
                {step === 'goal' && (
                    <>
                        <div className="change-goal-header">
                            <h2 className="change-goal-title">Изменить цель</h2>
                        </div>
                        <div className="change-goal-form">
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">Что вы хотите?</label>
                                <select
                                    className="change-goal-select"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                >
                                    <option value="lose weight">Похудеть</option>
                                    <option value="gain muscle">Набрать мышцы</option>
                                    <option value="maintain weight">Поддерживать вес</option>
                                </select>
                            </div>
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">Какой ваш уровень в спорте?</label>
                                <select
                                    className="change-goal-select"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="beginner">Начинающий</option>
                                    <option value="intermediate">Средний</option>
                                    <option value="advanced">Продвинутый</option>
                                </select>
                            </div>
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">Сколько дней в неделю вы хотите тренироваться?</label>
                                <input
                                    type="number"
                                    className="change-goal-input"
                                    min="1"
                                    max="7"
                                    value={daysCount}
                                    onChange={(e) => setDaysCount(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                        <button
                            className="change-goal-button confirm"
                            onClick={handleConfirmGoal}
                        >
                            ✓ Подтвердить
                        </button>
                    </>
                )}

                {step === 'days' && (
                    <>
                        <div className="change-goal-header">
                            <h2 className="change-goal-title">Выберите дни тренировок</h2>
                        </div>
                        <div className="change-goal-days-selector">
                            {Object.keys(selectedDays).map(day => (
                                <div key={day} className="change-goal-day-item">
                                    <span className="change-goal-day-name">{day}</span>
                                    <div
                                        className={`change-goal-checkbox ${selectedDays[day as keyof typeof selectedDays] ? 'checked' : ''}`}
                                        onClick={() => toggleDay(day as keyof typeof selectedDays)}
                                    >
                                        <span className="change-goal-checkbox-icon">✓</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="change-goal-buttons-row">
                            <button
                                className="change-goal-button skip"
                                onClick={handleSkip}
                            >
                                ⚙️ Пропустить
                            </button>
                            <button
                                className="change-goal-button confirm"
                                onClick={handleConfirmDays}
                                disabled={saving}
                            >
                                {saving ? 'Сохранение...' : '✓ Подтвердить'}
                            </button>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="change-goal-success-message">
                        <div className="change-goal-success-icon">✓</div>
                        <div className="change-goal-success-text">Цель успешно изменена!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangeGoalModal;