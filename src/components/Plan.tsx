import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFont } from '@/hooks/use-font';
import PlanSpeedGauge from './PlanSpeedGauge';

interface PlanProps {
  id: string,
  title: string;
  price: string | number;
  speed: {
    download: string;
    // upload: string;
  };
  features: string[];
  isBestValue?: boolean;
  currency: string;
  color?: string;
  isPlus?: boolean;
  isCustom?: boolean;
  ctaText?: string;
  business?: boolean,
  showOrder?: boolean,
  isNewLineForm?: boolean; // New prop to control layout for new-line form
}
const Plan: React.FC<PlanProps> = ({
  id = '',
  title,
  price,
  speed,
  features,
  isBestValue,
  isPlus = false,
  currency,
  color = 'bg-coolnet-purple',
  business,
  showOrder = true,
  isNewLineForm = false
}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const isCustomPlan = id === 'business-custom';
  const { font } = useFont();
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  // Enhanced display title with better styling
  const displayTitle = isPlus ? (
    <div className="flex items-center justify-center">
      <span className="text-white">{title.replace('+', '')}</span>
      <span className="inline-flex items-center justify-center ml-2 w-7 h-7 bg-white/20 rounded-full text-coolnet-orange font-bold text-lg backdrop-blur-sm">
        +
      </span>
    </div>
  ) : title;

  const handlenavigation = (id: string) => {
    if (isCustomPlan || business) {
      // Business plans disabled - navigate to contact or do nothing
      return;
    } else {
      const data = { id: id || '' };
      navigate('/new-line', { state: { data } });
      window.scrollTo(0, 0);
    }
  }

  // Simplified formal design for new line form
  if (isNewLineForm) {
    return (
      <div className="relative rounded-2xl border border-gray-600 bg-gray-800/50 overflow-hidden">
        {/* Simple Header */}
        <div className="p-4 border-b border-gray-600">
          <h3 className={`text-lg font-semibold text-center text-white ${font}`}>
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Speed Info */}
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">{t('plans.download')}</div>
            <div className="text-xl font-bold text-white">{speed.download}</div>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm font-medium text-gray-400">{currency}</span>
              <span className="text-2xl font-bold text-white">{price}</span>
              <span className="text-sm font-medium text-gray-400">{t('plans.month')}</span>
            </div>
          </div>

          {/* Learn More Button */}
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFeaturesModal(true);
            }}
            className="w-full text-sm border-gray-600 text-coolnet-purple hover:bg-white hover:text-coolnet-purple/90 transition-colors rounded-md"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('plans.readMoreFeatures')}
          </Button>
        </div>

        {/* Features Modal for New Line Form */}
        {showFeaturesModal && createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-jazeera">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold text-gray-800 ${font}`}>
                    {title} - {t('plans.featuresModalTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowFeaturesModal(false);
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {/* Speed Info */}
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-800 mb-2">{t('plans.speedDetails')}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{t('plans.download')}: {speed.download}</div>
                      {/* <div>{t('plans.upload')}: {speed.upload}</div> */}
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">{t('plans.planFeatures')}</h4>
                    <ul className="space-y-2">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-coolnet-purple rounded-full mt-2 flex-shrink-0"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Original design for regular website usage
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${'shadow-lg hover:shadow-xl  bg-gradient-to-b from-white to-gray-50/30'
      }`}
      style={{
        contain: 'layout style paint',
        contentVisibility: 'auto'
      }}
    >

      {/* Header with enhanced gradient */}
      <div className={`relative p-6 overflow-hidden ${isCustomPlan
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
        : 'bg-coolnet-purple text-white text-6xl'

        }`}>

        {/* More Visible Header Pattern - Diagonal Stripes */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.2)_32%,rgba(255,255,255,0.2)_34%,transparent_36%)] bg-[size:20px_20px] group-hover:animate-pulse"></div>
        </div>



        <h3 className={`relative text-3xl whitespace-nowrap font-bold text-center ${isRTL ? 'font-jazeera' : ''} ${font} ${!isBestValue && !isPlus && !isCustomPlan ? 'text-white' : ''
          }`}>
          {displayTitle}
        </h3>
      </div>

      {/* Main content with enhanced spacing */}
      <div className="flex-1 flex flex-col items-center p-8 bg-white/80 backdrop-blur-sm relative">

        {/* Speed Display with Beautiful Gauge */}
        <div className="mb-8 text-center w-full">
          {/* Speed Gauge - Only normal dual gauge display for regular website */}
          <div className="mb-6 flex justify-center">
            <PlanSpeedGauge
              downloadSpeed={parseInt(speed.download.replace(/\D/g, '')) || 0}
              // uploadSpeed={parseInt(speed.upload.replace(/\D/g, '')) || 0}
              maxSpeed={1000}
              size="md"
              animate={true}
              business={business}
            />
          </div>
        </div>

        {/* Enhanced Price Display */}
        <div className="text-center mb-8">
          {isCustomPlan ? (
            <div className="relative">
              <span className={`text-2xl font-bold text-gray-800 ${font}`}>
                {t('plans.Business.custom.customPricing')}
              </span>
              <div className="mt-2 text-sm text-gray-500">{t('plans.Business.custom.tagline')}</div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center">
              {business && (
                <span className={`text-lg font-medium text-gray-500 ${font}`}>
                  {t('plans.startingAt')}
                </span>
              )}
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-lg font-semibold text-gray-600 ${font}`}>{currency}</span>
                <span className={`text-5xl font-black text-coolnet-purple ${font}`}>{price}</span>
                <span className={`text-lg font-medium text-gray-500 ${font}`}>{t('plans.month')}</span>
              </div>
              {/* Animated underline */}
              <div className={`mt-2 h-1 w-20 mx-auto rounded-full ${isBestValue ? 'bg-coolnet-orange' : 'bg-coolnet-purple'} group-hover:w-32 transition-all duration-300`}></div>
            </div>
          )}
        </div>

        {/* Enhanced CTA Button */}
        <div className="w-full">
          {showOrder && (
            <Button
              className={`w-full h-14 text-lg font-bold transition-all duration-300 ${isCustomPlan
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl'
                : isBestValue
                  ? 'bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light hover:from-coolnet-orange-light hover:to-coolnet-orange-dark shadow-lg hover:shadow-coolnet-orange/25'
                  : 'bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark hover:from-coolnet-purple-dark hover:to-coolnet-purple-darker shadow-lg hover:shadow-coolnet-purple/25'
                } text-white rounded-xl group relative overflow-hidden ${isRTL ? 'font-jazeera' : ''} ${font}`}
              onClick={() => handlenavigation(id)}
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

              <span className="relative flex items-center justify-center">


                {isCustomPlan || business ? (
                  <>
                    {t('plans.Business.businessPlanButtonText')}
                    {isRTL ? (
                      <>
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                      </>
                    ) : (
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </>
                ) : (
                  <>
                    <span>{t('plans.ctaText')}

                    </span>
                    {isRTL ? (
                      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </>
                )}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Features Modal - Rendered as Portal */}
      {showFeaturesModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-jazeera">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold text-gray-800 ${font}`}>
                  {title} - {t('plans.featuresModalTitle')}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFeaturesModal(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Speed Info */}
                <div className="bg-gradient-to-r from-coolnet-purple/10 to-coolnet-purple-light/10 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">{t('plans.speedDetails')}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{t('plans.download')}: {speed.download}</div>
                    {/* <div>{t('plans.upload')}: {speed.upload}</div> */}
                  </div>
                </div>

                {/* Features List */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">{t('plans.planFeatures')}</h4>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-coolnet-purple rounded-full mt-2 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Plan;