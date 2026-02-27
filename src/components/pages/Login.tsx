import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "../shared/Header/Header";
import Footer from "../shared/Footer/Footer";
import LoginForm from "../LoginForm";
import { useAuth } from "../../hooks/useAuth";

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
            <Header />

            <main className="main-content">
                <LoginForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Login;
