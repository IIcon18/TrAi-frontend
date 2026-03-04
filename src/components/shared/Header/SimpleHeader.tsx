// src/components/shared/Header/SimpleHeader.tsx

import React from "react";
import "./Header.css";

const SimpleHeader: React.FC = () => {
    return (
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
        </header>
    );
};

export default SimpleHeader;
