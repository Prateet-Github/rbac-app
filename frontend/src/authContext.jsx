import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('guest');

  const login = (jwt) => {
    setToken(jwt);
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      setRole(payload.role || 'user');
    } catch {
      setRole('user');
    }
    // optionally save token to localStorage
  };

  const logout = () => {
    setToken(null);
    setRole('guest');
    localStorage.removeItem('token');
  };

  // helper to call protected endpoints
  const authFetch = (opts) => {
    const headers = opts.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return axios({ ...opts, headers });
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);