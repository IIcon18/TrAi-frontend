// src/components/shared/ChangeGoalModal.tsx
import React, { useState } from 'react';
import './ChangeGoalModal.css'; // ← теперь без конфликтов

interface ChangeGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangeGoalModal: React.FC<ChangeGoalModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'goal' | 'days' | 'success'>('goal');
    const [goal, setGoal] = useState<string>('lose weight');
    const [level, setLevel] = useState<string>('beginner');
    const [daysCount, setDaysCount] = useState<number>(3);
    const [selectedDays, setSelectedDays] = useState<{
        Monday: boolean;
        Tuesday: boolean;
        Wednesday: boolean;
        Thursday: boolean;
        Friday: boolean;
        Saturday: boolean;
        Sunday: boolean;
    }>({
        Monday: true,
        Tuesday: false,
        Wednesday: true,
        Thursday: false,
        Friday: true,
        Saturday: false,
        Sunday: false,
    });

    if (!isOpen) return null;

    const handleConfirmGoal = () => {
        const selectedDaysCount = Object.values(selectedDays).filter(Boolean).length;
        if (selectedDaysCount < daysCount) {
            alert(`Please select at least ${daysCount} days.`);
            return;
        }
        setStep('days');
    };

    const handleConfirmDays = () => {
        setStep('success');
        setTimeout(() => {
            onClose();
        }, 2000);
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
                            <h2 className="change-goal-title">Change your goal</h2>
                        </div>
                        <div className="change-goal-form">
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">What do you want?</label>
                                <select
                                    className="change-goal-select"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                >
                                    <option value="lose weight">Lose weight</option>
                                    <option value="gain muscle">Gain muscle</option>
                                    <option value="maintain weight">Maintain weight</option>
                                </select>
                            </div>
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">What your level in sport?</label>
                                <select
                                    className="change-goal-select"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="change-goal-form-group">
                                <label className="change-goal-label">How much days do you prefer for workouts?</label>
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
                            ✓ Confirm
                        </button>
                    </>
                )}

                {step === 'days' && (
                    <>
                        <div className="change-goal-header">
                            <h2 className="change-goal-title">Select days for workouts</h2>
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
                                ⚙️ Skip
                            </button>
                            <button
                                className="change-goal-button confirm"
                                onClick={handleConfirmDays}
                            >
                                ✓ Confirm
                            </button>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="change-goal-success-message">
                        <div className="change-goal-success-icon">✓</div>
                        <div className="change-goal-success-text">Your goal successfully changed!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangeGoalModal;