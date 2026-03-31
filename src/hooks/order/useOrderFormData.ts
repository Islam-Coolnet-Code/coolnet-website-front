import { useState } from 'react';
import { FormData } from '@/types/orderTypes';

interface UseOrderFormDataProps {
  initialRef?: string;
  initialFrom?: string;
}

export const useOrderFormData = ({ initialRef, initialFrom }: UseOrderFormDataProps = {}) => {
  // Default form data structure
  const getDefaultFormData = (): FormData => ({
    fullName: '',
    mobile: '',
    city: '',
    state: '',
    address: '',
    notes: '',
    fixedIp: false,
    apFilter: false,
  });

  const [formData, setFormData] = useState<FormData>(getDefaultFormData());

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handle checkbox changes
  const handleFixedIpChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, fixedIp: value }));
  };

  const handleApFilterChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, apFilter: value }));
  };

  // Handle address form changes (now same as handleInputChange since address is a single field)
  const handleAddressFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Reset form data and clear localStorage
  const resetFormData = () => {
    const defaultData = getDefaultFormData();
    setFormData(defaultData);
    // Clear all application-related data from localStorage
    try {
      localStorage.removeItem('form_order_data');
      localStorage.removeItem('coolnet_application_id');
      localStorage.removeItem('coolnet_application_id_timestamp');
      localStorage.removeItem('coolnet_form_data_timestamp');
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    handleFixedIpChange,
    handleApFilterChange,
    handleAddressFormChange,
    resetFormData
  };
};
