import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync / verify current user on initial mount if token exists
  useEffect(() => {
    async function initAuth() {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.warn('[AuthContext] Session invalid or backend unreachable:', err.message);
          // If 401 or invalid token, clean up
          if (err.status === 401) {
            authService.clearAuth();
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    }

    initAuth();

    // Listen for 401 unauthorized events from apiRequest
    const handleAuthExpired = () => {
      authService.clearAuth();
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  /**
   * Log in user with email & password
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authService.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    setError(null);
    try {
      const data = await authService.register(userData);
      if (data?.token) {
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Log out user and wipe local tokens
   */
  const logout = () => {
    authService.clearAuth();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
