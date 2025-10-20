import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../components/pages/Register";
import Login from "../components/pages/Login";
// import Dashboard from "../pages/Dashboard";
// import Profile from "../pages/Profile";
// import Workouts from "../pages/Workouts";
// import Progress from "../pages/Progress";
// import NotFound from "../components/pages/NotFound";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/register" replace />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/*<Route path="/dashboard" element={<Dashboard />} />*/}
                {/*<Route path="/profile" element={<Profile />} />*/}
                {/*<Route path="/workouts" element={<Workouts />} />*/}
                {/*<Route path="/progress" element={<Progress />} />*/}

                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;