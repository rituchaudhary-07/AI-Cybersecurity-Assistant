import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Safety timeout: If server does not respond within 3 seconds, drop loading
    const timer = setTimeout(() => {
      if (active) setLoading(false);
    }, 3000);

    const fetchCurrentUser = async () => {
      if (!token) {
        if (active) setLoading(false);
        clearTimeout(timer);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (active) setUser(response.data);
      } catch (err) {
        console.warn('Failed to load user profile or backend offline:', err);
        if (active) logout();
      } finally {
        clearTimeout(timer);
        if (active) setLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
