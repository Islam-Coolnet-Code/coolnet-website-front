// API service for zones - now using CMS API
import { fetchZones as fetchCmsZones } from '@/services/cms';

export interface ZoneApiResponse {
  id: number;
  name: string;          // Arabic name (primary)
  code: string;          // Zone code (e.g., "jet01")
  en_name: string;       // English name
  he_name: string;       // Hebrew name
  ar_name: string;       // Arabic name (explicit)
}

export interface ZonesResponse {
  success: boolean;
  data: ZoneApiResponse[];
}

export const fetchZones = async (): Promise<ZonesResponse> => {
  try {
    const cmsZones = await fetchCmsZones();

    // Transform CMS format to legacy format for backward compatibility
    const transformedData: ZoneApiResponse[] = cmsZones.map(zone => ({
      id: zone.id,
      name: zone.name.ar,          // Arabic name as primary
      code: zone.code,
      en_name: zone.name.en,
      he_name: zone.name.he,
      ar_name: zone.name.ar,
    }));

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching zones:', error);
    throw error;
  }
};
