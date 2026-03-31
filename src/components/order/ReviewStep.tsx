import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { FormData } from '@/types/orderTypes';
import { useRouters, useSiteSettings, Router as CMSRouter, MultiLangText, getMediaUrl } from '@/services/cms';
import { fetchZones } from '@/services/zones/api';
import { transformZoneFromApi, getZoneNameByLanguage } from '@/utils/zoneUtils';
import { Zone } from '@/types/zoneTypes';

// Plan interface for component props (from parent)
interface PlanProp {
    id: string;
    title: string;
    price: number | string;
    speed: {
        download: string;
        upload?: string;
    };
}

interface ReviewStepProps {
    formData: FormData;
    planType: 'personal' | 'business';
    selectedPlan: PlanProp | undefined;
    selectedRouterId: string;
    onTermsAcceptedChange: (accepted: boolean) => void;
}

// Helper to get localized text
const getLocalizedText = (text: MultiLangText | null, language: string): string => {
    if (!text) return '';
    if (language === 'ar') return text.ar || text.en;
    if (language === 'he') return text.he || text.en;
    return text.en;
};

// Helper to get setting value by key
const getSettingValue = (settings: Array<{ key: string; valueAr: string | null; valueEn: string | null; valueHe: string | null }>, key: string, language: string): string => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return '';
    if (language === 'ar') return setting.valueAr || setting.valueEn || '';
    if (language === 'he') return setting.valueHe || setting.valueEn || '';
    return setting.valueEn || '';
};

