// src/components/shared/AddMealModal.tsx
import React, { useState, useCallback } from 'react';
import './AddMealModal.css';
import apiClient from '../../api/apiClient';

interface DishSearchResult {
    id: number;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    fat_per_100g: number;
    carbs_per_100g: number;
}

interface AddMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMealAdded?: () => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onMealAdded }) => {
    const [step, setStep] = useState<'select' | 'search' | 'quantity' | 'success'>('select');
    const [selectedMealType, setSelectedMealType] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<DishSearchResult[]>([]);
    const [selectedDish, setSelectedDish] = useState<DishSearchResult | null>(null);
    const [quantity, setQuantity] = useState<number>(100);
    const [loading, setLoading] = useState(false);
    const [mealId, setMealId] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [searchSource, setSearchSource] = useState<string>('');

    const resetState = useCallback(() => {
        setStep('select');
        setSelectedMealType('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedDish(null);
        setQuantity(100);
        setMealId(null);
        setSearchSource('');
        setError('');
        setLoading(false);
    }, []);

    if (!isOpen) return null;

    const handleSelectMealType = async (type: string) => {
        setSelectedMealType(type);
        setError('');
        setLoading(true);
        try {
            // Создаём meal на бэкенде
            const mealTypeMap: Record<string, string> = {
                'Завтрак': 'breakfast',
                'Обед': 'lunch',
                'Ужин': 'dinner',
                'Перекус': 'snack',
            };
            const res = await apiClient.post('/dishes/create-meal', {
                type: mealTypeMap[type] || 'snack'
            });
            setMealId(res.data.id);
            setStep('search');
        } catch (err: any) {
            console.error('Failed to create meal:', err);
            setError('Failed to create meal');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setError('');
        setLoading(true);
        try {
            const res = await apiClient.post('/dishes/search', { query: searchQuery });
            setSearchResults(res.data.results || []);
            setSearchSource(res.data.source || '');
            if ((res.data.results || []).length === 0) {
                // Если в базе не нашли — пробуем analyze через AI
                try {
                    const analyzeRes = await apiClient.post('/dishes/analyze', {
                        query: searchQuery,
                        grams: 100
                    });
                    if (analyzeRes.data.nutrition) {
                        const n = analyzeRes.data.nutrition;
                        setSearchResults([{
                            id: 0,
                            name: analyzeRes.data.dish_name || searchQuery,
                            calories_per_100g: n.calories || 0,
                            protein_per_100g: n.protein || 0,
                            fat_per_100g: n.fat || 0,
                            carbs_per_100g: n.carbs || 0,
                        }]);
                    }
                } catch {
                    // AI тоже не смог — показываем пустой результат
                }
            }
        } catch (err: any) {
            console.error('Search failed:', err);
            setError('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelectDish = (dish: DishSearchResult) => {
        setSelectedDish(dish);
        setStep('quantity');
    };

    const handleAddMeal = async () => {
        if (!selectedDish || !mealId) return;
        setError('');
        setLoading(true);

        const factor = quantity / 100;
        const dishData = {
            name: selectedDish.name,
            grams: quantity,
            calories: Math.round(selectedDish.calories_per_100g * factor),
            protein: Math.round(selectedDish.protein_per_100g * factor * 10) / 10,
            fat: Math.round(selectedDish.fat_per_100g * factor * 10) / 10,
            carbs: Math.round(selectedDish.carbs_per_100g * factor * 10) / 10,
            meal_type: selectedMealType.toLowerCase(),
        };

        try {
            await apiClient.post(`/dishes/add-to-meal/${mealId}`, dishData);
            setStep('success');
            if (onMealAdded) {
                onMealAdded();
            }
            setTimeout(() => {
                resetState();
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Failed to add dish:', err);
            setError('Failed to add dish');
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

    return (
        <div className="add-meal-backdrop" onClick={handleClickBackdrop}>
            <div className="add-meal-modal">
                {step === 'select' && (
                    <>
                        <h3>Добавить приём пищи</h3>
                        {error && <div style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center' }}>{error}</div>}
                        <div className="meal-selection-list">
                            {[
                                { name: 'Завтрак', icon: '🍽️' },
                                { name: 'Обед', icon: '🍲' },
                                { name: 'Ужин', icon: '🍗' },
                                { name: 'Перекус', icon: '🍿' },
                            ].map((meal, index) => (
                                <div
                                    key={index}
                                    className="meal-item"
                                    onClick={() => !loading && handleSelectMealType(meal.name)}
                                    style={{ opacity: loading ? 0.5 : 1 }}
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
                        {error && <div style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{error}</div>}
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Поиск блюда..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                autoFocus
                            />
                            <span
                                className="search-icon"
                                onClick={handleSearch}
                                style={{ cursor: 'pointer', fontSize: 16 }}
                            >
                                🔍
                            </span>
                        </div>
                        {loading && <p style={{ color: '#999', textAlign: 'center', fontSize: 13 }}>Поиск...</p>}
                        <div className="dish-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {searchResults.map((dish, index) => (
                                <div
                                    key={index}
                                    className="dish-item"
                                    onClick={() => handleSelectDish(dish)}
                                >
                                    <div>
                                        <div className="dish-name">{dish.name}</div>
                                        <div className="dish-info">
                                            на 100г: {dish.calories_per_100g} ккал |
                                            Б: {dish.protein_per_100g}г |
                                            У: {dish.carbs_per_100g}г |
                                            Ж: {dish.fat_per_100g}г
                                        </div>
                                    </div>
                                    <button className="dish-add-button">+</button>
                                </div>
                            ))}
                            {!loading && searchQuery && searchResults.length === 0 && (
                                <p style={{ color: '#999', textAlign: 'center', fontSize: 13 }}>
                                    Ничего не найдено. Попробуйте другой запрос.
                                </p>
                            )}
                            {!loading && searchResults.length > 0 && searchSource && (
                                <p style={{ color: '#666', textAlign: 'center', fontSize: 11, marginTop: 8 }}>
                                    {searchSource === 'openfoodfacts' && 'Источник: OpenFoodFacts'}
                                    {searchSource === 'ai' && 'Источник: ИИ-анализ'}
                                    {searchSource === 'database' && 'Источник: база данных TrAi'}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {step === 'quantity' && selectedDish && (
                    <>
                        <h3>{selectedDish.name}</h3>
                        {error && <div style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{error}</div>}
                        <div style={{ background: '#2D2D2D', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                            <div style={{ fontSize: 13, color: '#CCC', lineHeight: 1.6 }}>
                                <div>Калории: {Math.round(selectedDish.calories_per_100g * quantity / 100)} ккал</div>
                                <div>Белки: {(selectedDish.protein_per_100g * quantity / 100).toFixed(1)}г</div>
                                <div>Углеводы: {(selectedDish.carbs_per_100g * quantity / 100).toFixed(1)}г</div>
                                <div>Жиры: {(selectedDish.fat_per_100g * quantity / 100).toFixed(1)}г</div>
                            </div>
                        </div>
                        <div className="quantity-selector">
                            <span className="quantity-label">Граммы:</span>
                            <input
                                type="number"
                                className="quantity-input"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                                min="1"
                                max="2000"
                            />
                            <span style={{ color: '#999', fontSize: 14 }}>г</span>
                        </div>
                        <button
                            className="add-meal-button"
                            onClick={handleAddMeal}
                            disabled={loading}
                            style={{ opacity: loading ? 0.6 : 1 }}
                        >
                            {loading ? 'Добавление...' : '+ Добавить блюдо'}
                        </button>
                    </>
                )}

                {step === 'success' && (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <div className="success-text">Блюдо успешно добавлено!</div>
                    </div>
                )}

                {step !== 'success' && step !== 'select' && (
                    <button
                        onClick={() => {
                            if (step === 'quantity') setStep('search');
                            else if (step === 'search') { setStep('select'); setSearchResults([]); setSearchQuery(''); }
                        }}
                        style={{
                            background: 'none',
                            border: '1px solid #555',
                            color: '#999',
                            borderRadius: 6,
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: 13,
                            alignSelf: 'center',
                        }}
                    >
                        Назад
                    </button>
                )}
            </div>
        </div>
    );
};

export default AddMealModal;