// src/components/shared/Header/Header.tsx

import React from "react";
import { useNavigate } from "react-router-dom"; // ← добавляем
import "./Header.css";

const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleNavClick = (path: string) => {
        navigate(path);
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">
                    <span className="logo-white">Tr</span>
                    <span className="logo-red">Ai</span>
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
            </nav>
        </header>
    );
};

export default Header;