const ReviewStep: React.FC<ReviewStepProps> = ({
    formData,
    planType,
    selectedPlan,
    selectedRouterId,
    onTermsAcceptedChange
}) => {
    const { t, language } = useLanguage();
    const { font } = useFont();
    const isRTL = language === 'ar';

    // Fetch routers from CMS
    const { data: cmsRouters } = useRouters();

    // Fetch site settings for add-on prices
    const { data: siteSettings } = useSiteSettings();

    // Get add-on prices from CMS settings only
    const FIXED_IP_PRICE = siteSettings ? parseFloat(getSettingValue(siteSettings, 'fixed_ip_price', 'en') || '0') : 0;
    const AP_FILTER_PRICE = siteSettings ? parseFloat(getSettingValue(siteSettings, 'ap_filter_price', 'en') || '0') : 0;

    // State for zones to display zone name in current language
    const [zones, setZones] = useState<Zone[]>([]);
    // State for terms acceptance
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Load zones for display
    useEffect(() => {
        const loadZones = async () => {
            try {
                const response = await fetchZones();
                const transformedZones = response.data.map(transformZoneFromApi);
                setZones(transformedZones);
            } catch (error) {
                console.error('Error loading zones for review:', error);
            }
        };
        loadZones();
    }, []);

    // Function to get zone display name in current language
    const getZoneDisplayName = (zoneArabicName: string): string => {
        const zone = zones.find(z => z.nameAr === zoneArabicName);
        return zone ? getZoneNameByLanguage(zone, language) : zoneArabicName;
    };

    // Handle terms acceptance change
    const handleTermsAcceptedChange = (checked: boolean) => {
        setTermsAccepted(checked);
        onTermsAcceptedChange(checked);
    };

    // Find selected router from CMS data
    const findRouter = (routerId: string): CMSRouter | undefined => {
        if (!cmsRouters) return undefined;
        // Try to find by id (number) or sku (string)
        const numId = parseInt(routerId, 10);
        return cmsRouters.find(r => r.id === numId || r.sku === routerId);
    };

    // Calculate order summary
    const calculateOrderSummary = () => {
        const items = [];
        let monthlyTotal = 0;
        let oneTimeTotal = 0;

        // Add main internet plan
        if (selectedPlan && selectedPlan.id !== 'business-custom') {
            const planPrice = typeof selectedPlan.price === 'number' ? selectedPlan.price : 0;
            items.push({
                name: `${selectedPlan.title} (${selectedPlan.speed.download}${selectedPlan.speed.upload ? '/' + selectedPlan.speed.upload : ''})`,
                type: t('order.newLine.orderSummary.internetService'),
                price: planPrice,
                isMonthly: true,
                qty: 1
            });
            monthlyTotal += planPrice;
        }

        // Add fixed IP if selected
        if (formData.fixedIp) {
            items.push({
                name: t('order.newLine.fixedIp'),
                type: t('order.newLine.orderSummary.fixedIpService'),
                price: FIXED_IP_PRICE,
                isMonthly: true,
                qty: 1
            });
            monthlyTotal += FIXED_IP_PRICE;
        }

        // Add AP filter if selected
        if (formData.apFilter) {
            items.push({
                name: t('order.newLine.apFilter'),
                type: t('order.newLine.orderSummary.apFilterService'),
                price: AP_FILTER_PRICE,
                isMonthly: true,
                qty: 1
            });
            monthlyTotal += AP_FILTER_PRICE;
        }

        // Add router if selected (from CMS)
        if (selectedRouterId) {
            const router = findRouter(selectedRouterId);
            if (router) {
                const isRental = router.isRentable && router.rentalPrice;
                const price = isRental && router.rentalPrice
                    ? router.rentalPrice.amount
                    : router.purchasePrice.amount;

                items.push({
                    name: getLocalizedText(router.title, language),
                    type: isRental ? t('order.newLine.orderSummary.routerRental') : t('order.newLine.orderSummary.routerPurchase'),
                    price: price,
                    isMonthly: isRental,
                    qty: 1
                });

                if (isRental) {
                    monthlyTotal += price;
                } else {
                    oneTimeTotal += price;
                }
            }
        }

        return { items, monthlyTotal, oneTimeTotal };
    };

    const { items, monthlyTotal, oneTimeTotal } = calculateOrderSummary();

    return (
        <div className="space-y-6">
            <h3 className="font-medium text-lg text-white">{t('order.newLine.review')}</h3>


            {/* Personal Information Summary */}
            <div className="p-4 rounded-lg border bg-gray-50">
                <h4 className="font-semibold mb-3">{t('order.newLine.personalInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">{t('order.newLine.firstName')}</span>: {formData.firstName}</div>
                    <div><span className="font-medium">{t('order.newLine.lastName')}</span>: {formData.lastName}</div>
                    <div><span className="font-medium">{t('order.newLine.phone')}</span>: {formData.phone}</div>

                    <div><span className="font-medium">{t('order.newLine.identity')}</span>: {formData.id}</div>
                </div>
            </div>
            {/* Address Summary */}
            {formData.address && (
                <div className="p-4 rounded-lg border bg-coolnet-purple/10">
                    <h4 className="font-semibold mb-3">{t('order.newLine.address')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">{t('order.newLine.zone')}</span>: {getZoneDisplayName(formData.address.zone)}</div>
                        <div><span className="font-medium">{t('order.newLine.street')}</span>: {formData.address.street}</div>
                        <div><span className="font-medium">{t('order.newLine.houseNumber')}</span>: {formData.address.houseNumber}</div>
                        <div><span className="font-medium">{t('order.newLine.details')}</span>: {formData.address.details}</div>
                    </div>
                </div>
            )}
            {/* Plan Summary Sections */}
            {(() => {
                // Calculate how many sections will be displayed
                const sectionsCount = [
                    selectedPlan, // Plan details
                    selectedRouterId, // Router details
                    (formData.fixedIp || formData.apFilter) // Additional options
                ].filter(Boolean).length;

                const gridCols = sectionsCount === 1 ? 'md:grid-cols-1' :
                    sectionsCount === 2 ? 'md:grid-cols-2' :
                        'md:grid-cols-3';

                return (
                    <div className={`grid gap-4 ${gridCols}`}>
                        {/* Main Plan Details */}
                        {selectedPlan && (
                            <div className="p-4 rounded-lg border bg-coolnet-purple/10">
                                <h4 className="font-semibold mb-3 text-coolnet-purple-dark">{t('order.newLine.selectedPlanDetails')}</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">{t('order.newLine.planType')}</span>: {t(`order.newLine.${planType}`)}</div>
                                    <div><span className="font-medium">{t('order.newLine.planName')}</span>: {selectedPlan.title}</div>
                                    {selectedPlan.id !== 'business-custom' && (
                                        <>
                                            <div><span className="font-medium">{t('order.newLine.speed')}</span>: {selectedPlan.speed.download}{selectedPlan.speed.upload ? ' / ' + selectedPlan.speed.upload : ''}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Router Details (if selected) - from CMS */}
                        {selectedRouterId && (
                            <div className="p-4 rounded-lg border bg-yellow-50">
                                <h4 className="font-semibold mb-3 text-yellow-800">{t('order.newLine.router.selected')}</h4>
                                <div className="flex items-start gap-3">
                                    {(() => {
                                        const router = findRouter(selectedRouterId);
                                        if (!router) return <div className="text-sm text-gray-500">Router not found</div>;

                                        const imageUrl = router.media?.fileUrl
                                            ? getMediaUrl(router.media.fileUrl)
                                            : '/images/routers/default.png';

                                        return (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt={getLocalizedText(router.title, language)}
                                                    className="w-20 h-20 object-contain rounded border bg-white flex-shrink-0"
                                                />
                                                <div className="flex-1 text-sm space-y-1">
                                                    <div className="font-medium">{getLocalizedText(router.title, language)}</div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Additional Options (if selected) */}
                        {(formData.fixedIp || formData.apFilter) && (
                            <div className="p-4 rounded-lg border bg-green-50">
                                <h4 className="font-semibold mb-3 text-green-800">{t('order.newLine.additionalOptions')}</h4>
                                <div className="space-y-2 text-sm">
                                    {formData.fixedIp && (
                                        <div className="flex justify-between items-center">
                                            <span>✓ {t('order.newLine.fixedIp')}</span>
                                        </div>
                                    )}
                                    {formData.apFilter && (
                                        <div className="flex justify-between items-center">
                                            <span>✓ {t('order.newLine.apFilter')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Order Summary */}
            <div className="p-6 rounded-lg border-2 border-coolnet-purple bg-gradient-to-r from-coolnet-purple/10 to-coolnet-purple/10">
                <h4 className="font-bold text-xl text-white mb-4">{t('order.newLine.orderSummary.title')}</h4>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className={`py-2 text-white font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t('order.newLine.orderSummary.service')}
                                </th>
                                <th className="text-center py-2 text-white font-semibold w-16">
                                    {t('order.newLine.orderSummary.qty')}
                                </th>
                                <th className={`py-2 text-white font-semibold w-24 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    {t('order.newLine.orderSummary.price')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200/20">
                                    <td className={`py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-300">{item.type}</div>
                                    </td>
                                    <td className="text-center py-3">{item.qty}</td>
                                    <td className={`py-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                                        ₪{item.price}
                                        <div className="text-xs text-gray-300">
                                            {item.isMonthly ? t('order.newLine.orderSummary.month') : t('order.newLine.orderSummary.oneTime')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="mt-4 pt-4">
                    <div className="flex justify-between items-center pt-2 border-t border-white">
                        <span className="text-white font-bold text-xl">{t('order.newLine.orderSummary.total')}</span>
                        <div className="text-right">
                            {monthlyTotal > 0 && (
                                <div className="text-white font-bold text-xl">₪{monthlyTotal}{t('order.newLine.orderSummary.month')}</div>
                            )}
                            {oneTimeTotal > 0 && (
                                <div className="text-white font-bold text-lg">₪{oneTimeTotal} {t('order.newLine.orderSummary.oneTime')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions */}
            <div className="p-6 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md">
                <h4 className="font-bold text-lg text-white mb-4">{t('activateService.form.terms')}</h4>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg space-y-3 max-h-64 overflow-y-auto">
                    <div className="space-y-2 text-sm text-white/90">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <div key={num} className={`flex items-start ${isRTL ? 'flex-row-reverse space-x-reverse gap-2' : 'space-x-2'}`}>
                                <span className="text-coolnet-orange font-medium flex-shrink-0">{num}.</span>
                                <p className={`${font} ${isRTL ? 'text-right' : 'text-left'} flex-1`}>
                                    {t(`activateService.form.termsDetails.term${num}`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Terms Acceptance Checkbox */}
                <div className="mt-6 pt-4 border-t border-white/20">
                    <label className={`flex items-start cursor-pointer ${isRTL ? 'flex-row-reverse gap-3' : 'gap-3'}`}>
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => handleTermsAcceptedChange(e.target.checked)}
                            className="mt-1 w-4 h-4 text-coolnet-orange bg-white/10 border-white/30 rounded focus:ring-coolnet-orange focus:ring-2 flex-shrink-0"
                        />
                        <span className={`text-white text-sm ${font} ${isRTL ? 'text-right' : 'text-left'} flex-1`}>
                            {t('activateService.form.acceptTerms')}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
