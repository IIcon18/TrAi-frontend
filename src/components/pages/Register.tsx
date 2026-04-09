import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"
import SimpleHeader from "../shared/Header/SimpleHeader";
import Footer from "../shared/Footer/Footer";
import RegistrationForm from "../RegistrationForm";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../SEOHead";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    return (
        <div  className="register-page">
            <SEOHead
                title="Регистрация"
                description="Создайте аккаунт TrAi и начните тренироваться умнее с ИИ-поддержкой и трекингом прогресса"
                canonical={`${process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/register`}
                ogTitle="TrAi — Регистрация"
                ogDescription="Персональный фитнес-трекер с ИИ-рекомендациями"
            />
            <SimpleHeader />

            <main className="main-content">
                <RegistrationForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Register;
