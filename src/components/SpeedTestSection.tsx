import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, ArrowRight, Download, Upload, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSiteSettings } from '@/services/cms';

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

/**
 * SpeedTestSection component - promotional section that links to the speed test page
 */
export const SpeedTestSection: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';
  const { data: siteSettings } = useSiteSettings();

  const maxSpeed = getSettingValue(siteSettings, 'speed_test_max_speed', language);
  const downloadExample = getSettingValue(siteSettings, 'speed_test_download_example', language);
  const uploadExample = getSettingValue(siteSettings, 'speed_test_upload_example', language);

  const handleNavigateToSpeedTest = () => {
    navigate('/speed-test');
    window.scrollTo(0, 0);
  };

  return (
    <section id="speedtest" className="relative py-20 overflow-hidden bg-coolnet-purple">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left side - Content */}
            <div className={`space-y-6 ${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>

              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Gauge className="w-4 h-4 text-coolnet-orange" />
                <span className={`text-sm font-semibold text-white ${font}`}>
                  {t('speedTest.badge')}
                </span>
              </div>

              {/* Title */}
              <h2 className={`text-4xl md:text-5xl ${isRTL ? 'font-black' : 'font-bold'} text-white leading-tight ${font}`}>
                {t('speedTest.title')}
              </h2>

              {/* Description */}
              <p className={`text-lg text-white/80 leading-relaxed ${font}`}>
                {t('speedTest.description')}
              </p>

              {/* Feature list */}
              <div className="space-y-3">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Download className="w-5 h-5 text-coolnet-orange" />
                  </div>
                  <span className={`text-white font-medium ${font}`}>
                    {t('speedTest.feature1')}
                  </span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-coolnet-orange" />
                  </div>
                  <span className={`text-white font-medium ${font}`}>
                    {t('speedTest.feature2')}
                  </span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-coolnet-orange" />
                  </div>
                  <span className={`text-white font-medium ${font}`}>
                    {t('speedTest.feature3')}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className={`pt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <Button
                  onClick={handleNavigateToSpeedTest}
                  className={`bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light text-white hover:from-coolnet-orange-light hover:to-coolnet-orange-dark px-8 py-6 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-coolnet-orange/25 inline-flex items-center gap-3 border-0 ${font}`}
                >
                  {t('speedTest.startTest')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Right side - Visual */}
            <div className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="relative">
                {/* Decorative background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full bg-white/5 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full bg-coolnet-orange/10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                {/* Main gauge visual */}
                <div className="relative flex items-center justify-center py-12">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-2xl border border-white/20">
                    <div className="w-56 h-56 rounded-full bg-white flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <Gauge className="w-16 h-16 text-coolnet-orange mx-auto mb-2" />
                        <div className="text-4xl font-black text-coolnet-purple">{maxSpeed || t('speedTest.badge')}</div>
                        <div className="text-sm text-gray-500 font-medium">Mbps</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stats cards */}
                <div className={`absolute top-8 ${isRTL ? 'right-0' : 'left-0'} bg-white rounded-xl shadow-lg p-4 border border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-coolnet-purple/10 flex items-center justify-center">
                      <Download className="w-5 h-5 text-coolnet-purple" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('speedTest.download')}</div>
                      <div className="text-lg font-bold text-gray-900">{downloadExample || '--'} Mbps</div>
                    </div>
                  </div>
                </div>

                <div className={`absolute bottom-8 ${isRTL ? 'left-0' : 'right-0'} bg-white rounded-xl shadow-lg p-4 border border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-coolnet-orange/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-coolnet-orange" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{t('speedTest.upload')}</div>
                      <div className="text-lg font-bold text-gray-900">{uploadExample || '--'} Mbps</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeedTestSection;
