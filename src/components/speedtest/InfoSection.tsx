import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Component that displays informative text about the speed test
 */
const InfoSection: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-8 text-sm text-gray-600 text-center max-w-2xl mx-auto">
      <p>{t('speedTest.infoLine1')}</p>
      <p className="mt-2">{t('speedTest.infoLine2')}</p>
    </div>
  );
};

export default InfoSection;