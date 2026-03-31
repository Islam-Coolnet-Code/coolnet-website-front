import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface StartScreenProps {
  onStartTest: () => void;
  isDisabled?: boolean;
}

/**
 * Initial screen displayed before starting a speed test
 */
const StartScreen: React.FC<StartScreenProps> = ({ 
  onStartTest, 
  isDisabled = false 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center">
      <p className="mb-6 text-gray-600 max-w-lg mx-auto">
        {t('speedTest.description')}
      </p>
      <Button
        onClick={onStartTest}
        className="bg-coolnet-purple hover:bg-coolnet-purple/80 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg font-medium text-white"
        disabled={isDisabled}
      >
        {t('speedTest.startTest')}
      </Button>
    </div>
  );
};

export default StartScreen;