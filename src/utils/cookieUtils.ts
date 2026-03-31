/**
 * Utility functions for managing cookies
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value, and options
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  try {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }

    if (options.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += `; secure`;
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  } catch (error) {
    console.warn('Failed to set cookie:', error);
  }
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  try {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to get cookie:', error);
    return null;
  }
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, path: string = '/'): void => {
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  } catch (error) {
    console.warn('Failed to delete cookie:', error);
  }
};

/**
 * Check if cookies are available
 */
export const cookiesAvailable = (): boolean => {
  try {
    // Try to set a test cookie
    const testName = '__cookie_test__';
    setCookie(testName, 'test', { maxAge: 1 });
    const available = getCookie(testName) === 'test';
    deleteCookie(testName);
    return available;
  } catch {
    return false;
  }
};

// Specific functions for ref and from parameters
const REF_COOKIE_NAME = 'jet_ref';
const FROM_COOKIE_NAME = 'jet_from';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

/**
 * Store ref and from parameters in cookies
 */
export const storeReferralParams = (ref: string | null, from: string | null): void => {
  const cookieOptions: CookieOptions = {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax'
  };

  if (ref) {
    setCookie(REF_COOKIE_NAME, ref, cookieOptions);
  }

  if (from) {
    setCookie(FROM_COOKIE_NAME, from, cookieOptions);
  }
};

/**
 * Get stored referral parameters from cookies
 */
export const getStoredReferralParams = (): { ref: string | null; from: string | null } => {
  return {
    ref: getCookie(REF_COOKIE_NAME),
    from: getCookie(FROM_COOKIE_NAME)
  };
};

/**
 * Clear stored referral parameters
 */
export const clearReferralParams = (): void => {
  deleteCookie(REF_COOKIE_NAME);
  deleteCookie(FROM_COOKIE_NAME);
};

/**
 * Check if referral parameters exist in cookies
 */
export const hasStoredReferralParams = (): boolean => {
  const storedParams = getStoredReferralParams();
  return !!(storedParams.ref || storedParams.from);
};

/**
 * Get ref and from parameters with cookie persistence priority
 * This function prioritizes stored cookies over URL parameters to maintain original referral source
 * Only stores new URL parameters if no valid cookies exist
 */
export const getReferralParams = (): { ref: string | null; from: string | null } => {
  // Get stored parameters from cookies first
  const storedParams = getStoredReferralParams();

  // If we have valid stored cookies, always use them (never overwrite)
  if (storedParams.ref || storedParams.from) {
    return {
      ref: storedParams.ref,
      from: storedParams.from
    };
  }

  // If no cookies exist, get URL parameters and store them as new cookies
  const querystring = window.location.search;
  const params = new URLSearchParams(querystring);
  const urlRef = params.get('ref');
  const urlFrom = params.get('from');

  // Store new parameters only if no cookies existed
  if (urlRef || urlFrom) {
    storeReferralParams(urlRef, urlFrom);
  }

  return {
    ref: urlRef,
    from: urlFrom
  };
};

// OTP Session Management
const OTP_SESSION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export interface OTPSessionData {
  referenceNumber: string;
  verified: boolean;
  timestamp: number;
  serviceData: unknown;
}

/**
 * Store OTP session data with reference number
 */
export const storeOTPSession = (referenceNumber: string, serviceData: unknown): void => {
  try {
    const sessionData: OTPSessionData = {
      referenceNumber,
      verified: true,
      timestamp: Date.now(),
      serviceData
    };

    // Store in sessionStorage and cookie
    sessionStorage.setItem(`otp_session_${referenceNumber}`, JSON.stringify(sessionData));
    setCookie(`otp_verified_${referenceNumber}`, 'true', {
      maxAge: OTP_SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
      sameSite: 'lax'
    });
  } catch (error) {
    console.warn('Failed to store OTP session:', error);
  }
};

/**
 * Check if OTP session is valid for the given reference number
 */
