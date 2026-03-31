
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface QrCustomer {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  zone: string;
  coming_from: string;
  from_id?: string;
  preferred_language: string;
}

interface QrCustomerResponse {
  success: boolean;
  message: string;
  data?: QrCustomer;
}

export const postQrPromotionForm = async (
  formData: {
    firstName: string;
    lastName: string;
    phone: string;
    zone: string;
    referrerId?: string;
  },
  language: string
): Promise<QrCustomerResponse> => {
  try {
    const qr_customer_data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone,
      zone: formData.zone,
      coming_from: 'dealer',
      from_id: formData.referrerId,
      preferred_language: language,
    };

    const response = await fetch(`${API_BASE_URL}/api/qr_customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(qr_customer_data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: QrCustomerResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting QR promotion form:', error);
    throw error;
  }
};
