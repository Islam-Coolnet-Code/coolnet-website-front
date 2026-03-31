// Export all API functions
export {
  submitPersonalInfo,
  submitAll,
  sendOTP,
  verifyOTP,
  checkDuplicate
} from './api';

// Export all types
export type {
  SubmitPersonalInfoRequest,
  SubmitPersonalInfoResponse,
  SubmitAllRequest,
  SubmitAllResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  CheckDuplicateResponse,
  ErrorResponse,
  BaseResponse
} from './types';
