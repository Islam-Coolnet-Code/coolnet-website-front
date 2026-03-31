import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Shop } from '@/types/dealerTypes';

interface MapControllerProps {
    selectedShop: Shop | null;
    userLocation: {lat: number; lng: number} | null;
}

const MapController: React.FC<MapControllerProps> = ({ selectedShop, userLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedShop) {
            map.flyTo([selectedShop.location.lat, selectedShop.location.lng], 16, {
                duration: 1.5,
                easeLinearity: 0.5
            });
        } else if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 14, {
                duration: 1.5,
                easeLinearity: 0.5
            });
        }
    }, [selectedShop, userLocation, map]);

    return null;
};

export default MapController;
