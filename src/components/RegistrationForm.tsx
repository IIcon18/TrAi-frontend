import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, RegisterData } from '../services/authService';
import './RegistrationForm.css';

const lifestyleOptions = [
  { value: 'low', label: 'Low (sedentary)' },
  { value: 'medium', label: 'Medium (moderately active)' },
  { value: 'high', label: 'High (very active)' }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    age: 25,
    lifestyle: 'medium',
    height: 170,
    weight: 70
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-container">
      <h2>Create TrAi Account</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="10"
              max="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (cm) *</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min="100"
              max="250"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight">Weight (kg) *</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lifestyle">Activity Level *</label>
          <select
            id="lifestyle"
            name="lifestyle"
            value={formData.lifestyle}
            onChange={handleChange}
            required
          >
            {lifestyleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="initial_weight">Initial Weight (kg)</label>
            <input
              type="number"
              id="initial_weight"
              name="initial_weight"
              value={formData.initial_weight || formData.weight}
              onChange={handleChange}
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="target_weight">Target Weight (kg)</label>
            <input
              type="number"
              id="target_weight"
              name="target_weight"
              value={formData.target_weight || formData.weight - 5}
              onChange={handleChange}
              min="30"
              max="300"
              step="0.1"
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div className="form-footer">
        <p>Already have an account? <a href="/login">Login</a></p>
      </div>
    </div>
  );
};

export default RegistrationForm;