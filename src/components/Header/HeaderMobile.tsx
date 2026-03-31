import React, { useState } from "react";
import { Phone, Menu, X, User, Download } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';
import { usePwaInstall } from '@/hooks/use-pwa-install';

interface HeaderMobileProps {
  t: (key: string) => string;
  language: string;
  isMenuOpen: boolean;
  isRTL: boolean;
  onToggleMenu: () => void;
  contactPhone?: string;
}

const HeaderMobile: React.FC<HeaderMobileProps> = ({
  t,
  language,
  isRTL,
  isMenuOpen,
  onToggleMenu,
  contactPhone,
}) => {
    const navigate = useNavigate();
    const { isInstallable, isInstalled, isIOS, canPromptInstall, promptInstall } = usePwaInstall();
    const [showInstructions, setShowInstructions] = useState(false);

    const handleDownloadClick = () => {
      // If we have an install prompt (Android/Chrome with PWA), use it
      if (canPromptInstall) {
        promptInstall();
      } else {
        // Otherwise show instructions for manual installation
        setShowInstructions(true);
      }
    };
  
  return (
    <div className="xl:hidden">
          <div className="flex items-center justify-between px-4 h-24">
            {/* Logo */}
            <div className="flex-shrink-0" onClick={() => navigate('/')}>
              {isRTL ? 
                <img src={arabicLogo} alt="Cool net" className="h-[140px]" />
                : 
                <img src={englishLogo} alt="Cool net" className="h-[140px]" /> 
              }
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Download/Install Button - Only show if installable and not already installed */}
              {isInstallable && !isInstalled && (
                <button
                  onClick={handleDownloadClick}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-coolnet-orange text-white shadow-lg backdrop-blur-sm active:scale-95 transition-transform"
                  aria-label={t('navigation.download')}
                >
                  <Download size={18} />
                </button>
              )}

              {/* Phone Button */}
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-coolnet-orange/80 text-white shadow-lg backdrop-blur-sm active:scale-95 transition-transform"
                aria-label={t('contact.callUs')}
              >
                <Phone size={18} />
              </a>

              {/* Client Area Button */}
              <button
                className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-500"
                style={{
                  backgroundColor: `rgba(255, 255, 255, 0.2)`,
                  color: 'white'
                }}
                onClick={() => navigate('/customer-corner')}
                aria-label={t('navigation.clientArea')}
              >
                <User size={18} />
              </button>

              {/* Menu Button */}
              <button
                onClick={onToggleMenu}
                className="flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm shadow-lg active:scale-95 transition-all duration-500"
                style={{
                  backgroundColor: `rgba(255, 255, 255, 0.2)`,
                  color: 'white'
                }}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>
          </div>

          {/* Installation Instructions Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={() => setShowInstructions(false)}>
              <div
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-coolnet-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="w-8 h-8 text-coolnet-orange" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('navigation.installApp')}</h3>
                </div>
                <div className={`space-y-3 text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isIOS ? (
                    <>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">1</span>
                        <span>{t('navigation.iosStep1')}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">2</span>
                        <span>{t('navigation.iosStep2')}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">3</span>
                        <span>{t('navigation.iosStep3')}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">1</span>
                        <span>{t('navigation.androidStep1')}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">2</span>
                        <span>{t('navigation.androidStep2')}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-coolnet-purple text-white flex items-center justify-center flex-shrink-0 text-xs">3</span>
                        <span>{t('navigation.androidStep3')}</span>
                      </p>
                    </>
                  )}
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
        </div>
  );
};

export default HeaderMobile;
