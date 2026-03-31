import React, { useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Shop } from '@/types/dealerTypes';
import MapController from '@/components/dealers/MapController';
import AnimatedMarker from '@/components/dealers/AnimatedMarker';
import UserLocationMarker from '@/components/dealers/UserLocationMarker';
import L from 'leaflet';

interface MapSectionProps {
    selectedShop: Shop | null;
    userLocation: {lat: number; lng: number} | null;
    shopsWithDistance: Shop[];
    onShopSelect: (shop: Shop) => void;
    onGetDirections: (shop: Shop) => void;
}

const MapSection: React.FC<MapSectionProps> = ({
    selectedShop,
    userLocation,
    shopsWithDistance,
    onShopSelect,
    onGetDirections
}) => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';
    const mapRef = useRef<L.Map | null>(null);

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
        <div className="bg-gradient-to-br from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 overflow-hidden">
            <div className="relative z-10">
                <MapContainer
                    center={[31.8097, 35.2450]}
                    zoom={12}
                    className="h-[600px] w-full"
                    ref={mapRef}
                    zoomControl={!isRTL}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapController selectedShop={selectedShop} userLocation={userLocation} />

                    {/* User location marker */}
                    {userLocation && <UserLocationMarker position={userLocation} />}

                    {/* Shop markers */}
                    {shopsWithDistance.map((shop) => (
                        <AnimatedMarker
                            key={shop.id}
                            shop={shop}
                            isSelected={selectedShop?.id === shop.id}
                            onClick={() => onShopSelect(shop)}
                            language={language}
                        />
                    ))}
                </MapContainer>

                {/* Floating zoom controls for RTL */}
                {isRTL && (
                    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1">
                        <button
                            onClick={() => mapRef.current?.zoomIn()}
                            className="bg-white hover:bg-gray-100 w-8 h-8 rounded shadow-md flex items-center justify-center"
                        >
                            +
                        </button>
                        <button
                            onClick={() => mapRef.current?.zoomOut()}
                            className="bg-white hover:bg-gray-100 w-8 h-8 rounded shadow-md flex items-center justify-center"
                        >
                            -
                        </button>
                    </div>
                )}
            </div>

            {/* Shop Details Panel */}
            <AnimatePresence mode="wait">
                {selectedShop ? (
                    <motion.div
                        key={selectedShop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-6 border-t border-white/10 bg-gradient-to-r from-coolnet-purple/60 to-slate-800/60 backdrop-blur-sm"
                    >
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {getLocalizedText(selectedShop, 'name')}
                                    </h3>
                                    <p className="text-sm text-gray-300 mt-2">
                                        {t('dealers.workingHours')}: {getLocalizedText(selectedShop, 'hours')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`tel:${selectedShop.phone}`, '_self')}
                                        className="bg-coolnet-purple border-coolnet-purple/50 text-white hover:bg-coolnet-purple hover:text-white transition-all duration-300"
                                    >
                                        <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('dealers.call')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onGetDirections(selectedShop)}
                                        className="bg-coolnet-orange border-coolnet-orange/50 text-white hover:bg-coolnet-orange hover:text-white transition-all duration-300"
                                    >
                                        <Navigation className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {t('dealers.getDirections')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-8 text-center text-gray-300 bg-gradient-to-r from-coolnet-purple/40 to-slate-800/40 backdrop-blur-sm"
                    >
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>{t('dealers.selectStore')}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MapSection;