export const isOTPSessionValid = (referenceNumber: string): boolean => {
  try {
    const sessionData = sessionStorage.getItem(`otp_session_${referenceNumber}`);
    const cookieExists = getCookie(`otp_verified_${referenceNumber}`) === 'true';

    if (sessionData && cookieExists) {
      const session = JSON.parse(sessionData) as OTPSessionData;
      const elapsed = Date.now() - session.timestamp;
      return elapsed < OTP_SESSION_DURATION;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/**
 * Get OTP session data for the given reference number
 */
export const getOTPSessionData = (referenceNumber: string): unknown | null => {
  try {
    if (!isOTPSessionValid(referenceNumber)) {
      return null;
    }

    const sessionData = sessionStorage.getItem(`otp_session_${referenceNumber}`);
    if (sessionData) {
      const session = JSON.parse(sessionData) as OTPSessionData;
      return session.serviceData || null;
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear OTP session data for the given reference number
 */
export const clearOTPSession = (referenceNumber: string): void => {
  try {
    sessionStorage.removeItem(`otp_session_${referenceNumber}`);
    deleteCookie(`otp_verified_${referenceNumber}`);
  } catch (error) {
    console.warn('Failed to clear OTP session:', error);
  }
};

/**
 * Get remaining time for OTP session in minutes
 */
export const getOTPSessionRemainingTime = (referenceNumber: string): number => {
  try {
    if (!isOTPSessionValid(referenceNumber)) {
      return 0;
    }

    const sessionData = sessionStorage.getItem(`otp_session_${referenceNumber}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const elapsed = Date.now() - session.timestamp;
      const remaining = OTP_SESSION_DURATION - elapsed;
      return Math.max(0, Math.ceil(remaining / 60000)); // Convert to minutes
    }

    return 0;
  } catch (error) {
    return 0;
  }
};

// OTP Resend tracking constants
const OTP_RESEND_COUNT_COOKIE = 'otp_resend_count';
const OTP_RESEND_EXPIRY_COOKIE = 'otp_resend_expiry';
const OTP_RESEND_PHONE_COOKIE = 'otp_resend_phone';
const MAX_RESEND_ATTEMPTS = 3;
const RESEND_TIMEOUT_MINUTES = 5;

export interface OTPResendStatus {
  canResend: boolean;
  remainingAttempts: number;
  timeoutExpiry?: Date;
}

/**
 * Get the current OTP resend status for a phone number
 */
export const getOTPResendStatus = (phoneNumber: string): OTPResendStatus => {
  try {
    const storedPhone = getCookie(OTP_RESEND_PHONE_COOKIE);
    const countStr = getCookie(OTP_RESEND_COUNT_COOKIE);
    const expiryStr = getCookie(OTP_RESEND_EXPIRY_COOKIE);

    // If phone number is different, reset everything
    if (storedPhone !== phoneNumber) {
      clearOTPResendData();
      return {
        canResend: true,
        remainingAttempts: MAX_RESEND_ATTEMPTS
      };
    }

    const count = countStr ? parseInt(countStr, 10) : 0;
    const expiry = expiryStr ? new Date(expiryStr) : null;

    // If expiry has passed, reset counter
    if (expiry && new Date() > expiry) {
      clearOTPResendData();
      return {
        canResend: true,
        remainingAttempts: MAX_RESEND_ATTEMPTS
      };
    }

    const remainingAttempts = MAX_RESEND_ATTEMPTS - count;

    return {
      canResend: remainingAttempts > 0,
      remainingAttempts: Math.max(0, remainingAttempts),
      timeoutExpiry: expiry || undefined
    };
  } catch (error) {
    console.warn('Failed to get OTP resend status:', error);
    return {
      canResend: true,
      remainingAttempts: MAX_RESEND_ATTEMPTS
    };
  }
};

/**
 * Record an OTP resend attempt
 */
export const recordOTPResendAttempt = (phoneNumber: string): void => {
  try {
    const currentStatus = getOTPResendStatus(phoneNumber);

    if (!currentStatus.canResend) {
      return; // Don't record if already at limit
    }

    const newCount = MAX_RESEND_ATTEMPTS - currentStatus.remainingAttempts + 1;
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + RESEND_TIMEOUT_MINUTES);

    const cookieOptions: CookieOptions = {
      expires: expiry,
      path: '/',
      sameSite: 'lax'
    };

    setCookie(OTP_RESEND_PHONE_COOKIE, phoneNumber, cookieOptions);
    setCookie(OTP_RESEND_COUNT_COOKIE, newCount.toString(), cookieOptions);
    setCookie(OTP_RESEND_EXPIRY_COOKIE, expiry.toISOString(), cookieOptions);
  } catch (error) {
    console.warn('Failed to record OTP resend attempt:', error);
  }
};

/**
 * Clear OTP resend tracking data
 */
export const clearOTPResendData = (): void => {
  try {
    deleteCookie(OTP_RESEND_PHONE_COOKIE);
    deleteCookie(OTP_RESEND_COUNT_COOKIE);
    deleteCookie(OTP_RESEND_EXPIRY_COOKIE);
  } catch (error) {
    console.warn('Failed to clear OTP resend data:', error);
  }
};

/**
 * Get formatted time remaining until resend timeout expires
 */
export const getOTPTimeoutRemaining = (timeoutExpiry?: Date): string => {
  if (!timeoutExpiry) return '';

  const now = new Date();
  const timeDiff = timeoutExpiry.getTime() - now.getTime();

  if (timeDiff <= 0) return '';

  const minutes = Math.floor(timeDiff / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};
