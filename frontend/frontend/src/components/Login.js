import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { User, Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Prevent body scroll when component mounts
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.bottom = '0';
    
    document.body.classList.add('login-active');
    
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.classList.remove('login-active');
    };
  }, []);

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
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('role', response.data.role);
        
        if (onLogin) {
          onLogin();
        }
        
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
    <div className="custom-login-wrapper">
      <div className="custom-login-box">
        
        {error && <div className="custom-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <User size={20} color="#333" />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="custom-input-group">
            <div className="custom-icon-box">
              <Lock size={20} color="#333" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="custom-options">
            <label className="custom-remember">
              <input type="checkbox" /> Remember Me
            </label>
            <Link to="/forgot-password" className="custom-forgot">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button type="submit" disabled={loading} className="custom-login-btn">
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        {/* Register Button */}
        <Link to="/signup" style={{ textDecoration: 'none' }}>
          <button type="button" className="custom-register-btn">
            REGISTER
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Login;