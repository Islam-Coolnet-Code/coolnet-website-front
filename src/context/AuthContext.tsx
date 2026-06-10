import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { AuthSession } from '@/types/authTypes';
import { tokenStore } from '@/services/auth/tokenStore';

const AUTH_STORAGE_KEY = 'coolnet_customer_session';

interface AuthContextType {
  isAuthenticated: boolean;
  session: AuthSession | null;
  /** True until the first-login forced password change is completed. */
  needsPasswordChange: boolean;
  login: (session: AuthSession) => void;
  /** Replace the session after the token rotates (e.g. change-password). */
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    // Expire if the token is past its expiry.
    if (parsed.tokenExpiresAt && Date.parse(parsed.tokenExpiresAt) <= Date.now()) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    const s = loadSession();
    tokenStore.set(s?.token ?? null);
    return s;
  });

  const persist = useCallback((next: AuthSession | null) => {
    setSessionState(next);
    tokenStore.set(next?.token ?? null);
    try {
      if (next) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist auth session:', error);
    }
  }, []);

  const login = useCallback((next: AuthSession) => persist(next), [persist]);
  const setSession = useCallback((next: AuthSession) => persist(next), [persist]);
  const logout = useCallback(() => persist(null), [persist]);

  // Auto-logout when the token expires.
  useEffect(() => {
    if (!session?.tokenExpiresAt) return;
    const remaining = Date.parse(session.tokenExpiresAt) - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const id = setTimeout(logout, remaining);
    return () => clearTimeout(id);
  }, [session?.tokenExpiresAt, logout]);

  // Logout when the API reports the token is no longer valid.
  useEffect(() => {
    tokenStore.setUnauthorizedHandler(() => persist(null));
    return () => tokenStore.setUnauthorizedHandler(null);
  }, [persist]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        session,
        needsPasswordChange: !!session?.forcePasswordChange,
        login,
        setSession,
        logout,
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
