import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { UserData, AuthState } from '@/types/authTypes';
import { setCookie, getCookie, deleteCookie } from '@/utils/cookieUtils';

const AUTH_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const AUTH_COOKIE_NAME = 'coolnet_auth_session';
const AUTH_STORAGE_KEY = 'coolnet_auth_data';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  phoneNumber: string | null;
  login: (phoneNumber: string, userData: UserData) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    phoneNumber: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const cookieExists = getCookie(AUTH_COOKIE_NAME) === 'true';
        const storedData = sessionStorage.getItem(AUTH_STORAGE_KEY);

        if (cookieExists && storedData) {
          const parsedData = JSON.parse(storedData) as {
            user: UserData;
            phoneNumber: string;
            timestamp: number;
          };

          // Check if session has expired
          const elapsed = Date.now() - parsedData.timestamp;
          if (elapsed < AUTH_SESSION_DURATION) {
            setAuthState({
              isAuthenticated: true,
              user: parsedData.user,
              phoneNumber: parsedData.phoneNumber,
            });
          } else {
            // Session expired, clear data
            clearAuthData();
          }
        }
      } catch (error) {
        console.warn('Failed to restore auth session:', error);
        clearAuthData();
      }
    };

    checkExistingSession();
  }, []);

  // Auto-logout timer
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const storedData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedData) return;

    try {
      const parsedData = JSON.parse(storedData) as { timestamp: number };
      const elapsed = Date.now() - parsedData.timestamp;
      const remaining = AUTH_SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        clearAuthData();
        setAuthState({
          isAuthenticated: false,
          user: null,
          phoneNumber: null,
        });
        return;
      }

      const timeoutId = setTimeout(() => {
        clearAuthData();
        setAuthState({
          isAuthenticated: false,
          user: null,
          phoneNumber: null,
        });
      }, remaining);

      return () => clearTimeout(timeoutId);
    } catch {
      // Ignore parse errors
    }
  }, [authState.isAuthenticated]);

  const clearAuthData = () => {
    try {
      deleteCookie(AUTH_COOKIE_NAME);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear auth data:', error);
    }
  };

  const login = useCallback((phoneNumber: string, userData: UserData) => {
    try {
      const sessionData = {
        user: userData,
        phoneNumber,
        timestamp: Date.now(),
      };

      // Store in sessionStorage
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));

      // Set cookie for session validation
      setCookie(AUTH_COOKIE_NAME, 'true', {
        maxAge: AUTH_SESSION_DURATION / 1000,
        path: '/',
        sameSite: 'lax',
      });

      setAuthState({
        isAuthenticated: true,
        user: userData,
        phoneNumber,
      });
    } catch (error) {
      console.error('Failed to store auth session:', error);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      user: null,
      phoneNumber: null,
    });
  }, []);

  const updateUser = useCallback((userData: Partial<UserData>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };

      // Update stored data
      try {
        const storedData = sessionStorage.getItem(AUTH_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          parsedData.user = updatedUser;
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsedData));
        }
      } catch (error) {
        console.warn('Failed to update stored user data:', error);
      }

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        phoneNumber: authState.phoneNumber,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
