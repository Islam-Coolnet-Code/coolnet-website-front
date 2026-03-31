import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Create Axios instance with default configuration for payment services
const paymentApiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens, logging, etc.
paymentApiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors globally
paymentApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Payment API request failed:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Types for payment API
export interface AddCardRequest {
    cardNumber: string;
    month: string;
    year: string;
    cvv: string;
    full_name_card_holder: string;
    card_holder_id: string;
    installments: number;
    email: string;
    reference: number;
    terms_and_conditions: boolean;
    collection_day: number;
    mode?: 'dev' | 'prod';
}

export interface AddCardResponse {
    success: boolean;
    message: string;
    error?: string;
}

// Add card function
export const addCard = async (data: AddCardRequest): Promise<AddCardResponse> => {

    try {
        const response = await paymentApiClient.post<AddCardResponse>('/api/add-card', data);


        return response.data;
    } catch (error: unknown) {
        console.error('=== API Error occurred ===');
        console.error('Error object:', error);

        // Handle axios errors using the same pattern as activation API
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string; error?: string }; status?: number }; request?: unknown };

            if (axiosError.response) {
                // Server responded with error status
                const errorMessage = axiosError.response.data?.error ||
                    axiosError.response.data?.message ||
                    `HTTP error! status: ${axiosError.response.status}`;
                console.error('Server error response:', errorMessage);
                return {
                    success: false,
                    message: errorMessage,
                    error: errorMessage
                };
            } else if (axiosError.request) {
                // Request was made but no response received
                console.error('Network error - no response received');
                return {
                    success: false,
                    message: 'Network error: No response from server',
                    error: 'Network error: No response from server'
                };
            }
        }

        // Something else happened
        const errorMessage = error instanceof Error ? error.message : 'Request configuration error';
        console.error('Other error:', errorMessage);
        return {
            success: false,
            message: errorMessage,
            error: errorMessage
        };
    }
};
