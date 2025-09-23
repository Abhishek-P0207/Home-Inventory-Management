import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import AuthPage from './components/AuthPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import Inventory from './components/Inventory.jsx';
import Analysis from './components/Analysis.jsx';
import Settings from './components/Settings.jsx';
import Navbar from './components/Navbar.jsx';
import AuthService from './services/auth.js';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and validate token
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Validate token with auth service
          const validatedUser = await AuthService.validateToken(token);
          setIsAuthenticated(true);
          setUser(validatedUser);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Show loading screen while validating session
  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="logo">
              <div className="logo-icon">IM</div>
              <span className="logo-text">Inventory Manager</span>
            </div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <LandingPage />
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <AuthPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/inventory" 
            element={
              isAuthenticated ? 
              <Inventory /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/analysis" 
            element={
              isAuthenticated ? 
              <Analysis /> : 
              <Navigate to="/auth" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
              <Settings user={user} /> : 
              <Navigate to="/auth" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
