// src/components/shared/Header/Header.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, isPro, isAdmin } from "../../../utils/auth";
import "./Header.css";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const role = getUserRole();

    const handleNavClick = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">
                    <span className="logo-white">Tr</span>
                    <span className="logo-red">Ai</span>
                    {isPro() && <span className="pro-badge">PRO</span>}
                </div>
                <div className="tagline">
                    your personal training intelligence
                </div>
            </div>

            <nav className="header-right">
                <button
                    className="nav-button"
                    onClick={() => handleNavClick("/dashboard")}
                >
                    Dashboard
                </button>
                <button
                    className="nav-button"
                    onClick={() => handleNavClick("/workouts")}
                >
                    Workouts
                </button>
                <button
                    className="nav-button"
                    onClick={() => handleNavClick("/progress")}
                >
                    Progress
                </button>
                <button
                    className="nav-button"
                    onClick={() => handleNavClick("/profile")}
                >
                    Profile
                </button>

                {isAdmin() && (
                    <button
                        className="nav-button nav-button-admin"
                        onClick={() => handleNavClick("/admin")}
                    >
                        Admin
                    </button>
                )}

                <button
                    className="nav-button nav-button-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </nav>
        </header>
    );
};

export default Header;
