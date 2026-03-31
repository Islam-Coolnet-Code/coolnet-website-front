
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Import translation files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

type LanguageType = 'en' | 'ar';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Load translations from JSON files
const translations: Record<LanguageType, Record<string, unknown>> = {
  en: enTranslations,
  ar: arTranslations
};


export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {  
  const [language, setLanguage] = useState<LanguageType>('ar');

  // Enhanced translation function to handle nested keys
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    // Navigate through nested objects safely without using `any`
    for (const k of keys) {
      if (value === undefined || value === null) return key;
      if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        value = record[k];
      } else {
        return key;
      }
    }

    // Return the key itself if the translation is not found
    return typeof value === 'string' ? value : key;
  };

  // Set HTML dir attribute for RTL languages and save to localStorage
  useEffect(() => {
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.className = language === 'ar' ? 'rtl' : '';

    // Save to localStorage
    try {
      localStorage.setItem('language', language);
    } catch (e) {
      // ignore (e.g., storage disabled)
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Allow exporting the hook from the same file with components. This rule
// sometimes flags fast-refresh when both components and utility hooks are
// exported from the same module. Silence the specific rule for this export.
/* eslint-disable react-refresh/only-export-components */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
