import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFont } from '@/hooks/use-font';
import Plan from '@/components/Plan';
import { usePersonalPlans, useSiteSettings, Plan as CmsPlan } from '@/services/cms';
import { PlanCardSkeleton } from '@/components/ui/skeletons';
import { getLocalizedText } from '@/utils/i18n';

export const PlansSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const { font } = useFont();

  // Fetch plans and site settings from CMS
  const { data: cmsPlans, isLoading, error } = usePersonalPlans();
  const { data: siteSettings } = useSiteSettings();

  // Get currency from CMS or use default
  const currency = siteSettings?.find(s => s.key === 'currency_symbol')?.valueEn || '₪';

  // Map CMS plans to component format
  const personalPlans = (cmsPlans || []).map((plan: CmsPlan) => ({
    id: plan.code,
    title: getLocalizedText(plan.title, language),
    price: plan.price.amount,
    speed: {
      download: plan.downloadSpeed,
    },
    features: plan.features.map(f => getLocalizedText(f.text, language)),
    isBestValue: Boolean(plan.isBestValue),
    color: plan.color,
    isPlus: Boolean(plan.isPlus),
    isCustom: Boolean(plan.isCustom),
  }));

  return (
    <section
      id="plans"
      className="relative py-20 overflow-hidden bg-white"
    >
      <div className="relative container mx-auto px-4">

        {/* Personal Plans Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-coolnet-orange"></div>
            <h2 className={`text-6xl ${isRTL ? 'font-black' : 'font-bold'} text-gray-900 ${isRTL ? 'font-jazeera' : ''} ${font}`}>
              {t('plans.personal')}
            </h2>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-orange"></div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
            {[1, 2, 3].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-10 text-red-500">
            {t('common.errorLoading')}
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
            {personalPlans.map((plan) => (
              <Plan
                id={plan.id}
                key={plan.id}
                title={plan.title}
                price={plan.price}
                speed={plan.speed}
                features={plan.features}
                isBestValue={plan.isBestValue}
                currency={currency}
                color={plan.color}
                isPlus={plan.isPlus}
              />
            ))}
          </div>
        )}

        <div className='text-center mx-auto max-w-md mb-32'>
          <Button
            className={`w-full h-16 bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light hover:from-coolnet-orange-light hover:to-coolnet-orange-dark text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-coolnet-orange/25 transition-all duration-300 group relative overflow-hidden ${font}`}
            onClick={() => {
              navigate('/home-services');
            }}
          >
            {/* Button animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            {isRTL ? (
              <span className="relative flex items-center justify-center gap-3">
                {t('plans.readMoreServices')}
                <ArrowLeft className="w-6 h-6" />
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-3">
                <ArrowRight className="w-6 h-6" />
                {t('plans.readMoreServices')}
              </span>
            )}

          </Button>
        </div>
      </div>
    </section >
  );
};

export default PlansSection;
