// API service for dealers - now using CMS API
import { fetchDealers as fetchCmsDealers } from '@/services/cms';

export interface DealerApiResponse {
  id: number;
  name: string;          // Arabic name
  address: string;       // Arabic address
  phone: string;
  en_name: string;       // English name
  he_name: string;       // Hebrew name
  en_address: string;    // English address
  he_address: string;    // Hebrew address
  working_hours: string;
  lat: number;
  lng: number;
}

export interface DealersResponse {
  success: boolean;
  data: DealerApiResponse[];
}

export const fetchDealers = async (): Promise<DealersResponse> => {
  try {
    const cmsDealers = await fetchCmsDealers();

    // Transform CMS format to legacy format for backward compatibility
    const transformedData: DealerApiResponse[] = cmsDealers.map(dealer => ({
      id: dealer.id,
      name: dealer.name.ar,           // Arabic name as primary
      address: dealer.address.ar,     // Arabic address
      phone: dealer.phone,
      en_name: dealer.name.en,
      he_name: dealer.name.he,
      en_address: dealer.address.en,
      he_address: dealer.address.he,
      working_hours: dealer.workingHours?.en || dealer.workingHours?.ar || '',
      lat: dealer.location.lat,
      lng: dealer.location.lng,
    }));

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error('Error fetching dealers:', error);
    throw error;
  }
};
