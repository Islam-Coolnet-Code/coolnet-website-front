import { MultiLangText } from '@/services/cms';

/**
 * Get localized text based on current language
 * @param text - Multi-language text object or null
 * @param language - Current language code ('en' | 'ar' | 'he')
 * @returns Localized string or empty string if text is null
 */
export const getLocalizedText = (
  text: MultiLangText | { en: string; ar: string | null; he: string | null } | null,
  language: string
): string => {
  if (!text) return '';
  if (language === 'ar') return text.ar || text.en;
  if (language === 'he') return text.he || text.en;
  return text.en;
};

/**
 * Format a date string for the current locale
 * @param dateString - ISO date string or null
 * @param language - Current language code
 * @returns Formatted date string
 */
export const formatLocalizedDate = (dateString: string | null, language: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const locale = language === 'ar' ? 'ar-SA' : language === 'he' ? 'he-IL' : 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
