import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouters, MultiLangText, getMediaUrl } from '@/services/cms';

// Helper to get localized text
const getLocalizedText = (text: MultiLangText | null, language: string): string => {
    if (!text) return '';
    if (language === 'ar') return text.ar;
    if (language === 'he') return text.he;
    return text.en;
};

interface RouterSelectionStepProps {
    selectedRouterId: string;
    setSelectedRouterId: (routerId: string) => void;
}

const RouterSelectionStep: React.FC<RouterSelectionStepProps> = ({
    selectedRouterId,
    setSelectedRouterId,
}) => {
    const { t, language } = useLanguage();

    // Fetch routers from CMS
    const { data: cmsRouters, isLoading } = useRouters();

    const handleRouterClick = (routerId: string) => {
        // If the router is already selected, unselect it
        if (selectedRouterId === routerId) {
            setSelectedRouterId('');
        } else {
            setSelectedRouterId(routerId);
        }
    };

    const handleRemoveSelection = () => {
        setSelectedRouterId('');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-coolnet-purple" />
            </div>
        );
    }

    // Map CMS routers to display format
    const routers = (cmsRouters || []).map((router) => ({
        id: router.sku,
        title: getLocalizedText(router.title, language),
        description: getLocalizedText(router.description, language),
        imageUrl: router.media?.fileUrl ? getMediaUrl(router.media.fileUrl) : '/images/router-placeholder.png',
        purchasePrice: router.purchasePrice.amount,
        rentalPrice: router.rentalPrice?.amount || 0,
        isRentable: router.isRentable,
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg text-white">
                    {t('order.newLine.router.selectRouter') || 'Select a Router'}
                </h3>
                {selectedRouterId && (
                    <Button
                        onClick={handleRemoveSelection}
                        variant="outline"
                        className="border-coolnet-purple text-white bg-coolnet-purple hover:text-coolnet-purple hover:bg-white"
                    >
                        {t('order.newLine.router.removeSelection') || 'Remove Selection'}
                    </Button>
                )}
            </div>

            {routers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                    {t('order.newLine.router.noRouters') || 'No routers available'}
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {routers.map((router) => (
                        <div
                            key={router.id}
                            onClick={() => handleRouterClick(router.id)}
                            className={`
                                cursor-pointer
                                p-4
                                rounded-2xl
                                border
                                bg-gray-800/50
                                text-white
                                shadow-lg
                                transition-all
                                duration-300
                                ease-in-out
                                transform
                                ${selectedRouterId === router.id
                                    ? 'ring-4 ring-coolnet-orange scale-[1.03]'
                                    : 'hover:ring-2 hover:ring-coolnet-purple hover:scale-[1.03]'}
                            `}
                        >
                            <img
                                src={router.imageUrl}
                                alt={router.title}
                                className="rounded-xl mb-4 w-full h-40 object-contain"
                            />
                            <h4 className="font-semibold text-lg mb-2">{router.title}</h4>
                            <p className="text-sm text-gray-400 mb-2">
                                {router.isRentable && router.rentalPrice > 0
                                    ? `${t('order.newLine.router.rentFor') || 'Rent for'} ₪${router.rentalPrice}/mo`
                                    : `${t('order.newLine.router.buyFor') || 'Buy for'} ₪${router.purchasePrice}`}
                            </p>

                            {router.description && (
                                <ul className="text-sm text-white mt-2 list-disc list-inside space-y-1">
                                    {router.description
                                        .split('.')
                                        .filter((sentence: string) => sentence.trim())
                                        .map((sentence: string, idx: number) => (
                                            <li key={idx}>{sentence.trim()}.</li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RouterSelectionStep;
