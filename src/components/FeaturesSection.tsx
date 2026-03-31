// FeaturesSection.tsx
import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Gauge, ShieldCheck, Phone, Hammer, ArrowRight, Wifi, Zap, Clock, Headphones, Settings, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFeatures, getMediaUrl } from '@/services/cms';
import { FeatureCardSkeleton } from '@/components/ui/skeletons';
import { getLocalizedText } from '@/utils/i18n';


// Icon mapping for CMS icon strings
const iconMap: Record<string, React.ReactNode> = {
  Gauge: <Gauge className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  Phone: <Phone className="w-6 h-6" />,
  Hammer: <Hammer className="w-6 h-6" />,
  Wifi: <Wifi className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Headphones: <Headphones className="w-6 h-6" />,
  Settings: <Settings className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
};

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  id: string;
  bgColor: string;
};

export const FeaturesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isRTL = language === 'ar';

  // Fetch features from CMS
  const { data: cmsFeatures, isLoading } = useFeatures();

  // Map CMS features to component format — no fallbacks
  const features: Feature[] = (cmsFeatures || []).map((f) => ({
    id: String(f.id),
    icon: f.icon && iconMap[f.icon] ? iconMap[f.icon] : <Star className="w-6 h-6" />,
    title: getLocalizedText(f.title, language),
    description: getLocalizedText(f.description, language),
    image: f.media?.fileUrl ? getMediaUrl(f.media.fileUrl) : '',
    bgColor: f.bgColor || 'bg-coolnet-purple',
  }));

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animate title
    gsap.fromTo(titleRef.current,
      {
        y: 40,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        }
      }
    );

    // Animate cards with stagger
    cardRefs.current.forEach((ref, index) => {
      if (!ref) return;

      gsap.fromTo(
        ref,
        {
          y: 60,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref,
            start: "top 85%",
          },
          delay: index * 0.1
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Don't render section if no CMS features and not loading
  if (!isLoading && features.length === 0) return null;

  return (
    <section
      id="features"
      className="relative py-16 md:py-24 overflow-hidden bg-white"
    >
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-coolnet-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-coolnet-orange/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div ref={titleRef} className="text-center mb-12 md:mb-16" style={{ opacity: 1 }}>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl ${isRTL ? 'font-black' : 'font-bold'} text-gray-900 mb-4 ${font}`}>
            {t('features.title')}
          </h2>
          <p className={`text-lg md:text-xl text-gray-600 max-w-2xl mx-auto ${font}`}>
            {t('features.subTitle')}
          </p>
        </div>

        {/* Features Grid - Cards with Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {isLoading ? (
            // Show skeleton loaders while loading
            [1, 2, 3, 4].map((i) => <FeatureCardSkeleton key={i} />)
          ) : features.map((feature, index) => (
            <div
              key={feature.id}
              ref={el => (cardRefs.current[index] = el)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                {/* Actual image */}
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Icon badge */}
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-20`}>
                  <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {React.cloneElement(feature.icon as React.ReactElement, {
                      className: "w-6 h-6 text-coolnet-purple"
                    })}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className={`text-xl font-bold text-gray-900 mb-3 group-hover:text-coolnet-purple transition-colors ${font}`}>
                  {feature.title}
                </h3>
                <p className={`text-gray-600 text-sm leading-relaxed ${font}`}>
                  {feature.description}
                </p>
              </div>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-coolnet-orange transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <Button
            className={`bg-coolnet-orange text-white hover:bg-coolnet-orange-dark px-8 py-6 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-coolnet-orange/25 inline-flex items-center gap-3 border-0 ${font}`}
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('hero.explorePlans')}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
