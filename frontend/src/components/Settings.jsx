import React, { useState } from 'react';
import { User, Bell, Shield, Database, Download, Trash2, Save } from 'lucide-react';
import './Settings.css';

const Settings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    company: 'Acme Corp',
    phone: '+1 (555) 123-4567'
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newItems: false,
    reports: true,
    updates: false
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Simulate API call
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const handleNotificationUpdate = () => {
    // Simulate API call
    console.log('Notifications updated:', notifications);
    alert('Notification preferences updated!');
  };

  const handleSecurityUpdate = () => {
    // Simulate API call
    console.log('Security settings updated:', security);
    alert('Security settings updated!');
  };

  const exportData = () => {
    // Simulate data export
    const exportData = {
      profile: profileData,
      notifications: notifications,
      security: security,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Simulate account deletion
      alert('Account deletion request submitted. You will receive a confirmation email.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ];

  return (
    <div className="settings">
      <div className="container">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your account preferences and security settings</p>
        </div>

        <div className="settings-content">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="settings-main">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Profile Information</h2>
                  <p>Update your personal information and contact details</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.company}
                        onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Save size={16} />
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Notification Preferences</h2>
                  <p>Choose what notifications you want to receive</p>
                </div>

                <div className="notification-settings">
                  <div className="notification-item">
                    <div className="notification-info">
                      <h3>Low Stock Alerts</h3>
                      <p>Get notified when items are running low</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.lowStock}
                        onChange={(e) => setNotifications({...notifications, lowStock: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h3>New Items Added</h3>
                      <p>Get notified when new items are added to inventory</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.newItems}
                        onChange={(e) => setNotifications({...notifications, newItems: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h3>Weekly Reports</h3>
                      <p>Receive weekly inventory summary reports</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.reports}
                        onChange={(e) => setNotifications({...notifications, reports: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h3>System Updates</h3>
                      <p>Get notified about system updates and maintenance</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={notifications.updates}
                        onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button onClick={handleNotificationUpdate} className="btn btn-primary">
                  <Save size={16} />
                  Save Preferences
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Security Settings</h2>
                  <p>Manage your account security and authentication</p>
                </div>

                <div className="security-settings">
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Two-Factor Authentication</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={security.twoFactor}
                        onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <select
                      className="form-input"
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Expiry (days)</label>
                    <select
                      className="form-input"
                      value={security.passwordExpiry}
                      onChange={(e) => setSecurity({...security, passwordExpiry: e.target.value})}
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSecurityUpdate} className="btn btn-primary">
                  <Save size={16} />
                  Update Security Settings
                </button>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="settings-section">
                <div className="section-header">
                  <h2>Data & Privacy</h2>
                  <p>Manage your data and privacy preferences</p>
                </div>

                <div className="data-settings">
                  <div className="data-item">
                    <div className="data-info">
                      <h3>Export Your Data</h3>
                      <p>Download a copy of all your account data</p>
                    </div>
                    <button onClick={exportData} className="btn btn-secondary">
                      <Download size={16} />
                      Export Data
                    </button>
                  </div>

                  <div className="data-item danger">
                    <div className="data-info">
                      <h3>Delete Account</h3>
                      <p>Permanently delete your account and all associated data</p>
                    </div>
                    <button onClick={deleteAccount} className="btn btn-danger">
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;