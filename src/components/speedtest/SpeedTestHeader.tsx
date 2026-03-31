import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Gauge } from 'lucide-react';

/**
 * Header component for the Speed Test section
 */
const SpeedTestHeader: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">
        {t('speedTest.title')}
      </h2>
      <div className="w-20 h-1 bg-gradient-to-r from-coolnet-purple to-coolnet-orange mx-auto mb-4 rounded-full"></div>
      <Gauge className="h-12 w-12 mx-auto text-coolnet-purple" />
    </div>
  );
};

export default SpeedTestHeader;