import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { useFeatures, Feature, getMediaUrl } from '@/services/cms';
import Footer from '@/components/Footer';
import { Star, Settings, Wifi, Zap, Clock, Headphones, ShieldCheck, Phone, Hammer, Gauge } from 'lucide-react';

// Icon mapping for CMS icon strings
const iconMap: Record<string, React.ElementType> = {
  Gauge: Gauge,
  ShieldCheck: ShieldCheck,
  Phone: Phone,
  Hammer: Hammer,
  Wifi: Wifi,
  Zap: Zap,
  Clock: Clock,
  Headphones: Headphones,
  Settings: Settings,
  Star: Star,
};

interface ServiceCardProps {
  feature: Feature;
  isRTL: boolean;
  font: string;
  language: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ feature, isRTL, font, language }) => {
  const getLocalizedText = (text: { en: string; ar: string | null; he: string | null } | null): string => {
    if (!text) return '';
    if (language === 'ar') return text.ar || text.en;
    if (language === 'he') return text.he || text.en;
    return text.en;
  };

  const IconComponent = feature.icon && iconMap[feature.icon] ? iconMap[feature.icon] : Star;
  const bgColorClass = feature.bgColor || 'bg-coolnet-purple';

  return (
    <article
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-coolnet-purple/10 to-coolnet-orange/10">
        {feature.media?.fileUrl ? (
          <img
            src={getMediaUrl(feature.media.fileUrl)}
            alt={getLocalizedText(feature.title)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${bgColorClass}`}>
            <IconComponent className="w-24 h-24 text-white/50" />
          </div>
        )}

        {/* Icon badge */}
        <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
          <div className={`w-14 h-14 rounded-xl ${bgColorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-coolnet-purple transition-colors ${font}`}>
          {getLocalizedText(feature.title)}
        </h3>
        {feature.description && (
          <p className={`text-gray-600 leading-relaxed ${font}`}>
            {getLocalizedText(feature.description)}
          </p>
        )}
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-coolnet-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </article>
  );
};

const ServicesSkeleton: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 animate-pulse ${isRTL ? 'text-right' : 'text-left'}`}>
    <div className="h-56 bg-gray-200" />
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const AllServices: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar' || language === 'he';

  // SEO
  useSEO({
    title: t('allServices.seoTitle'),
    description: t('allServices.seoDescription'),
  });

  // Fetch all features
  const { data: features, isLoading, error } = useFeatures();

  return (
    <div className={`flex flex-col min-h-screen ${font}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-coolnet-orange/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Settings className="w-5 h-5 text-white" />
              <span className={`text-white font-semibold ${font}`}>
                {t('services.badge')}
              </span>
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 ${font}`}>
              {t('allServices.title')}
            </h1>
            <p className={`text-xl text-white/80 max-w-2xl mx-auto ${font}`}>
              {t('allServices.subtitle')}
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ServicesSkeleton key={i} isRTL={isRTL} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className={`text-gray-500 ${font}`}>
                  {t('services.error')}
                </p>
              </div>
            ) : features && features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {features.map((feature) => (
                  <ServiceCard
                    key={feature.id}
                    feature={feature}
                    isRTL={isRTL}
                    font={font}
                    language={language}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className={`text-gray-500 text-lg ${font}`}>
                  {t('allServices.noServices')}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AllServices;
