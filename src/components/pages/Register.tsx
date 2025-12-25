import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"
import Header from "../shared/Header/Header";
import Footer from "../shared/Footer/Footer";
import RegistrationForm from "../RegistrationForm";

const Register: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Если пользователь уже авторизован, перенаправляем на dashboard
        const token = localStorage.getItem('access_token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    return (
        <div  className="register-page">
            <Header />

            <main className="main-content">
                <RegistrationForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Register;
