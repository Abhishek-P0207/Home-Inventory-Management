import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, AlertTriangle, Plus, Search, Eye } from 'lucide-react';
import ApiService from '../services/api.js';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    categories: 0,
    recentActivity: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [statsData, recentItemsData, lowStockData] = await Promise.all([
        ApiService.getDashboardStats(),
        ApiService.getRecentItems(4),
        ApiService.getLowStockItems(5)
      ]);

      setStats(statsData);
      setRecentItems(recentItemsData);
      setLowStockItems(lowStockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Fallback to dummy data for demo
      setStats({
        totalItems: 156,
        lowStock: 8,
        categories: 12,
        recentActivity: 23
      });

      setRecentItems([
        { id: 1, name: 'Laptop Dell XPS', category: 'Electronics', quantity: 5, addedDate: '2024-01-15' },
        { id: 2, name: 'Office Chair', category: 'Furniture', quantity: 12, addedDate: '2024-01-14' },
        { id: 3, name: 'Printer Paper', category: 'Office Supplies', quantity: 50, addedDate: '2024-01-13' },
        { id: 4, name: 'Wireless Mouse', category: 'Electronics', quantity: 8, addedDate: '2024-01-12' }
      ]);

      setLowStockItems([
        { id: 1, name: 'Ink Cartridge', category: 'Office Supplies', quantity: 2, threshold: 10 },
        { id: 2, name: 'USB Cable', category: 'Electronics', quantity: 3, threshold: 15 },
        { id: 3, name: 'Notebook', category: 'Office Supplies', quantity: 1, threshold: 5 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening with your inventory today.</p>
            {error && <div className="error-message">{error}</div>}
          </div>
          <Link to="/inventory" className="btn btn-primary">
            <Plus size={16} />
            Add Item
          </Link>
        </div>

        {loading ? (
          <div className="loading-stats">
            <div className="loading-card">Loading...</div>
            <div className="loading-card">Loading...</div>
            <div className="loading-card">Loading...</div>
            <div className="loading-card">Loading...</div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Package size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.totalItems}</h3>
                <p>Total Items</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.lowStock}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.categories}</h3>
                <p>Categories</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Package size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.recentActivity}</h3>
                <p>Recent Activity</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/inventory" className="action-card">
                <div className="action-icon">
                  <Search size={24} />
                </div>
                <div className="action-content">
                  <h3>Quick Lookup</h3>
                  <p>Search and find items quickly</p>
                </div>
              </Link>

              <Link to="/inventory" className="action-card">
                <div className="action-icon">
                  <Eye size={24} />
                </div>
                <div className="action-content">
                  <h3>Detailed Inventory</h3>
                  <p>View complete inventory list</p>
                </div>
              </Link>

              <Link to="/analysis" className="action-card">
                <div className="action-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="action-content">
                  <h3>Analysis</h3>
                  <p>View reports and analytics</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Items</h2>
                <Link to="/inventory" className="section-link">View all</Link>
              </div>
              <div className="items-list">
                {recentItems.map(item => (
                  <div key={item.id} className="item-row">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.category}</p>
                    </div>
                    <div className="item-quantity">
                      <span className="quantity">{item.quantity} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h2>Low Stock Alerts</h2>
                <Link to="/inventory" className="section-link">View all</Link>
              </div>
              <div className="items-list">
                {lowStockItems.map(item => (
                  <div key={item.id} className="item-row alert">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{item.category}</p>
                    </div>
                    <div className="item-quantity">
                      <span className="quantity warning">{item.quantity} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;