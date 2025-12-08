// src/components/shared/AddMealModal.tsx
import React, { useState } from 'react';
import './AddMealModal.css';

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'select' | 'search' | 'quantity' | 'success'>('select');
    const [selectedMealType, setSelectedMealType] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedDish, setSelectedDish] = useState<{ name: string; kcal: number; proteins: number; carbs: number; fats: number } | null>(null);
    const [quantity, setQuantity] = useState<number>(100);

    if (!isOpen) return null;

    // Моковые данные для поиска
    const mockDishes = [
        { name: 'Паста карбонара', kcal: 220, proteins: 7.4, carbs: 17.3, fats: 13.2 },
        { name: 'Куриная грудка', kcal: 165, proteins: 31, carbs: 0, fats: 3.6 },
        { name: 'Овсянка', kcal: 110, proteins: 4, carbs: 20, fats: 2 },
        { name: 'Яблоко', kcal: 52, proteins: 0.3, carbs: 14, fats: 0.2 },
    ];

    const filteredDishes = searchQuery
        ? mockDishes.filter(dish => dish.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const handleSelectMealType = (type: string) => {
        setSelectedMealType(type);
        setStep('search');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectDish = (dish: any) => {
        setSelectedDish(dish);
        setStep('quantity');
    };

    const handleAddMeal = () => {
        setStep('success');
        // Здесь можно отправить данные на сервер
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
        <div className="add-meal-backdrop" onClick={handleClickBackdrop}>
            <div className="add-meal-modal">
                {step === 'select' && (
                    <>
                        <h3>Add Meal</h3>
                        <div className="meal-selection-list">
                            {[
                                { name: 'Breakfast', icon: '🍽️' },
                                { name: 'Lunch', icon: '🍲' },
                                { name: 'Dinner', icon: '🍗' },
                                { name: 'Snacks', icon: '🍿' },
                            ].map((meal, index) => (
                                <div
                                    key={index}
                                    className="meal-item"
                                    onClick={() => handleSelectMealType(meal.name)}
                                >
                                    <span className="meal-icon">{meal.icon}</span>
                                    <span className="meal-name">{meal.name}</span>
                                    <button className="meal-plus">+</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === 'search' && (
                    <>
                        <h3>{selectedMealType}</h3>
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Поиск блюда..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        <div className="dish-list">
                            {filteredDishes.map((dish, index) => (
                                <div
                                    key={index}
                                    className="dish-item"
                                    onClick={() => handleSelectDish(dish)}
                                >
                                    <div>
                                        <div className="dish-name">{dish.name}</div>
                                        <div className="dish-info">
                                            Kkals: {dish.kcal}g<br />
                                            Proteins: {dish.proteins}g<br />
                                            Carbohydrates: {dish.carbs}g<br />
                                            Fats: {dish.fats}g
                                        </div>
                                    </div>
                                    <button className="dish-add-button">+</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {step === 'quantity' && selectedDish && (
                    <>
                        <h3>{selectedDish.name}</h3>
                        <div className="quantity-selector">
                            <span className="quantity-label">Количество:</span>
                            <input
                                type="number"
                                className="quantity-input"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                min="1"
                                max="1000"
                            />
                            <select
                                className="quantity-dropdown"
                                value="in 100g"
                                onChange={(e) => console.log(e.target.value)}
                            >
                                <option value="in 100g">in 100g</option>
                                <option value="in 50g">in 50g</option>
                                <option value="in 200g">in 200g</option>
                            </select>
                        </div>
                        <button
                            className="add-meal-button"
                            onClick={handleAddMeal}
                        >
                            + Add meal
                        </button>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">Dish successfully added!</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddMealModal;