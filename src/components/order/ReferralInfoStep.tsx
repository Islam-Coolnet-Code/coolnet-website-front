import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { FormData } from '@/types/orderTypes';

interface ReferralInfoStepProps {
    formData: FormData;
}

const ReferralInfoStep: React.FC<ReferralInfoStepProps> = ({ formData }) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    const renderSourceLabel = () => {
        switch (formData.comingFrom) {
            case 'dealer':
                return t('order.newLine.referral.dealer');
            case 'employee':
                return t('order.newLine.referral.employee');
            case 'social':
                return t('order.newLine.referral.social');
            default:
                return t('order.newLine.referral.unknown');
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-lg text-white">
                {t('order.newLine.referralInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-white">
                        {t('order.newLine.comingFrom')}
                    </Label>
                    <div
                        className={`text-white border border-white/20 rounded-md p-2 bg-white/10 ${isRTL ? 'text-right' : 'text-left'
                            }`}
                    >
                        {renderSourceLabel()}
                    </div>
                </div>

                {(formData.comingFrom === 'dealer' || formData.comingFrom === 'employee') && (
                    <div className="space-y-2">
                        <Label className="text-white">
                            {t('order.newLine.dealerNumber')}
                        </Label>
                        <div
                            className={`text-white border border-white/20 rounded-md p-2 bg-white/10 ${isRTL ? 'text-right' : 'text-left'
                                }`}
                        >
                            {formData.dealerNumber || t('order.newLine.notProvided')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferralInfoStep;
