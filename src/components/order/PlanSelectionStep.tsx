import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Plan } from '@/utils/Plans/Plans';
import PlanComponent from '@/components/Plan';
import { Label } from '@/components/ui/label';
import { RequiredAsterisk } from '../RequiredAsterisk';
import { getUpsellPlans, isPlanPreselected, getUpsellMessage } from '@/utils/planUpsellUtils';
import { ValidationErrors } from '@/types/validationTypes';

interface PlanSelectionStepProps {
    planType: 'personal' | 'business';
    setPlanType: (type: 'personal' | 'business') => void;
    selectedPlanId: string;
    setSelectedPlanId: (planId: string) => void;
    personalPlans: Plan[];
    retailPlans: Plan[];
    fixedIp: boolean;
    setFixedIp: (value: boolean) => void;
    apFilter: boolean;
    setApFilter: (value: boolean) => void;
    initialPreselectedPlanId?: string; // Add this prop to track the original preselection
    validationErrors?: ValidationErrors;
    triggerValidation?: boolean;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
    selectedPlanId,
    setSelectedPlanId,
    personalPlans,
    fixedIp,
    setFixedIp,
    apFilter,
    setApFilter,
    initialPreselectedPlanId,
    validationErrors = {},
    triggerValidation = false
}) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const currency = '₪';

    // Check if a plan was preselected and get appropriate plans to display
    const isPreselected = isPlanPreselected(initialPreselectedPlanId);
    const plansToShow = getUpsellPlans(selectedPlanId, personalPlans, initialPreselectedPlanId);
    const upsellMessage = selectedPlanId ? getUpsellMessage(selectedPlanId, t) : '';

    const handlePlanSelect = (planId: string, e?: React.MouseEvent) => {
        // Prevent form submission
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setSelectedPlanId(planId);
    };

    return (
        <div className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg text-white">
                    {isPreselected ? t('order.newLine.preselectedPlan') : t('order.newLine.planSelection')}
                    <RequiredAsterisk />
                </h3>

                {/* Plan validation error */}
                {validationErrors.plan && (
                    <div className={`p-3 rounded-lg border border-red-500 bg-red-500/10 ${triggerValidation ? 'animate-vibrate' : ''}`}>
                        <p className="text-red-400 text-sm">
                            {validationErrors.plan}
                        </p>
                    </div>
                )}

                {/* Show upsell message if there's a selected plan */}
                {selectedPlanId && upsellMessage && (
                    <div className="p-4 rounded-lg border border-coolnet-orange/50 bg-coolnet-orange/10">
                        <p className="text-white/90 text-sm">{upsellMessage}</p>
                    </div>
                )}

                {/* Responsive grid layout for plan selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansToShow.map((plan) => {
                        const isCurrentSelection = selectedPlanId === plan.id;
                        
                        return (
                            <div
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan.id)}
                                className={`
                                    cursor-pointer
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    transform
                                    rounded-2xl
                                    ${isCurrentSelection
                                        ? 'ring-4 ring-coolnet-orange scale-[1.03]'
                                        : 'hover:ring-2 hover:ring-coolnet-purple hover:scale-[1.03]'}
                                `}
                            >
                                <PlanComponent
                                    id={plan.id}
                                    title={plan.title}
                                    price={plan.price}
                                    speed={plan.speed}
                                    features={plan.features}
                                    isBestValue={plan.isBestValue}
                                    currency={currency}
                                    color={plan.color}
                                    isPlus={plan.isPlus}
                                    showOrder={false}
                                    isNewLineForm={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* Additional Options */}
            {selectedPlanId && (
                <div className="space-y-4 animate-fadeIn" >
                    <h3 className="font-medium text-lg text-white">{t('order.newLine.additionalOptions')}</h3>

                    <div className="space-y-3">
                        {/* Fixed IP Checkbox */}
                        <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 rounded-lg border border-gray-600 bg-gray-800/30">
                            <input
                                type="checkbox"
                                id="fixedIp"
                                checked={fixedIp}
                                onChange={(e) => setFixedIp(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-coolnet-orange focus:ring-coolnet-orange focus:ring-offset-0 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="fixedIp" className="block font-medium text-white cursor-pointer">
                                        {t('order.newLine.fixedIp')}
                                    </Label>
                                    <span className="text-sm text-gray-400">
                                        +{t('order.newLine.fixedIpPrice')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    {t('order.newLine.fixedIpDescription')}
                                </p>
                            </div>
                        </div>

                        {/* AP Filter Checkbox */}
                        <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 rounded-lg border border-gray-600 bg-gray-800/30">
                            <input
                                type="checkbox"
                                id="apFilter"
                                checked={apFilter}
                                onChange={(e) => setApFilter(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-coolnet-orange focus:ring-coolnet-orange focus:ring-offset-0 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="apFilter" className="block font-medium text-white cursor-pointer">
                                        {t('order.newLine.apFilter')}
                                    </Label>
                                    <span className="text-sm text-gray-400">
                                        +{t('order.newLine.apFilterPrice')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                    {t('order.newLine.apFilterDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default PlanSelectionStep;