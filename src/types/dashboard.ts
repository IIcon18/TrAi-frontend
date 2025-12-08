// Dashboard.types.ts
export interface ActivityData {
    day: string;
    mood: number;
    energy: number;
}

export interface ProgressItem {
    label: string;
    current: number;
    total: number;
    color: string;
}

export interface QuickStat {
    label: string;
    value: string;
}

export interface DashboardProps {
    username: string;
    lastTraining: string;
    activityData: ActivityData[];
    weeklyProgress: ProgressItem;
    aiPlan: ProgressItem[];
    quickStats: QuickStat[];
}