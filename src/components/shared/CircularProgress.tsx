// src/components/shared/CircularProgress.tsx
import React from 'react';

export interface CircularProgressProps {
    progress: number; // процент заполнения (0-100)
    color?: string;   // цвет заполненной части
    label: string;    // подпись под кругом (Proteins, Carbohydrates, Fats)
    current: number;  // текущее значение
    total: number;    // общее значение
}

const CircularProgress: React.FC<CircularProgressProps> = ({
                                                               progress,
                                                               color = '#FF3B30',
                                                               label,
                                                               current,
                                                               total
                                                           }) => {
    const size = 70;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="circular-progress">
            <svg width={size} height={size} className="progress-svg">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke="#2D2D2D"
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    stroke={color}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
                <text
                    x="35"
                    y="35"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="600"
                    transform="rotate(90 35 35)"
                >
                    {current}/{total}
                </text>
            </svg>
            <div className="progress-label">
                {label}
            </div>
        </div>
    );
};

export default CircularProgress;