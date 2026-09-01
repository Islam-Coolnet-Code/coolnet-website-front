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
}

/**
 * Confirmation that a freshly generated password was texted to the subscriber.
 * The password itself is never returned to the browser — it only goes to the
 * mobile registered on the account.
 */
export interface PasswordSmsResult {
  /** Destination with the middle digits hidden, e.g. "059***456". */
  mobileMasked: string;
  /** ISO timestamp of when another password may be requested (30 days out). */
  availableAt: string;
  userno: string;
}

export type ExtendRequestStatus = 'pending' | 'approved' | 'rejected';

/**
 * A one-time activation request the subscriber raised after using up their
 * self-service extensions. Decided by Coolgate staff, not by the website.
 */
export interface ExtendRequestRecord {
  id: number;
  status: ExtendRequestStatus;
  reason: string | null;
  requestedAt: string | null;
  decidedAt: string | null;
  /**
   * The approver's internal note on a turned-down request. Deliberately NOT
   * shown to the subscriber — they get the "settle your invoice" note instead —
   * but kept on the record for support.
   */
  decisionNote: string | null;
  /** The expiry granted — only present once approved. */
  newExpiration: string | null;
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
  maxExtendDays: number;
  /** Self-service extensions are used up — only an approved request can activate. */
  extendLimitReached: boolean;
  /**
   * The subscriber may raise a one-time activation request right now — they sit
   * in the eligible extend-day window (12..20) with nothing pending or already
   * granted this cycle. Decided upstream; the UI only reads it.
   */
  canRequestExtend: boolean;
  requestMinDays: number;
  requestMaxDays: number;
  /** The subscriber's latest activation request for this billing cycle. */
  extendRequest: ExtendRequestRecord | null;
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

export interface ExtendRequestResult {
  requestId: number;
  status: ExtendRequestStatus;
  requestedAt: string;
}

/** Payload for a Yabus (salary-deduction) authorization submission. */
export interface YabusAuthorizationInput {
  /** Subscription number (5 digits) — the logged-in subscriber's userno. */
  userno: string;
  /** Name of the Yabus (Yaboos) app account owner. */
  yaboosUserName: string;
  /** ID number per the salary slip / Yabus app. */
  idNumberSalary: string;
  /** ID number of the subscription owner on record at Coolnet. */
  idNumberCoolnet: string;
  /** Payer's relationship to the subscription owner (self / first-degree relative). */
  relationship: string;
  /** Attached salary slip. */
  salarySlip: File;
  /** Attached ID image (payer, per salary slip). */
  idImage: File;
  /** Attached ID annex showing a first-degree relative of the subscriber. */
  idAnnex: File;
  /** Attached ID image of the Coolnet subscription owner. */
  coolnetIdImage: File;
  /** Attached ID annex of the Coolnet subscription owner. */
  coolnetIdAnnex: File;
}

export interface YabusAuthorizationResult {
  id: number;
  status: string;
}

export type YabusRequestStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

/** One of the logged-in subscriber's own Yabus requests. */
export interface YabusAuthorizationRecord {
  id: number;
  userno: string;
  yaboosUserName: string | null;
  idNumberSalary: string;
  idNumberCoolnet: string;
  relationship: string | null;
  status: YabusRequestStatus;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  salarySlipUrl: string | null;
  idImageUrl: string | null;
  idAnnexUrl: string | null;
  coolnetIdImageUrl: string | null;
  coolnetIdAnnexUrl: string | null;
}

/** Our API envelope: { success, data, error?: { code, message } }. */
export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    /**
     * Structured context behind the failure, so the UI can build its own
     * localized sentence rather than showing the backend's English one —
     * e.g. `days_remaining` on a RESET_COOLDOWN.
     */
    details?: Record<string, unknown>;
  };
}
