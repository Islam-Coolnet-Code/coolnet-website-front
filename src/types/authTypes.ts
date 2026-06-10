/**
 * Authentication & Customer Zone types.
 *
 * Backed by the Coolgate `website` module (proxied through our API at
 * `/api/customer/*`). Auth is userno + password → bearer token.
 */

export type OnlineStatus = 'online' | 'offline';

/** The session held by the SPA after login. */
export interface AuthSession {
  token: string;
  tokenExpiresAt: string; // ISO timestamp
  userno: string;
  username: string;
  forcePasswordChange: boolean;
}

/** Subscriber profile from `users/details`. */
export interface UserDetails {
  userNo: string;
  contractId: string | number;
  fullName: string;
  mobile: string;
  serviceType: string;
  status: OnlineStatus;
  totalExtendDays: number;
  paidTill: string | null; // Y-m-d or null
}

/** One usage window from `users/sessions`. */
export interface UsageWindow {
  downloadBytes: number;
  uploadBytes: number;
  downloadGb: number;
  uploadGb: number;
}

export interface UsageData {
  lastWeek: UsageWindow;
  lastMonth: UsageWindow;
  last3Months: UsageWindow;
}

export interface CheckUserResult {
  valid: boolean;
  enabled: boolean;
}

export interface ExtendResult {
  username: string;
  expiration: string;
}

/** Our API envelope: { success, data, error?: { code, message } }. */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}
