// src/router/AppRouter.tsx
import Workouts from "../components/pages/Workouts"; // <-- Добавь эту строку

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../components/pages/Register";
import Login from "../components/pages/Login";
import Dashboard from "../components/pages/Dashboard";
import Profile from "../components/pages/Profile";
import Progress from "../components/pages/Progress"; // <-- Добавьте этот импорт

const dashboardData = {
    username: "@username",
    lastTraining: "yesterday",
    activityData: [
        { day: "Monday", mood: 7, energy: 6 },
        { day: "Tuesday", mood: 8, energy: 7 },
        { day: "Wednesday", mood: 6, energy: 8 },
        { day: "Thursday", mood: 9, energy: 5 },
        { day: "Friday", mood: 8, energy: 9 },
        { day: "Saturday", mood: 7, energy: 7 },
        { day: "Sunday", mood: 9, energy: 8 }
    ],
    weeklyProgress: {
        label: "Trainings",
        current: 2,
        total: 3,
        color: "#FF3B30"
    },
    aiPlan: [
        { label: "Proteins", current: 65, total: 120, color: "#FF3B30" },
        { label: "Carbohydrates", current: 30, total: 120, color: "#FF9800" },
        { label: "Fats", current: 40, total: 80, color: "#FFEB3B" }
    ],
    quickStats: [
        { label: "Weekly Volume:", value: "3 trainings" },
        { label: "Average Weight:", value: "175 kg" },
        { label: "Average Recovery:", value: "95%" },
        { label: "AI Goal Progress:", value: "-8kg" }
    ]
};

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={<Dashboard {...dashboardData} />}
                />

                <Route path="/profile" element={<Profile />} />
                <Route path="/progress" element={<Progress />} /> {/* <-- Добавьте этот маршрут */}
                <Route path="/workouts" element={<Workouts />} /> {/* <-- Добавь этот маршрут */}

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;