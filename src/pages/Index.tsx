import React from 'react';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import { useLanguage } from '@/context/LanguageContext';
import PlansSection from '@/components/PlansSection';
import SpeedTestSection from '@/components/SpeedTestSection';
import PostsSection from '@/components/PostsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import PartnersSection from '@/components/PartnersSection';
import Footer from '@/components/Footer';
import InstallAppSection from '@/components/InstallAppSection';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { useHomepageSections } from '@/services/cms/hooks';

const sectionComponents: Record<string, React.FC> = {
  'hero': HeroSection,
  'plans': PlansSection,
  'features': FeaturesSection,
  'posts': PostsSection,
  'testimonials': TestimonialsSection,
  'partners': PartnersSection,
};


const Index: React.FC = () => {
  const { font } = useFont();
  const { language, t } = useLanguage();
  const { data: sections } = useHomepageSections();

  // Set SEO meta tags for the home page
  useSEO({
    title: t('seo.homeTitle'),
    description: t('seo.homeDescription'),
    keywords: t('seo.homeKeywords'),
  });

  // Use API sections only — no hardcoded fallbacks
  const visibleKeys = sections
    ? sections.map((s) => s.sectionKey)
    : [];

  return (
    <div className={`flex flex-col min-h-screen ${font}`}>
      <main>
        {visibleKeys.map((key) => {
          const Component = sectionComponents[key];
          if (!Component) return null;
          return <Component key={key} />;
        })}

        {/* Mobile-only "add Coolnet to your home screen" invitation. Rendered
            outside the CMS section map on purpose: it is a device capability,
            not editorial content, so it should not depend on someone having
            enabled a section in the admin panel. */}
        <InstallAppSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
