import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { User, Lock, Mail } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await API.post('/api/auth/signup', {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        fullName: formData.fullName
      });

      if (response.data.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: 'Failed to create account. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-login-wrapper">
      <div className="custom-login-box">
        
        <div className="login-header" style={{ marginBottom: '20px' }}>
          <h2 style={{ color: 'white', fontSize: '24px', margin: '0 0 5px 0' }}>Create Account</h2>
          <p style={{ color: '#b0b0b0', fontSize: '12px' }}>Join the Library System</p>
        </div>

        {successMessage && (
          <div className="custom-success">{successMessage}</div>
        )}

        {errors.submit && (
          <div className="custom-error">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <User size={20} color="#333" />
            </div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name (Optional)"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Username */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <User size={20} color="#333" />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          {errors.username && <span className="custom-field-error">{errors.username}</span>}

          {/* Email */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <Mail size={20} color="#333" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          {errors.email && <span className="custom-field-error">{errors.email}</span>}

          {/* Password */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <Lock size={20} color="#333" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {errors.password && <span className="custom-field-error">{errors.password}</span>}

          {/* Confirm Password */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <Lock size={20} color="#333" />
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {errors.confirmPassword && <span className="custom-field-error">{errors.confirmPassword}</span>}

          {/* Sign Up Button */}
          <button type="submit" disabled={loading} className="custom-login-btn" style={{ marginTop: '10px' }}>
            {loading ? 'CREATING...' : 'SIGN UP'}
          </button>
        </form>

        {/* Login Button */}
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button type="button" className="custom-register-btn">
            LOGIN
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Signup;