import React from "react";
import "./Login.css";
import Header from "../shared/Header/Header";
import Footer from "../shared/Footer/Footer";
import LoginForm from "../LoginForm";

const Login: React.FC = () => {
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