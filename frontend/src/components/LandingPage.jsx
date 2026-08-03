import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, BarChart2, Bell, Sparkles } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header Navigation */}
      <header className="landing-header">
        <div className="container landing-nav">
          <div className="logo">
            <div className="logo-icon">
              <img src="/box-open-solid-full.svg" alt="Box" width={22} height={22} />
            </div>
            <span className="logo-text">Easy Inventory</span>
          </div>
          <div className="nav-buttons">
            <Link to="/auth" className="btn btn-primary nav-cta">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="landing-main">
        <div className="container">
          <div className="hero-section">
            <h1 className="hero-title">
              Inventory management built for clarity & speed
            </h1>

            <p className="hero-description">
              Track stock levels, organize supplies, and gain instant visual insights with a clean, modern dashboard designed for total control.
            </p>

            <div className="hero-buttons">
              <Link to="/auth" className="btn btn-primary btn-large hero-cta">
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper icon-blue">
                <Package size={24} />
              </div>
              <h3>Seamless Item Tracking</h3>
              <p>Organize inventory by category, location, and quantities with real-time updates.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper icon-indigo">
                <BarChart2 size={24} />
              </div>
              <h3>Visual Analytics</h3>
              <p>Monitor total inventory valuation, category distribution, and stock metrics effortlessly.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper icon-emerald">
                <Bell size={24} />
              </div>
              <h3>Proactive Stock Alerts</h3>
              <p>Never run low on essential supplies with automated stock monitoring and alerts.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Easy Inventory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;