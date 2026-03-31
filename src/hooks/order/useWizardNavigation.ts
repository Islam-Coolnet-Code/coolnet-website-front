import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { WizardStep, FormData } from '@/types/orderTypes';
import { validatePlanSelection, validateAddressInfo } from '@/utils/orderValidation';

interface UseWizardNavigationProps {
  isDevMode: () => boolean;
}

export const useWizardNavigation = ({
  isDevMode
}: UseWizardNavigationProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.PERSONAL_INFO);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goToNextStep = async (
    selectedPlanId: string,
    formData: FormData,
    handlePersonalInfoSubmission: () => Promise<void>
  ) => {
    let isValid = false;

    // In dev mode, skip all validation and allow proceeding
    if (isDevMode()) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => {
        const next = prev + 1;
        scrollToTop();
        return next;
      });
      return;
    }

    switch (currentStep) {
      case WizardStep.PERSONAL_INFO:
        // Always handle personal info submission with API call
        await handlePersonalInfoSubmission();
        return; // Exit early as the function handles navigation
      case WizardStep.OTP:
        // OTP validation will be handled by parent component
        isValid = true; // Allow navigation, parent will handle validation
        break;
      case WizardStep.PLAN_SELECTION:
        isValid = validatePlanSelection(selectedPlanId, t);
        break;
      case WizardStep.ADDRESS:
        isValid = validateAddressInfo(formData, t);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => {
        const next = prev + 1;
        scrollToTop();
        return next;
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > WizardStep.PERSONAL_INFO) {
      // NEVER allow going back from OTP step - user must complete OTP verification
      if (currentStep === WizardStep.OTP) {
        return; // Block navigation away from OTP step
      }
      
      // Smart previous navigation - always skip OTP step when going back from step 3+
      let targetStep = currentStep - 1;
      
      // If we're going back from a step after OTP, always skip OTP step and go to PERSONAL_INFO
      if (currentStep > WizardStep.OTP && targetStep === WizardStep.OTP) {
        targetStep = WizardStep.PERSONAL_INFO; // Always skip OTP step when going back
      }
      
      setCurrentStep(targetStep);
      scrollToTop();
    }
  };

  const goToStep = (step: WizardStep) => {
    // In dev mode, allow access to any step
    if (isDevMode()) {
      setCurrentStep(step);
      scrollToTop();
      return;
    }

    // NEVER allow manual navigation to OTP step
    if (step === WizardStep.OTP) {
      return; // Block all manual navigation to OTP step
    }
    
    // Allow access to any completed step (except OTP)
    if (completedSteps.has(step)) {
      setCurrentStep(step);
      scrollToTop();
      return;
    }
    
    // Allow access to next step if current or previous is completed
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step);
      scrollToTop();
    }
  };

  const setCurrentStepAndScroll = (step: WizardStep) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const markStepCompleted = (step: WizardStep) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  };

  const markMultipleStepsCompleted = (steps: WizardStep[]) => {
    setCompletedSteps((prev) => new Set([...prev, ...steps]));
  };

  const resetWizard = () => {
    setCurrentStep(WizardStep.PERSONAL_INFO);
    setCompletedSteps(new Set());
  };

  return {
    currentStep,
    completedSteps,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setCurrentStepAndScroll,
    markStepCompleted,
    markMultipleStepsCompleted,
    resetWizard,
    scrollToTop
  };
};
