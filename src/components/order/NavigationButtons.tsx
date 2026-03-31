import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { WizardStep } from '@/types/orderTypes';

interface NavigationButtonsProps {
    currentStep: WizardStep;
    onPrevious: () => void;
    onNext: () => void;
    isSubmitting: boolean;
    isNextDisabled?: boolean;
    termsAccepted?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
    currentStep,
    onPrevious,
    onNext,
    isSubmitting,
    isNextDisabled = false,
    termsAccepted = true
}) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="flex justify-between pt-4">
            {/* Previous (Blue) */}
           <Button
    type="button"
    variant="outline"
    onClick={(e) => {
        e.preventDefault();
        onPrevious();
    }}
    disabled={currentStep === WizardStep.PERSONAL_INFO || currentStep === WizardStep.OTP}
    className={`bg-coolnet-purple text-white hover:bg-coolnet-purple/90 shadow-coolnet-purple/30 border-0 hover:text-white disabled:bg-white/10 disabled:border-white/20 disabled:text-white/50 ${isRTL ? 'ml-auto' : ''}`}
>
    {isRTL ? (
        <>
            <ChevronRight className="w-4 h-4 mr-2" />
            {t('order.newLine.previous')}
        </>
    ) : (
        <>
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('order.newLine.previous')}
        </>
    )}
</Button>

{currentStep !== WizardStep.REVIEW ? (
    <Button
        type="button"
        onClick={(e) => {
            e.preventDefault();
            onNext();
        }}
        disabled={isNextDisabled}
        className="backdrop-blur-sm bg-coolnet-orange text-white hover:bg-coolnet-orange/80 shadow-coolnet-purple/30 border-0 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
    >
        {isRTL ? (
            <>
                <ChevronLeft className="w-4 h-4 ml-2" />
                {t('order.newLine.next')}
            </>
        ) : (
            <>
                {t('order.newLine.next')}
                <ChevronRight className="w-4 h-4 ml-2" />
            </>
        )}
    </Button>
) : (
    <Button
        type="submit"
        disabled={isSubmitting || !termsAccepted}
        className="bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-50"
        title={!termsAccepted ? t('activateService.errors.termsRequired') : ''}
    >
        {isSubmitting ? t('order.newLine.submitting') : t('order.newLine.submit')}
    </Button>
)}

        </div>
    );  
};

export default NavigationButtons;
