import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { FormData } from '@/types/orderTypes';
import { fetchRouters, Router as CMSRouter, MultiLangText, createOrder, CreateOrderRequest } from '@/services/cms';
import { getStoredReferralParams } from '@/utils/cookieUtils';

// Plan interface for order submission
interface PlanProp {
  id: string;
  title: string;
  price: number | string;
  speed: {
    download: string;
    upload?: string;
  };
}

// Helper to get localized text
const getLocalizedText = (text: MultiLangText | null, language: string): string => {
  if (!text) return '';
  if (language === 'ar') return text.ar || text.en;
  if (language === 'he') return text.he || text.en;
  return text.en;
};

interface UseOrderSubmissionProps {
  formData: FormData;
  selectedPlan: PlanProp | undefined;
  selectedRouterId: string;
  planType: 'personal' | 'business';
  isDevMode: () => boolean;
  setIsSubmitting: (value: boolean) => void;
  resetFormData: () => void;
  resetWizard: () => void;
}

export const useOrderSubmission = ({
  formData,
  selectedPlan,
  selectedRouterId,
  planType,
  isDevMode,
  setIsSubmitting,
  resetFormData,
  resetWizard
}: UseOrderSubmissionProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // In dev mode, skip API calls and go directly to success
      if (isDevMode()) {
        toast({
          title: "Development Mode",
          description: "Skipped form submission",
          variant: "default"
        });

        // Navigate to activate service page with mock reference
        navigate('/activate-service', {
          state: {
            referenceNumber: 'REF-DEV-123456',
            showSuccessMessage: true,
            skipOTPVerification: true, // Skip OTP in dev mode
            orderData: {
              ...formData,
              planType,
              selectedPlan,
              selectedRouterId
            }
          }
        });

        // Scroll to top after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }, 100);

        return;
      }

      // Fetch routers from CMS to get the selected router title
      let selectedRouter: CMSRouter | undefined;
      try {
        const cmsRouters = await fetchRouters();
        const numId = parseInt(selectedRouterId, 10);
        selectedRouter = cmsRouters.find(r => r.id === numId || r.sku === selectedRouterId);
      } catch (error) {
        console.error('Error fetching routers:', error);
      }

      // Get stored referral parameters
      const storedReferralParams = getStoredReferralParams();

      // Determine coming_from and from_id based on stored parameters or form data
      let comingFrom = formData.comingFrom || 'social_media';
      let fromId = formData.dealerNumber?.trim() || undefined;

      // If there are stored referral parameters, use them instead
      if (storedReferralParams.ref) {
        fromId = storedReferralParams.ref;
        // Determine coming_from based on stored from parameter if available
        if (storedReferralParams.from) {
          comingFrom = storedReferralParams.from;
        } else {
          // Default to dealer if ref exists but no from parameter
          comingFrom = 'dealer';
        }
      }

      // Prepare submission data for the CMS API
      const orderData: CreateOrderRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        identityNumber: String(formData.id),
        phoneNumber: formData.phone,
        email: formData.email || undefined,
        city: formData.address.city || '3000',
        zone: formData.address.zone || undefined,
        streetName: formData.address.street || undefined,
        houseNumber: formData.address.houseNumber || undefined,
        addressNotes: formData.address.details || undefined,
        serviceSpeed: selectedPlan
          ? `${selectedPlan.speed.download.replace(' Mbps', 'MB').trim()} ${selectedPlan.price} ₪`
          : '',
        planId: selectedPlan ? parseInt(selectedPlan.id, 10) : undefined,
        withFixedIp: formData.fixedIp || false,
        withApService: formData.apFilter || false,
        routerId: selectedRouterId ? parseInt(selectedRouterId, 10) : undefined,
        routerType: selectedRouter ? getLocalizedText(selectedRouter.title, 'en') : undefined,
        routerIsRental: true, // Default to rental
        comingFrom: comingFrom,
        fromId: fromId,
        language: language
      };

      // Submit to CMS API
      const order = await createOrder(orderData);

      toast({
        title: t('order.newLine.success.title') || 'Order Submitted Successfully!',
        description: t('order.newLine.success.message') || 'Your order has been submitted. You will be redirected to activate your service.',
        variant: "default"
      });

      // Navigate to activate service page with reference number
      navigate('/activate-service', {
        state: {
          referenceNumber: order.referenceNumber,
          showSuccessMessage: true,
          skipOTPVerification: true, // Skip OTP since user just completed form submission
          orderData: {
            ...formData,
            planType,
            selectedPlan,
            selectedRouterId,
            orderId: order.id,
            referenceNumber: order.referenceNumber
          }
        }
      });

      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 100);

      // Reset everything after successful submission
      resetFormData(); // This also clears the applicationId
      resetWizard();

    } catch (error: unknown) {
      console.error('Error submitting form:', error);

      let errorMessage = t('order.newLine.errors.tryAgain');

      // Handle specific error messages
      if (error instanceof Error) {
        if (error.message?.includes('User not found')) {
          errorMessage = 'User not found. Please submit personal information first.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toast({
        title: t('order.newLine.errors.submissionFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit
  };
};
