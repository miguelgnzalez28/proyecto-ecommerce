import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  // Simulate loading public settings
  useEffect(() => {
    setIsLoadingPublicSettings(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoadingPublicSettings(false);
    }, 500);
  }, []);

  // Simulate auth check
  useEffect(() => {
    setIsLoadingAuth(true);
    // Check if user is logged in (you can implement actual auth logic here)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setTimeout(() => {
      setIsLoadingAuth(false);
    }, 500);
  }, []);

  const navigateToLogin = () => {
    // You can implement actual login navigation here
    console.log('Navigate to login');
  };

  const value = {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    user,
    setAuthError,
    navigateToLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
