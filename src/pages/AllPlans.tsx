import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { useSEO } from '@/hooks/use-seo';
import { usePersonalPlans, useBusinessPlans, Plan as CmsPlan, MultiLangText } from '@/services/cms';
import Plan from '@/components/Plan';
import Footer from '@/components/Footer';
import { PlanCardSkeleton } from '@/components/ui/skeletons';
import { Sparkles, Building2 } from 'lucide-react';

// Helper to get localized text
const getLocalizedText = (text: MultiLangText | null, language: string): string => {
  if (!text) return '';
  if (language === 'ar') return text.ar;
  if (language === 'he') return text.he;
  return text.en;
};

const AllPlans: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar' || language === 'he';

  // SEO
  useSEO({
    title: t('allPlans.title'),
    description: t('allPlans.seoDescription'),
  });

  // Fetch plans
  const { data: personalPlans, isLoading: loadingPersonal } = usePersonalPlans();
  const { data: businessPlans, isLoading: loadingBusiness } = useBusinessPlans();

  const currency = '₪';

  // Map plans to component format
  const mapPlans = (plans: CmsPlan[] | undefined) =>
    (plans || []).map((plan) => ({
      id: plan.code,
      title: getLocalizedText(plan.title, language),
      price: plan.price.amount,
      speed: { download: plan.downloadSpeed },
      features: plan.features.map((f) => getLocalizedText(f.text, language)),
      isBestValue: Boolean(plan.isBestValue),
      color: plan.color,
      isPlus: Boolean(plan.isPlus),
      isCustom: Boolean(plan.isCustom),
    }));

  const personalPlansMapped = mapPlans(personalPlans);
  const businessPlansMapped = mapPlans(businessPlans);

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
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 ${font}`}>
              {t('allPlans.title')}
            </h1>
            <p className={`text-xl text-white/80 max-w-2xl mx-auto ${font}`}>
              {t('allPlans.subtitle')}
            </p>
          </div>
        </section>

        {/* Personal Plans Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Sparkles className="w-8 h-8 text-coolnet-orange" />
              <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 ${font}`}>
                {t('plans.personal')}
              </h2>
            </div>

            {loadingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : personalPlansMapped.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {personalPlansMapped.map((plan) => (
                  <Plan
                    key={plan.id}
                    id={plan.id}
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
            ) : (
              <p className={`text-center text-gray-500 ${font}`}>
                {t('allPlans.noPlans')}
              </p>
            )}
          </div>
        </section>

        {/* Business Plans Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Building2 className="w-8 h-8 text-coolnet-purple" />
              <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 ${font}`}>
                {t('plans.business')}
              </h2>
            </div>

            {loadingBusiness ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : businessPlansMapped.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {businessPlansMapped.map((plan) => (
                  <Plan
                    key={plan.id}
                    id={plan.id}
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
            ) : (
              <p className={`text-center text-gray-500 ${font}`}>
                {t('common.noData') || 'No business plans available'}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AllPlans;
