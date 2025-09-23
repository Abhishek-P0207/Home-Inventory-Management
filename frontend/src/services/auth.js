// Simple authentication service (mock implementation)
// In a real application, this would connect to a proper authentication backend

class AuthService {
  // Mock user database (in real app, this would be in the backend)
  static users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123' // In real app, this would be hashed
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123'
    }
  ];

  // Simulate API delay
  static delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Login method
  static async login(email, password) {
    await this.delay(1000); // Simulate network delay

    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate a mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token
    };
  }

  // Register method
  static async register(name, email, password, confirmPassword) {
    await this.delay(1000); // Simulate network delay

    // Validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: this.users.length + 1,
      name,
      email,
      password // In real app, this would be hashed
    };

    this.users.push(newUser);

    // Generate a mock JWT token
    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: token
    };
  }

  // Validate token (mock implementation)
  static async validateToken(token) {
    await this.delay(500);
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new Error('Invalid token');
    }

    // Extract user ID from token (in real app, you'd decode the JWT)
    const parts = token.split('-');
    const userId = parseInt(parts[3]);
    
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token
    };
  }

  // Logout (client-side only for mock)
  static async logout() {
    await this.delay(500);
    // In real app, you might invalidate the token on the server
    return { success: true };
  }
}

export default AuthService;