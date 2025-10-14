import React from "react";
import "./Register.css"
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";

const Register: React.FC = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />

            <div style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <h2>Страница Регистрации</h2>
            </div>

            <Footer />
        </div>
    );
};

export default Register;