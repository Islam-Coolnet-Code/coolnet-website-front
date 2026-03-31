import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shop } from '@/types/dealerTypes';

interface AnimatedMarkerProps {
    shop: Shop;
    isSelected: boolean;
    onClick: () => void;
    language: string;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({ shop, isSelected, onClick, language }) => {
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
      <div class="${isSelected ? 'marker-selected' : 'marker-default'}">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="${isSelected ? '#3b82f6' : '#ef4444'}" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });

    return (
        <Marker
            position={[shop.location.lat, shop.location.lng]}
            icon={customIcon}
            eventHandlers={{ click: onClick }}
        >
            <Popup>
                <div className="text-center">
                    <strong>{language === 'ar' ? shop.nameAr : language === 'he' ? shop.nameHe : shop.name}</strong>
                    <br />
                    {language === 'ar' ? shop.addressAr : language === 'he' ? shop.addressHe : shop.address}
                </div>
            </Popup>
        </Marker>
    );
};

export default AnimatedMarker;
