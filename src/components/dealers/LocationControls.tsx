import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LocationControlsProps {
    userLocation: {lat: number; lng: number} | null;
    locationLoading: boolean;
    locationError: string | null;
    onGetUserLocation: () => void;
    onClearUserLocation: () => void;
}

const LocationControls: React.FC<LocationControlsProps> = ({
    userLocation,
    locationLoading,
    locationError,
    onGetUserLocation,
    onClearUserLocation
}) => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="flex justify-center mb-4">
                {!userLocation ? (
                    <Button
                        onClick={onGetUserLocation}
                        disabled={locationLoading}
                        className="bg-gradient-to-r from-coolnet-purple to-[#2e1e5f] hover:[#2e1e5f] hover:to-[#2e1e5f] shadow-lg hover:shadow-blue-500/25 text-white transition-all duration-300 px-6 py-2.5"
                    >
                        <Locate className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} ${locationLoading ? 'animate-pulse' : ''}`} />
                        {locationLoading ? 
                            (language === 'ar' ? 'جاري تحديد الموقع...' : 
                             language === 'he' ? 'מאתר מיקום...' : 
                             'Getting location...') :
                            (language === 'ar' ? 'العثور على أقرب متجر' : 
                             language === 'he' ? 'מצא את החנות הקרובה' : 
                             'Find Nearest Store')
                        }
                    </Button>
                ) : (
                    <div className="flex items-center gap-4">
                        <span className="text-green-400 flex items-center gap-2">
                            <Locate className="w-4 h-4" />
                            {language === 'ar' ? 'تم تحديد الموقع' : 
                             language === 'he' ? 'המיקום שלך אותר' : 
                             'Location found'}
                        </span>
                        <Button
                            onClick={onClearUserLocation}
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white bg-coolnet-purple hover:bg-coolnet-purple"
                        >
                            <X className="w-4 h-4" color='white' />
                        </Button>
                    </div>
                )}
                {locationError && (
                    <span className="text-red-400 text-sm">{locationError}</span>
                )}
        </div>
    );
};

export default LocationControls;
