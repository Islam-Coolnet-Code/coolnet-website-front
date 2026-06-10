import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { validatePersonalInfoFields } from '@/utils/orderValidation';
import { FormData } from '@/types/orderTypes';
import { ValidationErrors } from '@/types/validationTypes';
import { useFont } from '@/hooks/use-font';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RequiredAsterisk } from '@/components/RequiredAsterisk';
import PersonalInfoStep from '@/components/order/PersonalInfoStep';
import { createOrder, CreateOrderRequest } from '@/services/cms';

// Helper function to split full name into first and last name
const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
};

const NeighborsCampaign = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dealerId = searchParams.get('dealer');
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Scroll to top and request geolocation when component mounts
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Request location silently
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // User denied or error — continue without location
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    address: '',
    notes: '',
  });

  // Referrer subscription number (the existing customer making the referral)
  const [subscriptionNumber, setSubscriptionNumber] = useState('');

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation
    setValidationErrors({});
    setTriggerValidation(false);

    // Validate personal info
    const personalValidation = validatePersonalInfoFields(formData, t);
    const errors: ValidationErrors = { ...personalValidation.errors };

    // Validate referrer subscription number
    const trimmedSubscription = subscriptionNumber.trim();
    if (!trimmedSubscription) {
      errors.subscriptionNumber = t('order.neighborsCampaign.errors.subscriptionRequired');
    } else if (!/^\d+$/.test(trimmedSubscription)) {
      errors.subscriptionNumber = t('order.neighborsCampaign.errors.subscriptionFormat');
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTriggerValidation(true);
      setTimeout(() => setTriggerValidation(false), 600);

      toast({
        title: t('order.newLine.errors.validationFailed'),
        description: t('order.newLine.errors.checkFields'),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Split full name into first and last name
      const { firstName, lastName } = splitFullName(formData.fullName);

      // Prepare order data for CMS API
      const orderData: CreateOrderRequest = {
        firstName,
        lastName,
        identityNumber: formData.mobile, // Using mobile as identifier for this simplified form
        phoneNumber: formData.mobile,
        city: formData.city || 'Unknown',
        zone: formData.state,
        streetName: formData.address,
        addressNotes: formData.notes,
        serviceSpeed: 'Contact Required', // This simplified form doesn't have plan selection
        language: language,
        comingFrom: 'neighbor',
        fromId: dealerId || undefined,
        referrerNumber: trimmedSubscription,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
      };

      // Submit to CMS API
      const order = await createOrder(orderData);

      toast({
        title: t('order.newLine.success.orderSubmitted'),
        description: t('order.newLine.success.orderSubmittedDescription'),
        variant: "default"
      });

      // Navigate to activate service page with reference number
      navigate('/activate-service', {
        state: {
          referenceNumber: order.referenceNumber,
          showSuccessMessage: true,
        }
      });

    } catch (error) {
      console.error('Error submitting neighbors campaign order:', error);
      toast({
        title: t('order.newLine.errors.submissionFailed'),
        description: error instanceof Error ? error.message : t('order.newLine.errors.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subscriptionHasError = !!validationErrors.subscriptionNumber;
  const subscriptionVibrate = triggerValidation && subscriptionHasError ? 'animate-vibrate' : '';

  return (
    <>
      <div
        className={`min-h-screen relative overflow-hidden ${font} bg-coolnet-purple`}
      >
        <main className="relative flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-coolnet-orange" />
                <h1 className={`text-4xl md:text-5xl ${isRTL ? 'font-black' : 'font-bold'} text-white ${font}`}>
                  {t('order.neighborsCampaign.title')}
                </h1>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-orange" />
              </div>
              <p className="text-white/80">
                {t('order.neighborsCampaign.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                <CardContent className="space-y-6 p-8">
                  {/* Referrer Subscription Number */}
                  <div className="space-y-2">
                    <Label className="text-white" htmlFor="subscriptionNumber">
                      {t('order.neighborsCampaign.subscriptionNumber')}
                      <RequiredAsterisk />
                    </Label>
                    <Input
                      id="subscriptionNumber"
                      type="text"
                      inputMode="numeric"
                      value={subscriptionNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow digits only
                        if (value === '' || /^\d*$/.test(value)) {
                          setSubscriptionNumber(value);
                        }
                      }}
                      placeholder={t('order.neighborsCampaign.subscriptionNumberPlaceholder')}
                      className={`bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'} ${subscriptionHasError ? 'border-red-500' : ''} ${subscriptionVibrate}`.trim()}
                    />
                    {validationErrors.subscriptionNumber ? (
                      <p className="text-red-400 text-sm mt-1">
                        {validationErrors.subscriptionNumber}
                      </p>
                    ) : (
                      <p className="text-white/60 text-sm mt-1">
                        {t('order.neighborsCampaign.subscriptionNumberHelp')}
                      </p>
                    )}
                  </div>

                  {/* Personal Information (same data as New Line) */}
                  <PersonalInfoStep
                    formData={formData}
                    onFormDataChange={handleInputChange}
                    validationErrors={validationErrors}
                    triggerValidation={triggerValidation}
                  />
                </CardContent>

                {/* Submit Button */}
                <div className="p-8 pt-0">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-50 h-14 text-lg font-bold"
                  >
                    {isSubmitting ? t('order.newLine.submitting') : t('order.newLine.submit')}
                  </Button>
                </div>
              </Card>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NeighborsCampaign;
