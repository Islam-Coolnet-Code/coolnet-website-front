import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Clock, Navigation, Store } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Shop } from '@/types/dealerTypes';

interface ShopListProps {
    shopsWithDistance: Shop[];
    selectedShop: Shop | null;
    userLocation: {lat: number; lng: number} | null;
    onShopSelect: (shop: Shop) => void;
}

const ShopList: React.FC<ShopListProps> = ({
    shopsWithDistance,
    selectedShop,
    userLocation,
    onShopSelect
}) => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    const getLocalizedText = (shop: Shop, field: 'name' | 'address' | 'hours') => {
        switch (field) {
            case 'name':
                return language === 'ar' ? shop.nameAr : language === 'he' ? shop.nameHe : shop.name;
            case 'address':
                return language === 'ar' ? shop.addressAr : language === 'he' ? shop.addressHe : shop.address;
            case 'hours':
                return language === 'ar' ? shop.hoursAr : language === 'he' ? shop.hoursHe : shop.hours;
        }
    };

    return (
        <>
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2 mx-2">
                <Store className="w-6 h-6" />
                {t('dealers.availableStores')}
                {userLocation && (
                    <span className="text-sm font-normal text-gray-300">
                        ({language === 'ar' ? 'مرتبة حسب المسافة' : 
                          language === 'he' ? 'ממוין לפי מרחק' : 
                          'sorted by distance'})
                    </span>
                )}
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto px-3 py-2 custom-scrollbar">
                {shopsWithDistance.map((shop, index) => (
                    <motion.div
                        key={shop.id}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            className={`cursor-pointer transition-all duration-300 overflow-hidden  bg-slate-800/60 backdrop-blur-sm border border-white/10 hover:shadow-2xl hover:border-white/20 hover:scale-[1.02] ${selectedShop?.id === shop.id
                                ? 'ring-2 ring-coolnet-purple shadow-2xl scale-[1.02]'
                                : ''
                                } ${userLocation && index === 0 ? 'border-coolnet-orange border-2 shadow-coolnet-orange/25' : ''}`}
                            onClick={() => onShopSelect(shop)}
                        >
                            <CardContent className="p-4 relative">
                                {/* Background decoration for selected card */}
                                {selectedShop?.id === shop.id && (
                                    <>
                                        <div className="absolute top-2 right-2 w-16 h-16 bg-coolnet-purple/10 rounded-full blur-xl"></div>
                                        <div className="absolute bottom-2 left-2 w-12 h-12 bg-coolnet-orange/10 rounded-full blur-lg"></div>
                                    </>
                                )}
                                
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex-1">
                                        {userLocation && index === 0 && (
                                            <div className="inline-block bg-coolnet-orange/20 text-coolnet-orange text-xs font-semibold px-3 py-1.5 rounded-full mb-2 border border-coolnet-orange/30">
                                                {language === 'ar' ? 'الأقرب إليك' : 
                                                 language === 'he' ? 'הקרוב ביותר' : 
                                                 'Nearest to you'}
                                            </div>
                                        )}
                                        <h3 className="font-semibold text-lg text-white mb-2">
                                            {getLocalizedText(shop, 'name')}
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-300">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <span className="leading-tight">{getLocalizedText(shop, 'address')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 flex-shrink-0" />
                                                <span dir="ltr">{shop.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 flex-shrink-0" />
                                                <span>{getLocalizedText(shop, 'hours')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedShop?.id === shop.id && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                            className="text-coolnet-purple"
                                        >
                                            <MapPin className="w-6 h-6" />
                                        </motion.div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default ShopList;
