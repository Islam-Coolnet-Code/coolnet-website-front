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
  expiration: string | null; // datetime, or null
  expired: boolean; // authoritative expiry flag from upstream
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

/** Payload for a Yabus (salary-deduction) authorization submission. */
export interface YabusAuthorizationInput {
  /** Subscription number (5 digits) — the logged-in subscriber's userno. */
  userno: string;
  /** ID number per the salary slip / Yabus app. */
  idNumberSalary: string;
  /** ID number of the subscription owner on record at Coolnet. */
  idNumberCoolnet: string;
  /** Payer's relationship to the subscription owner (self / first-degree relative). */
  relationship: string;
  /** Attached salary slip. */
  salarySlip: File;
  /** Attached ID image. */
  idImage: File;
  /** Attached ID annex showing a first-degree relative of the subscriber. */
  idAnnex: File;
}

export interface YabusAuthorizationResult {
  id: number;
  status: string;
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
