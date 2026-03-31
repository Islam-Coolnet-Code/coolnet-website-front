import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

type LanguageType = 'en' | 'ar';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onSelectLanguage: (language: LanguageType) => void;
  onClose: () => void;
  detectedLanguage: LanguageType;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onSelectLanguage,
  onClose,
  detectedLanguage,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Use detected language for initial display if no translation is available yet
  const getTranslatedText = (key: string, fallback: string) => {
    const translated = t(key);
    return translated !== key ? translated : fallback;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-coolnet-orange/20 to-coolnet-orange-light/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-coolnet-purple/20 to-coolnet-purple-light/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative p-8">
          {/* Header with gradient line decoration */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-coolnet-orange" />
              <h2 className="text-xl font-bold text-white">
                {getTranslatedText('languageModal.title', detectedLanguage === 'ar' ? 'اختر اللغة' : 'Select Language')}
              </h2>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-coolnet-orange" />
            </div>
            <p className="text-sm text-gray-300">
              {getTranslatedText('languageModal.description', detectedLanguage === 'ar' ? 'اختر لغتك المفضلة' : 'Choose your preferred language')}
            </p>
            <p className="text-xs text-coolnet-orange mt-2">
              {getTranslatedText('languageModal.detected', detectedLanguage === 'ar' ? 'المكتشفة' : 'Detected')}: {getLanguageDisplayName(detectedLanguage)}
            </p>
          </div>

          {/* Language buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => onSelectLanguage('en')}
              className={`w-full group relative overflow-hidden backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-coolnet-purple/50 rounded-xl py-3 px-4 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-coolnet-purple/25 ${
                detectedLanguage === 'en' ? 'ring-2 ring-coolnet-orange/50' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-coolnet-purple/0 via-coolnet-purple/5 to-coolnet-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <span>English</span>
              </div>
            </button>
            <button
              onClick={() => onSelectLanguage('ar')}
              className={`w-full group relative overflow-hidden backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 hover:border-coolnet-orange/50 rounded-xl py-3 px-4 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-coolnet-orange/25 ${
                detectedLanguage === 'ar' ? 'ring-2 ring-coolnet-orange/50' : ''
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-coolnet-orange/0 via-coolnet-orange/5 to-coolnet-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-between">
                <span>العربية</span>
              </div>
            </button>
          </div>

          {/* Keep current option */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-coolnet-orange transition-colors duration-200 underline decoration-transparent hover:decoration-coolnet-orange underline-offset-2"
            >
              {t('languageModal.keepCurrent')} ({getLanguageDisplayName(detectedLanguage)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get display name for language
const getLanguageDisplayName = (lang: LanguageType): string => {
  const names = {
    'en': 'English',
    'ar': 'العربية'
  };
  return names[lang];
};
