import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CheckDuplicateResponse, isContinuing } from '@/services/wizard/types';
import { Button } from '@/components/ui/button';

interface DuplicateUserSectionProps {
  duplicateData: CheckDuplicateResponse;
  onChoice: (choice: isContinuing) => void;
  isVisible: boolean;
}

const DuplicateUserSection: React.FC<DuplicateUserSectionProps> = ({
  duplicateData,
  onChoice,
  isVisible
}) => {
  const { t } = useLanguage();

  const handleChoice = (choice: isContinuing) => {
    onChoice(choice);
  };

  const renderChoices = () => {
    const { is_client, is_not_continued, is_duplicate } = duplicateData;

    if (is_client) {
      // User is already a client
      return (
        <>
          <p className="text-white/90 mb-4">
            {t('order.newLine.duplicate.clientFound')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleChoice(isContinuing.DIFFERENT_PERSON)}
              className="flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white"
            >
              {t('order.newLine.duplicate.continueForDifferentPerson')}
            </Button>
            <Button
              onClick={() => handleChoice(isContinuing.ACTIVATE_SERVICE)}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {t('order.newLine.duplicate.goToActivateService')}
            </Button>
          </div>
        </>
      );
    }

    if (is_not_continued) {
      // User has previous application but didn't continue
      return (
        <>
          <p className="text-white/90 mb-4">
            {t('order.newLine.duplicate.previousApplicationFound')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleChoice(isContinuing.CONTINUE_REQUEST)}
              className="flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white"
            >
              {t('order.newLine.duplicate.continuePreviousRequest')}
            </Button>
            <Button
              onClick={() => handleChoice(isContinuing.NEW_REQUEST)}
              className="flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white"
            >
              {t('order.newLine.duplicate.continueWithNewRequest')}
            </Button>
          </div>
        </>
      );
    }

    if (is_duplicate) {
      // User already submitted info but not yet a client
      return (
        <>
          <p className="text-white/90 mb-4">
            {t('order.newLine.duplicate.existingApplicationFound')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleChoice(isContinuing.DIFFERENT_PERSON)}
              className="flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white"
            >
              {t('order.newLine.duplicate.submitForSomeoneElse')}
            </Button>
            <Button
              onClick={() => handleChoice(isContinuing.NEW_REQUEST)}
              className="flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white"
            >
              {t('order.newLine.duplicate.formStatusCheck')}
            </Button>
          </div>
        </>
      );
    }

    return null;
  };

  if (!isVisible) return null;

  return (
    <div className="mt-6 p-4 rounded-lg border border-coolnet-orange/50 bg-coolnet-orange/10 animate-slideDown">
      <h4 className="font-semibold text-lg text-white mb-3">
        {t('order.newLine.duplicate.existingRequestFound')}
      </h4>

      {renderChoices()}
    </div>
  );
};

export default DuplicateUserSection;
