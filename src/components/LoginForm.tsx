// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import NewAccountButton from "./shared/Buttons/NewAccountButton";
import apiClient from "../api/apiClient";
import { useAuth } from "../hooks/useAuth";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
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

  const handleLogin = async () => {
    try {
      const response = await apiClient.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      const { access_token, refresh_token, role } = response.data;
      login(access_token, refresh_token, role || "user");

      navigate("/dashboard");
    } catch (err) {
      alert("Ошибка входа: неверный email или пароль");
      console.error(err);
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  return (
    <div className="login-form-container">
      <div className="login-form-box">
        <h2 className="login-form-title">Авторизация</h2>
        <div className="login-form">
          {/* Email Section */}
          <div className="login-form-group">
            <label className="login-input-label">Почта:</label>
            <input
              type="text"
              className="login-input-field"
              placeholder="Эл. почта"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          {/* Password Section */}
          <div className="login-form-group">
            <label className="login-input-label">Пароль:</label>
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
                  alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  width="20"
                  height="20"
                />
              </button>
            </div>
          </div>

          {/* Buttons Section */}
          <div className="login-buttons-container">
              <button className="login-confirm-button" onClick={handleLogin}>Войти</button>
            <div className="login-divider"></div>
            <NewAccountButton onClick={handleCreateAccount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;