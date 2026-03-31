import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import { useFont } from "@/hooks/use-font";
import { usePersonalPlans, Plan as CMSPlan, MultiLangText } from "@/services/cms";
import Plan from "@/components/Plan";
import { PlanCardSkeleton } from "@/components/ui/skeletons";

// Helper to get localized text
const getLocalizedText = (text: MultiLangText | null, language: string): string => {
  if (!text) return '';
  if (language === 'ar') return text.ar || text.en;
  if (language === 'he') return text.he || text.en;
  return text.en;
};

// Helper to get localized feature text
const getLocalizedFeature = (feature: { text: MultiLangText }, language: string): string => {
  return getLocalizedText(feature.text, language);
};

const HomeServices = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === "ar" || language === "he";

  // Fetch personal plans from CMS
  const { data: cmsPlans, isLoading, error } = usePersonalPlans();

  // Filter out custom plans for standard display
  const standardPlans = cmsPlans?.filter((plan) => !plan.isCustom) || [];

  // Map CMS plan to component props
  const mapPlanToProps = (plan: CMSPlan) => ({
    id: plan.code,
    title: getLocalizedText(plan.title, language),
    price: plan.price.amount,
    speed: {
      download: plan.downloadSpeed,
    },
    features: plan.features
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((f) => getLocalizedFeature(f, language)),
    isBestValue: plan.isBestValue,
    currency: plan.price.currency === 'ILS' ? '₪' : plan.price.currency,
    color: plan.color || 'bg-coolnet-purple',
    isPlus: plan.isPlus,
    isCustom: plan.isCustom,
  });

  return (
    <div>
      <div
        className={`min-h-screen relative overflow-hidden ${font} bg-white`}
      >
        <section className="relative py-16">
          <div className="relative container mx-auto px-4">
            <div className="relative container mx-auto px-4 mb-8">
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 text-center justify-center">
                  <h1
                    className={`text-6xl ${
                      isRTL ? "font-black" : "font-bold"
                    } text-gray-900 ${font}`}
                  >
                    {t("plans.personal")}
                  </h1>
                </div>
              </div>
            </div>

            <hr className="h-1 border-0 bg-gradient-to-r from-transparent via-coolnet-orange to-transparent" />

            <div className="relative container mx-auto px-4 mb-6 mt-24">
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 text-center justify-center">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent to-coolnet-orange"></div>
                  <h1
                    className={`text-4xl ${
                      isRTL ? "font-black" : "font-bold"
                    } text-gray-900 ${font}`}
                  >
                    {t("plans.Personal.services.home")}
                  </h1>
                  <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-orange"></div>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className={`text-gray-500 ${font}`}>
                  {t('plans.error') || 'Failed to load plans'}
                </p>
              </div>
            ) : standardPlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {standardPlans.map((plan) => {
                  const props = mapPlanToProps(plan);
                  return (
                    <Plan
                      key={plan.id}
                      id={props.id}
                      title={props.title}
                      price={props.price}
                      speed={props.speed}
                      features={props.features}
                      isBestValue={props.isBestValue}
                      currency={props.currency}
                      color={props.color}
                      isPlus={props.isPlus}
                      business={false}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className={`text-gray-500 ${font}`}>
                  {t('allPlans.noPlans')}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HomeServices;
