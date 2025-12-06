// AddMealModal.tsx
import React from 'react';
import './AddMealModal.css';

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleClickBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const meals = [
        { name: 'Breakfast', icon: '🍽️' },
        { name: 'Lunch', icon: '🍲' },
        { name: 'Dinner', icon: '🍗' },
        { name: 'Snacks', icon: '🍿' },
    ];

    return (
        <div className="add-meal-backdrop" onClick={handleClickBackdrop}>
            <div className="add-meal-modal">
                <h3>Add Meal</h3>
                <div className="add-meal-list">
                    {meals.map((meal, index) => (
                        <div key={index} className="add-meal-item">
                            <span className="add-meal-icon">{meal.icon}</span>
                            <span className="add-meal-name">{meal.name}</span>
                            <button className="add-meal-plus">+</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AddMealModal;