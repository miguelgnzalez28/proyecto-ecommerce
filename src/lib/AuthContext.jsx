import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  // Simulate loading public settings
  useEffect(() => {
    setIsLoadingPublicSettings(true);
    setTimeout(() => {
      setIsLoadingPublicSettings(false);
    }, 500);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    setIsLoadingAuth(true);
    const storedUser = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (storedUser && isAuthenticated) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    } else {
      setUser(null);
    }
    
    setTimeout(() => {
      setIsLoadingAuth(false);
    }, 300);
  }, []);

  const navigateToLogin = (returnUrl) => {
    // This will be handled by the component using the hook
    if (typeof window !== 'undefined') {
      window.location.href = `/login${returnUrl ? `?return=${encodeURIComponent(returnUrl)}` : ''}`;
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const value = {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    user,
    isAuthenticated: !!user,
    setAuthError,
    navigateToLogin,
    login,
    logout,
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
