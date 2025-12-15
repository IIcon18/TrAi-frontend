// src/components/RegistrationForm.tsx
import React, { useState } from "react";
import "./RegistrationForm.css";
import EyeOpen from "../assets/icons/eye.svg";
import EyeClosed from "../assets/icons/hide_eye.svg";
import apiClient from "../api/apiClient"; // ← важно
import { useNavigate } from "react-router-dom"; // ← важно

export const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return "";
    if (pass.length < 6) return "weak";
    if (pass.length < 10) return "medium";
    return "strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.username || !password) {
      alert("Email и пароль обязательны!");
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        email: formData.username,
        password,
        age: Number(formData.age) || 20,
        lifestyle: formData.lifestyle || 'medium',
        height: Number(formData.height) || 170,
        weight: Number(formData.weight) || 70,
        level: 'beginner',
        weekly_training_goal: 3,
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка регистрации');
      console.error(err);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
      <div className="registration-container">
        <div className="registration-box">
          <h2 className="registration-title">Registration</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="input-label">Email:</label>
              <input
                  type="text"
                  className="input-field"
                  placeholder="user@example.com"
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
                          className={`password-strength-progress ${passwordStrength}`}
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

            {/* ИСПРАВЛЕНО: нативная кнопка submit */}
            <button type="submit" className="confirm-button">
              Confirm
            </button>
          </form>
        </div>
      </div>
  );
};

export default RegistrationForm;