import React from 'react';
import { useTestimonials } from '@/services/cms/hooks';
import { useLanguage } from '@/context/LanguageContext';
import { Star } from 'lucide-react';
import { useFont } from '@/hooks/use-font';
import type { Testimonial } from '@/services/cms/api';

const TestimonialsSection: React.FC = () => {
  const { data: testimonials, isLoading } = useTestimonials();
  const { t, language } = useLanguage();

  if (isLoading || !testimonials || testimonials.length === 0) return null;

  const getName = (t: Testimonial) => {
    if (language === 'ar') return t.nameAr;
    if (language === 'he') return t.nameHe || t.nameEn;
    return t.nameEn;
  };

  const getRole = (t: Testimonial) => {
    if (language === 'ar') return t.roleAr;
    if (language === 'he') return t.roleHe || t.roleEn;
    return t.roleEn;
  };

  const getContent = (t: Testimonial) => {
    if (language === 'ar') return t.contentAr;
    if (language === 'he') return t.contentHe || t.contentEn;
    return t.contentEn;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('testimonials.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{getContent(testimonial)}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {(getName(testimonial) || '').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{getName(testimonial)}</p>
                  {getRole(testimonial) && (
                    <p className="text-sm text-gray-500">{getRole(testimonial)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
