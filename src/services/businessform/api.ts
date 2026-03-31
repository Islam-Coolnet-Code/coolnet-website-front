import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Axios instance with default configuration for business form services
const businessFormApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens, logging, etc.
businessFormApiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
businessFormApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Business form API request failed:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types for business form API
export interface BusinessFormData {
  full_name: string;
  business_name?: string;
  phone_number: string;
  lead_email?: string;
  plan_name?: string;
}

export interface SendBusinessFormRequest {
  full_name: string;
  business_name?: string;
  phone_number: string;
  lead_email?: string;
  plan_name?: string;
}

export interface SendBusinessFormResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    full_name: string;
    business_name?: string;
    phone_number: string;
    lead_email?: string;
    plan_name?: string;
    submitted_at?: string;
  };
}

export interface BusinessFormErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// Generic API request handler for business form services
async function makeBusinessFormRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: Record<string, unknown>,
  params?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await businessFormApiClient.request({
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
 * Send Business Form
 * POST /api/welcome
 */
export async function sendBusinessForm(
  formData: SendBusinessFormRequest
): Promise<SendBusinessFormResponse> {
  const data = {
    full_name: formData.full_name,
    business_name: formData.business_name,
    phone_number: formData.phone_number,
    lead_email: formData.lead_email,
    plan_name: formData.plan_name
  };
  
  return makeBusinessFormRequest<SendBusinessFormResponse>('/api/welcome', 'POST', data);
}

// Helper function to check if response is an error
export function isBusinessFormErrorResponse(response: unknown): response is BusinessFormErrorResponse {
  return typeof response === 'object' && response !== null && 'success' in response && (response as { success: boolean }).success === false;
}