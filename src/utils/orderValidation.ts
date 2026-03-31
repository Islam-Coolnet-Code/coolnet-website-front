import { toast } from '@/hooks/use-toast';
import { FormData } from '@/types/orderTypes';
import { ValidationResult, ValidationErrors } from '@/types/validationTypes';

// Israeli phone validation (+970, +972, or local mobile prefixes)
const validateIsraeliPhone = (phone: string): boolean => {
    // Remove all formatting characters (spaces, dashes, parentheses)
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // Check if empty
    if (!cleanPhone) {
        return false;
    }

    // International format +970 (9 digits)
    if (cleanPhone.startsWith('+970')) {
        const localPart = cleanPhone.substring(4);
        return /^\d{9}$/.test(localPart);
    }

    // International format +972 (9 digits)
    if (cleanPhone.startsWith('+972')) {
        const localPart = cleanPhone.substring(4);
        return /^\d{9}$/.test(localPart);
    }

    if (/^(05)\d{8}$/.test(cleanPhone)) {
        return true;
    }

    return false;
};

// New validation functions that return field-specific errors
export const validatePersonalInfoFields = (formData: FormData, t: (key: string) => string): ValidationResult => {
    const errors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
        errors.fullName = t('order.newLine.errors.requiredField');
    }

    if (!formData.mobile.trim()) {
        errors.mobile = t('order.newLine.errors.requiredField');
    } else if (!validateIsraeliPhone(formData.mobile)) {
        errors.mobile = t('order.newLine.errors.phoneFormat');
    }

    if (!formData.city.trim()) {
        errors.city = t('order.newLine.errors.requiredField');
    }

    if (!formData.state.trim()) {
        errors.state = t('order.newLine.errors.requiredField');
    }

    if (!formData.address.trim()) {
        errors.address = t('order.newLine.errors.requiredField');
    }

    // Notes are optional, no validation needed

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateReferralInfoFields = (formData: FormData, t: (key: string) => string): ValidationResult => {
    // No longer needed - removed comingFrom and dealerNumber fields
    return {
        isValid: true,
        errors: {}
    };
};

export const validateAddressInfoFields = (formData: FormData, t: (key: string) => string): ValidationResult => {
    // Address validation now handled in validatePersonalInfoFields
    return {
        isValid: true,
        errors: {}
    };
};

export const validatePlanSelectionFields = (selectedPlanId: string, t: (key: string) => string): ValidationResult => {
    const errors: ValidationErrors = {};

    if (!selectedPlanId) {
        errors.plan = t('order.newLine.errors.noPlanSelected');
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validatePersonalInfo = (formData: FormData, t: (key: string) => string): boolean => {
    if (!formData.fullName.trim()) {
        toast({
            title: t('order.newLine.errors.requiredField'),
            description: t('order.newLine.fullName'),
            variant: "destructive"
        });
        return false;
    }

    if (!formData.mobile.trim()) {
        toast({
            title: t('order.newLine.errors.requiredField'),
            description: t('order.newLine.mobile'),
            variant: "destructive"
        });
        return false;
    }

    // Phone validation for Israeli numbers
    if (!validateIsraeliPhone(formData.mobile)) {
        toast({
            title: t('order.newLine.errors.invalidPhone'),
            description: t('order.newLine.errors.phoneFormat'),
            variant: "destructive"
        });
        return false;
    }

    if (!formData.city.trim()) {
        toast({
            title: t('order.newLine.errors.requiredField'),
            description: t('order.newLine.city'),
            variant: "destructive"
        });
        return false;
    }

    if (!formData.state.trim()) {
        toast({
            title: t('order.newLine.errors.requiredField'),
            description: t('order.newLine.state'),
            variant: "destructive"
        });
        return false;
    }

    if (!formData.address.trim()) {
        toast({
            title: t('order.newLine.errors.requiredField'),
            description: t('order.newLine.address'),
            variant: "destructive"
        });
        return false;
    }

    return true;
};

export const validateReferralInfo = (formData: FormData, t: (key: string) => string): boolean => {
    // No longer needed - removed comingFrom and dealerNumber fields
    return true;
};


export const validateAddressInfo = (formData: FormData, t: (key: string) => string): boolean => {
    // Address validation now handled in validatePersonalInfo
    return true;
};

export const validatePlanSelection = (selectedPlanId: string, t: (key: string) => string): boolean => {
    if (!selectedPlanId) {
        toast({
            title: t('order.newLine.errors.noPlanSelected'),
            variant: "destructive"
        });
        return false;
    }
    return true;
};

export const validateForm = (formData: FormData, selectedPlanId: string, t: (key: string) => string): boolean => {
    return validatePersonalInfo(formData, t) &&
        validatePlanSelection(selectedPlanId, t);
};
