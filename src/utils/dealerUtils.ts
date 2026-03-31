import { Shop, DealerApiResponse } from '@/types/dealerTypes';

// Mock dealers data removed - now fetching from database

// Transform API response to Shop interface
export const transformDealerToShop = (dealer: DealerApiResponse): Shop => {
    // Default image placeholder
    const defaultImage = "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=300&fit=crop";
    
    return {
        id: dealer.id.toString(),
        name: dealer.en_name,
        nameAr: dealer.name,
        nameHe: dealer.he_name,
        address: dealer.en_address,
        addressAr: dealer.address,
        addressHe: dealer.he_address,
        phone: dealer.phone,
        hours: dealer.working_hours || "Contact for hours",
        hoursAr: dealer.working_hours || "اتصل للاستفسار عن أوقات العمل",
        hoursHe: dealer.working_hours || "צור קשר לשעות פתיחה",
        location: {
            lat: dealer.lat,
            lng: dealer.lng
        },
        image: defaultImage
    };
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
};
