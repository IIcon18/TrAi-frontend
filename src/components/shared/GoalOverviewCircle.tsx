// src/components/shared/GoalOverviewCircle.tsx
import React from 'react';

interface GoalOverviewCircleProps {
    percentage: number; // 0-100
    size?: number; // Диаметр круга
    strokeWidth?: number; // Толщина линии
    filledColor?: string; // Цвет заполненной части
    emptyColor?: string; // Цвет незаполненной части (фон)
    textColor?: string; // Цвет текста
    textSize?: number; // Размер текста
    label?: string; // Текст внутри круга (если нужно)
}

const GoalOverviewCircle: React.FC<GoalOverviewCircleProps> = ({
                                                                   percentage,
                                                                   size = 160,
                                                                   strokeWidth = 16,
                                                                   filledColor = '#4CAF50',
                                                                   emptyColor = '#9D2628',
                                                                   textColor = 'white',
                                                                   textSize = 36,
                                                                   label = '%'
                                                               }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Ограничиваем процент от 0 до 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    // Вычисляем смещение для заполненной части
    const filledDashoffset = circumference - (clampedPercentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Фоновая (незаполненная) часть — просто заливка */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={emptyColor}
                    fill="none"
                />
                {/* Заполненная часть (зелёная) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={filledColor}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={filledDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
                {/* Центральный текст */}
                <text
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textColor}
                    fontSize={textSize}
                    fontWeight="600"
                    style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
                >
                    {clampedPercentage}{label}
                </text>
            </svg>
        </div>
    );
};

export default GoalOverviewCircle;