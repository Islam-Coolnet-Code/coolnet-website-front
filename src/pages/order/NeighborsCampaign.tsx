import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { validatePersonalInfoFields } from '@/utils/orderValidation';
import { FormData } from '@/types/orderTypes';
import { ValidationErrors } from '@/types/validationTypes';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Loader2 } from 'lucide-react';
import { cmsApi, CmsResponse, MultiLangText } from '@/services/cms/api';
import { createOrder, CreateOrderRequest } from '@/services/cms';

interface CityApi {
  id: number;
  name: MultiLangText;
  sortOrder: number;
  isActive: boolean;
}
interface ZoneApi {
  id: number;
  name: MultiLangText;
  cityId: number;
  isActive: boolean;
}

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const inputClass =
  'h-11 border-gray-300 focus-visible:ring-coolnet-purple text-start';

const NeighborsCampaign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dealerId = searchParams.get('dealer');
  const { t, language } = useLanguage();
  const { font } = useFont();
  const { session } = useAuth();

  const referrerNumber = session?.userno ?? '';
  const nameOf = (n: MultiLangText) => (language === 'ar' ? n.ar : n.en);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => undefined,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Cities & zones (zones are cascaded from the chosen city)
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => (await cmsApi.get<CmsResponse<CityApi[]>>('/cities')).data.data,
  });
  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: async () => (await cmsApi.get<CmsResponse<ZoneApi[]>>('/zones')).data.data,
  });

  const activeCities = useMemo(
    () => cities.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [cities]
  );

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);

  // Zones for the selected city only — empty until a city is chosen.
  const cityZones = useMemo(
    () => (selectedCityId === null ? [] : zones.filter((z) => z.isActive && z.cityId === selectedCityId)),
    [zones, selectedCityId]
  );

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (id: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setSelectedCityId(id);
    setSelectedZoneId(null);
    const city = activeCities.find((c) => c.id === id);
    setFormData((prev) => ({ ...prev, city: city ? nameOf(city.name) : '', state: '' }));
    setErrors((prev) => ({ ...prev, city: undefined, state: undefined }));
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : null;
    setSelectedZoneId(id);
    const zone = cityZones.find((z) => z.id === id);
    setField('state', zone ? nameOf(zone.name) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: validation } = validatePersonalInfoFields(formData, t);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast({
        title: t('order.newLine.errors.validationFailed'),
        description: t('order.newLine.errors.checkFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { firstName, lastName } = splitFullName(formData.fullName);
      const orderData: CreateOrderRequest = {
        firstName,
        lastName,
        identityNumber: formData.mobile,
        phoneNumber: formData.mobile,
        city: formData.city || 'Unknown',
        zone: formData.state,
        streetName: formData.address,
        addressNotes: formData.notes,
        serviceSpeed: 'Contact Required',
        language,
        comingFrom: 'neighbor',
        fromId: dealerId || undefined,
        referrerNumber,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      };
      const order = await createOrder(orderData);
      toast({
        title: t('order.newLine.success.orderSubmitted'),
        description: t('order.newLine.success.orderSubmittedDescription'),
      });
      navigate('/activate-service', {
        state: { referenceNumber: order.referenceNumber, showSuccessMessage: true },
      });
    } catch (error) {
      toast({
        title: t('order.newLine.errors.submissionFailed'),
        description: error instanceof Error ? error.message : t('order.newLine.errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const errText = (key: string) =>
    errors[key] ? <p className="text-red-600 text-sm mt-1">{errors[key]}</p> : null;

  const selectClass = (hasError: boolean, disabled = false) =>
    `w-full h-11 rounded-md border bg-white px-3 text-start text-sm focus:outline-none focus:ring-2 focus:ring-coolnet-purple disabled:bg-gray-100 disabled:text-gray-400 ${
      hasError ? 'border-red-400' : 'border-gray-300'
    } ${disabled ? 'cursor-not-allowed' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coolnet-purple/5 via-gray-50 to-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <div className="text-center mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 ${font}`}>
            {t('order.neighborsCampaign.title')}
          </h1>
          <p className={`text-gray-600 mt-2 ${font}`}>{t('order.neighborsCampaign.subtitle')}</p>
        </div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-coolnet-purple to-coolnet-orange" />
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Referrer subscriber number — fixed, read-only */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="subscriptionNumber">
                  {t('order.neighborsCampaign.subscriptionNumber')}
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="subscriptionNumber"
                    value={referrerNumber}
                    readOnly
                    aria-readonly="true"
                    className="h-11 bg-gray-100 text-gray-600 font-semibold border-gray-200 cursor-not-allowed pe-10 text-start"
                  />
                </div>
                <p className={`text-gray-500 text-xs ${font}`}>{t('order.neighborsCampaign.readOnlyHelp')}</p>
              </div>

              <hr className="border-gray-100" />

              {/* Full name */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="fullName">
                  {t('order.newLine.fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setField('fullName', e.target.value)}
                  placeholder={t('order.newLine.fullNamePlaceholder')}
                  className={`${inputClass} ${errors.fullName ? 'border-red-400' : ''}`}
                />
                {errText('fullName')}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="mobile">
                  {t('order.newLine.mobile')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^[+]?[0-9\s\-()+]*$/.test(v)) setField('mobile', v);
                  }}
                  placeholder={t('order.newLine.mobilePlaceholder')}
                  className={`${inputClass} ${errors.mobile ? 'border-red-400' : ''}`}
                />
                {errText('mobile')}
              </div>

              {/* City + Zone (cascading) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="city">
                    {t('order.newLine.city')} <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="city"
                    value={selectedCityId !== null ? String(selectedCityId) : ''}
                    onChange={handleCityChange}
                    disabled={citiesLoading}
                    className={`${selectClass(!!errors.city)} ${font}`}
                  >
                    <option value="">
                      {citiesLoading ? t('order.newLine.loading') : t('order.newLine.selectCity')}
                    </option>
                    {activeCities.map((c) => (
                      <option key={c.id} value={String(c.id)}>{nameOf(c.name)}</option>
                    ))}
                  </select>
                  {errText('city')}
                </div>

                <div className="space-y-1.5">
                  <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="state">
                    {t('order.newLine.state')} <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="state"
                    value={selectedZoneId !== null ? String(selectedZoneId) : ''}
                    onChange={handleZoneChange}
                    disabled={selectedCityId === null}
                    className={`${selectClass(!!errors.state, selectedCityId === null)} ${font}`}
                  >
                    <option value="">
                      {selectedCityId === null
                        ? t('order.neighborsCampaign.selectCityFirst')
                        : t('order.newLine.selectState')}
                    </option>
                    {cityZones.map((z) => (
                      <option key={z.id} value={String(z.id)}>{nameOf(z.name)}</option>
                    ))}
                  </select>
                  {errText('state')}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="address">
                  {t('order.newLine.address')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder={t('order.newLine.addressPlaceholder')}
                  className={`border-gray-300 focus-visible:ring-coolnet-purple text-start ${errors.address ? 'border-red-400' : ''}`}
                />
                {errText('address')}
              </div>

              {/* Notes (optional) */}
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium text-gray-700 ${font}`} htmlFor="notes">
                  {t('order.newLine.notes')} <span className="text-gray-400">({t('order.newLine.optional')})</span>
                </Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder={t('order.newLine.notesPlaceholder')}
                  className="border-gray-300 focus-visible:ring-coolnet-purple text-start"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-bold text-base ${font}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('order.newLine.submitting')}
                  </span>
                ) : (
                  t('order.newLine.submit')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NeighborsCampaign;
