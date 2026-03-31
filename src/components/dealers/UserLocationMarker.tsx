import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

interface UserLocationMarkerProps {
    position: {lat: number; lng: number};
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
      <div class="user-marker-pulse">
        <div class="user-marker-dot"></div>
      </div>
    `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    return (
        <>
            <Marker position={[position.lat, position.lng]} icon={userIcon}>
                <Popup>
                    <div className="text-center">Your Location</div>
                </Popup>
            </Marker>
            <Circle
                center={[position.lat, position.lng]}
                radius={100}
                pathOptions={{
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    color: '#3b82f6',
                    weight: 2,
                }}
            />
        </>
    );
};

export default UserLocationMarker;
