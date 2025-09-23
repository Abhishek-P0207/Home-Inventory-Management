import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <nav className="landing-nav">
            <div className="logo">
              <div className="logo-icon">IM</div>
              <span className="logo-text">Inventory Manager</span>
            </div>
            <div className="nav-links">
              <a href="#home">Home</a>
              <a href="#dashboard">Dashboard</a>
              <a href="#admin">Admin</a>
              <a href="#features">Features</a>
            </div>
            <div className="nav-buttons">
              <Link to="/auth" className="btn btn-secondary">Log in</Link>
              <Link to="/auth" className="btn btn-primary">Get Started</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <div className="container">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                Simple, fast inventory<br />
                management that scales<br />
                with you
              </h1>
              <p className="hero-description">
                Track stock levels, manage products, and gain insights with a clean dashboard.<br />
                Designed for teams that need clarity and control.
              </p>
              <div className="hero-buttons">
                <Link to="/auth" className="btn btn-primary btn-large">
                  Start for free
                </Link>
                <button className="btn btn-secondary btn-large">
                  View demo
                </button>
              </div>
              <p className="hero-note">No credit card required</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;