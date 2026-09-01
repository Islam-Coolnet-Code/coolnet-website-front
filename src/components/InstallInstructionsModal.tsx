import React from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface InstallInstructionsModalProps {
  open: boolean;
  onClose: () => void;
  /** Translation keys for the platform-specific steps, from useInstallAction(). */
  steps: string[];
}

/**
 * Manual "add to home screen" steps, shown when the browser gives us no
 * install prompt and no store app to hand off to (iOS Safari without an App
 * Store link, desktop Firefox, and so on).
 *
 * Shared by the floating install button and the download sections so all three
 * show the same steps.
 */
const InstallInstructionsModal: React.FC<InstallInstructionsModalProps> = ({ open, onClose, steps }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-coolnet-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-coolnet-orange" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t('navigation.installApp')}</h3>
        </div>
        <div className={`space-y-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
          {steps.map((stepKey, index) => (
            <p key={stepKey} className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">
                {index + 1}
              </span>
              <span>{t(stepKey)}</span>
            </p>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-coolnet-purple text-white rounded-xl font-medium active:scale-95 transition-transform"
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
};

export default InstallInstructionsModal;
