import axios from 'axios';
import { tokenStore } from './tokenStore';
import type {
  ApiEnvelope,
  AuthSession,
  UserDetails,
  UsageData,
  CheckUserResult,
  ExtendResult,
  YabusAuthorizationInput,
  YabusAuthorizationResult,
  YabusAuthorizationRecord,
} from '@/types/authTypes';

/**
 * Customer Zone API client.
 *
 * Talks to our own backend (`/api/customer/*`), which proxies the Coolgate
 * `website` module and injects the app-level signature/operator secrets server-side.
 * The browser only ever holds the per-customer bearer token.
 */
const API_BASE_URL = import.meta.env.VITE_CMS_API_URL || '/api';

const customerApi = axios.create({
  baseURL: `${API_BASE_URL}/customer`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/**
 * Document uploads carry up to five files of up to 10MB each. The 15s default
 * aborts them mid-transfer on a mobile/ADSL uplink, which surfaced to the
 * customer as an unexplained "try again later".
 */
const UPLOAD_TIMEOUT_MS = 180000;

// Attach the customer token on every request when present.
// We send BOTH headers on purpose: `Authorization` is the standard, but some
// reverse-proxy edges (e.g. the coolnet.ps front layer) strip `Authorization`
// while passing custom headers through — so `token` is the resilient fallback.
// The backend's requireCustomerToken middleware accepts either.
customerApi.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token;
  }
  return config;
});

/** Error carrying the backend `code` so callers can branch (NOT_EXPIRED, etc.). */
export class CustomerApiError extends Error {
  code: string;
  status?: number;
  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'CustomerApiError';
    this.code = code;
    this.status = status;
  }
}

// Map any failure to a CustomerApiError; fire the unauthorized handler on 401.
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const envelope = error?.response?.data as ApiEnvelope<unknown> | undefined;
    // A 413 comes from the reverse proxy as an HTML page, so there is no
    // envelope to read the code from — recognise it by status.
    const fallbackCode =
      status === 413
        ? 'FILE_TOO_LARGE'
        : error?.code === 'ECONNABORTED'
          ? 'TIMEOUT'
          : 'NETWORK_ERROR';
    const code = envelope?.error?.code || fallbackCode;
    const message =
      envelope?.error?.message ||
      (error?.request && !error?.response
        ? 'Network error: no response from server'
        : error?.message || 'Request failed');

    if (status === 401 || code === 'UNAUTHORIZED') {
      tokenStore.notifyUnauthorized();
    }
    return Promise.reject(new CustomerApiError(message, code, status));
  }
);

function unwrap<T>(body: ApiEnvelope<T>): T {
  if (!body?.success || body.data === undefined) {
    throw new CustomerApiError(
      body?.error?.message || 'Unexpected response',
      body?.error?.code || 'UNEXPECTED_RESPONSE'
    );
  }
  return body.data;
}

/** POST /api/customer/auth/login */
export async function loginUser(userno: string, password: string): Promise<AuthSession> {
  const res = await customerApi.post<ApiEnvelope<AuthSession>>('/auth/login', { userno, password });
  return unwrap(res.data);
}

/** POST /api/customer/auth/change-password (requires token). */
export async function changePassword(
  newPassword: string,
  oldPassword?: string
): Promise<{ token: string; tokenExpiresAt: string }> {
  const body: Record<string, string> = { new_password: newPassword };
  if (oldPassword !== undefined) body.old_password = oldPassword;
  const res = await customerApi.post<ApiEnvelope<{ token: string; tokenExpiresAt: string }>>(
    '/auth/change-password',
    body
  );
  return unwrap(res.data);
}

/** POST /api/customer/users/check (public). */
export async function checkUser(userno: string): Promise<CheckUserResult> {
  const res = await customerApi.post<ApiEnvelope<CheckUserResult>>('/users/check', { userno });
  return unwrap(res.data);
}

/** POST /api/customer/users/details (requires token). */
export async function getUserDetails(): Promise<UserDetails> {
  const res = await customerApi.post<ApiEnvelope<UserDetails>>('/users/details', {});
  return unwrap(res.data);
}

