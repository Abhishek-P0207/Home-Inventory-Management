// Authentication service for backend communication
const API_BASE_URL = '/api/auth';

class AuthService {
  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Helper method to make API calls
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Auth API Error for ${url}:`, error);
      throw error;
    }
  }

  // Login method
  async login(email, password) {
    const data = await this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      token: data.token
    };
  }

  // Register method
  async register(name, email, password, confirmPassword) {
    // Client-side validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const data = await this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      token: data.token
    };
  }

  // Validate token
  async validateToken(token) {
    const data = await this.makeRequest('/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      token: token
    };
  }

  // Get user profile
  async getProfile(token) {
    const data = await this.makeRequest('/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return data.user;
  }

  // Update user profile
  async updateProfile(token, profileData) {
    const data = await this.makeRequest('/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    return data.user;
  }

  // Change password
  async changePassword(token, currentPassword, newPassword) {
    const data = await this.makeRequest('/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    return data;
  }

  // Logout (client-side cleanup)
  async logout() {
    // In a real app, you might want to invalidate the token on the server
    // For now, we'll just do client-side cleanup
    return { success: true };
  }
}

export default new AuthService();