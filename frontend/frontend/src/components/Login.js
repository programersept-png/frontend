import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('role', response.data.role);
        
        // Call the onLogin callback from App.js
        if (onLogin) {
          onLogin();
        }
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }

    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.error || 'Login failed. Please try again.');
      } else if (err.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>📚 Library Management System</h2>
          <h3>Welcome Back!</h3>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <div className="default-creds">
            <p>🔐 Default Admin Credentials:</p>
            <p><strong>Username:</strong> admin &nbsp;|&nbsp; <strong>Password:</strong> admin123</p>
            <p><strong>Username:</strong> programmer &nbsp;|&nbsp; <strong>Password:</strong> admin123</p>
          </div>
          
          <div className="signup-link">
            <p>Don't have an account? <Link to="/signup">Create one here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
