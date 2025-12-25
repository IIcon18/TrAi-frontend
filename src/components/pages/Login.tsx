import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "../shared/Header/Header";
import Footer from "../shared/Footer/Footer";
import LoginForm from "../LoginForm";

const Login: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Если пользователь уже авторизован, перенаправляем на dashboard
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="login-page">
            <Header />

            <main className="main-content">
                <LoginForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Login;