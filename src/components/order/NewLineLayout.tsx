import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { WizardStep } from '@/types/orderTypes';

// Import components
import StepProgressIndicator from '@/components/order/StepProgressIndicator';
import NavigationButtons from '@/components/order/NavigationButtons';

interface NewLineLayoutProps {
  children: React.ReactNode;
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  onStepClick: (step: WizardStep) => void;
  otpVerified: boolean;
  otpSentForPhone: string;
  currentPhone: string;
  originalPhone: string;
  isDevMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isNextDisabled?: boolean;
  needsReVerification?: () => boolean;
  selectedPlan?: {
    id: string;
    title: string;
    price: string | number;
    speed: {
      download: string;
      upload: string;
    };
  } | null;
  planType?: 'personal' | 'business';
  termsAccepted?: boolean;
}

export const NewLineLayout: React.FC<NewLineLayoutProps> = ({
  children,
  currentStep,
  completedSteps,
  onStepClick,
  otpVerified,
  otpSentForPhone,
  currentPhone,
  originalPhone,
  isDevMode,
  onPrevious,
  onNext,
  isSubmitting,
  onSubmit,
  isNextDisabled = false,
  needsReVerification,
  selectedPlan,
  planType,
  termsAccepted = true
}) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  return (
    <>
      <div
        className={`min-h-screen relative overflow-hidden ${font} bg-coolnet-purple`}
      >
        <main className="relative flex-grow container mx-auto px-4 py-8">
          <div className="max-w-8xl mx-auto">
            {/* Development Mode Indicator */}
            {isDevMode && (
              <div className="mb-4 p-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
                <p className="text-yellow-100 text-sm text-center font-medium">
                  🚧 Development Mode: All steps accessible, validation skipped
                </p>
              </div>
            )}

            {/* Title with Coolnet styling */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-coolnet-purple" />
                <h1 className={`text-4xl md:text-5xl ${isRTL ? 'font-black' : 'font-bold'} text-white ${font}`}>
                  {t('order.newLine.title')}
                </h1>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-purple" />
              </div>

              {/* Display selected plan information */}
              {selectedPlan && planType && currentStep === WizardStep.PERSONAL_INFO && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <div className="relative overflow-hidden bg-gradient-to-br from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                    {/* Background effects */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-coolnet-orange/10 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-coolnet-purple/10 rounded-full blur-2xl"></div>
                    </div>

                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        {/* Icon + Speed */}
                        <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                          {/* Icon + Speed */}
                          <div className={`flex items-center gap-4 ${isRTL ? "text-right" : "text-left"}`}>
                            <div className="w-12 h-12 bg-gradient-to-br from-coolnet-orange to-coolnet-orange-light rounded-xl flex items-center justify-center shadow-lg">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-gray-300 font-medium">
                                {t("order.newLine.preselectedPlan")}
                              </p>
                              <h3 className="text-xl font-bold text-white">
                                {selectedPlan.title}
                              </h3>
                            </div>
                          </div>
                        </div>


                        {/* Price + Personal */}
                        <div
                          className={`${isRTL ? 'order-1 text-left' : 'order-2 text-right'
                            }`}
                        >
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-medium text-gray-300">₪</span>
                            <span className="text-2xl font-bold text-white">
                              {selectedPlan.price}
                            </span>
                            <span className="text-sm font-medium text-gray-300">
                              {t('plans.month')}
                            </span>
                          </div>
                          <div className="text-sm text-coolnet-orange font-medium">
                            {/* {t('order.newLine.personal')} */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Progress Indicator */}
            <StepProgressIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={onStepClick}
              otpVerified={otpVerified}
              otpSentForPhone={otpSentForPhone}
              currentPhone={currentPhone}
              originalPhone={originalPhone}
              devMode={isDevMode}
              needsReVerification={needsReVerification}
            />

            <form onSubmit={onSubmit}>
              {/* Glassmorphism Card */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                <CardContent className="space-y-6 p-8">
                  {children}
                </CardContent>
                <div className="p-8 pt-0">
                  {currentStep !== WizardStep.OTP && (
                    <NavigationButtons
                      currentStep={currentStep}
                      onPrevious={onPrevious}
                      onNext={onNext}
                      isSubmitting={isSubmitting}
                      isNextDisabled={isNextDisabled}
                      termsAccepted={termsAccepted}
                    />
                  )}
                </div>
              </Card>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};
