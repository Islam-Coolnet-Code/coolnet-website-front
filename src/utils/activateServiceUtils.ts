import { FormData, FormErrors } from '@/types/activateServiceTypes';

export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

export const generateDayOptions = () => {
  const options: { value: string; label: string }[] = [
    { value: '5', label: '5' },
    { value: '15', label: '15' },
    { value: '25', label: '25' }
  ];
  return options;
};

export const validateForm = (formData: FormData, t: (key: string) => string, hasScrolledToBottom: boolean = true): FormErrors => {
  const newErrors: FormErrors = {};

  // Email is now required
  if (!formData.email.trim()) {
    newErrors.email = t('activateService.errors.emailRequired');
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = t('activateService.errors.emailInvalid');
  }

  if (!formData.cardNumber) {
    newErrors.cardNumber = t('activateService.errors.cardNumberRequired');
  } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
    newErrors.cardNumber = t('activateService.errors.cardNumberInvalid');
  }

  if (!formData.cvv) {
    newErrors.cvv = t('activateService.errors.cvvRequired');
  } else if (!/^\d{3}$/.test(formData.cvv)) {
    newErrors.cvv = t('activateService.errors.cvvInvalid');
  }

  if (!formData.expiryMonth || !formData.expiryYear) {
    newErrors.expiry = t('activateService.errors.expiryRequired');
  }

  if (!formData.cardholderName.trim()) {
    newErrors.cardholderName = t('activateService.errors.cardholderNameRequired');
  }

  if (!formData.idNumber.trim()) {
    newErrors.idNumber = t('activateService.errors.idNumberRequired');
  }

  if (!formData.subscriptionDay) {
    newErrors.subscriptionDay = t('activateService.errors.subscriptionDayRequired');
  }

  if (!formData.acceptTerms) {
    if (!hasScrolledToBottom) {
      newErrors.acceptTerms = t('activateService.errors.mustScrollToAcceptTerms');
    } else {
      newErrors.acceptTerms = t('activateService.errors.termsRequired');
    }
  }

  return newErrors;
};

export const getInitialFormData = (email: string = ''): FormData => ({
  email,
  cardNumber: '',
  cvv: '',
  expiryMonth: '1',
  expiryYear: new Date().getFullYear().toString(),
  cardholderName: '',
  idNumber: '',
  subscriptionDay: '5',
  acceptTerms: false,
});
