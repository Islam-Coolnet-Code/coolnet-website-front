import axios from 'axios';
import type {
  SendOTPResponse,
  VerifyOTPResponse,
  ReactivateLineResponse,
  UserData
} from '@/types/authTypes';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Axios instance with default configuration
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
authApiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
authApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Auth API request failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Generic API request handler
async function makeAuthRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await authApiClient.request({
      url: endpoint,
      method,
      data,
      params,
    });

    return response.data as T;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number }; request?: unknown };
      if (axiosError.response) {
        throw new Error(
          axiosError.response.data?.message || `HTTP error! status: ${axiosError.response.status}`
        );
      } else if (axiosError.request) {
        throw new Error('Network error: No response from server');
      }
    }
    throw new Error(error instanceof Error ? error.message : 'Request configuration error');
  }
}

/**
 * Send OTP to customer phone number for login
 * POST /api/customer/send-otp
 */
export async function sendLoginOTP(
  phoneNumber: string,
  language: string
): Promise<SendOTPResponse> {
  const data = {
    phone_number: phoneNumber,
    language: language
  };

  return makeAuthRequest<SendOTPResponse>('/api/customer/send-otp', 'POST', data);
}

/**
 * Verify OTP and get user data
 * GET /api/customer/verify-otp
 */
export async function verifyLoginOTP(
  phoneNumber: string,
  otp: string
): Promise<VerifyOTPResponse> {
  return makeAuthRequest<VerifyOTPResponse>(
    '/api/customer/verify-otp',
    'GET',
    undefined,
    { phone_number: phoneNumber, otp: otp }
  );
}

/**
 * Get user details by phone number
 * GET /api/customer/details
 */
export async function getUserDetails(
  phoneNumber: string
): Promise<{ success: boolean; data: { user: UserData } }> {
  return makeAuthRequest<{ success: boolean; data: { user: UserData } }>(
    '/api/customer/details',
    'GET',
    undefined,
    { phone_number: phoneNumber }
  );
}

/**
 * Reactivate suspended or expired line
 * POST /api/customer/reactivate
 */
export async function reactivateLine(
  phoneNumber: string
): Promise<ReactivateLineResponse> {
  const data = {
    phone_number: phoneNumber
  };

  return makeAuthRequest<ReactivateLineResponse>('/api/customer/reactivate', 'POST', data);
}
