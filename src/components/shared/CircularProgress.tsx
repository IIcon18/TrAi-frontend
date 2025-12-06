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
    const size = 80;
    const strokeWidth = 8;
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
                    x="40"
                    y="40"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="600"
                    transform="rotate(90 40 40)" /* ← поворот на 90° */
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