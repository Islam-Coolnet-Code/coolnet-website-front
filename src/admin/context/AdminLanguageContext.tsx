import React, { createContext, useState, useContext, ReactNode } from 'react';

import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

type AdminLanguageType = 'en' | 'ar';

interface AdminLanguageContextType {
  language: AdminLanguageType;
  setLanguage: (language: AdminLanguageType) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

const translations: Record<AdminLanguageType, Record<string, unknown>> = {
  en: enTranslations,
  ar: arTranslations,
};

export const AdminLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AdminLanguageType>(() => {
    try {
      const saved = localStorage.getItem('admin-language');
      return (saved === 'en' || saved === 'ar') ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });

  const setLanguage = (lang: AdminLanguageType) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('admin-language', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value === undefined || value === null) return key;
      if (typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const isRTL = language === 'ar';

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useAdminLanguage = () => {
  const context = useContext(AdminLanguageContext);
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return context;
};
