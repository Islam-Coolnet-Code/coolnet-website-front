import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { AuthSession } from '@/types/authTypes';
import { tokenStore } from '@/services/auth/tokenStore';

const AUTH_STORAGE_KEY = 'coolnet_customer_session';
// setTimeout fires immediately for delays beyond ~24.8 days (2^31-1 ms); cap to that.
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * Parse Coolgate's token_expires_at into epoch ms, tolerating non-ISO formats.
 * Returns null when it can't be parsed (in which case we DON'T auto-logout —
 * the API's own 401 handling remains the safety net).
 */
function parseExpiry(value: string | number | undefined | null): number | null {
  if (value === null || value === undefined || value === '') return null;
  // Numeric (or numeric-string) → Unix epoch. Coolgate uses seconds.
  if (typeof value === 'number' || /^\d+$/.test(String(value).trim())) {
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return n < 1e12 ? n * 1000 : n; // seconds → ms (guard if already ms)
  }
  let ms = Date.parse(value);
  if (Number.isNaN(ms)) {
    // MySQL "YYYY-MM-DD HH:MM:SS" → make it ISO-ish.
    ms = Date.parse(String(value).replace(' ', 'T'));
  }
  return Number.isNaN(ms) ? null : ms;
}

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
    // Expire only if we can parse the expiry AND it's in the past.
    const exp = parseExpiry(parsed.tokenExpiresAt);
    if (exp !== null && exp <= Date.now()) {
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

  // Auto-logout when the token expires. If the expiry can't be parsed we skip
  // the timer entirely (a NaN delay would make setTimeout fire immediately and
  // log the user straight back out); the API's 401 handling covers that case.
  useEffect(() => {
    const exp = parseExpiry(session?.tokenExpiresAt);
    if (exp === null) return;
    const remaining = exp - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const id = setTimeout(logout, Math.min(remaining, MAX_TIMEOUT_MS));
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
