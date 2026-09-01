import React from 'react';
import { useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useInstallAction } from '@/hooks/use-install-action';
import InstallInstructionsModal from '@/components/InstallInstructionsModal';

/**
 * Global floating "install app / add to home screen" button.
 *
 * Always available on every device (mobile + desktop) so visitors can add the
 * website to their home screen / desktop at any time. The install behaviour
 * itself lives in useInstallAction(), shared with the download sections on the
 * home page and the customer-corner sign-in page.
 *
 * Positioned bottom-start to avoid clashing with the scroll-to-top button
 * (bottom-end). Hidden once the app is already installed and on the admin panel.
 */
const InstallAppFab: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { install, steps, showInstructions, setShowInstructions, isInstalled } = useInstallAction();

  // Don't show inside the admin panel, or once the app is already installed.
  if (isInstalled || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <button
        onClick={install}
        title={t('navigation.installPrompt')}
        aria-label={t('navigation.installPrompt')}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-coolnet-orange hover:bg-coolnet-orange-dark text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-coolnet-orange focus:ring-offset-2 animate-fade-in"
      >
        <Download className="w-5 h-5" />
      </button>

      <InstallInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        steps={steps}
      />
    </>
  );
};

export default InstallAppFab;
