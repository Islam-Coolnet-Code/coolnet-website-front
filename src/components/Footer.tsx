import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSiteSettings, useSocialLinks } from '@/services/cms';
import {
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';

// Icon mapping for social platforms
const socialIconMap: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
};

// Helper to get setting value by key
const getSettingValue = (
  settings: Array<{ key: string; valueAr: string | null; valueEn: string | null; valueHe: string | null }> | undefined,
  key: string,
  language: string
): string => {
  if (!settings) return '';
  const setting = settings.find(s => s.key === key);
  if (!setting) return '';
  if (language === 'ar') return setting.valueAr || setting.valueEn || '';
  if (language === 'he') return setting.valueHe || setting.valueEn || '';
  return setting.valueEn || '';
};

export const Footer: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { font } = useFont();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch site settings and social links from CMS
  const { data: siteSettings } = useSiteSettings();
  const { data: cmsSocialLinks } = useSocialLinks();

  // Get contact info from CMS
  const contactPhone = getSettingValue(siteSettings, 'contact_phone', language);
  const contactEmail = getSettingValue(siteSettings, 'contact_email', language);

  const isHomePage = location.pathname === '/';

  // Handle section scrolling when navigating from other pages
  useEffect(() => {
    if (isHomePage && location.search) {
      const params = new URLSearchParams(location.search);
      const section = params.get('section');
      if (section) {
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
          // Clean up the URL
          navigate('/', { replace: true });
        }, 100);
      }
    }
  }, [location, isHomePage, navigate]);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
  ];

  // Map CMS social links (no fallbacks — all data from API)
  const socialLinks = (cmsSocialLinks || []).map(link => ({
    icon: socialIconMap[link.platform.toLowerCase()] || Globe,
    href: link.url,
    label: link.platform,
  }));

  // Navigation handler similar to Header component
  const handleNavClick = (id: string) => {
    if (id === 'dealers') {
      navigate('/dealers');
      window.scrollTo(0, 0);
    } else if (id === 'home' && !isHomePage) {
      navigate('/');
    } else if (!isHomePage) {
      // Navigate to home page with section parameter
      navigate(`/?section=${id}`);
    } else {
      // We're on home page, just scroll to section
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const quickLinks = [
    { id: 'home', label: t('navigation.home') },
    { id: 'features', label: t('navigation.features') },
    { id: 'plans', label: t('navigation.plans') },
    { id: 'speedtest', label: t('navigation.speedTest') },
    { id: 'dealers', label: t('navigation.dealers') },
  ];

  const isRTL = language === 'ar';

  return (
    <footer className="bg-coolnet-purple text-white border-t-4 border-coolnet-orange" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Section with Wave Pattern */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-coolnet-purple-dark/50"></div>
        <svg className="absolute top-0 w-full h-12 -mt-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="rgba(74, 45, 110, 0.1)"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              {isRTL ?
                <img src={arabicLogo} alt="Coolnet" className="h-[160px]" />
                :
                <img src={englishLogo} alt="Coolnet" className="h-[160px]" />
              }
            </div>
            <p className={`text-gray-300 text-sm leading-relaxed ${font}`}>
              {t('footer.companyDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className={`font-bold text-lg text-coolnet-orange flex items-center gap-2 ${font}`}>
              <div className={`w-1 h-6 bg-coolnet-orange rounded ${isRTL ? 'order-2' : ''}`}></div>
              {t('footer.quicklinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className={`text-gray-300 hover:text-coolnet-orange transition-all duration-300 inline-block ${isRTL ? 'hover:-translate-x-1' : 'hover:translate-x-1'} ${font} cursor-pointer bg-transparent border-none p-0 text-left`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - from CMS */}
          <div className="space-y-4">
            <h4 className={`font-bold text-lg text-coolnet-orange flex items-center gap-2 ${font}`}>
              <div className={`w-1 h-6 bg-coolnet-orange rounded ${isRTL ? 'order-2' : ''}`}></div>
              {t('footer.contactInfo')}
            </h4>
            <div className="space-y-3 text-gray-300">
              {contactPhone && (
                <div className="flex items-start gap-3">
                  <Phone className={`w-5 h-5 text-coolnet-orange mt-0.5 ${isRTL ? 'order-2' : ''}`} />
                  <div className={`${isRTL ? 'text-right' : ''} ${font}`}>
                    <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors cursor-pointer" dir="ltr">{contactPhone}</a>
                    <p className="text-sm">{t('footer.support')}</p>
                  </div>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-start gap-3">
                  <Mail className={`w-5 h-5 text-coolnet-orange mt-0.5 ${isRTL ? 'order-2' : ''}`} />
                  <a href={`mailto:${contactEmail}`} className={`hover:text-white transition-colors ${font}`} dir="ltr">
                    {contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Social & Language */}
          <div className="space-y-6">
            {/* Social Media - from CMS */}
            <div>
              <h4 className={`font-bold text-lg text-coolnet-orange flex items-center gap-2 mb-4 ${font}`}>
                <div className={`w-1 h-6 bg-coolnet-orange rounded ${isRTL ? 'order-2' : ''}`}></div>
                {t('footer.followUs')}
              </h4>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-coolnet-purple-dark rounded-lg flex items-center justify-center hover:bg-coolnet-orange transition-all duration-300 hover:scale-110 group"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <h4 className={`font-bold text-lg text-coolnet-orange flex items-center gap-2 mb-4 ${font}`}>
                <div className={`w-1 h-6 bg-coolnet-orange rounded ${isRTL ? 'order-2' : ''}`}></div>
                {t('footer.language')}
              </h4>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar' | 'he')}
                  className={`w-full bg-coolnet-purple-dark text-white px-4 py-2 rounded-lg appearance-none cursor-pointer hover:bg-coolnet-purple-light transition-colors focus:outline-none focus:ring-2 focus:ring-coolnet-orange ${font}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code} className={font}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <Globe className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none`} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section with Copyright */}
        <div className="border-t border-coolnet-purple-dark pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-gray-300 text-sm text-center md:text-left ${font}`}>
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
