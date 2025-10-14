import React, { useState } from "react";
import "./Header.css"

const Header: React.FC = () => {
    const [activeButton, setActiveButton] = useState<string | null>(null);

    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName);
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
                    className={`nav-button ${activeButton === "Dashboard" ? "active" : ""}`}
                    onClick={() => handleButtonClick("Dashboard")}
                >
                    Dashboard
                </button>
                <button
                    className={`nav-button ${activeButton === "Workouts" ? "active" : ""}`}
                    onClick={() => handleButtonClick("Workouts")}
                >
                    Workouts
                </button>
                <button
                    className={`nav-button ${activeButton === "Progress" ? "active" : ""}`}
                    onClick={() => handleButtonClick("Progress")}
                >
                    Progress
                </button>
                <button
                    className={`nav-button ${activeButton === "Profile" ? "active" : ""}`}
                    onClick={() => handleButtonClick("Profile")}
                >
                    Profile
                </button>
            </nav>
        </header>
    );
};

export default Header;