/** POST /api/customer/users/sessions (requires token). */
export async function getUserSessions(): Promise<UsageData> {
  const res = await customerApi.post<ApiEnvelope<UsageData>>('/users/sessions', {});
  return unwrap(res.data);
}

/** POST /api/customer/users/extend (requires token). */
export async function extendExpiration(): Promise<ExtendResult> {
  const res = await customerApi.post<ApiEnvelope<ExtendResult>>('/users/extend', {});
  return unwrap(res.data);
}

/**
 * POST /api/customer/yabus-authorization (requires token, multipart).
 * Submits a salary-deduction (Yabus) authorization with its three documents.
 */
export async function submitYabusAuthorization(
  input: YabusAuthorizationInput
): Promise<YabusAuthorizationResult> {
  const form = new FormData();
  form.append('userno', input.userno);
  form.append('yaboosUserName', input.yaboosUserName);
  form.append('idNumberSalary', input.idNumberSalary);
  form.append('idNumberCoolnet', input.idNumberCoolnet);
  form.append('relationship', input.relationship);
  form.append('salarySlip', input.salarySlip);
  form.append('idImage', input.idImage);
  form.append('idAnnex', input.idAnnex);
  form.append('coolnetIdImage', input.coolnetIdImage);
  form.append('coolnetIdAnnex', input.coolnetIdAnnex);

  const res = await customerApi.post<ApiEnvelope<YabusAuthorizationResult>>(
    '/yabus-authorization',
    form,
    // Unset the instance's default JSON content-type so the browser sets the
    // correct multipart/form-data boundary itself.
    { headers: { 'Content-Type': undefined }, timeout: UPLOAD_TIMEOUT_MS }
  );
  return unwrap(res.data);
}

/**
 * POST /api/customer/yabus-authorization/mine (requires token).
 * Returns the logged-in subscriber's own Yabus requests (scoped server-side).
 */
export async function getMyYabusAuthorizations(): Promise<YabusAuthorizationRecord[]> {
  const res = await customerApi.post<ApiEnvelope<{ authorizations: YabusAuthorizationRecord[] }>>(
    '/yabus-authorization/mine',
    {}
  );
  return unwrap(res.data).authorizations;
}

/**
 * POST /api/customer/yabus-authorization/:id (requires token, multipart).
 * Edits the subscriber's own request (only while not approved). Files are
 * optional — a file is sent only when the customer picked a replacement.
 */
export async function updateYabusAuthorization(
  id: number,
  input: {
    yaboosUserName: string;
    idNumberSalary: string;
    idNumberCoolnet: string;
    relationship: string;
    salarySlip?: File | null;
    idImage?: File | null;
    idAnnex?: File | null;
    coolnetIdImage?: File | null;
    coolnetIdAnnex?: File | null;
  }
): Promise<YabusAuthorizationResult> {
  const form = new FormData();
  form.append('yaboosUserName', input.yaboosUserName);
  form.append('idNumberSalary', input.idNumberSalary);
  form.append('idNumberCoolnet', input.idNumberCoolnet);
  form.append('relationship', input.relationship);
  if (input.salarySlip) form.append('salarySlip', input.salarySlip);
  if (input.idImage) form.append('idImage', input.idImage);
  if (input.idAnnex) form.append('idAnnex', input.idAnnex);
  if (input.coolnetIdImage) form.append('coolnetIdImage', input.coolnetIdImage);
  if (input.coolnetIdAnnex) form.append('coolnetIdAnnex', input.coolnetIdAnnex);

  // POST, not PUT: the coolnet.ps proxy in front of the API strips the body from
  // PUT requests (multer then sees no multipart and the update is a no-op).
  const res = await customerApi.post<ApiEnvelope<YabusAuthorizationResult>>(
    `/yabus-authorization/${id}`,
    form,
    { headers: { 'Content-Type': undefined }, timeout: UPLOAD_TIMEOUT_MS }
  );
  return unwrap(res.data);
}
