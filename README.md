# Easy Inventory

A modern, React-based inventory management system.

## Features

### 🔐 Authentication
- **User registration and login** with MongoDB storage
- **JWT token-based authentication** with secure password hashing (bcrypt)
- **Database-stored user accounts** with unique email validation
- **Token validation and session management**
- **Protected API routes** - all inventory operations require authentication

### 📊 Dashboard
- **Real-time statistics** from backend API
- Statistics overview with key metrics (total items, low stock, categories)
- Quick action cards for common tasks
- Recent items and low stock alerts from live data

### 📦 Inventory Management
- **Real-time data persistence** - all changes saved to database
- Search and filter functionality
- Category-based organization
- Modal forms for adding/editing items
- Error handling and loading states

### 📈 Analytics (Backend Data Integration)
- **Live analytics** computed from actual inventory data
- Category distribution from real data
- Low stock trend analysis
