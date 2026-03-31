// API Request Types
export interface SubmitPersonalInfoRequest {
  first_name: string;
  last_name: string;
  identity_number: string;
  phone_number: string;
  email: string;
  applicationId?: number;
  isContinuing?: boolean;
}

export interface SubmitAllRequest {
  identity_number: string;
  city?: string;
  street_name: string;
  zone: string;
  house_number: string;
  address_notes?: string;
  service_speed: string;
  with_fixed_ip: boolean;
  with_ap_service: boolean;
  router_type: string;
  step: number;
  router_id: string;
  coming_from?: string;
  from_id?: string;
  language?: string
}

export interface VerifyOTPRequest {
  identity_number: string;
  otp: string;
}

// API Response Types
export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface SubmitPersonalInfoResponse extends BaseResponse {
  data: {
    application_id: number;
    first_name: string;
    last_name: string;
    identity_number: string;
    phone_number: string;
    verified: number;
    created_at: string;
  };
}

export interface VerifyOTPResponse extends BaseResponse {
  data: {
    identity_number: string;
    verified: boolean;
    step: number;
  };
}

export interface CheckDuplicateResponse extends BaseResponse {
  is_duplicate: boolean;
  is_client: boolean;
  is_not_continued: boolean;
  data: {
    identity_number?: string;
    available?: boolean;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    username?: string;
    full_name?: string;
  } | {
    first_name: string;
    last_name: string;
    identity_number: string;
    phone_number?: string;
    email?: string;
    application_id?: number
  }[];
}

export interface GenerateActivationOTPResponse extends BaseResponse {
  data: {
    reference_number: string;
    phone_number: string; // last 4 digits only
  };
}

export interface VerifyActivationOTPResponse extends BaseResponse {
  data: {
    reference_number: string;
    customer_id: number;
    customer_name: string;
    access_granted: boolean;
  };
}

export interface SubmitAllResponse extends BaseResponse {
  data: {
    application_id: number;
    reference_number: string;
    first_name: string;
    last_name: string;
    identity_number: string;
    phone_number: string;
    email: string;
    city?: string;
    street_name: string;
    zone: string;
    service_speed: string;
    verified: boolean;
  };
}

// Error Response Type
export interface ErrorResponse extends BaseResponse {
  success: false;
}

// Duplicate user choice types
export enum isContinuing {
  CONTINUE_REQUEST = 'continue_request',
  NEW_REQUEST = 'new_request',
  ACTIVATE_SERVICE = 'activate_service',
  DIFFERENT_PERSON = 'different_person'
}
