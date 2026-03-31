import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wifi, Zap, Shield, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSlides, useSiteSettings, MultiLangText, getMediaUrl, HeroGalleryItem } from '@/services/cms';
import { HeroSkeleton } from '@/components/ui/skeletons';
import { getLocalizedText } from '@/utils/i18n';

// Helper to get setting value by key and language
const getSettingValue = (
  settings: Array<{ key: string; valueEn: string | null; valueAr: string | null; valueHe: string | null }> | undefined,
  key: string,
  language: string
): string | null => {
  if (!settings) return null;
  const setting = settings.find(s => s.key === key);
  if (!setting) return null;
  if (language === 'ar') return setting.valueAr || setting.valueEn;
  if (language === 'he') return setting.valueHe || setting.valueEn;
  return setting.valueEn;
};

export const HeroSection: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch hero slides and site settings from CMS
  const { data: heroSlides, isLoading } = useHeroSlides();
  const { data: siteSettings } = useSiteSettings();

  // Get hero stats from CMS settings
  const heroStatSpeed = getSettingValue(siteSettings, 'hero_stat_speed', language);
  const heroStatUptime = getSettingValue(siteSettings, 'hero_stat_uptime', language);
  const heroStatSupport = getSettingValue(siteSettings, 'hero_stat_support', language);

  // Get customer count from CMS and format it
  const heroCustomerCountRaw = getSettingValue(siteSettings, 'hero_customer_count', 'en');
  const heroCustomerCount = heroCustomerCountRaw ? (() => {
    const count = parseInt(heroCustomerCountRaw, 10);
    if (isNaN(count)) return heroCustomerCountRaw;
    if (count >= 1000) return `${Math.floor(count / 1000)}K+`;
    return `${count}+`;
  })() : null;

  // Get the first active hero slide for text content
  const heroSlide = heroSlides?.[0];

  // Text content from CMS only (locale strings as last resort — no hardcoded English)
  const badge = heroSlide ? getLocalizedText(heroSlide.badge, language) : t('hero.badge');
  const title = heroSlide ? getLocalizedText(heroSlide.title, language) : t('hero.title');
  const subtitle = heroSlide ? getLocalizedText(heroSlide.subtitle, language) : t('hero.subtitle');
  const ctaPrimaryText = heroSlide ? getLocalizedText(heroSlide.ctaPrimaryText, language) : t('hero.viewPlans');
  const ctaSecondaryText = heroSlide ? getLocalizedText(heroSlide.ctaSecondaryText, language) : t('hero.learnMore');

  // Build gallery images from first hero slide's gallery (max 3 images, fully dynamic)
  const buildHeroImages = () => {
    const images: { src: string; alt: string }[] = [];

    // Check if hero slide has gallery images
    if (heroSlide?.gallery && heroSlide.gallery.length > 0) {
      // Use gallery images from the first hero slide (max 3)
      heroSlide.gallery
        .slice(0, 3)
        .forEach((item: HeroGalleryItem, index: number) => {
          if (item.media?.fileUrl) {
            images.push({
              src: getMediaUrl(item.media.fileUrl),
              alt: getLocalizedText(item.media.altText || heroSlide.title, language) || `Hero Image ${index + 1}`,
            });
          }
        });
    }
    // Fallback to main media from hero slide if no gallery
    else if (heroSlide?.media?.fileUrl) {
      images.push({
        src: getMediaUrl(heroSlide.media.fileUrl),
        alt: getLocalizedText(heroSlide.title, language) || 'Hero Image',
      });
    }

    return images;
  };

  const heroImages = buildHeroImages();
  const imageCount = heroImages.length;

  // Dynamic grid class based on number of images
  const getGridClass = () => {
    switch (imageCount) {
      case 1:
        return 'grid-cols-1 grid-rows-1';
      case 2:
        return 'grid-cols-2 grid-rows-1';
      case 3:
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  // Dynamic span class for each image based on total count and position
  const getImageSpan = (index: number) => {
    if (imageCount === 1) {
      return 'col-span-1 row-span-1';
    }
    if (imageCount === 2) {
      return 'col-span-1 row-span-1';
    }
    if (imageCount === 3) {
      // First image takes left column full height, other two stack on right
      if (index === 0) return 'col-span-1 row-span-2';
      return 'col-span-1 row-span-1';
    }
    return 'col-span-1 row-span-1';
  };

  const scrollToPlans = () => {
    if (heroSlide?.ctaPrimaryLink) {
      // If there's a link, navigate to it
      if (heroSlide.ctaPrimaryLink.startsWith('#')) {
        document.getElementById(heroSlide.ctaPrimaryLink.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = heroSlide.ctaPrimaryLink;
      }
    } else {
      document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSecondaryClick = () => {
    if (heroSlide?.ctaSecondaryLink) {
      if (heroSlide.ctaSecondaryLink.startsWith('#')) {
        document.getElementById(heroSlide.ctaSecondaryLink.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = heroSlide.ctaSecondaryLink;
      }
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lightbox functions
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1));
  }, [heroImages.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
  }, [heroImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') isRTL ? goToNext() : goToPrevious();
      if (e.key === 'ArrowRight') isRTL ? goToPrevious() : goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, isRTL, goToPrevious, goToNext]);

  if (isLoading) {
    return <HeroSkeleton />;
  }

  return (
    <section className="relative min-h-[90vh] bg-white overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-coolnet-purple/5 via-transparent to-coolnet-orange/5 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:order-2 text-right' : 'lg:order-1 text-left'}`}>

            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-coolnet-purple/10 rounded-full border border-coolnet-purple/20">
                <Wifi className="w-4 h-4 text-coolnet-orange" />
                <span className={`text-sm font-semibold text-coolnet-purple ${font}`}>
                  {badge}
                </span>
              </div>
            )}

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className={`text-5xl md:text-6xl lg:text-7xl ${isRTL ? 'font-black' : 'font-bold'} text-gray-900 leading-tight ${font}`}>
                {title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Feature Pills - Dynamic from CMS */}
            {(heroStatSpeed || heroStatUptime || heroStatSupport) && (
              <div className="flex flex-wrap gap-4">
                {heroStatSpeed && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                    <Zap className="w-5 h-5 text-coolnet-orange" />
                    <span className="font-semibold text-gray-900">{heroStatSpeed}</span>
                  </div>
                )}
                {heroStatUptime && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                    <Shield className="w-5 h-5 text-coolnet-orange" />
                    <span className="font-semibold text-gray-900">{heroStatUptime}</span>
                  </div>
                )}
                {heroStatSupport && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
                    <Wifi className="w-5 h-5 text-coolnet-orange" />
                    <span className="font-semibold text-gray-900">{heroStatSupport}</span>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className={`flex flex-wrap gap-4 ${isRTL ? 'justify-end lg:justify-start' : 'justify-start'}`}>
              <Button
                onClick={scrollToPlans}
                className={`bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light text-white hover:from-coolnet-orange-light hover:to-coolnet-orange-dark px-8 py-6 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-coolnet-orange/25 inline-flex items-center gap-3 border-0 ${font}`}
              >
                {ctaPrimaryText}
                {isRTL ? (
                  <ArrowRight className="w-5 h-5 rotate-180" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </Button>

              <Button
                onClick={handleSecondaryClick}
                variant="outline"
                className={`px-8 py-6 rounded-full text-lg font-bold border-2 border-coolnet-purple text-coolnet-purple hover:bg-coolnet-purple hover:text-white transition-all duration-300 ${font}`}
              >
                {ctaSecondaryText}
              </Button>
            </div>
          </div>

          {/* Right: Image Grid — only if CMS provides images */}
          {heroImages.length > 0 && (
          <div className={`relative ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className={`grid ${getGridClass()} gap-4 h-[500px] md:h-[600px]`}>
              {heroImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => openLightbox(index)}
                  className={`${getImageSpan(index)} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer relative bg-gray-100`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-coolnet-purple/20 via-transparent to-coolnet-orange/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Click indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-3 shadow-lg">
                      <svg className="w-6 h-6 text-coolnet-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating stats card — only if customer count is set in CMS */}
            {heroCustomerCount && (
              <div className="absolute -bottom-6 left-4 bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 hidden lg:block z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-coolnet-orange to-coolnet-orange-light rounded-xl flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-coolnet-purple">{heroCustomerCount}</p>
                    <p className="text-sm text-gray-600 font-medium">{t('hero.happyCustomers')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          {/* Image counter - only show if more than 1 image */}
          {heroImages.length > 1 && (
            <div className="absolute top-4 left-4 text-white/80 text-lg font-medium">
              {currentImageIndex + 1} / {heroImages.length}
            </div>
          )}

          {/* Previous button - only show if more than 1 image */}
          {heroImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRTL ? goToNext() : goToPrevious();
              }}
              className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10`}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next button - only show if more than 1 image */}
          {heroImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                isRTL ? goToPrevious() : goToNext();
              }}
              className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10`}
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Main image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={heroImages[currentImageIndex]?.src}
              alt={heroImages[currentImageIndex]?.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Thumbnail strip - only show if more than 1 image */}
          {heroImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-xl">
              {heroImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-16 h-12 rounded-lg overflow-hidden transition-all ${
                    index === currentImageIndex
                      ? 'ring-2 ring-coolnet-orange scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
