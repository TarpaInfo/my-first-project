import React, { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('satori_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('satori_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', {
      username: email,
      email: email,
      password: password,
    });

    const jwtToken = response.data.token || response.data.jwt || response.data.accessToken;
    const userData = {
      email: response.data.email || email,
      role: response.data.role || 'ROLE_OPERATIONS_MANAGER',
    };

    localStorage.setItem('satori_token', jwtToken);
    localStorage.setItem('satori_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('satori_token');
    localStorage.removeItem('satori_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);