import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Download } from 'lucide-react';
import ApiService from '../services/api.js';
import './Analysis.css';

const Analysis = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalValue: 0,
    monthlyChange: 0,
    topCategories: [],
    lowStockTrend: [],
    recentActivity: []
  });
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
      
      // Fallback to dummy data for demo
      setAnalyticsData({
        totalValue: 45750,
        monthlyChange: 12.5,
        topCategories: [
          { name: 'Electronics', count: 45, value: 25000, percentage: 55 },
          { name: 'Furniture', count: 32, value: 12000, percentage: 26 },
          { name: 'Office Supplies', count: 78, value: 8750, percentage: 19 }
        ],
        lowStockTrend: [
          { month: 'Jan', count: 5 },
          { month: 'Feb', count: 8 },
          { month: 'Mar', count: 12 },
          { month: 'Apr', count: 7 },
          { month: 'May', count: 9 },
          { month: 'Jun', count: 6 }
        ],
        recentActivity: [
          { date: '2024-01-15', action: 'Added', item: 'Laptop Dell XPS', quantity: 5 },
          { date: '2024-01-14', action: 'Updated', item: 'Office Chair', quantity: 12 },
          { date: '2024-01-13', action: 'Removed', item: 'Old Printer', quantity: 1 },
          { date: '2024-01-12', action: 'Added', item: 'Wireless Mouse', quantity: 8 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Dummy export functionality
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange: timeRange,
      ...analyticsData
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="analysis">
      <div className="container">
        <div className="analysis-header">
          <div>
            <h1>Analytics & Reports</h1>
            <p>Gain insights into your inventory performance and trends</p>
            {error && <div className="error-message">{error}</div>}
          </div>
          <div className="header-actions">
            <select 
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button 
              className="btn btn-primary" 
              onClick={exportReport}
              disabled={loading}
            >
              <Download size={16} />
              {loading ? 'Loading...' : 'Export Report'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-overview">
            <div className="loading-card">Loading...</div>
            <div className="loading-card">Loading...</div>
            <div className="loading-card">Loading...</div>
          </div>
        ) : (
          <div className="analytics-overview">
            <div className="overview-card">
              <div className="card-icon">
                <BarChart3 size={24} />
              </div>
              <div className="card-content">
                <h3>${analyticsData.totalValue.toLocaleString()}</h3>
                <p>Total Inventory Value</p>
                <div className="trend">
                  <TrendingUp size={16} className="trend-up" />
                  <span className="trend-value">+{analyticsData.monthlyChange}%</span>
                  <span className="trend-period">vs last month</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon">
                <PieChart size={24} />
              </div>
              <div className="card-content">
                <h3>{analyticsData.topCategories.length}</h3>
                <p>Active Categories</p>
                <div className="trend">
                  <Calendar size={16} />
                  <span className="trend-period">Updated today</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon warning">
                <TrendingDown size={24} />
              </div>
              <div className="card-content">
                <h3>{analyticsData.lowStockTrend[analyticsData.lowStockTrend.length - 1]?.count || 0}</h3>
                <p>Low Stock Items</p>
                <div className="trend">
                  <TrendingDown size={16} className="trend-down" />
                  <span className="trend-value">Needs attention</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="analytics-content">
          <div className="analytics-section">
            <div className="section-header">
              <h2>Category Distribution</h2>
              <p>Breakdown of inventory by category</p>
            </div>
            <div className="category-chart">
              {analyticsData.topCategories.map((category, index) => (
                <div key={category.name} className="category-item">
                  <div className="category-info">
                    <div className="category-name">
                      <div className={`category-color color-${index}`}></div>
                      <span>{category.name}</span>
                    </div>
                    <div className="category-stats">
                      <span className="item-count">{category.count} items</span>
                      <span className="category-value">${category.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="category-bar">
                    <div 
                      className={`category-fill color-${index}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="category-percentage">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-section">
            <div className="section-header">
              <h2>Low Stock Trend</h2>
              <p>Monthly low stock items over time</p>
            </div>
            <div className="trend-chart">
              <div className="chart-container">
                {analyticsData.lowStockTrend.map((data, index) => (
                  <div key={data.month} className="chart-bar">
                    <div 
                      className="bar"
                      style={{ height: `${(data.count / 15) * 100}%` }}
                    ></div>
                    <span className="bar-label">{data.month}</span>
                    <span className="bar-value">{data.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="analytics-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
              <p>Latest inventory changes and updates</p>
            </div>
            <div className="activity-list">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.action.toLowerCase()}`}>
                    {activity.action === 'Added' && <TrendingUp size={16} />}
                    {activity.action === 'Updated' && <BarChart3 size={16} />}
                    {activity.action === 'Removed' && <TrendingDown size={16} />}
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-item">{activity.item}</span>
                      <span className="activity-quantity">({activity.quantity} units)</span>
                    </div>
                    <div className="activity-date">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;