import React from 'react';
import { WizardStep, FormData } from '@/types/orderTypes';
import { Plan } from '@/utils/Plans/Plans';
import { CheckDuplicateResponse, isContinuing } from '@/services/wizard/types';
import { ValidationErrors } from '@/types/validationTypes';
import { sendOTP } from '@/services';
import { useLanguage } from '@/context/LanguageContext';

// Import step components
import PersonalInfoStep from '@/components/order/PersonalInfoStep';
import { Otp } from '@/components/activate-service/Otp';
import PlanSelectionStep from '@/components/order/PlanSelectionStep';
import AddressStep from '@/components/order/AddressStep';
import RouterSelectionStep from '@/components/order/RouterSelectionStep';
import ReviewStep from '@/components/order/ReviewStep';

interface OrderStepRendererProps {
  currentStep: WizardStep;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleOTPVerification: (otp: string) => Promise<void>;
  planType: 'personal' | 'business';
  setPlanType: (type: 'personal' | 'business') => void;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  personalPlans: Plan[];
  retailPlans: Plan[];
  handleFixedIpChange: (value: boolean) => void;
  handleApFilterChange: (value: boolean) => void;
  initialPreselectedPlanId?: string;
  handleAddressFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  selectedRouterId: string;
  setSelectedRouterId: (id: string) => void;
  selectedPlan: Plan | undefined;
  duplicateData?: CheckDuplicateResponse | null;
  onDuplicateChoice?: (choice: isContinuing) => void;
  showDuplicateSection?: boolean;
  validationErrors?: ValidationErrors;
  triggerValidation?: boolean;
  enableDuplicateCheck?: boolean;
  onTermsAcceptedChange?: (accepted: boolean) => void;
}

export const OrderStepRenderer: React.FC<OrderStepRendererProps> = ({
  currentStep,
  formData,
  handleInputChange,
  handleOTPVerification,
  planType,
  setPlanType,
  selectedPlanId,
  setSelectedPlanId,
  personalPlans,
  retailPlans,
  handleFixedIpChange,
  handleApFilterChange,
  initialPreselectedPlanId,
  handleAddressFormChange,
  selectedRouterId,
  setSelectedRouterId,
  selectedPlan,
  duplicateData,
  onDuplicateChoice,
  showDuplicateSection,
  validationErrors,
  triggerValidation,
  enableDuplicateCheck,
  onTermsAcceptedChange
}) => {
  const { language } = useLanguage();

  // Handle OTP resend functionality
  const handleOTPResend = async (): Promise<void> => {
    try {
      // Call the sendOTP API with the user's identity number
      const response = await sendOTP({
        identity_number: String(formData.id),
        mode: 'dev', // You can change this to 'prod' for production
        language: language
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend OTP');
      }

      // Successfully sent, the OTP component will handle the UI feedback
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error; // Let the OTP component handle the error display
    }
  };
  switch (currentStep) {
    case WizardStep.PERSONAL_INFO:
      return (
        <PersonalInfoStep
          formData={formData}
          onFormDataChange={handleInputChange}
          duplicateData={enableDuplicateCheck ? duplicateData : undefined}
          onDuplicateChoice={enableDuplicateCheck ? onDuplicateChoice : undefined}
          showDuplicateSection={enableDuplicateCheck ? showDuplicateSection : false}
          validationErrors={validationErrors}
          triggerValidation={triggerValidation}
        />
      );

    case WizardStep.OTP:
      return (
        <Otp
          onVerify={handleOTPVerification}
          phone={formData.phone}
          onResend={handleOTPResend}
        />
      );

    case WizardStep.PLAN_SELECTION:
      return (
        <PlanSelectionStep
          planType={planType}
          setPlanType={setPlanType}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
          personalPlans={personalPlans}
          retailPlans={retailPlans}
          fixedIp={formData.fixedIp}
          setFixedIp={handleFixedIpChange}
          apFilter={formData.apFilter}
          setApFilter={handleApFilterChange}
          initialPreselectedPlanId={initialPreselectedPlanId}
          validationErrors={validationErrors}
          triggerValidation={triggerValidation}
        />
      );

    case WizardStep.ADDRESS:
      return (
        <AddressStep
          addressForm={formData.address}
          onAddressFormChange={handleAddressFormChange}
          validationErrors={validationErrors}
          triggerValidation={triggerValidation}
        />
      );

    case WizardStep.ROUTER_SELECTION:
      return (
        <RouterSelectionStep
          selectedRouterId={selectedRouterId}
          setSelectedRouterId={setSelectedRouterId}
        />
      );

    case WizardStep.REVIEW:
      return (
        <ReviewStep
          formData={formData}
          planType={planType}
          selectedPlan={selectedPlan}
          selectedRouterId={selectedRouterId}
          onTermsAcceptedChange={onTermsAcceptedChange || (() => {})}
        />
      );

    default:
      return null;
  }
};
