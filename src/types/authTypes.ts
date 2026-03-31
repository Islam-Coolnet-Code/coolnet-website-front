/**
 * Authentication and User types for Customer Corner
 */

export type LineStatus = 'active' | 'suspended' | 'expired';

export interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  streetName?: string;
  houseNumber?: string;
  zone?: string;
  lineStatus: LineStatus;
  serviceSpeed?: string;
  referenceNumber?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  phoneNumber: string | null;
}

export interface SendOTPRequest {
  phone_number: string;
  language: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data?: {
    phone_number: string;
    otp?: string; // For testing only
  };
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserData;
  };
}

export interface ReactivateLineRequest {
  phone_number: string;
}

export interface ReactivateLineResponse {
  success: boolean;
  message: string;
  data?: {
    newStatus: LineStatus;
  };
}
