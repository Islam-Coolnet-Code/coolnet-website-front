import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Axios instance with default configuration for activation services
const activationApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens, logging, etc.
activationApiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
activationApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Activation API request failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for activation API
export interface CustomerData {
  applicationId: string;
  first_name: string;
  last_name: string;
  identity_number: string;
  phone_number: string;
  email?: string;
  city?: string;
  street_name?: string;
  zone?: string;
  house_number?: string;
  address_notes?: string;
  street_number?: string;
  service_speed?: string;
  withTV?: boolean;
  with_fixed_ip?: boolean;
  with_ap_service?: boolean;
  reference?: string;
  OTP?: string;
  verified: number;
  status?: string;
  created_at?: string;
  router_type?: string;
  entrance_number?: string;
  transferred?: boolean;
  step?: number;
  router_id?: string;
  is_pay?: boolean;
  pay_price?: string;
  rent_price?: string;
  router_is_rent?: boolean;
  approved?: boolean;
  coming_from?: string;
  from_id?: string;
  // Legacy fields that might still be used
  address?: string;
  plan_name?: string;
  plan_speed?: string;
  monthly_price?: number;
  installation_fee?: number;
  activation_date?: string;
}

export interface GenerateActivationOTPRequest {
  reference_number: string;
}

export interface GenerateActivationOTPResponse {
  success: boolean;
  message: string;
  data: {
    reference_number: string;
    phone_number: string;
    otp?: string; // Only for testing - should be removed in production
    customer?: CustomerData; // Customer data from database
  };
}

export interface VerifyActivationOTPResponse {
  success: boolean;
  message: string;
  data: {
    customer: CustomerData;
  };
}

export interface ActivationErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Generic API request handler for activation services
async function makeActivationRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await activationApiClient.request({
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
        // Server responded with error status
        throw new Error(
          axiosError.response.data?.message || `HTTP error! status: ${axiosError.response.status}`
        );
      } else if (axiosError.request) {
        // Request was made but no response received
        throw new Error('Network error: No response from server');
      }
    }
    // Something else happened
    throw new Error(error instanceof Error ? error.message : 'Request configuration error');
  }
}

/**
 * Generate Activation OTP
 * POST /api/generate-activation-otp
 */
export async function generateActivationOTP(
  referenceNumber: string,
  language: string
): Promise<GenerateActivationOTPResponse> {
  const data = {
    reference_number: referenceNumber,
    language:language
  };
  
  return makeActivationRequest<GenerateActivationOTPResponse>('/api/generate-activation-otp', 'POST', data);
}

/**
 * Verify Activation OTP
 * GET /api/verify-activation-otp?reference_number=REF-00123&otp=654321
 */
export async function verifyActivationOTP(
  referenceNumber: string,
  otp: string
): Promise<VerifyActivationOTPResponse> {
  return makeActivationRequest<VerifyActivationOTPResponse>(
    '/api/verify-activation-otp',
    'GET',
    undefined,
    { reference_number: referenceNumber, otp: otp }
  );
}

// Helper function to check if response is an error
export function isActivationErrorResponse(response: unknown): response is ActivationErrorResponse {
  return typeof response === 'object' && response !== null && 'success' in response && (response as { success: boolean }).success === false;
}
