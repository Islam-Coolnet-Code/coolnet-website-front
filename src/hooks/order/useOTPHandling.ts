import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { submitPersonalInfo, sendOTP, verifyOTP } from '@/services';
import { validatePersonalInfo } from '@/utils/orderValidation';
import { FormData, WizardStep } from '@/types/orderTypes';

interface UseOTPHandlingProps {
  isDevMode: () => boolean;
  formData: FormData;
  setFormData: (value: FormData | ((prev: FormData) => FormData)) => void;
  setIsSubmitting: (value: boolean) => void;
  markStepCompleted: (step: WizardStep) => void;
  markMultipleStepsCompleted: (steps: WizardStep[]) => void;
  setCurrentStepAndScroll: (step: WizardStep) => void;
}

export const useOTPHandling = ({
  isDevMode,
  formData,
  setFormData,
  setIsSubmitting,
  markStepCompleted,
  markMultipleStepsCompleted,
  setCurrentStepAndScroll
}: UseOTPHandlingProps) => {
  const [otpVerified, setOtpVerified] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [otpSentForPhone, setOtpSentForPhone] = useState<string>('');
  const [originalPhoneBeforeEdit, setOriginalPhoneBeforeEdit] = useState<string>('');
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string>('');

  const { t, language } = useLanguage();

  // Track phone number changes
  const handlePhoneChange = (phone: string) => {
    // Track original phone number before user starts editing (only if not already tracked)
    if (!originalPhoneBeforeEdit && formData.mobile) {
      setOriginalPhoneBeforeEdit(formData.mobile.trim());
    }
  };

  // Check if phone number specifically changed from the verified phone number
  const hasPhoneNumberChanged = () => {
    // If no phone number has been verified yet, consider it changed
    if (!verifiedPhoneNumber) return true;

    // Compare current phone with the verified phone number
    return verifiedPhoneNumber.trim() !== formData.mobile.trim();
  };

  // Check if phone number actually changed from the last verified phone
  const hasPhoneChangedFromVerified = () => {
    // If no verified phone tracked, consider it changed
    if (!verifiedPhoneNumber) return true;

    // Compare current phone with the verified phone number
    return verifiedPhoneNumber.trim() !== formData.mobile.trim();
  };

  // Check if phone changed from verified values (main verification check)
  const needsReVerification = () => {
    return hasPhoneNumberChanged();
  };

  // Helper function to split full name into first and last name
  const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }

    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  // Main submission handler - simplified without application choice logic
  const handlePersonalInfoSubmission = async () => {
    // Skip validation in dev mode
    if (!isDevMode() && !validatePersonalInfo(formData, t)) {
      return;
    }

    // Proceed with normal submission
    await submitPersonalInfoAndProceed();
  };

  // Submit personal information and proceed to OTP
  const submitPersonalInfoAndProceed = async () => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // In dev mode, skip API calls and go directly to next step
      if (isDevMode()) {
        toast({
          title: "Development Mode",
          description: "Skipped personal info submission and OTP",
          variant: "default"
        });

        // Set a mock applicationId in dev mode for consistency
        setFormData(prev => ({
          ...prev,
          applicationId: 999999 // Mock application ID for dev mode
        }));

        // Mark as completed and proceed
        setApplicationSubmitted(true);
        setOtpVerified(true); // Auto-verify OTP in dev mode
        setOtpSentForPhone(formData.mobile);
        setOriginalPhoneBeforeEdit(formData.mobile);
        setVerifiedPhoneNumber(formData.mobile.trim());
        markMultipleStepsCompleted([WizardStep.PERSONAL_INFO, WizardStep.OTP]);
        setCurrentStepAndScroll(WizardStep.PLAN_SELECTION);
        return;
      }

      // Phone number formatting function
      const formatPhoneForBackend = (phoneNumber: string): string => {
        // Remove all spaces and dashes
        let formatted = phoneNumber.replace(/\s/g, '').replace(/-/g, '');
        // Convert +970 or +972 to 0
        if (formatted.startsWith('+970')) {
          formatted = '0' + formatted.substring(4);
        } else if (formatted.startsWith('+972')) {
          formatted = '0' + formatted.substring(4);
        }
        return formatted;
      };

      // Split full name into first and last name for backend
      const { firstName, lastName } = splitFullName(formData.fullName);

      const personalInfoData: any = {
        first_name: firstName,
        last_name: lastName,
        identity_number: formData.mobile, // Using mobile as identity for now
        phone_number: formatPhoneForBackend(formData.mobile),
        email: '', // No email field in new form
        city: formData.city,
        state: formData.state,
        address: formData.address,
        notes: formData.notes
      };

      if (formData.applicationId) {
        personalInfoData.applicationId = formData.applicationId;
        // Only set isContinuing to true if user specifically chose to continue
        personalInfoData.isContinuing = true;
      }

      // Submit personal information to API
      const response = await submitPersonalInfo(personalInfoData);

      if (!response.success) {
        setSubmissionError('Failed to submit personal information');
        toast({
          title: t('order.newLine.errors.submissionFailed'),
          description: 'Please try again',
          variant: "destructive"
        });
        return;
      }

      // Extract applicationId from response and update formData
      if (response.data && response.data.application_id) {
        setFormData(prev => ({
          ...prev,
          applicationId: response.data.application_id
        }));
      }

      // Send OTP for verification
      try {
        await sendOTP({
          identity_number: formData.mobile,
          mode: 'dev',
          language: language
        });

        // Mark OTP as sent for this phone number
        setOtpSentForPhone(formData.mobile);

        toast({
          title: t('order.newLine.success.personalInfoSubmitted'),
          variant: "default"
        });
      } catch (otpError) {
        console.error('Error sending OTP:', otpError);
        toast({
          title: t('order.newLine.success.personalInfoSubmitted'),
          description: 'Personal info saved, but OTP sending failed. You can try again.',
          variant: "default"
        });
      }

      // Proceed to appropriate step
      setApplicationSubmitted(true);
      markStepCompleted(WizardStep.PERSONAL_INFO);
      setCurrentStepAndScroll(WizardStep.OTP);

    } catch (error) {
      console.error('Error submitting personal info:', error);
      setSubmissionError('Network error occurred');
      toast({
        title: t('order.newLine.errors.networkError'),
        description: t('order.newLine.errors.tryAgain') || 'Please check your connection and try again',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phone number formatting function
  const formatPhoneForBackend = (phoneNumber: string): string => {
    // Remove all spaces first
    let formatted = phoneNumber.replace(/\s/g, '');

    // Convert +970 or +972 to 0
    if (formatted.startsWith('+970')) {
      formatted = '0' + formatted.substring(4);
    } else if (formatted.startsWith('+972')) {
      formatted = '0' + formatted.substring(4);
    }

    return formatted;
  };

  // Handle OTP verification
  const handleOTPVerification = async (otp: string) => {
    setIsSubmitting(true);

    try {
      const response = await verifyOTP({
        identity_number: formData.mobile,
        otp: otp
      });

      if (response.success && 'data' in response) {
        setOtpVerified(true);
        // Save the phone number that was verified
        setVerifiedPhoneNumber(formData.mobile.trim());
        setOtpSentForPhone(formData.mobile.trim());
        markStepCompleted(WizardStep.OTP);
        setCurrentStepAndScroll(WizardStep.PLAN_SELECTION);

        toast({
          title: t('otp.success') || 'OTP verified successfully',
          description: t('otp.successDescription') || 'You can now proceed to the next step',
          variant: "default"
        });
      } else {
        // Throw user-friendly error message for wrong OTP
        throw new Error(t('otp.enterAgain') || 'Please enter the OTP again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      // Always throw user-friendly message regardless of the actual error
      throw new Error(t('otp.enterAgain') || 'Please enter the OTP again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    otpVerified,
    applicationSubmitted,
    submissionError,
    otpSentForPhone,
    originalPhoneBeforeEdit,
    verifiedPhoneNumber,
    hasPhoneNumberChanged,
    hasPhoneChangedFromVerified,
    needsReVerification,
    handlePhoneChange,
    handlePersonalInfoSubmission,
    submitPersonalInfoAndProceed,
    handleOTPVerification
  };
};
