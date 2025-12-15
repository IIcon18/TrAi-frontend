// src/components/LoginForm.tsx
import React, { useState } from "react";
import "./LoginForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import NewAccountButton from "./shared/Buttons/NewAccountButton";
import ConfirmButton from "./shared/Buttons/ConfirmButton";
import apiClient from "../api/apiClient";

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

  const handleLogin = async () => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: formData.username,
        password: formData.password,
      });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      window.location.href = '/dashboard';
    } catch (err) {
      alert('Ошибка входа: неверный email или пароль');
      console.error(err);
    }
  };
  const handleCreateAccount = () => {
    window.location.href = "/register";
  };

  return (
      <div className="login-form-container">
        <div className="login-form-box">
          <h2 className="login-form-title">Authorization</h2>
          <div className="login-form">
            {/* Email Section */}
            <div className="login-form-group">
              <label className="login-input-label">Email:</label>
              <input
                  type="text"
                  className="login-input-field"
                  placeholder="Email"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </div>
            {/* Password Section */}
            <div className="login-form-group">
              <label className="login-input-label">Password:</label>
              <div className="login-password-input-container">
                <input
                    type={showPassword ? "text" : "password"}
                    className="login-password-field"
                    placeholder="Password"
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
                      width="20"
                      height="20"
                  />
                </button>
              </div>
            </div>
            {/* Buttons Section */}
            <div className="login-buttons-container">
              <div className="login-confirm-wrapper">
                <ConfirmButton onClick={handleLogin} />
              </div>
              <div className="login-divider"></div>
              <NewAccountButton onClick={handleCreateAccount} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginForm;