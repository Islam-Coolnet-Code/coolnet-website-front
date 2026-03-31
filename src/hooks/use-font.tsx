import { useLanguage } from '@/context/LanguageContext';

/**
 * Hook to get the appropriate font class based on the current language
 * @returns Classes object with font class for Arabic and Hebrew languages
 */
export const useFont = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const classes = {
    font: isRTL ? 'font-jazeera' : '',
  };

  return classes;
};
