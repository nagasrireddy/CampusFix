// ---------------------------------------------------------
// context/AuthContext.jsx
// Single source of truth for "who is logged in and as what
// role" across the whole app. Wraps the namespaced storage
// module so components never touch localStorage directly.
// ---------------------------------------------------------

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { getSession, setSession, clearSession } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we validate an existing session

  // On first mount, check for a persisted session and verify it's still
  // valid against the backend (in case the token expired server-side).
  useEffect(() => {
    const bootstrap = async () => {
      const session = getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
