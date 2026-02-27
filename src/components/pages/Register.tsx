import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"
import Header from "../shared/Header/Header";
import Footer from "../shared/Footer/Footer";
import RegistrationForm from "../RegistrationForm";
import { useAuth } from "../../hooks/useAuth";

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
            <Header />

            <main className="main-content">
                <RegistrationForm/>
            </main>

            <Footer />
        </div>
    );
};

export default Register;
