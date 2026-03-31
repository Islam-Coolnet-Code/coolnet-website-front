import React from 'react';
import { usePartners } from '@/services/cms/hooks';
import { useLanguage } from '@/context/LanguageContext';
import { getMediaUrl } from '@/services/cms/api';

const PartnersSection: React.FC = () => {
  const { data: partners, isLoading } = usePartners();
  const { t, language } = useLanguage();

  if (isLoading || !partners || partners.length === 0) return null;

  const getName = (partner: any) => {
    if (typeof partner.name === 'object' && partner.name !== null) {
      if (language === 'ar') return partner.name.ar;
      if (language === 'he') return partner.name.he || partner.name.en;
      return partner.name.en;
    }
    return partner.name || '';
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('partners.title')}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-12">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.websiteUrl || '#'}
              target={partner.websiteUrl ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              {partner.media ? (
                <img
                  src={getMediaUrl(partner.media.fileUrl)}
                  alt={getName(partner)}
                  className="h-12 object-contain"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-400">
                  {getName(partner)}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
