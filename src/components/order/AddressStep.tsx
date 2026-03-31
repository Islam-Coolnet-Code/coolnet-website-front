
import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { fetchZones } from '@/services/zones/api';
import { transformZoneFromApi, getZoneNameByLanguage } from '@/utils/zoneUtils';
import { Zone } from '@/types/zoneTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequiredAsterisk } from '../RequiredAsterisk';
import { ValidationErrors } from '@/types/validationTypes';


interface AddressStepProps {
  addressForm: {
    zone: string;
    street: string;
    houseNumber: string;
    details: string;
  };
  onAddressFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validationErrors?: ValidationErrors;
  triggerValidation?: boolean;
}

const AddressStep: React.FC<AddressStepProps> = ({
  addressForm,
  onAddressFormChange,
  validationErrors = {},
  triggerValidation = false
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  // State for zones
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Load zones function
  const loadZones = useCallback(async () => {
    setZonesLoading(true);
    setZonesError(null);

    try {
      const response = await fetchZones();
      const transformedZones = response.data.map(transformZoneFromApi);
      setZones(transformedZones);
    } catch (error) {
      console.error('Error loading zones:', error);
      setZonesError(
        language === 'ar' ? 'فشل في تحميل بيانات المناطق. يرجى المحاولة مرة أخرى.' :
          language === 'he' ? 'נכשל בטעינת נתוני האזורים. אנא נסה שוב.' :
            'Failed to load zones data. Please try again.'
      );
      setZones([]);
    } finally {
      setZonesLoading(false);
    }
  }, [language]);

  // Fetch zones data on component mount and language change
  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Helper function to get field classes with validation styling
  const getFieldClasses = (fieldName: string, baseClasses: string = '') => {
    const hasError = validationErrors[fieldName];
    const vibrate = triggerValidation && hasError ? 'animate-vibrate' : '';
    const borderColor = hasError ? 'border-red-500' : '';
    return `${baseClasses} ${borderColor} ${vibrate}`.trim();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-white">{t('order.newLine.addressInfo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City - Readonly */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="city">
            {t('order.newLine.city')}
            <RequiredAsterisk />

          </Label>
          <Input
            id="city"
            value="Jerusalem - ירושלים"
            readOnly
            className="bg-gray-300 text-black cursor-not-allowed"
          />
        </div>

        {/* Zone - Dropdown */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="zone">
            {t('order.newLine.zone')}
            <RequiredAsterisk />
          </Label>
          <Select
            value={addressForm.zone}
            onValueChange={(value) =>
              onAddressFormChange({
                target: {
                  id: 'zone',
                  value,
                },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            disabled={zonesLoading}
          >
            <SelectTrigger
              id="zone"
              className={getFieldClasses('zone', `w-full bg-white/90 text-black ${isRTL ? 'text-right' : 'text-left'}`)}
            >
              <SelectValue
                placeholder={
                  zonesLoading ?
                    (language === 'ar' ? 'جاري تحميل المناطق...' :
                      language === 'he' ? 'טוען אזורים...' :
                        'Loading zones...') :
                    zonesError ?
                      (language === 'ar' ? 'خطأ في تحميل المناطق' :
                        language === 'he' ? 'שגיאה בטעינת אזורים' :
                          'Error loading zones') :
                      t('order.newLine.selectZone')
                }
              />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.nameAr}>
                  {getZoneNameByLanguage(zone, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.zone && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.zone}
            </p>
          )}
          {zonesError && !zonesLoading && (
            <p className="text-red-400 text-sm mt-1">
              {zonesError}
            </p>
          )}
        </div>

        {/* Street Name */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="street">
            {t('order.newLine.street')}{' '}
            <span className="text-gray-400">({t('order.newLine.optional')})</span>
          </Label>
          <Input
            id="street"
            value={addressForm.street}
            onChange={onAddressFormChange}
            placeholder={t('order.newLine.streetPlaceholder')}
            required
            className={isRTL ? 'text-right' : 'text-left'}
          />
        </div>

        {/* House Number */}
        <div className="space-y-2">
          <Label className="text-white" htmlFor="houseNumber">
            {t('order.newLine.houseNumber')}{' '}
            <span className="text-gray-400">({t('order.newLine.optional')})</span>
          </Label>
          <Input
            id="houseNumber"
            value={addressForm.houseNumber}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only English numbers (0-9)
              if (value === '' || /^[0-9]+$/.test(value)) {
                onAddressFormChange(e);
              }
            }}
            placeholder={t('order.newLine.houseNumberPlaceholder')}
            className={getFieldClasses('houseNumber', isRTL ? 'text-right' : 'text-left')}
          />
          {validationErrors.houseNumber && (
            <p className="text-red-400 text-sm mt-1">
              {validationErrors.houseNumber}
            </p>
          )}
        </div>

        {/* Full Address Details */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-white" htmlFor="details">
            {t('order.newLine.addressDetails')}{' '}
            <span className="text-gray-400">({t('order.newLine.optional')})</span>
          </Label>
          <Input
            id="details"
            value={addressForm.details}
            onChange={onAddressFormChange}
            placeholder={t('order.newLine.detailsPlaceholder')}
            required
            className={isRTL ? 'text-right' : 'text-left'}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressStep;
