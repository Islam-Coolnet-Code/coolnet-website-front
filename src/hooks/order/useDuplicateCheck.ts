import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkDuplicateOrder, CheckDuplicateResult, Order } from '@/services/cms';
import { isContinuing } from '@/services/wizard/types';
import { FormData } from '@/types/orderTypes';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';

// Mapped response type for backward compatibility with existing UI
interface MappedDuplicateResponse {
  success: boolean;
  message: string;
  is_duplicate: boolean;
  is_client: boolean;
  is_not_continued: boolean;
  existingOrder: Order | null;
  data: {
    identity_number?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    application_id?: number;
    reference_number?: string;
  } | null;
}

// Map CMS response to legacy format for UI compatibility
const mapCmsResponseToLegacy = (result: CheckDuplicateResult): MappedDuplicateResponse => {
  const order = result.existingOrder;

  // Determine legacy flags based on order status
  const isClient = order?.status === 'installed';
  const isNotContinued = order?.status === 'pending' || order?.status === 'verified';

  return {
    success: true,
    message: result.isDuplicate ? 'Duplicate order found' : 'No duplicate found',
    is_duplicate: result.isDuplicate,
    is_client: isClient,
    is_not_continued: isNotContinued,
    existingOrder: order,
    data: order ? {
      identity_number: order.identityNumber,
      first_name: order.firstName,
      last_name: order.lastName,
      phone_number: order.phoneNumber,
      email: order.email || undefined,
      application_id: order.id,
      reference_number: order.referenceNumber,
    } : null,
  };
};

interface UseDuplicateCheckParams {
  isDevMode: () => boolean;
  isDuplicateTestMode: () => boolean;
  onContinueFlow: () => void;
  enableDuplicateCheck?: boolean;
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
}

export const useDuplicateCheck = ({
  isDevMode,
  isDuplicateTestMode,
  onContinueFlow,
  enableDuplicateCheck = true,
  setFormData
}: UseDuplicateCheckParams) => {
  const [duplicateData, setDuplicateData] = useState<MappedDuplicateResponse | null>(null);
  const [showDuplicateSection, setShowDuplicateSection] = useState(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const performDuplicateCheck = useCallback(async (identityNumber: string, phone_number: number) => {
    // Skip duplicate check if disabled
    if (!enableDuplicateCheck) {
      setIsDuplicateChecked(true);
      onContinueFlow();
      return;
    }

    // Skip duplicate check in dev mode
    if (isDevMode()) {
      setIsDuplicateChecked(true);
      onContinueFlow();
      return;
    }

    // Validate required fields
    if (!identityNumber || !phone_number) {
      toast({
        title: t('order.newLine.errors.requiredField'),
        description: t('order.newLine.identity'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Call CMS API and map response to legacy format
      const cmsResult = await checkDuplicateOrder(String(phone_number), identityNumber);
      const response = mapCmsResponseToLegacy(cmsResult);

      setDuplicateData(response);
      setIsDuplicateChecked(true);

      // Update form data with existing order data if available
      if (response.data && response.existingOrder) {
        if (setFormData) {
          setFormData(prev => ({
            ...prev,
            firstName: response.data?.first_name || prev.firstName,
            lastName: response.data?.last_name || prev.lastName,
            phone: response.data?.phone_number || prev.phone,
            email: response.data?.email || prev.email,
            id: response.data?.identity_number ? Number(response.data.identity_number) : prev.id,
            applicationId: response.data?.application_id // Set existing order ID
          }));
        }
      }

      // If no duplicate found, continue with normal flow
      if (!response.is_duplicate && !response.is_client && !response.is_not_continued) {
        // In test mode or normal mode, continue to next step
        if (isDuplicateTestMode()) {
          // Skip personal info submission in test mode
        }
        onContinueFlow();
        return;
      }

      // Show duplicate section with animation
      setShowDuplicateSection(true);

    } catch (error) {
      console.error('Duplicate check failed:', error);
      toast({
        title: t('order.newLine.errors.networkError'),
        description: t('order.newLine.errors.tryAgain'),
        variant: "destructive"
      });
    }
  }, [enableDuplicateCheck, isDevMode, isDuplicateTestMode, onContinueFlow, setFormData, t]);

  const handleDuplicateChoice = useCallback((choice: isContinuing) => {
    // Store the user's choice in form data

    if (setFormData) {
      setFormData(prev => ({
        ...prev,
        isContinuing: choice
      }));

    }

    switch (choice) {
      case isContinuing.ACTIVATE_SERVICE:
        navigate('/activate-service');
        break;

      case isContinuing.CONTINUE_REQUEST:
      case isContinuing.NEW_REQUEST:
      case isContinuing.DIFFERENT_PERSON:
        // All these choices proceed to OTP step
        setShowDuplicateSection(false);
        onContinueFlow();
        break;

      default:
        break;
    }
  }, [navigate, onContinueFlow, setFormData]);

  const resetDuplicateCheck = useCallback(() => {
    setDuplicateData(null);
    setShowDuplicateSection(false);
    setIsDuplicateChecked(false);
  }, []);

  return {
    duplicateData,
    showDuplicateSection: enableDuplicateCheck ? showDuplicateSection : false,
    isDuplicateChecked,
    performDuplicateCheck,
    handleDuplicateChoice,
    resetDuplicateCheck,
    enableDuplicateCheck
  };
};
