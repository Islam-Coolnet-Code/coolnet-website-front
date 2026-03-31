export interface Shop {
    id: string;
    name: string;
    nameAr: string;
    nameHe: string;
    address: string;
    addressAr: string;
    addressHe: string;
    phone: string;
    hours: string;
    hoursAr: string;
    hoursHe: string;
    location: {
        lat: number;
        lng: number;
    };
    image: string;
    distance?: number; // Distance from user location in km
}

// API Response interface
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