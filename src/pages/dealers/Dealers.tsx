import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import L from "leaflet";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import { useFont } from "@/hooks/use-font";
import bgCityBlue from '@/assets/H_BG.png';
import { Shop } from '@/types/dealerTypes';
import { calculateDistance, transformDealerToShop } from '@/utils/dealerUtils';
import { fetchDealers } from '@/services/dealers/api';
import DealerHeader from '@/components/dealers/DealerHeader';
import LocationControls from '@/components/dealers/LocationControls';
import MapSection from '@/components/dealers/MapSection';
import ShopList from '@/components/dealers/ShopList';
import DealerStyles from '@/components/dealers/DealerStyles';
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
// @ts-expect-error Leaflet requires this fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const Dealers = () => {
    const { t, language } = useLanguage();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const { font } = useFont();
    const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [shopsWithDistance, setShopsWithDistance] = useState<Shop[]>([]);
    const [dealersLoading, setDealersLoading] = useState(true);
    const [dealersError, setDealersError] = useState<string | null>(null);

    const isRTL = language === 'ar';

    // Load dealers function
    const loadDealers = useCallback(async () => {
        setDealersLoading(true);
        setDealersError(null);
        
        try {
            const response = await fetchDealers();
            const transformedShops = response.data.map(transformDealerToShop);
            setShopsWithDistance(transformedShops);
            
            // Set first shop as selected by default
            if (transformedShops.length > 0) {
                setSelectedShop(transformedShops[0]);
            }
        } catch (error) {
            console.error('Error loading dealers:', error);
            setDealersError(t('dealers.errorLoad'));
            // No fallback data - show empty state
            setShopsWithDistance([]);
            setSelectedShop(null);
        } finally {
            setDealersLoading(false);
        }
    }, [language]);

    // Fetch dealers data on component mount
    useEffect(() => {
        loadDealers();
    }, [loadDealers]);

    const handleShopSelect = (shop: Shop) => {
        setSelectedShop(shop);
    };

    const handleGetDirections = (shop: Shop) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.location.lat},${shop.location.lng}`;
        window.open(url, '_blank');
    };

    const getUserLocation = () => {
        setLocationLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError(t('dealers.geoNotSupported'));
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                
                // Calculate distances and sort shops
                const shopsWithDist = shopsWithDistance.map(shop => ({
                    ...shop,
                    distance: calculateDistance(latitude, longitude, shop.location.lat, shop.location.lng)
                }));
                
                // Sort by distance (closest first)
                shopsWithDist.sort((a, b) => {
                    // Handle undefined distances
                    if (!a.distance && !b.distance) return 0;
                    if (!a.distance) return 1;
                    if (!b.distance) return -1;
                    return a.distance - b.distance;
                });
                setShopsWithDistance(shopsWithDist);
                
                // Select the nearest shop
                if (shopsWithDist.length > 0) {
                    setSelectedShop(shopsWithDist[0]);
                }
                
                setLocationLoading(false);
            },
            (error) => {
                let errorMessage = t('dealers.geoError');

                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = t('dealers.geoPermissionDenied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = t('dealers.geoPositionUnavailable');
                        break;
                    case error.TIMEOUT:
                        errorMessage = t('dealers.geoTimeout');
                        break;
                }
                
                setLocationError(errorMessage);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const clearUserLocation = () => {
        setUserLocation(null);
        setLocationError(null);
        
        // Reset shops to original order (without distance sorting)
        const resetShops = shopsWithDistance.map(shop => ({ ...shop, distance: undefined }));
        setShopsWithDistance(resetShops);
    };

    return (
        <>
            <div
                className={`min-h-screen relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'} ${font} bg-coolnet-purple`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <div className="relative container mx-auto p-4">
                    <DealerHeader />

                    <LocationControls
                        userLocation={userLocation}
                        locationLoading={locationLoading}
                        locationError={locationError}
                        onGetUserLocation={getUserLocation}
                        onClearUserLocation={clearUserLocation}
                    />

                    {/* Loading State */}
                    {dealersLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-white text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                <p>{t('dealers.loading')}</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {dealersError && !dealersLoading && (
                        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6 text-center">
                            <p className="text-red-400 mb-4">{dealersError}</p>
                            <button
                                onClick={loadDealers}
                                className="bg-white text-red-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {t('dealers.retry')}
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!dealersLoading && !dealersError && shopsWithDistance.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-white">
                                <p className="text-xl mb-4">
                                    {t('dealers.noDealers')}
                                </p>
                                <p className="text-gray-300">
                                    {t('dealers.tryAgainLater')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    {!dealersLoading && shopsWithDistance.length > 0 && (
                        <div className="flex flex-col lg:flex-row gap-8 mb-12">
                        {/* Map Section - conditionally ordered based on RTL */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className={`flex-1 lg:flex-[2] ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}
                        >
                            <MapSection
                                selectedShop={selectedShop}
                                userLocation={userLocation}
                                shopsWithDistance={shopsWithDistance}
                                onShopSelect={handleShopSelect}
                                onGetDirections={handleGetDirections}
                            />
                        </motion.div>

                        {/* Shop List - conditionally ordered based on RTL */}
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`flex-1 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}
                        >
                            <ShopList
                                shopsWithDistance={shopsWithDistance}
                                selectedShop={selectedShop}
                                userLocation={userLocation}
                                onShopSelect={handleShopSelect}
                            />
                        </motion.div>
                        </div>
                    )}
                </div>

                <DealerStyles />
            </div>
            
            <Footer/>
        </>
    );
};

export default Dealers;