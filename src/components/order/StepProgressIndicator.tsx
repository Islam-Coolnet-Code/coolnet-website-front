import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { WizardStep, TOTAL_STEPS } from '@/types/orderTypes';

interface StepProgressIndicatorProps {
    currentStep: WizardStep;
    completedSteps: Set<WizardStep>;
    onStepClick: (step: WizardStep) => void;
    otpVerified?: boolean;
    otpSentForPhone?: string;
    currentPhone?: string;
    originalPhone?: string;
    devMode?: boolean;
    needsReVerification?: () => boolean;
}

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
    currentStep,
    completedSteps,
    onStepClick,
    otpVerified = false,
    otpSentForPhone = '',
    currentPhone = '',
    originalPhone = '',
    devMode = false,
    needsReVerification
}) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const getStepTitle = (step: WizardStep): string => {
        switch (step) {
            case WizardStep.PERSONAL_INFO:
                return t('order.newLine.personalInfo');
            case WizardStep.ADDRESS:
                return t('order.newLine.addressInfo');
            case WizardStep.OTP:
                return t('otp.title');
            case WizardStep.ROUTER_SELECTION:
                return t('order.newLine.router.selectRouter');
            case WizardStep.PLAN_SELECTION:
                return t('order.newLine.planSelection');
            case WizardStep.REVIEW:
                return t('order.newLine.review');
            default:
                return '';
        }
    };

    // Create array of steps - no need to reverse
    const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);

    return (
        <div className="mb-8">
            <div
                className="flex items-center justify-between mb-4"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {steps.map((step, index) => {
                    const isActive = step === currentStep;
                    const isCompleted = completedSteps.has(step);
                    
                    // Smart accessibility logic
                    let isAccessible = false;
                    let requiresVerification = false;
                    
                    // In dev mode, make all steps accessible
                    if (devMode) {
                        isAccessible = true;
                    } else {
                        // If currently on OTP step, block navigation to any other step
                        if (currentStep === WizardStep.OTP && step !== WizardStep.OTP) {
                            isAccessible = false;
                            requiresVerification = true;
                        }
                        // NEVER allow manual navigation to OTP step
                        else if (step === WizardStep.OTP) {
                            isAccessible = false;
                        }
                        // Allow access to completed steps (except OTP)
                        else if (completedSteps.has(step)) {
                            isAccessible = true;
                            
                            // Special handling for steps after OTP
                            if (step > WizardStep.OTP && needsReVerification) {
                                const needsReVerificationCheck = needsReVerification();
                                if (needsReVerificationCheck) {
                                    isAccessible = false;
                                    requiresVerification = true;
                                }
                            }
                        }
                        // Allow access to current step or next step if previous is completed
                        else if (step <= currentStep || completedSteps.has(step - 1)) {
                            isAccessible = true;
                            
                            // Special handling for steps after OTP
                            if (step > WizardStep.OTP && needsReVerification) {
                                const needsReVerificationCheck = needsReVerification();
                                if (needsReVerificationCheck) {
                                    isAccessible = false;
                                    requiresVerification = true;
                                }
                            }
                        }
                    }


                    // Check if this is the last step
                    const isLastStep = step === TOTAL_STEPS;

                    // For line color, check if the current step is completed
                    const isLineCompleted = completedSteps.has(step);

                    return (
                        <div key={`step-${step}`}>
                            <div className="flex items-center">
                                <Button
                                    onClick={() => isAccessible && onStepClick(step)}
                                    disabled={!isAccessible}
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                                        isActive && "border-coolnet-purple bg-coolnet-purple text-white shadow-lg shadow-coolnet-purple/50",
                                        isCompleted && !isActive && "border-coolnet-orange bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/50",
                                        !isActive && !isCompleted && isAccessible && "border-white/40 bg-white/20 backdrop-blur-sm text-white hover:border-coolnet-purple hover:bg-coolnet-purple/20",
                                        requiresVerification && "border-red-500/60 bg-red-500/20 backdrop-blur-sm text-red-300 cursor-not-allowed",
                                        !isAccessible && !requiresVerification && "border-white/20 bg-white/10 backdrop-blur-sm text-white/50 cursor-not-allowed"
                                    )}
                                >
                                    {isCompleted && !isActive ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : (
                                        step
                                    )}
                                </Button>
                            </div>

                            {/* Connecting line */}
                            {!isLastStep && (
                                <div className={cn(
                                    "flex-1 h-0.5 mx-2",
                                    isLineCompleted ? "bg-coolnet-orange" : "bg-white/20"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar */}
            <div
                className="relative w-full h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <div
                    className={cn(
                        "h-full bg-gradient-to-r from-coolnet-purple to-coolnet-orange transition-all duration-300 ease-in-out rounded-full shadow-lg",
                        isRTL ? "float-right" : "float-left"
                    )}
                    style={{
                        width: `${(currentStep / TOTAL_STEPS) * 100}%`
                    }}
                />
            </div>

            <div className="text-center mt-2 text-sm text-white/90 font-medium">
                {t('order.newLine.step')} {currentStep} {t('order.newLine.of')} {TOTAL_STEPS}: {getStepTitle(currentStep)}
            </div>
        </div>
    );
};

export default StepProgressIndicator;