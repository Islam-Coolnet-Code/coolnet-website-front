import { Zone, ZoneApiResponse } from '@/types/zoneTypes';

// Transform API response to Zone interface
export const transformZoneFromApi = (zone: ZoneApiResponse): Zone => {
    return {
        id: zone.id.toString(),
        name: zone.en_name,        // Default to English
        nameAr: zone.name,         // Arabic name
        nameEn: zone.en_name,      // English name
        nameHe: zone.he_name,      // Hebrew name
        code: zone.code,
        ar_name: zone.ar_name
    };
};

// Get zone name based on language
export const getZoneNameByLanguage = (zone: Zone, language: string): string => {
    switch (language) {
        case 'ar':
            return zone.ar_name;
        case 'he':
            return zone.nameHe;
        case 'en':
        default:
            return zone.nameEn;
    }
};
