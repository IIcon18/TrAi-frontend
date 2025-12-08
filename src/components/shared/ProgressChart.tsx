// src/components/shared/ProgressChart.tsx
import React from 'react';

interface ProgressChartData {
    day: string;
    mood: number; // 0-10
    energy: number; // 0-10
}

interface ProgressChartProps {
    data: ProgressChartData[];
    width?: number; // Ширина SVG
    height?: number; // Высота SVG
    moodColor?: string; // Цвет линии настроения
    energyColor?: string; // Цвет линии энергии
    gridColor?: string; // Цвет сетки
    axisLabelColor?: string; // Цвет подписей дней
    legendMoodLabel?: string; // Подпись для легенды "Mood"
    legendEnergyLabel?: string; // Подпись для легенды "Energy"
}

const ProgressChart: React.FC<ProgressChartProps> = ({
                                                         data,
                                                         width = 400,
                                                         height = 200,
                                                         moodColor = '#4CAF50',
                                                         energyColor = '#FF3B30',
                                                         gridColor = '#333',
                                                         axisLabelColor = '#CCCCCC',
                                                         legendMoodLabel = 'Mood',
                                                         legendEnergyLabel = 'Energy'
                                                     }) => {
    const START_X = 0;
    const END_X = width - 40; // Отступ справа
    const Y_OFFSET = 40;
    const Y_SCALE = height - Y_OFFSET - 40; // Масштаб по Y

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="progress-chart-svg"
        >
            {/* Горизонтальные линии сетки */}
            {[0, 2, 4, 6, 8, 10].map((value) => (
                <g key={value}>
                    <line
                        x1={START_X + 20}
                        y1={height - Y_OFFSET - (value / 10) * Y_SCALE}
                        x2={END_X}
                        y2={height - Y_OFFSET - (value / 10) * Y_SCALE}
                        stroke={gridColor}
                        strokeWidth="1"
                    />
                    <text
                        x={START_X + 10}
                        y={height - Y_OFFSET - (value / 10) * Y_SCALE}
                        fill={axisLabelColor}
                        fontSize="12"
                        textAnchor="end"
                    >
                        {value}
                    </text>
                </g>
            ))}

            {/* Линия настроения */}
            <polyline
                points={data
                    .map((point, index) => {
                        const x = START_X + 20 + (index / (data.length - 1)) * (END_X - START_X - 20);
                        const y = height - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                        return `${x},${y}`;
                    })
                    .join(' ')}
                fill="none"
                stroke={moodColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Линия энергии */}
            <polyline
                points={data
                    .map((point, index) => {
                        const x = START_X + 20 + (index / (data.length - 1)) * (END_X - START_X - 20);
                        const y = height - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                        return `${x},${y}`;
                    })
                    .join(' ')}
                fill="none"
                stroke={energyColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Подписи дней */}
            {data.map((point, index) => {
                const x = START_X + 20 + (index / (data.length - 1)) * (END_X - START_X - 20);
                return (
                    <text
                        key={point.day}
                        x={x}
                        y={height - 10}
                        fill={axisLabelColor}
                        fontSize="12"
                        textAnchor="middle"
                        letterSpacing="0.5px"
                    >
                        {point.day}
                    </text>
                );
            })}

            {/* Точки на линиях */}
            {data.map((point, index) => {
                const x = START_X + 20 + (index / (data.length - 1)) * (END_X - START_X - 20);
                const yMood = height - Y_OFFSET - (point.mood / 10) * Y_SCALE;
                const yEnergy = height - Y_OFFSET - (point.energy / 10) * Y_SCALE;
                return (
                    <>
                        <circle
                            key={`mood-${index}`}
                            cx={x}
                            cy={yMood}
                            r="4"
                            fill={moodColor}
                            stroke="#000"
                            strokeWidth="2"
                        />
                        <circle
                            key={`energy-${index}`}
                            cx={x}
                            cy={yEnergy}
                            r="4"
                            fill={energyColor}
                            stroke="#000"
                            strokeWidth="2"
                        />
                    </>
                );
            })}

            {/* Легенда */}
            <g transform={`translate(${width / 2 - 70}, ${height - 20})`}>
                <rect x="-5" y="-15" width="140" height="30" fill="#1A1A1A" rx="6" ry="6" />
                <circle cx="0" cy="0" r="4" fill={moodColor} />
                <text x="10" y="0" fill={axisLabelColor} fontSize="12" dominantBaseline="middle">
                    {legendMoodLabel}
                </text>
                <circle cx="70" cy="0" r="4" fill={energyColor} />
                <text x="80" y="0" fill={axisLabelColor} fontSize="12" dominantBaseline="middle">
                    {legendEnergyLabel}
                </text>
            </g>
        </svg>
    );
};

export default ProgressChart;