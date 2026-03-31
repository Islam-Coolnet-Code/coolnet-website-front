export interface ServiceData {
  applicationId: string;
  first_name: string;
  last_name: string;
  identity_number: string;
  phone_number: string;
  email: string;
  city: string;
  street_name: string;
  zone: string;
  house_number: string;
  address_notes: string;
  street_number: string;
  service_speed: string;
  withTV: boolean;
  with_fixed_ip: boolean;
  with_ap_service: boolean;
  reference: string;
  OTP: string;
  verified: number;
  status: string;
  created_at: string;
  router_type: string;
  entrance_number: string;
  transferred: boolean;
  step: number;
  router_id: string;
  is_pay: boolean;
  pay_price: string;
  rent_price: string;
  router_is_rent: boolean;
  approved: boolean;
  coming_from: string;
  from_id: string;
}

export interface FormData {
  email: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  idNumber: string;
  subscriptionDay: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}
