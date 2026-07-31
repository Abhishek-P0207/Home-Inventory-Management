// API service for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Helper method to make API calls with error handling
  async makeRequest(url, options = {}) {
    try {
      const authHeaders = this.getAuthHeaders();

      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_URL}${url}`, requestConfig);

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Get all inventory items
  async getAllItems() {
    const result = await this.makeRequest('/all');
    return result;
  }

  // Get items by category/room
  async getItemsByCategory(roomName) {
    return this.makeRequest(`/room/${encodeURIComponent(roomName)}`);
  }

  // Get specific item by name
  async getItemByName(name) {
    return this.makeRequest(`/item/${encodeURIComponent(name)}`);
  }

  // Add new inventory item
  async addItem(itemData) {
    const payload = {
      name: itemData.name,
      roomName: itemData.category || itemData.roomName,
      quantity: parseInt(itemData.quantity),
      description: itemData.description
    };

    const result = await this.makeRequest('/new', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return result;
  }

  // Update inventory item
  async updateItem(originalName, originalCategory, itemData) {
    return this.makeRequest(`/room/${encodeURIComponent(originalCategory)}/item/${encodeURIComponent(originalName)}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: itemData.name,
        roomName: itemData.category || itemData.roomName,
        quantity: parseInt(itemData.quantity),
        description: itemData.description
      }),
    });
  }

  // Delete inventory item
  async deleteItem(name, category) {
    return this.makeRequest(`/room/${encodeURIComponent(category)}/item/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
  }

  // Search items (client-side filtering for now)
  async searchItems(searchTerm) {
    const allItems = await this.getAllItems();
    return allItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get analytics data (computed from inventory data)
  async getAnalyticsData() {
    try {
      const items = await this.getAllItems();
      console.log(items);
      // Calculate analytics
      const totalItems = items.length;
      const categories = [...new Set(items.map(item => item.roomName))];
      const lowStockItems = items.filter(item => item.quantity <= 5);
      console.log(categories);
      console.log(lowStockItems)

      // Calculate category distribution
      const categoryStats = categories.map(category => {
        const categoryItems = items.filter(item => item.roomName === category);
        return {
          name: category,
          count: categoryItems.length,
          value: categoryItems.reduce((sum, item) => sum + (item.quantity * 100), 0), // Estimated value
          percentage: Math.round((categoryItems.length / totalItems) * 100)
        };
      });

      return {
        totalItems,
        lowStock: lowStockItems.length,
        categories: categories.length,
        totalValue: categoryStats.reduce((sum, cat) => sum + cat.value, 0),
        monthlyChange: Math.floor(Math.random() * 20) + 5,
        topCategories: categoryStats.slice(0, 3),
        lowStockTrend
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const items = await this.getAllItems();
      const categories = [...new Set(items.map(item => item.roomName))];
      const lowStockItems = items.filter(item => item.quantity <= 5);
      

      return {
        totalItems: items.length,
        lowStock: lowStockItems.length,
        categories: categories.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get recent items
  async getRecentItems(limit = 4) {
    try {
      const items = await this.getAllItems();
      return items.slice(-limit).map(item => ({
        id: item._id,
        name: item.name,
        category: item.roomName,
        quantity: item.quantity,
        addedDate: new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching recent items:', error);
      throw error;
    }
  }

  // Get low stock items
  async getLowStockItems(threshold = 5) {
    try {
      const items = await this.getAllItems();
      return items
        .filter(item => item.quantity <= threshold)
        .map(item => ({
          id: item._id,
          name: item.name,
          category: item.roomName,
          quantity: item.quantity,
          threshold
        }));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  // Upload document / invoice for processing
  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const authHeaders = this.getAuthHeaders();

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          ...authHeaders,
        },
        body: formData,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Fetch user's uploaded invoices
  async getInvoices() {
    return this.makeRequest('/invoices');
  }

  // Securely view private S3 invoice document in browser
  async viewInvoiceFile(invoiceId) {
    try {
      const authHeaders = this.getAuthHeaders();
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/file`, {
        headers: authHeaders
      });
      if (!response.ok) {
        throw new Error(`Failed to load document (${response.status})`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error viewing invoice file:', error);
      throw error;
    }
  }
}

export default new ApiService();