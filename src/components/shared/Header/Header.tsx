// src/components/shared/Header/Header.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubscriptionSidebar from "../SubscriptionSidebar/SubscriptionSidebar";
import { useAuth } from "../../../hooks/useAuth";
import "./Header.css";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin, isPro } = useAuth();
    const [subscriptionOpen, setSubscriptionOpen] = useState(false);

    const handleNavClick = (path: string) => {
        navigate(path);
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
                        ваш персональный ИИ-тренер
                    </div>
                </div>

                <nav className="header-right">
                    <button
                        className="nav-button"
                        onClick={() => handleNavClick("/dashboard")}
                    >
                        Главная
                    </button>
                    <button
                        className="nav-button"
                        onClick={() => handleNavClick("/workouts")}
                    >
                        Тренировки
                    </button>
                    <button
                        className="nav-button"
                        onClick={() => handleNavClick("/progress")}
                    >
                        Прогресс
                    </button>
                    <button
                        className="nav-button"
                        onClick={() => handleNavClick("/profile")}
                    >
                        Профиль
                    </button>

                    {isAdmin() && (
                        <button
                            className="nav-button nav-button-admin"
                            onClick={() => handleNavClick("/admin")}
                        >
                            Админ
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
                                Получить PRO
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