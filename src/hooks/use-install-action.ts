import { useState, useCallback } from 'react';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { useSiteSettings } from '@/services/cms';

// Read a site-setting value by key (App Store / Play Store links are stored in CMS).
const getSettingValue = (
  settings: Array<{ key: string; valueEn: string | null }> | undefined,
  key: string
): string | null => settings?.find((s) => s.key === key)?.valueEn || null;

/**
 * The one "add this site to my home screen" action, shared by every entry
 * point that offers it (the floating button and the download sections on the
 * home page and the customer-corner sign-in page).
 *
 * It lives in a hook rather than in each component because the fallback chain
 * is the interesting part and must not drift between them: a browser that can
 * install a PWA gets the native prompt, iOS gets the App Store app (Safari
 * refuses to install a PWA programmatically), Android without a captured
 * prompt gets the Play Store app, and everything else gets manual steps.
 */
export function useInstallAction() {
  const { isInstalled, isIOS, isMobile, canPromptInstall, promptInstall } = usePwaInstall();
  const { data: siteSettings } = useSiteSettings();
  const [showInstructions, setShowInstructions] = useState(false);

  const appStoreLink = getSettingValue(siteSettings, 'app_store_link');
  const playStoreLink = getSettingValue(siteSettings, 'play_store_link');

  const install = useCallback(() => {
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
  }, [canPromptInstall, promptInstall, isIOS, isMobile, appStoreLink, playStoreLink]);

  // Pick the right manual-install steps for the current platform.
  const steps = isIOS
    ? ['navigation.iosStep1', 'navigation.iosStep2', 'navigation.iosStep3']
    : isMobile
    ? ['navigation.androidStep1', 'navigation.androidStep2', 'navigation.androidStep3']
    : ['navigation.desktopStep1', 'navigation.desktopStep2', 'navigation.desktopStep3'];

  return {
    install,
    steps,
    showInstructions,
    setShowInstructions,
    isInstalled,
    isIOS,
    isMobile,
  };
}
