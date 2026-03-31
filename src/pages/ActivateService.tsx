import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useFont } from '@/hooks/use-font';
import { toast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import { ServiceData, FormData } from '@/types/activateServiceTypes';
import { formatCardNumber, validateForm, getInitialFormData } from '@/utils/activateServiceUtils';
import { generateActivationOTP, verifyActivationOTP, CustomerData } from '@/services/activation/api';
import { addCard } from '@/services/payment/api';
import {
  storeOTPSession,
  isOTPSessionValid,
  getOTPSessionData,
  clearOTPSession,
  getOTPSessionRemainingTime
} from '@/utils/cookieUtils';
import { ReferenceNumberInput } from '@/components/activate-service/ReferenceNumberInput';
import { ServiceInfoDisplay } from '@/components/activate-service/ServiceInfoDisplay';
import { PaymentForm } from '@/components/activate-service/PaymentForm';
import { Otp } from '@/components/activate-service/Otp';

const ActivateService: React.FC = () => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const location = useLocation();
  const navigate = useNavigate();
  const { referenceNumber: urlReferenceNumber } = useParams<{ referenceNumber?: string }>();
  const isRTL = language === 'ar';

  // Scroll to top when component mounts or location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  // Get success state from navigation
  const { showSuccessMessage, orderData, referenceNumber: passedReferenceNumber, skipOTPVerification } = location.state || {};

  // State management
  const [referenceNumber, setReferenceNumber] = useState('');
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(''); // Store phone number from generate OTP response
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0); // Track session time

  // Payment result popup state
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  // Show success message if coming from order submission
  useEffect(() => {
    if (showSuccessMessage) {
      setShowSuccess(true);
    }
  }, [showSuccessMessage]);

  // Clean up expired sessions periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Clean up any expired sessions in sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('otp_session_')) {
          try {
            const data = sessionStorage.getItem(key);
            if (data) {
              const session = JSON.parse(data);
              // Check if session is expired using the utility function
              const refNumber = key.replace('otp_session_', '');
              if (!isOTPSessionValid(refNumber)) {
                clearOTPSession(refNumber);
              }
            }
          } catch (error) {
            // Remove corrupted session data
            sessionStorage.removeItem(key);
          }
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  // Check for existing OTP session when reference number changes
  useEffect(() => {
    if (referenceNumber) {

      if (isOTPSessionValid(referenceNumber)) {
        const sessionData = getOTPSessionData(referenceNumber) as ServiceData;

        if (sessionData) {
          setServiceData(sessionData);
          setFormData(prev => ({ ...prev, email: sessionData.email || '' }));
          setVerified(true);
          setShowForm(true);

          const remainingTime = getOTPSessionRemainingTime(referenceNumber);
          setSessionRemainingTime(remainingTime);

          toast({
            title: "Session Restored",
            description: `Your verification session is valid for ${remainingTime} more minutes.`,
            variant: "default"
          });
        }
      } else {
        // Clear any invalid session data
        clearOTPSession(referenceNumber);
        setSessionRemainingTime(0);
      }
    }
  }, [referenceNumber]);

  // Update session remaining time every minute
  useEffect(() => {
    if (verified && referenceNumber) {
      const interval = setInterval(() => {
        const remaining = getOTPSessionRemainingTime(referenceNumber);
        setSessionRemainingTime(remaining);

        // If session expired, clear everything
        if (remaining === 0) {
          clearOTPSession(referenceNumber);
          setVerified(false);
          setServiceData(null);
          setShowForm(false);
          toast({
            title: "Session Expired",
            description: "Your verification session has expired. Please verify again.",
            variant: "destructive"
          });
        }
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [verified, referenceNumber]);

  // Handler functions
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }; const verify = async (otp: string): Promise<void> => {
    try {
      const response = await verifyActivationOTP(referenceNumber, otp);

      if (response.success && response.data && response.data.customer) {
        // OTP verified successfully, now we get the customer data
        const customer = response.data.customer;

        // Create service data from the API response - using exact backend field names
        const serviceData: ServiceData = {
          applicationId: customer.applicationId,
          first_name: customer.first_name,
          last_name: customer.last_name,
          identity_number: customer.identity_number,
          phone_number: customer.phone_number,
          email: customer.email || '',
          city: customer.city || '',
          street_name: customer.street_name || '',
          zone: customer.zone || '',
          house_number: customer.house_number || '',
          address_notes: customer.address_notes || '',
          street_number: customer.street_number || '',
          service_speed: customer.service_speed || '',
          withTV: customer.withTV || false,
          with_fixed_ip: customer.with_fixed_ip || false,
          with_ap_service: customer.with_ap_service || false,
          reference: customer.reference || referenceNumber,
          OTP: customer.OTP || '',
          verified: customer.verified,
          status: customer.status || '',
          created_at: customer.created_at || '',
          router_type: customer.router_type || '',
          entrance_number: customer.entrance_number || '',
          transferred: customer.transferred || false,
          step: customer.step || 0,
          router_id: customer.router_id || '',
          is_pay: customer.is_pay || false,
          pay_price: customer.pay_price || '',
          rent_price: customer.rent_price || '',
          router_is_rent: customer.router_is_rent || false,
          approved: customer.approved || false,
          coming_from: customer.coming_from || '',
          from_id: customer.from_id || ''
        };

        // Set the service data and mark as verified
        setServiceData(serviceData);
        setFormData(prev => ({ ...prev, email: serviceData.email }));
        setVerified(true);

        // Store OTP session for 10 minutes
        storeOTPSession(referenceNumber, serviceData);
        setSessionRemainingTime(10); // Initial 10 minutes

        toast({
          title: "Verification Successful",
          description: "Your session will remain active for 10 minutes.",
          variant: "default"
        });
      } else {
        throw new Error(response.message || 'Verification failed');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error; // Re-throw to let the OTP component handle the error display
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    try {
      // Call the same API endpoint that generates/sends the OTP
      const response = await generateActivationOTP(referenceNumber, language);

      if (!response.success) {
        throw new Error(response.message || 'Failed to resend OTP');
      }

      // Successfully sent, phone number should remain the same
      // The OTP component will handle the UI feedback
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error; // Let the OTP component handle the error display
    }
  };


  const handleReferenceSubmit = useCallback(async () => {
    if (!referenceNumber) return;

    setLoading(true);
    setNotFound(false);
    setServiceData(null);

    try {
      // Call the API to generate OTP - this just sends the SMS
      const response = await generateActivationOTP(referenceNumber, language);

      if (response.success) {
        // OTP generated successfully, show the OTP input form
        setPhoneNumber(response.data.phone_number); // Store the phone number from the response
        setShowForm(true);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [referenceNumber, language]);

  // Convert order data to service data format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertOrderDataToServiceData = (orderData: Record<string, any>, referenceNumber: string): ServiceData => {
    const submissionResponse = orderData.submissionResponse;

    return {
      applicationId: submissionResponse?.application_id || '',
      first_name: orderData.firstName || '',
      last_name: orderData.lastName || '',
      identity_number: String(orderData.id || ''),
      phone_number: orderData.phone || '',
      email: orderData.email || '',
      city: orderData.address?.city || '',
      street_name: orderData.address?.street || '',
      zone: orderData.address?.zone || '',
      house_number: orderData.address?.houseNumber || '',
      address_notes: orderData.address?.notes || '',
      street_number: orderData.address?.streetNumber || '',
      service_speed: orderData.selectedPlan?.speed
        ? `${orderData.selectedPlan.speed.download} / ${orderData.selectedPlan.speed.upload}`
        : '',
      withTV: orderData.withTV || false,
      with_fixed_ip: orderData.fixedIp || false,
      with_ap_service: orderData.apFilter || false,
      reference: referenceNumber,
      OTP: '',
      verified: 1, // Already verified during form submission
      status: 'approved',
      created_at: new Date().toISOString(),
      router_type: orderData.selectedRouterId || '',
      entrance_number: orderData.address?.entranceNumber || '',
      transferred: false,
      step: 3, // Skip to payment step
      router_id: orderData.selectedRouterId || '',
      is_pay: false,
      pay_price: submissionResponse?.pay_price || '',
      rent_price: submissionResponse?.rent_price || '',
      router_is_rent: orderData.selectedPlan?.isRent || false,
      approved: true,
      coming_from: 'order_form',
      from_id: submissionResponse?.from_id || ''
    };
  };

  // Auto-set reference number from URL parameter or state
  useEffect(() => {
    // Priority: URL parameter > state parameter
    const referenceToSet = urlReferenceNumber || passedReferenceNumber;

    if (referenceToSet) {
      setReferenceNumber(referenceToSet);

      // If coming from form submission with skipOTPVerification, bypass OTP
      if (skipOTPVerification && orderData) {
        const convertedServiceData = convertOrderDataToServiceData(orderData, referenceToSet);
        setServiceData(convertedServiceData);
        setFormData(prev => ({ ...prev, email: convertedServiceData.email }));
        setVerified(true);
        setShowForm(true);

        // Store session for consistency
        storeOTPSession(referenceToSet, convertedServiceData);
        setSessionRemainingTime(10);

        toast({
          title: t('activateService.welcome') || "Welcome!",
          description: t('activateService.formSubmissionSuccess') || "Your order was submitted successfully. Complete payment to activate your service.",
          variant: "default"
        });
      } else {
        // Normal flow - auto-submit the reference number for OTP verification
        setTimeout(() => {
          handleReferenceSubmit();
        }, 1000); // Small delay to show the reference number was set
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlReferenceNumber, passedReferenceNumber, skipOTPVerification, orderData]); // Removed handleReferenceSubmit and t to prevent re-running on language change

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const newErrors = validateForm(formData, t, hasScrolledToBottom);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the form errors and try again.",
        variant: "destructive"
      });
      return;
    }


    if (!serviceData) {
      console.error('❌ STOPPING - No service data available');
      toast({
        title: "Error",
        description: "Service data is not available. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }


    if (!referenceNumber) {
      console.error('❌ STOPPING - No reference number available');
      toast({
        title: "Error",
        description: "Reference number is missing. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare card data for submission
      const cardData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces
        month: formData.expiryMonth,
        year: formData.expiryYear,
        cvv: formData.cvv,
        full_name_card_holder: formData.cardholderName,
        card_holder_id: formData.idNumber,
        installments: 1, // Default to 1 installment
        email: formData.email,
        reference: parseInt(referenceNumber), // Cast to integer
        terms_and_conditions: formData.acceptTerms,
        collection_day: parseInt(formData.subscriptionDay),
        mode: 'dev' as const // You can change this to 'prod' for production
      };



      const response = await addCard(cardData);



      if (response.success) {
        setPaymentSuccess(true);
        setPaymentMessage(t('activateService.form.cardAddedSuccessPopupMessage') || 'Your card has been added successfully! You will be redirected to the home page.');
        setShowPaymentResult(true);
        // You can add navigation to success page here if needed
        // navigate('/payment-success');
      } else {
        console.error('Payment failed:', response.message);
        throw new Error(response.message || 'Failed to add card');
      }
    } catch (error: unknown) {
      console.error('=== Error submitting payment ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);

      let errorMessage = 'Failed to process payment. Please try again.';

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setPaymentSuccess(false);
      // setPaymentMessage(errorMessage);
      setShowPaymentResult(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePaymentResult = () => {
    setShowPaymentResult(false);
    setPaymentMessage('');

    // If payment was successful, redirect to home page
    if (paymentSuccess) {
      // Show success toast message
      toast({
        title: t('activateService.form.cardAddedSuccessTitle') || 'Success!',
        description: t('activateService.form.cardAddedSuccessMessage') || 'Your card has been added successfully. Redirecting to home page...',
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  };

  const handleReset = () => {
    // Clear OTP session
    if (referenceNumber) {
      clearOTPSession(referenceNumber);
    }

    setShowForm(false);
    setServiceData(null);
    setReferenceNumber('');
    setFormData(getInitialFormData());
    setErrors({});
    setNotFound(false);
    setVerified(false);
    setPhoneNumber('');
    setHasScrolledToBottom(false);
  };

  return (
    <>
      <div
        className={`min-h-screen relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'} ${font} bg-coolnet-purple`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Content */}
        <div className="relative container mx-auto px-4 py-24">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className='flex items-center space-x-4 text-center justify-center mb-8'>
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-coolnet-purple"></div>
              <h1 className={`text-6xl ${isRTL ? 'font-black' : 'font-bold'} text-white ${font}`}>
                {t('activateService.title')}
              </h1>
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-coolnet-purple"></div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="w-full">
                <div className="relative w-full bg-gradient-to-br from-coolnet-purple/40 via-slate-800/50 to-coolnet-purple-dark/60 backdrop-blur-sm shadow-md border-b border-white/10">

                  {/* Background Effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-60 h-60 bg-coolnet-orange/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-coolnet-purple/5 rounded-full blur-3xl"></div>
                  </div>

                  {/* Content */}
                  <div className="relative flex items-center justify-between px-6 py-2 text-sm text-white font-semibold ">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{t('order.newLine.success.message')}</span>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowSuccess(false)}
                      className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* Reference Number Input - Only show when form is not displayed */}
          {!showForm && (
            <ReferenceNumberInput
              referenceNumber={referenceNumber}
              setReferenceNumber={setReferenceNumber}
              loading={loading}
              notFound={notFound}
              onSubmit={handleReferenceSubmit}
            />
          )}
          {showForm && !verified && (
            <div className='flex mx-auto justify-center p-10'>
              <Otp onVerify={verify} onResend={handleResendOTP} phone={phoneNumber} />
            </div>
          )}
          {showForm && serviceData && verified && (
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Side - Service Information */}
                <div className="space-y-6">
                  <ServiceInfoDisplay serviceData={serviceData} />
                </div>

                {/* Right Side - Payment Form */}
                <div className="space-y-6">
                  <PaymentForm
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                    onSubmit={handleFormSubmit}
                    onReset={handleReset}
                    formatCardNumber={formatCardNumber}
                    hasScrolledToBottom={hasScrolledToBottom}
                    setHasScrolledToBottom={setHasScrolledToBottom}
                    isLoading={loading}
                    showPaymentResult={showPaymentResult}
                    paymentSuccess={paymentSuccess}
                    paymentMessage={paymentMessage}
                    onClosePaymentResult={handleClosePaymentResult}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ActivateService;
