import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import SimpleHeader from "../shared/Header/SimpleHeader";
import Footer from "../shared/Footer/Footer";
import LoginForm from "../LoginForm";
import { useAuth } from "../../hooks/useAuth";
import SEOHead from "../SEOHead";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    return (
        <div className="login-page">
            <SEOHead
                title="Вход"
                description="Войдите в TrAi — персональный фитнес-трекер с ИИ-тренировками и трекингом питания"
                canonical={`${process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/login`}
                ogTitle="TrAi — Вход в аккаунт"
                ogDescription="Персональный тренер с ИИ-рекомендациями по тренировкам и питанию"
            />
            <SimpleHeader />

            <main className="main-content">
                <LoginForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
