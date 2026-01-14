// src/components/RegistrationForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import apiClient from "../api/apiClient";

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return "";
    if (pass.length < 6) return "weak";
    if (pass.length < 10) return "medium";
    return "strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname || !email || !password) {
      alert("Все поля обязательны!");
      return;
    }

    if (password.length < 6) {
      alert("Пароль должен быть минимум 6 символов");
      return;
    }

    try {
      const response = await apiClient.post("/auth/register", {
        nickname,
        email,
        password
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Редирект на профиль для дозаполнения данных
      navigate("/profile");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ошибка регистрации");
      console.error(err);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="registration-container">
      <div className="registration-box">
        <h2 className="registration-title">Registration</h2>
        <form onSubmit={handleSubmit}>
          {/* Nickname */}
          <div className="form-group">
            <label className="input-label">Nickname:</label>
            <input
              type="text"
              className="input-field"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="input-label">Email:</label>
            <input
              type="email"
              className="input-field"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="input-label">Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field password-field"
                placeholder="Password"
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
                    className={`password-strength-progress ${passwordStrength}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="confirm-button">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;