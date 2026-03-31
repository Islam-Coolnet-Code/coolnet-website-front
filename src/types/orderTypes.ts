export enum WizardStep {
  PERSONAL_INFO = 1,
  OTP = 2,
  PLAN_SELECTION = 3,
  ADDRESS = 4,
  ROUTER_SELECTION = 5,
  REVIEW = 6
}

export const TOTAL_STEPS = 6;

export interface FormData {
  fullName: string;
  mobile: string;
  city: string;
  state: string;
  address: string;
  notes: string;
  fixedIp?: boolean;
  apFilter?: boolean;
  applicationId?: number;
  isContinuing?: string;
}
