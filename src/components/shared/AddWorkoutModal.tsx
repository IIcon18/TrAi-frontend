// src/components/shared/AddWorkoutModal.tsx
import React, { useState, useCallback } from 'react';
import './AddWorkoutModal.css';
import apiClient from '../../api/apiClient';

type MuscleGroup = 'upper_body_push' | 'upper_body_pull' | 'core_stability' | 'lower_body';
type Intensity = 'low' | 'medium' | 'high';

interface Exercise {
    name: string;
    description: string;
    equipment: string;
    sets: number;
    reps: number;
    weight: number;
    intensity: Intensity;
}

interface AddWorkoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWorkoutAdded?: () => void;
}

const muscleGroups: { value: MuscleGroup; label: string }[] = [
    { value: 'upper_body_push', label: 'Upper Body Push 💪' },
    { value: 'upper_body_pull', label: 'Upper Body Pull 🔙' },
    { value: 'core_stability', label: 'Core & Stability 🧘' },
    { value: 'lower_body', label: 'Lower Body 🦵' },
];

const equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'resistance_band', label: 'Resistance Band' },
    { value: 'machine', label: 'Machine' },
    { value: 'none', label: 'No Equipment' },
];

const AddWorkoutModal: React.FC<AddWorkoutModalProps> = ({ isOpen, onClose, onWorkoutAdded }) => {
    const [step, setStep] = useState<'select' | 'add-exercises' | 'success'>('select');
    const [workoutName, setWorkoutName] = useState<string>('');
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup>('upper_body_push');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExercise, setCurrentExercise] = useState<Exercise>({
        name: '',
        description: '',
        equipment: 'bodyweight',
        sets: 3,
        reps: 10,
        weight: 0,
        intensity: 'medium',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const resetState = useCallback(() => {
        setStep('select');
        setWorkoutName('');
        setSelectedMuscleGroup('upper_body_push');
        setExercises([]);
        setCurrentExercise({
            name: '',
            description: '',
            equipment: 'bodyweight',
            sets: 3,
            reps: 10,
            weight: 0,
            intensity: 'medium',
        });
        setError('');
        setLoading(false);
    }, []);

    const handleSelectMuscleGroup = (group: MuscleGroup) => {
        setSelectedMuscleGroup(group);
        setWorkoutName(`Custom ${muscleGroups.find(g => g.value === group)?.label || 'Workout'}`);
        setStep('add-exercises');
    };

    const handleAddExercise = () => {
        if (!currentExercise.name.trim()) {
            setError('Exercise name is required');
            return;
        }

        setExercises([...exercises, currentExercise]);
        setCurrentExercise({
            name: '',
            description: '',
            equipment: 'bodyweight',
            sets: 3,
            reps: 10,
            weight: 0,
            intensity: 'medium',
        });
        setError('');
    };

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSaveWorkout = async () => {
        if (exercises.length === 0) {
            setError('Add at least one exercise');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiClient.post('/workouts/create-manual', {
                name: workoutName,
                muscle_group: selectedMuscleGroup,
                exercises: exercises,
            });

            setStep('success');

            if (onWorkoutAdded) {
                onWorkoutAdded();
            }

            setTimeout(() => {
                resetState();
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to create workout:', err);
            setError('Failed to create workout');
        } finally {
            setLoading(false);
        }
    };

    const handleClickBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            resetState();
            onClose();
        }
    };

    // Проверка видимости модалки (ПОСЛЕ всех хуков!)
    if (!isOpen) return null;

    return (
        <div className="add-workout-backdrop" onClick={handleClickBackdrop}>
            <div className="add-workout-modal">
                {step === 'select' && (
                    <>
                        <h3>Create Workout</h3>
                        {error && <div className="error-message">{error}</div>}
                        <p className="modal-subtitle">Select muscle group</p>
                        <div className="muscle-group-list">
                            {muscleGroups.map((group) => (
                                <div
                                    key={group.value}
                                    className="muscle-group-item"
                                    onClick={() => handleSelectMuscleGroup(group.value)}
                                >
                                    <span className="muscle-group-label">{group.label}</span>
                                    <button className="muscle-group-plus">+</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === 'add-exercises' && (
                    <>
                        <h3>{workoutName}</h3>
                        {error && <div className="error-message">{error}</div>}

                        {/* Список добавленных упражнений */}
                        {exercises.length > 0 && (
                            <div className="exercises-list">
                                <h4>Exercises ({exercises.length})</h4>
                                {exercises.map((ex, idx) => (
                                    <div key={idx} className="exercise-item">
                                        <div className="exercise-info">
                                            <div className="exercise-name">{ex.name}</div>
                                            <div className="exercise-details">
                                                {ex.sets}×{ex.reps} | {ex.weight > 0 ? `${ex.weight}kg` : 'BW'} | {ex.equipment}
                                            </div>
                                        </div>
                                        <button
                                            className="remove-exercise-btn"
                                            onClick={() => handleRemoveExercise(idx)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Форма добавления упражнения */}
                        <div className="add-exercise-form">
                            <h4>Add Exercise</h4>

                            <input
                                type="text"
                                className="exercise-input"
                                placeholder="Exercise name (e.g., Push-ups)"
                                value={currentExercise.name}
                                onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                            />

                            <textarea
                                className="exercise-textarea"
                                placeholder="Description (optional)"
                                value={currentExercise.description}
                                onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                                rows={2}
                            />

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Equipment</label>
                                    <select
                                        className="exercise-select"
                                        value={currentExercise.equipment}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, equipment: e.target.value })}
                                    >
                                        {equipmentOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Intensity</label>
                                    <select
                                        className="exercise-select"
                                        value={currentExercise.intensity}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, intensity: e.target.value as Intensity })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sets</label>
                                    <input
                                        type="number"
                                        className="exercise-number-input"
                                        min="1"
                                        max="10"
                                        value={currentExercise.sets}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) || 1 })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Reps</label>
                                    <input
                                        type="number"
                                        className="exercise-number-input"
                                        min="1"
                                        max="50"
                                        value={currentExercise.reps}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, reps: parseInt(e.target.value) || 1 })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="exercise-number-input"
                                        min="0"
                                        max="500"
                                        value={currentExercise.weight}
                                        onChange={(e) => setCurrentExercise({ ...currentExercise, weight: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <button className="add-exercise-btn" onClick={handleAddExercise}>
                                + Add Exercise
                            </button>
                        </div>

                        {/* Кнопки управления */}
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setStep('select')}
                            >
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleSaveWorkout}
                                disabled={loading || exercises.length === 0}
                            >
                                {loading ? 'Saving...' : `Save Workout (${exercises.length} exercises)`}
                            </button>
                        </div>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">Workout created successfully!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddWorkoutModal;
