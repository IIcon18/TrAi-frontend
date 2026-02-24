// src/components/shared/Header/Header.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, isPro, isAdmin } from "../../../utils/auth";
import SubscriptionSidebar from "../SubscriptionSidebar/SubscriptionSidebar";
import "./Header.css";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const role = getUserRole();
    const [subscriptionOpen, setSubscriptionOpen] = useState(false);

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
        <>
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

                    {isAdmin() && (
                        <button
                            className="nav-button nav-button-admin"
                            onClick={() => handleNavClick("/admin")}
                        >
                            Admin
                        </button>
                    )}

                    <button
                        className={`nav-button-subscription ${isPro() ? "nav-button-subscription--active" : "nav-button-subscription--upgrade"}`}
                        onClick={() => setSubscriptionOpen(true)}
                    >
                        {isPro() ? (
                            <>
                                <span className="nav-button-subscription__icon">✦</span>
                                PRO
                            </>
                        ) : (
                            <>
                                <span className="nav-button-subscription__icon">♛</span>
                                Get PRO
                            </>
                        )}
                    </button>
                </nav>
            </header>

            <SubscriptionSidebar
                isOpen={subscriptionOpen}
                onClose={() => setSubscriptionOpen(false)}
            />
        </>
    );
};

export default Header;