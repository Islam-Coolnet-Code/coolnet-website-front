import axios from 'axios';
import {
  SubmitPersonalInfoRequest,
  SubmitPersonalInfoResponse,
  SubmitAllRequest,
  SubmitAllResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  CheckDuplicateResponse,
  ErrorResponse
} from './types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API request failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Generic API request handler
async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  params?: any
): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      method,
      data,
      params,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      throw new Error(
        error.response.data?.message || `HTTP error! status: ${error.response.status}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: No response from server');
    } else {
      // Something else happened
      throw new Error(error.message || 'Request configuration error');
    }
  }
}

/**
 * Submit Personal Information
 * POST /api/new_customer
 */
export async function submitPersonalInfo(
  data: SubmitPersonalInfoRequest
): Promise<SubmitPersonalInfoResponse> {
  return makeRequest<SubmitPersonalInfoResponse>('/api/new_customer', 'POST', data);
}

/**
 * Submit Complete Application
 * POST /api/submit_all
 */
export async function submitAll(
  data: SubmitAllRequest
): Promise<SubmitAllResponse> {
  return makeRequest<SubmitAllResponse>('/api/submit-all', 'POST', data);
}

/**
 * Send OTP
 * POST /api/send-otp
 */
export async function sendOTP(data: {
  identity_number: string;
  mode?: string;
  language?: 'ar' | 'he' | 'en';
}): Promise<{ success: boolean; message: string; language?: string }> {
  return makeRequest<{ success: boolean; message: string; language?: string }>('/api/send-otp', 'POST', data);
}

/**
 * Verify OTP
 * POST /api/verify-otp
 */
export async function verifyOTP(
  data: VerifyOTPRequest
): Promise<VerifyOTPResponse | ErrorResponse> {
  return makeRequest<VerifyOTPResponse | ErrorResponse>('/api/verify-otp', 'POST', data);
}

/**
 * Check for Duplicate Identity Number
 * GET /api/check-duplicate?identity_number=123456789
 */
export async function checkDuplicate(
  identityNumber: string,
  phone_number: number
): Promise<CheckDuplicateResponse> {
  return makeRequest<CheckDuplicateResponse>(
    '/api/check-duplicate',
    'GET',
    undefined,
    { identity_number: identityNumber, phone_number: phone_number }
  );
}

// Helper function to check if response is an error
export function isErrorResponse(response: any): response is ErrorResponse {
  return response.success === false;
}
