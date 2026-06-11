import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useSiteSettings } from '@/services/cms';

// Read a site-setting value by key (App Store / Play Store links are stored in CMS).
const getSettingValue = (
  settings: Array<{ key: string; valueEn: string | null }> | undefined,
  key: string
): string | null => settings?.find((s) => s.key === key)?.valueEn || null;

/**
 * Global floating "install app / add to home screen" button.
 *
 * Always available on every device (mobile + desktop) so visitors can add the
 * website to their home screen / desktop at any time. When the browser supports
 * the native install prompt (Android / Chrome / Edge) it fires that directly;
 * otherwise it shows platform-specific manual instructions (iOS, Android, desktop).
 *
 * Positioned bottom-start to avoid clashing with the scroll-to-top button
 * (bottom-end). Hidden once the app is already installed and on the admin panel.
 */
const InstallAppFab: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { isInstalled, isIOS, isMobile, canPromptInstall, promptInstall } = usePwaInstall();
  const { data: siteSettings } = useSiteSettings();
  const [showInstructions, setShowInstructions] = useState(false);

  const isRTL = language === 'ar' || language === 'he';

  // Native store apps (configured in Admin → Settings). On iOS a PWA can't be
  // installed programmatically, so the App Store app is the real one-tap install.
  const appStoreLink = getSettingValue(siteSettings, 'app_store_link');
  const playStoreLink = getSettingValue(siteSettings, 'play_store_link');

  // Don't show inside the admin panel, or once the app is already installed.
  if (isInstalled || location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleClick = () => {
    // 1) Native PWA install prompt (Android / desktop Chrome / Edge) — works directly.
    if (canPromptInstall) {
      promptInstall();
      return;
    }
    // 2) iOS can't install a PWA programmatically → send to the App Store app if set.
    if (isIOS && appStoreLink) {
      window.open(appStoreLink, '_blank', 'noopener,noreferrer');
      return;
    }
    // 3) Android without a prompt → fall back to the Play Store app if set.
    if (!isIOS && isMobile && playStoreLink) {
      window.open(playStoreLink, '_blank', 'noopener,noreferrer');
      return;
    }
    // 4) Otherwise show manual "add to home screen" instructions.
    setShowInstructions(true);
  };

  // Pick the right manual-install steps for the current platform.
  const steps = isIOS
    ? ['navigation.iosStep1', 'navigation.iosStep2', 'navigation.iosStep3']
    : isMobile
    ? ['navigation.androidStep1', 'navigation.androidStep2', 'navigation.androidStep3']
    : ['navigation.desktopStep1', 'navigation.desktopStep2', 'navigation.desktopStep3'];

  return (
    <>
      <button
        onClick={handleClick}
        title={t('navigation.installPrompt')}
        aria-label={t('navigation.installPrompt')}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-coolnet-orange hover:bg-coolnet-orange-dark text-white shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-coolnet-orange focus:ring-offset-2 animate-fade-in"
      >
        <Download className="w-5 h-5" />
      </button>

      {showInstructions && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-coolnet-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-coolnet-orange" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('navigation.installApp')}</h3>
            </div>
            <div className={`space-y-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              {steps.map((stepKey, index) => (
                <p key={stepKey} className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">
                    {index + 1}
                  </span>
                  <span>{t(stepKey)}</span>
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 bg-coolnet-purple text-white rounded-xl font-medium active:scale-95 transition-transform"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppFab;
