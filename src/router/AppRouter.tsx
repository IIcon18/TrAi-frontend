import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/pages/Login";
import Register from "../components/pages/Register";
import NotFound from "../components/pages/NotFound";
import PrivateRoute from "../components/shared/PrivateRoute";

const Dashboard = React.lazy(() => import("../components/pages/Dashboard"));
const Profile = React.lazy(() => import("../components/pages/Profile"));
const Progress = React.lazy(() => import("../components/pages/Progress"));
const Workouts = React.lazy(() => import("../components/pages/Workouts"));
const AdminPanel = React.lazy(() => import("../components/pages/AdminPanel"));

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1A1A1A', color: '#999' }}>Загрузка...</div>}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Защищённые маршруты */}
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

                    {/* Маршрут только для администратора */}
                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute requiredRoles={["admin"]}>
                                <AdminPanel />
                            </PrivateRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRouter;
