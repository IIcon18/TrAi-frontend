import React, { useState } from "react";
import "./LoginForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import NewAccountButton from "./shared/Buttons/NewAccountButton";
import ConfirmButton from "./shared/Buttons/ConfirmButton";

const LoginForm: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLogin = () => {
        console.log("Login data:", formData);
    };

    const handleCreateAccount = () => {
        window.location.href = "/register";
    };

    return (
        <div className="login-form-container">
            <div className="login-form-box">
                <h2 className="login-form-title">Authorization</h2>

                <div className="login-form">
                    <div className="login-form-group">
                        <label className="login-input-label">Username:</label>
                        <input
                            type="text"
                            className="login-input-field"
                            placeholder="Имя пользователя"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                        />
                    </div>

                    <div className="login-form-group">
                        <label className="login-input-label">Password:</label>
                        <div className="login-password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="login-password-field"
                                placeholder="Пароль"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                <img
                                    src={showPassword ? EyeClosed : EyeOpen}
                                    alt={showPassword ? "Hide password" : "Show password"}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="login-divider"></div>

                    <div className="login-buttons-container">
                        <ConfirmButton onClick={handleLogin} />
                        <NewAccountButton onClick={handleCreateAccount} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;