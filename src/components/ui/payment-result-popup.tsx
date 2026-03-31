import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import '@/styles/payment-result-popup.css';

interface PaymentResultPopupProps {
  isOpen: boolean;
  isSuccess: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export const PaymentResultPopup: React.FC<PaymentResultPopupProps> = ({
  isOpen,
  isSuccess,
  title,
  message,
  onClose
}) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';
  const [showContent, setShowContent] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  // Handle animation phases
  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('enter');
      setShowContent(true);
      // Show content after backdrop animation
      const contentTimer = setTimeout(() => {
        setAnimationPhase('show');
      }, 150);

      return () => clearTimeout(contentTimer);
    } else {
      // When closing, animate out first
      setAnimationPhase('exit');
      const hideTimer = setTimeout(() => {
        setShowContent(false);
        setAnimationPhase('enter'); // Reset for next time
      }, 300);

      return () => clearTimeout(hideTimer);
    }
  }, [isOpen]);

  // Auto-close after 3 seconds for success
  useEffect(() => {
    if (isOpen && isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isSuccess, onClose]);

  // Don't render anything if popup should not be visible
  if (!isOpen && animationPhase !== 'exit') return null;

  const defaultTitle = isSuccess 
    ? t('activateService.form.paymentSuccess') || 'Payment Successful!'
    : t('activateService.form.paymentError') || 'Payment Failed';

  const defaultMessage = isSuccess
    ? t('activateService.form.paymentSuccessMessage') || 'Your payment has been processed successfully.'
    : t('activateService.form.paymentErrorMessage') || 'There was an error processing your payment. Please try again.';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        animationPhase === 'enter' || animationPhase === 'show' 
          ? 'payment-popup-fadeIn' 
          : 'payment-popup-fadeOut'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Popup Content */}
      {showContent && (
        <Card className={`relative bg-white/95 backdrop-blur-xl border-2 ${
          isSuccess ? 'border-green-400/50' : 'border-red-400/50'
        } shadow-2xl max-w-md w-full mx-4 ${
          animationPhase === 'show' ? 'payment-popup-slideInScale' : 'payment-popup-slideOutScale'
        }`}>
          <CardContent className="p-8 text-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-2 h-8 w-8 p-0 hover:bg-gray-100/20 text-gray-600 hover:text-gray-800`}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Success/Error Icon with Animation */}
            <div className="flex justify-center mb-6">
              {isSuccess ? (
                <div className="relative">
                  {/* Green Circle Background */}
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center payment-popup-scaleIn">
                    {/* Checkmark with draw animation */}
                    <CheckCircle className="w-12 h-12 text-white payment-popup-checkDraw" />
                  </div>
                  {/* Success Pulse Ring */}
                  <div className="absolute inset-0 w-20 h-20 bg-green-500/30 rounded-full payment-popup-pulse-ring"></div>
                </div>
              ) : (
                <div className="relative">
                  {/* Red Circle Background */}
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center payment-popup-scaleIn">
                    {/* X mark with shake animation */}
                    <XCircle className="w-12 h-12 text-white payment-popup-shake" />
                  </div>
                  {/* Error Pulse Ring */}
                  <div className="absolute inset-0 w-20 h-20 bg-red-500/30 rounded-full payment-popup-pulse-ring-error"></div>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className={`text-xl font-semibold mb-3 ${font} ${
              isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {title || defaultTitle}
            </h3>

            {/* Message */}
            <p className={`text-gray-600 mb-6 ${font} ${isRTL ? 'text-right' : 'text-left'}`}>
              {message || defaultMessage}
            </p>

            {/* Success - Auto close message */}
            {isSuccess && (
              <p className={`text-sm text-green-600 mb-4 ${font}`}>
                {t('activateService.form.autoCloseMessage') || 'This popup will close automatically...'}
              </p>
            )}

            {/* Action Button (mainly for error cases) */}
            {!isSuccess && (
              <Button
                onClick={onClose}
                className={`w-full bg-red-500 hover:bg-red-600 text-white ${font}`}
              >
                {t('activateService.form.tryAgain') || 'Try Again'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}


    </div>
  );
};
