import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType } from '../types';

const AUTH_STORAGE_KEY = 'phishing_demo_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate auth state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.token && parsed.username) {
          setToken(parsed.token);
          setUsername(parsed.username);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = (inputUser: string, inputPass: string): boolean => {
    setError(null);
    const cleanUser = inputUser.trim();
    const cleanPass = inputPass.trim();

    // Required hardcoded credentials: Alphaphis / Alpha12A
    if (cleanUser === 'Alphaphis' && cleanPass === 'Alpha12A') {
      const generatedToken = `token_${Date.now()}_auth_demo_session`;
      setToken(generatedToken);
      setUsername(cleanUser);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token: generatedToken, username: cleanUser, loginTime: new Date().toISOString() })
      );
      return true;
    } else {
      setError('Invalid username or password. Please check your credentials.');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setError(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        username,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
