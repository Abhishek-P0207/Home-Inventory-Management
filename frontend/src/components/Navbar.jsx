import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="logo">
            <div className="logo-icon">I</div>
            <span className="logo-text">Easy Inventory</span>
          </Link>

          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/inventory" 
              className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}
            >
              Inventory
            </Link>
            <Link 
              to="/analysis" 
              className={`nav-link ${isActive('/analysis') ? 'active' : ''}`}
            >
              Analysis
            </Link>
          </div>

          <div className="navbar-user">
            <div className="user-dropdown">
              <button 
                className="user-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <span className="user-name">{user?.name || 'User'}</span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <button 
                    className="dropdown-item logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;