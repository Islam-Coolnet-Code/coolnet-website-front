export interface Zone {
  id: string;
  name: string;        // Current language name
  nameAr: string;      // Arabic name
  nameEn: string;      // English name  
  nameHe: string;
  ar_name: string      // Hebrew name
  code: string;        // Zone code
}

export interface ZoneApiResponse {
  id: number;
  name: string;          // Arabic name (primary)
  code: string;          // Zone code (e.g., "jet01")
  en_name: string;       // English name
  he_name: string;      // Hebrew name
  ar_name: string;
}
