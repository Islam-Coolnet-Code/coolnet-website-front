import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { cmsApi, CmsResponse, MultiLangText } from '@/services/cms/api';
import { RequiredAsterisk } from '../RequiredAsterisk';
import { ValidationErrors } from '@/types/validationTypes';

interface CityFromApi {
  id: number;
  code: string;
  name: MultiLangText;
  sortOrder: number;
  isActive: boolean;
}

interface ZoneFromApi {
  id: number;
  code: string;
  name: MultiLangText;
  cityId: number;
  coveragePolygon: number[][] | null;
  isActive: boolean;
}

interface PersonalInfoStepProps {
  formData: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    address: string;
    notes: string;
  };
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationErrors?: ValidationErrors;
  triggerValidation?: boolean;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  onFormDataChange,
  validationErrors = {},
  triggerValidation = false
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  // State for cities
  const [cities, setCities] = useState<CityFromApi[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // State for zones (states)
  const [allZones, setAllZones] = useState<ZoneFromApi[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Load cities from CMS API
  const loadCities = useCallback(async () => {
    setCitiesLoading(true);
    setCitiesError(null);

    try {
      const response = await cmsApi.get<CmsResponse<CityFromApi[]>>('/cities');
      const activeCities = response.data.data
        .filter(city => city.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      setCities(activeCities);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCitiesError(
        language === 'ar' ? 'فشل في تحميل بيانات المدن. يرجى المحاولة مرة أخرى.' :
          language === 'he' ? 'נכשל בטעינת נתוני הערים. אנא נסה שוב.' :
            'Failed to load cities data. Please try again.'
      );
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, [language]);

  // Load zones from CMS API (with cityId)
  const loadZones = useCallback(async () => {
    setZonesLoading(true);
    setZonesError(null);

    try {
      const response = await cmsApi.get<CmsResponse<ZoneFromApi[]>>('/zones');
      const activeZones = response.data.data.filter(zone => !!zone.isActive);
      setAllZones(activeZones);
    } catch (error) {
      console.error('Error loading zones:', error);
      setZonesError(
        language === 'ar' ? 'فشل في تحميل بيانات المناطق. يرجى المحاولة مرة أخرى.' :
          language === 'he' ? 'נכשל בטעינת נתוני האזורים. אנא נסה שוב.' :
            'Failed to load zones data. Please try again.'
      );
      setAllZones([]);
    } finally {
      setZonesLoading(false);
    }
  }, [language]);

  // Fetch cities and zones on mount
  useEffect(() => {
    loadCities();
    loadZones();
  }, [loadCities, loadZones]);

  // Sync selectedCityId when formData.city changes (e.g., form reset)
  useEffect(() => {
    if (!formData.city) {
      setSelectedCityId(null);
    }
  }, [formData.city]);

  // Filter zones by selected city
  const filteredZones = useMemo(() => {
    if (selectedCityId === null) return allZones;
    return allZones.filter(zone => zone.cityId === selectedCityId);
  }, [allZones, selectedCityId]);

  // Get city name based on current language
  const getCityName = (city: CityFromApi) => {
    switch (language) {
      case 'ar': return city.name.ar;
      case 'he': return city.name.he;
      case 'en':
      default: return city.name.en;
    }
  };

  // Get zone name based on current language
  const getZoneName = (zone: ZoneFromApi) => {
    switch (language) {
      case 'ar': return zone.name.ar;
      case 'he': return zone.name.he;
      case 'en':
      default: return zone.name.en;
    }
  };

  // Handle city selection
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value ? Number(e.target.value) : null;
    setSelectedCityId(cityId);

    // Find the selected city and get its localized name
    const selectedCity = cities.find(c => c.id === cityId);
    const cityName = selectedCity ? getCityName(selectedCity) : '';

    // Create a synthetic event with the city name as value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        id: 'city',
        name: 'city',
        value: cityName,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onFormDataChange(syntheticEvent);

    // Clear the zone selection when city changes
    const clearZoneEvent = {
      ...e,
      target: {
        ...e.target,
        id: 'state',
        name: 'state',
        value: '',
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onFormDataChange(clearZoneEvent);
  };

  // Handle zone selection
  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value ? Number(e.target.value) : null;
    const selectedZone = allZones.find(z => z.id === zoneId);
    const zoneName = selectedZone ? selectedZone.name.ar : '';

    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        id: 'state',
        name: 'state',
        value: zoneName,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    onFormDataChange(syntheticEvent);
  };

  // Helper function to get field classes with validation styling
  const getFieldClasses = (fieldName: string, baseClasses: string = '') => {
    const hasError = validationErrors[fieldName];
    const vibrate = triggerValidation && hasError ? 'animate-vibrate' : '';
    const borderColor = hasError ? 'border-red-500' : '';
    return `${baseClasses} ${borderColor} ${vibrate}`.trim();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-white">{t('order.newLine.personalInfo')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-white" htmlFor="fullName">
            {t('order.newLine.fullName')}
            <RequiredAsterisk />
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={onFormDataChange}
            placeholder={t('order.newLine.fullNamePlaceholder')}
            className={getFieldClasses('fullName', `bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`)}
          />
          {validationErrors.fullName && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.fullName}
            </p>
          )}
        </div>

        {/* Mobile */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-white" htmlFor="mobile">
            {t('order.newLine.mobile')}
            <RequiredAsterisk />
          </Label>
          <Input
            id="mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => {
              const value = e.target.value;
              // Allow numbers, spaces, dashes, parentheses, and a leading +
              if (value === '' || /^[+]?[0-9\s\-()+]*$/.test(value)) {
                onFormDataChange(e);
              }
            }}
            placeholder={t('order.newLine.mobilePlaceholder')}
            className={getFieldClasses('mobile', `bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`)}
          />
          {validationErrors.mobile && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.mobile}
            </p>
          )}
        </div>

        {/* City Dropdown */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="city">
            {t('order.newLine.city')}
            <RequiredAsterisk />
          </Label>
          <select
            id="city"
            value={selectedCityId !== null ? String(selectedCityId) : ''}
            onChange={handleCityChange}
            disabled={citiesLoading}
            className={getFieldClasses('city', `w-full bg-white/90 text-black ${isRTL ? 'text-right' : 'text-left'} rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coolnet-orange disabled:opacity-50`)}
          >
            <option value="">
              {citiesLoading ?
                (language === 'ar' ? 'جاري تحميل المدن...' :
                  language === 'he' ? 'טוען ערים...' :
                    'Loading cities...') :
                citiesError ?
                  (language === 'ar' ? 'خطأ في تحميل المدن' :
                    language === 'he' ? 'שגיאה בטעינת ערים' :
                      'Error loading cities') :
                  t('order.newLine.selectCity')
              }
            </option>
            {cities.map((city) => (
              <option key={city.id} value={String(city.id)}>
                {getCityName(city)}
              </option>
            ))}
          </select>
          {validationErrors.city && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.city}
            </p>
          )}
          {citiesError && !citiesLoading && (
            <p className="text-red-400 text-sm mt-1">
              {citiesError}
            </p>
          )}
        </div>

        {/* State (Zone) Dropdown */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="state">
            {t('order.newLine.state')}
            <RequiredAsterisk />
          </Label>
          <select
            id="state"
            value={filteredZones.find(z => z.name.ar === formData.state)?.id?.toString() ?? ''}
            onChange={handleZoneChange}
            disabled={zonesLoading}
            className={getFieldClasses('state', `w-full bg-white/90 text-black ${isRTL ? 'text-right' : 'text-left'} rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coolnet-orange disabled:opacity-50`)}
          >
            <option value="">
              {zonesLoading ?
                (language === 'ar' ? 'جاري تحميل المناطق...' :
                  language === 'he' ? 'טוען אזורים...' :
                    'Loading zones...') :
                zonesError ?
                  (language === 'ar' ? 'خطأ في تحميل المناطق' :
                    language === 'he' ? 'שגיאה בטעינת אזורים' :
                      'Error loading zones') :
                  t('order.newLine.selectState')
              }
            </option>
            {filteredZones.map((zone) => (
              <option key={zone.id} value={String(zone.id)}>
                {getZoneName(zone)}
              </option>
            ))}
          </select>
          {validationErrors.state && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.state}
            </p>
          )}
          {zonesError && !zonesLoading && (
            <p className="text-red-400 text-sm mt-1">
              {zonesError}
            </p>
          )}
        </div>

        {/* Address Textarea */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-white" htmlFor="address">
            {t('order.newLine.address')}
            <RequiredAsterisk />
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={onFormDataChange}
            placeholder={t('order.newLine.addressPlaceholder')}
            rows={3}
            className={getFieldClasses('address', `bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`)}
          />
          {validationErrors.address && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.address}
            </p>
          )}
        </div>

        {/* Notes Textarea - Optional */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-white" htmlFor="notes">
            {t('order.newLine.notes')}{' '}
            <span className="text-gray-400">({t('order.newLine.optional')})</span>
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={onFormDataChange}
            placeholder={t('order.newLine.notesPlaceholder')}
            rows={3}
            className={`bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
