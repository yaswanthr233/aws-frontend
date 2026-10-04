import { API, apiRequest } from '../config/api';

/**
 * Authentication Service
 * Talks to Auth Service running on port 5001 (via VITE_AUTH_API_URL)
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  async register(userData) {
    const data = await apiRequest(API.AUTH, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password
      })
    });

    // Many backends return { token, user } on register, or { message }
    if (data?.token) {
      this.saveAuth(data.token, data.user || { name: userData.name, email: userData.email });
    }
    return data;
  },

  /**
   * Login user with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const data = await apiRequest(API.AUTH, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Support responses formatted as { token, user } or { data: { token, user } }
    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user || { email };

    if (token) {
      this.saveAuth(token, user);
    }

    return { token, user, ...data };
  },

  /**
   * Fetch current user info using JWT
   */
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const data = await apiRequest(API.AUTH, '/api/auth/me', {
        method: 'GET'
      });
      const user = data?.user || data?.data?.user || data;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    } catch (err) {
      // If 401 or token invalid, clear
      if (err.status === 401) {
        this.clearAuth();
      }
      throw err;
    }
  },

  /**
   * Save JWT and user info into localStorage
   */
  saveAuth(token, user) {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Get JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user from localStorage
   */
  getUser() {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear JWT and user data on logout
   */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
