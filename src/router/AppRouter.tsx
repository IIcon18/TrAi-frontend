// src/router/AppRouter.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../components/pages/Register";
import Login from "../components/pages/Login";
import Dashboard from "../components/pages/Dashboard";
import Profile from "../components/pages/Profile";
import Progress from "../components/pages/Progress";
import Workouts from "../components/pages/Workouts";
import PrivateRoute from "../components/shared/PrivateRoute";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/progress" 
                    element={
                        <PrivateRoute>
                            <Progress />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/workouts" 
                    element={
                        <PrivateRoute>
                            <Workouts />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;