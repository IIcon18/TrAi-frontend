import React from 'react';

export interface ProgressBarProps {
    progress: number;
    color?: string;
    height?: number;
    showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
                                                            progress,
                                                            color = '#9D2628',
                                                            height = 8,
                                                            showLabel = true
                                                        }) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="progress-bar-container">
            {showLabel && (
                <div className="progress-label">
                    {clampedProgress}%
                </div>
            )}
            <div
                className="progress-bar-background"
                style={{ height: `${height}px` }}
            >
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${clampedProgress}%`,
                        backgroundColor: color,
                        height: `${height}px`
                    }}
                />
            </div>
        </div>
    );
};