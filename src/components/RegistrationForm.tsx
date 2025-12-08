// src/components/RegistrationForm.tsx
import React, { useState } from "react";
import "./RegistrationForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import ConfirmButton from "./shared/Buttons/ConfirmButton";

export const RegistrationForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        age: "",
        lifestyle: "",
        height: "",
        weight: ""
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getPasswordStrength = (pass: string) => {
        if (pass.length === 0) return "";
        if (pass.length < 6) return "weak";
        if (pass.length < 10) return "medium";
        return "strong";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Registration data:", { ...formData, password });
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div className="registration-container">
            <div className="registration-box">
                <h2 className="registration-title">Registration</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="input-label">Username:</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Имя пользователя"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Password:</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input-field password-field"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                <img
                                    src={showPassword ? EyeClosed : EyeOpen}
                                    alt={showPassword ? "Hide password" : "Show password"}
                                    width="20"
                                    height="20"
                                />
                            </button>
                            {password && (
                                <div className="password-strength-bar">
                                    <div
                                        className={`password-strength-progress ${passwordStrength.toLowerCase()}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Age:</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="20"
                            value={formData.age}
                            onChange={(e) => handleInputChange("age", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Lifestyle:</label>
                        <select
                            className="input-field select-field"
                            value={formData.lifestyle}
                            onChange={(e) => handleInputChange("lifestyle", e.target.value)}
                        >
                            <option value="">Select lifestyle</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Height:</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="175"
                            value={formData.height}
                            onChange={(e) => handleInputChange("height", e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Weight:</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="73"
                            value={formData.weight}
                            onChange={(e) => handleInputChange("weight", e.target.value)}
                        />
                    </div>

                    {/* Убран разделитель */}
                    {/* <div className="divider"></div> */}

                    {/* Кнопка по центру и зелёная */}
                    <ConfirmButton />
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;