// src/router/AppRouter.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "../pages/Login";
import Register from "../pages/Register";
// import Dashboard from "../pages/Dashboard";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/register" replace />} />

                {/*<Route path="/login" element={<Login />} />*/}
                <Route path="/register" element={<Register />} />

                {/*<Route path="/dashboard" element={<Dashboard />} />*/}

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;