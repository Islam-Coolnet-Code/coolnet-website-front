import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, Sparkles, Gift } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { validatePersonalInfoFields, validateIdentityNumber } from '@/utils/orderValidation';
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

const NewLine = () => {
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
    identityNumber: '',
    city: '',
    state: '',
    address: '',
    notes: '',
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Which path the user picked on the intro screen:
  // 'choice'   -> the two-option selection screen
  // 'existing' -> existing subscriber joining the prize draw campaign
  // 'new'      -> new customer filling the new line form
  const [mode, setMode] = useState<'choice' | 'existing' | 'new'>('choice');

  // Existing-subscriber (prize draw) state
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [prizeDrawDone, setPrizeDrawDone] = useState(false);

  // Celebrate with a confetti burst when the prize-draw entry succeeds
  useEffect(() => {
    if (!prizeDrawDone) return;

    const fireConfetti = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        origin: { y: 0.6 },
        colors: ['#F97316', '#FBBF24', '#FFFFFF', '#A855F7'],
        particleCount: Math.floor(200 * particleRatio),
        ...opts,
      });
    };

    fireConfetti(0.25, { spread: 26, startVelocity: 55 });
    fireConfetti(0.2, { spread: 60 });
    fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fireConfetti(0.1, { spread: 120, startVelocity: 45 });
  }, [prizeDrawDone]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Go back to the two-option selection screen, resetting the prize-draw form
  const handleBackToChoice = () => {
    setMode('choice');
    setCustomerNumber('');
    setCustomerError('');
    setPrizeDrawDone(false);
  };

  // Existing subscriber submits their customer number for the prize draw.
  // No backend — we just show a success message.
  const handlePrizeDrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = customerNumber.trim();
    if (!value) {
      setCustomerError(t('order.newLine.choice.customerNumberRequired'));
      return;
    }
    // Customer number must be exactly 5 digits
    if (!/^\d{5}$/.test(value)) {
      setCustomerError(t('order.newLine.choice.customerNumberFormat'));
      return;
    }
    setCustomerError('');
    setPrizeDrawDone(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation
    setValidationErrors({});
    setTriggerValidation(false);

    // Validate form
    const personalValidation = validatePersonalInfoFields(formData, t);
    const errors = { ...personalValidation.errors };

    // Identity number is required on the New Line form and must be a valid
    // Palestinian/Israeli ID
    const identityNumber = formData.identityNumber?.trim() ?? '';
    if (!identityNumber) {
      errors.identityNumber = t('order.newLine.errors.requiredField');
    } else if (!validateIdentityNumber(identityNumber)) {
      errors.identityNumber = t('order.newLine.errors.idFormat');
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
        identityNumber,
        phoneNumber: formData.mobile,
        city: formData.city || 'Unknown',
        zone: formData.state,
        streetName: formData.address,
        addressNotes: formData.notes,
        serviceSpeed: 'Contact Required', // This simplified form doesn't have plan selection
        language: language,
        comingFrom: dealerId ? 'dealer' : undefined,
        fromId: dealerId || undefined,
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
      console.error('Error submitting order:', error);
      toast({
        title: t('order.newLine.errors.submissionFailed'),
        description: error instanceof Error ? error.message : t('order.newLine.errors.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  {t('order.newLine.title')}
                </h1>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-orange" />
              </div>
            </div>

            {/* Step 1: choose between existing subscriber and new customer */}
            {mode === 'choice' && (
              <div className="space-y-6">
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold mb-2">{t('order.newLine.choice.heading')}</h2>
                  <p className="text-white/70">{t('order.newLine.choice.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Existing subscriber -> prize draw */}
                  <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl flex flex-col">
                    <CardContent className="p-8 flex flex-col flex-grow space-y-4">
                      <h3 className="text-xl font-bold text-white">{t('order.newLine.choice.existingTitle')}</h3>
                      <p className="text-white/70 flex-grow">{t('order.newLine.choice.existingDescription')}</p>
                      <Button
                        type="button"
                        onClick={() => setMode('existing')}
                        className="w-full bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 h-12 text-base font-bold"
                      >
                        {t('order.newLine.choice.existingCta')}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* New customer -> new line form */}
                  <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl flex flex-col">
                    <CardContent className="p-8 flex flex-col flex-grow space-y-4">
                      <h3 className="text-xl font-bold text-white">{t('order.newLine.choice.newTitle')}</h3>
                      <p className="text-white/70 flex-grow">{t('order.newLine.choice.newDescription')}</p>
                      <Button
                        type="button"
                        onClick={() => setMode('new')}
                        className="w-full bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 h-12 text-base font-bold"
                      >
                        {t('order.newLine.choice.newCta')}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Existing subscriber: ask for customer number, then show success */}
            {mode === 'existing' && (
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                {prizeDrawDone ? (
                  <CardContent className="p-8 sm:p-12 text-center relative overflow-hidden">
                    {/* Soft glowing backdrop */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-coolnet-orange/20 via-transparent to-purple-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />

                    <motion.div
                      className="relative flex flex-col items-center gap-5"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.15 } },
                      }}
                    >
                      {/* Animated check badge with pulsing rings */}
                      <motion.div
                        className="relative"
                        variants={{
                          hidden: { scale: 0, rotate: -45, opacity: 0 },
                          visible: { scale: 1, rotate: 0, opacity: 1 },
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-green-400/30"
                          animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-green-400/20"
                          animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                        />
                        <CheckCircle2 className="relative w-24 h-24 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]" strokeWidth={1.5} />
                      </motion.div>

                      {/* Floating sparkles */}
                      <motion.div aria-hidden className="absolute -top-2 left-1/4 text-coolnet-orange"
                        animate={{ y: [0, -12, 0], rotate: [0, 20, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}>
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                      <motion.div aria-hidden className="absolute top-4 right-1/4 text-yellow-300"
                        animate={{ y: [0, -16, 0], rotate: [0, -25, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}>
                        <Gift className="w-7 h-7" />
                      </motion.div>

                      <motion.h2
                        className="text-3xl font-black text-white"
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1 },
                        }}
                      >
                        {t('order.newLine.choice.successTitle')}
                      </motion.h2>
                      <motion.p
                        className="text-white/80 max-w-md"
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1 },
                        }}
                      >
                        {t('order.newLine.choice.successMessage')}
                      </motion.p>

                      <motion.div
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: { y: 0, opacity: 1 },
                        }}
                      >
                        <Button
                          type="button"
                          onClick={handleBackToChoice}
                          className="bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 h-12 px-8 text-base font-bold hover:scale-105 transition-transform"
                        >
                          {t('order.newLine.choice.back')}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                ) : (
                  <form onSubmit={handlePrizeDrawSubmit}>
                    <CardContent className="p-8 space-y-4">
                      <h3 className="text-xl font-bold text-white">{t('order.newLine.choice.existingTitle')}</h3>
                      <p className="text-white/70">{t('order.newLine.choice.existingDescription')}</p>

                      <div className="space-y-2">
                        <Label className="text-white" htmlFor="customerNumber">
                          {t('order.newLine.choice.customerNumber')}
                          <RequiredAsterisk />
                        </Label>
                        <Input
                          id="customerNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={customerNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Digits only, capped at 5 characters
                            if (value === '' || /^\d{0,5}$/.test(value)) {
                              setCustomerNumber(value);
                              if (customerError) setCustomerError('');
                            }
                          }}
                          placeholder={t('order.newLine.choice.customerNumberPlaceholder')}
                          className={`bg-white/90 text-gray-900 border-white/20 focus:ring-coolnet-orange focus:border-coolnet-orange placeholder:text-gray-500 ${isRTL ? 'text-right' : 'text-left'} ${customerError ? 'border-red-500' : ''}`}
                        />
                        {customerError && (
                          <p className="text-red-400 text-sm mt-1">{customerError}</p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          type="submit"
                          className="flex-1 bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 h-12 text-base font-bold"
                        >
                          {t('order.newLine.choice.join')}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleBackToChoice}
                          variant="outline"
                          className="flex-1 border-white/40 bg-transparent text-white hover:bg-white/10 h-12 text-base font-bold"
                        >
                          {t('order.newLine.choice.back')}
                        </Button>
                      </div>
                    </CardContent>
                  </form>
                )}
              </Card>
            )}

            {/* New customer: the new line form */}
            {mode === 'new' && (
              <form onSubmit={handleSubmit}>
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
                  <CardContent className="space-y-6 p-8">
                    {/* Personal Information */}
                    <PersonalInfoStep
                      formData={formData}
                      onFormDataChange={handleInputChange}
                      validationErrors={validationErrors}
                      triggerValidation={triggerValidation}
                    />
                  </CardContent>

                  {/* Submit Button */}
                  <div className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      onClick={handleBackToChoice}
                      variant="outline"
                      className="sm:w-40 border-white/40 bg-transparent text-white hover:bg-white/10 h-14 text-lg font-bold"
                    >
                      {t('order.newLine.choice.back')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-coolnet-orange text-white shadow-lg shadow-coolnet-orange/30 border-0 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:opacity-50 h-14 text-lg font-bold"
                    >
                      {isSubmitting ? t('order.newLine.submitting') : t('order.newLine.submit')}
                    </Button>
                  </div>
                </Card>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NewLine;
