import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../services/auth.js';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userData;
      
      if (isLogin) {
        userData = await AuthService.login(formData.email, formData.password);
      } else {
        userData = await AuthService.register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword
        );
      }

      onLogin(userData);
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="container">
          <Link to="/" className="logo">
            <div className="logo-icon">I</div>
            <span className="logo-text">Easy Inventory</span>
          </Link>
        </div>
      </header>

      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header-content">
              <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
              <p>{isLogin ? 'Sign in to your account' : 'Get started with your inventory management'}</p>
              {error && <div className="error-message">{error}</div>}
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  className="auth-switch"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({
                      email: '',
                      password: '',
                      name: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;