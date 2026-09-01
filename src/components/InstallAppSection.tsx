import React from 'react';
import { Download, Smartphone, Zap, Bell, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useInstallAction } from '@/hooks/use-install-action';
import InstallInstructionsModal from '@/components/InstallInstructionsModal';

interface InstallAppSectionProps {
  /**
   * `band` is the full-width strip used on the home page; `card` is the
   * narrower panel that sits inside the customer-corner sign-in column.
   */
  variant?: 'band' | 'card';
  className?: string;
}

/**
 * "لتحميل التطبيق" — the mobile shortcut invitation.
 *
 * Deliberately `md:hidden`: this asks the visitor to put a shortcut on their
 * home screen, which is only a real action on a phone. On a desktop the
 * floating install button still covers the rare visitor who wants it, so
 * showing this band there would just be a dead promise taking up a screenful.
 *
 * It also disappears once the app is installed — the section's whole job is
 * done at that point, and still offering it reads as broken.
 */
const InstallAppSection: React.FC<InstallAppSectionProps> = ({ variant = 'band', className = '' }) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const { install, steps, showInstructions, setShowInstructions, isInstalled } = useInstallAction();

  const isRTL = language === 'ar';

  if (isInstalled) return null;

  const perks = [
    { icon: Zap, key: 'installSection.perk.fast' },
    { icon: CreditCard, key: 'installSection.perk.pay' },
    { icon: Bell, key: 'installSection.perk.alerts' },
  ];

  const button = (
    <button
      type="button"
      onClick={install}
      className={`w-full h-14 rounded-2xl bg-white text-coolnet-purple font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform ${font}`}
    >
      <Download className="w-5 h-5 shrink-0" />
      {t('installSection.button')}
    </button>
  );

  const body = (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coolnet-purple via-coolnet-purple-light to-coolnet-orange text-white px-6 py-8 shadow-xl"
    >
      {/* Decorative brand glow, matching the sign-in card above it. */}
      <div className="pointer-events-none absolute -top-16 -end-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/15 ring-4 ring-white/10 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-7 h-7 text-white" />
        </div>

        <h2 className={`text-2xl font-extrabold leading-tight ${font}`}>
          {t('installSection.title')}
        </h2>
        <p className={`mt-3 text-sm leading-relaxed text-white/85 ${font}`}>
          {t('installSection.subtitle')}
        </p>

        <ul className="mt-6 space-y-3 text-start">
          {perks.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </span>
              <span className={`text-sm text-white/90 ${font}`}>{t(key)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7">{button}</div>

        <p className={`mt-3 text-xs text-white/70 ${font}`}>
          {t('installSection.hint')}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <section
        className={`md:hidden ${variant === 'band' ? 'px-4 py-10' : 'mt-8'} ${className}`}
        aria-label={t('installSection.title')}
      >
        <div className={variant === 'band' ? 'max-w-lg mx-auto' : ''}>{body}</div>
      </section>

      <InstallInstructionsModal
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
        steps={steps}
      />
    </>
  );
};

export default InstallAppSection;
