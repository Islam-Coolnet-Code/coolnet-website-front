import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  apiKey: string | null;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'admin_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { apiKey: storedKey, expiry } = JSON.parse(stored);
        if (expiry > Date.now()) {
          setApiKey(storedKey);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (key: string): Promise<boolean> => {
    try {
      // Validate API key by making a test request
      const apiUrl = import.meta.env.VITE_CMS_API_URL || '';
      const response = await fetch(`${apiUrl}/admin/orders?limit=1`, {
        headers: {
          'X-API-Key': key,
        },
      });

      if (response.ok || response.status === 200) {
        setApiKey(key);
        setIsAuthenticated(true);
        // Store with 8-hour expiry
        sessionStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            apiKey: key,
            expiry: Date.now() + 8 * 60 * 60 * 1000,
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setApiKey(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
