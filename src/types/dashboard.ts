// TrAi-frontend/src/types/dashboard.ts
export interface EnergyChartData {
    date: string;
    energy: number;
    mood: number;
}

export interface WeeklyProgress {
    planned_workouts: number;
    completed_workouts: number;
    completion_rate: number;
}

export interface NutritionPlan {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface CurrentNutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface QuickStats {
    planned_workouts: number;
    total_weight_lifted: number;
    recovery_score: number;
    goal_progress: number;
    weight_change: number;
}

export interface QuickAction {
    name: string;
    icon: string;
    route: string;
}

export interface AIRecommendation {
    id: number;
    type: string;
    message: string;
    created_at: string;
}

export interface DashboardResponse {
    user_greeting: string;
    progress_fact: string;
    last_training_message: string;
    weekly_progress_message: string;
    energy_chart: EnergyChartData[];
    weekly_progress: WeeklyProgress;
    nutrition_plan: NutritionPlan;
    current_nutrition: CurrentNutrition;
    quick_stats: QuickStats;
    quick_actions: QuickAction[];
    ai_recommendations: AIRecommendation[];
}