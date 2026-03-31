import React, { useCallback, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { RequiredAsterisk } from '@/components/RequiredAsterisk';
import { Phone } from 'lucide-react';
import { fetchZones } from '@/services/zones/api';
import { Zone } from '@/types/zoneTypes';
import { transformZoneFromApi, getZoneNameByLanguage } from '@/utils/zoneUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useFont } from '@/hooks/use-font';
import confetti from 'canvas-confetti';
import coolnetLogo from '@/assets/logos/english.png';

import { postQrPromotionForm } from '@/services/qrPromotionForm/api';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QRFormData {
    firstName: string;
    lastName: string;
    phone: string;
    id: string;
    zone: string;
    referrerId: string;
}

interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    phone?: string;
    id?: string;
    zone?: string;
}

// Confetti animation function
const triggerConfetti = () => {
    // First burst
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500', '#1E40AF', '#3B82F6']
    });

    // Second burst after delay
    setTimeout(() => {
        confetti({
            particleCount: 50,
            spread: 120,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FFA500', '#FF4500', '#1E40AF', '#3B82F6']
        });
    }, 300);

    // Third burst for extra celebration
    setTimeout(() => {
        confetti({
            particleCount: 75,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#FF4500', '#1E40AF', '#3B82F6']
        });
    }, 600);
};

const CelebrationModal = ({ t, isRTL, onClose }: { t: (key: string) => string, isRTL: boolean, onClose: () => void }) => (
    <>
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');
                
                .font-jazeera {
                    font-family: 'Al Jazeera Arabic', 'Tajawal', 'Noto Sans Arabic', 'Cairo', 'Amiri', sans-serif;
                }
                
                @keyframes slideInFromBottom {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                @keyframes glassyGlow {
                    0%, 100% { 
                        box-shadow: 0 0 15px rgba(255, 255, 255, 0.1), 
                                    0 0 30px rgba(59, 130, 246, 0.1),
                                    0 0 45px rgba(249, 115, 22, 0.1);
                    }
                    50% { 
                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.15), 
                                    0 0 40px rgba(59, 130, 246, 0.15),
                                    0 0 60px rgba(249, 115, 22, 0.15);
                    }
                }
                
                @keyframes modalSlideIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.9) translateY(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) translateY(0); 
                    }
                }
                
                .animate-slide-in-bottom {
                    animation: slideInFromBottom 0.4s ease-out forwards;
                }
                
                .animate-glassy-glow {
                    animation: glassyGlow 2s ease-in-out infinite;
                }
                
                .animate-modal-slide-in {
                    animation: modalSlideIn 0.5s ease-out forwards;
                }
                
                .animation-delay-100 { animation-delay: 0.1s; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                
                @media (max-width: 640px) {
                    .celebration-modal {
                        margin: 1rem;
                        max-width: calc(100vw - 2rem);
                    }
                }
            `}
        </style>

        {/* Modal Backdrop */}
        <div className="fixed inset-0 bg-gradient-to-br from-coolnet-purple/95 via-coolnet-purple-dark/95 to-coolnet-purple-darker/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 font-jazeera">
            {/* Modal Content */}
            <div className="celebration-modal bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md text-center animate-modal-slide-in animate-glassy-glow shadow-2xl relative">

                {/* Logo - Smaller for mobile, positioned at top */}
                <div className="relative mb-4 sm:mb-6 mt-2">
                    {/* <img
                        src={coolnetLogo}
                        alt="Jet Fiber Logo"
                        className="h-8 sm:h-16 mx-auto drop-shadow-xl"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    /> */}
                </div>

                {/* Close Button - Positioned below logo */}
                <button
                    onClick={onClose}
                    className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 text-white/80 hover:text-white z-10`}
                    aria-label="إغلاق"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Main Title - Responsive text with Arabic font */}
                {/* <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 animate-slide-in-bottom bg-gradient-to-r from-white via-blue-100 to-orange-100 bg-clip-text text-transparent leading-tight font-arabic">
                    🎉
                </h1> */}


                {/* Continue Button - Enhanced Glassy Blue */}
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="w-full relative bg-gradient-to-r from-coolnet-purple/30 via-coolnet-purple-light/35 to-coolnet-purple-dark/30 backdrop-blur-xl text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl animate-slide-in-bottom animation-delay-400 border border-white/30 overflow-hidden group"
                    >
                        {/* Glass shine effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-coolnet-purple-light/20 to-coolnet-purple-dark/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm"></div>

                        {/* Button text */}
                        <span className="relative z-10 drop-shadow-lg font-jazeera">
                            {t('qrpromotion.celebration.continueToRegister')}
                        </span>
                    </button>

                    {/* External glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-coolnet-purple-light/10 to-coolnet-purple-dark/10 blur-lg -z-10"></div>
                </div>
            </div>
        </div>
    </>
);

export const Qrcodepromotion = () => {
    const { t, language, setLanguage } = useLanguage();
    const isRTL = language === 'ar';
    const { referrer } = useParams();
    const { font } = useFont();

    // State for showing celebration or form
    const [showCelebration, setShowCelebration] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Set Arabic as primary language for this page only
    useEffect(() => {
        if (language !== 'ar') {
            setLanguage('ar');
        }
    }, [language, setLanguage]);

    // State for zones
    const [zones, setZones] = useState<Zone[]>([]);
    const [zonesLoading, setZonesLoading] = useState(true);
    const [zonesError, setZonesError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<QRFormData>({
        firstName: '',
        lastName: '',
        phone: '',
        id: '',
        zone: '',
        referrerId: referrer || ''
    });

    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [triggerValidation, setTriggerValidation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load zones function
    const loadZones = useCallback(async () => {
        setZonesLoading(true);
        setZonesError(null);

        try {
            const response = await fetchZones();
            const transformedZones = response.data.map(transformZoneFromApi);
            setZones(transformedZones);
        } catch (error) {
            console.error('Error loading zones:', error);
            setZonesError(t('qrpromotion.form.zonesLoadError'));
            setZones([]);
        } finally {
            setZonesLoading(false);
        }
    }, []);

    // Fetch zones data on component mount
    useEffect(() => {
        loadZones();
    }, [loadZones]);

    // Trigger confetti when page loads with valid referrer
    useEffect(() => {
        if (referrer) {
            // Delay confetti to allow page to fully load
            const timer = setTimeout(() => {
                triggerConfetti();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [referrer]);

    // Form validation and handling
    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!formData.firstName.trim()) {
            errors.firstName = t('order.newLine.errors.requiredField');
        }

        if (!formData.lastName.trim()) {
            errors.lastName = t('order.newLine.errors.requiredField');
        }

        if (!formData.phone.trim()) {
            errors.phone = t('order.newLine.errors.requiredField');
        } else if (!/^[+]?[0-9\s\-()+]{9,15}$/.test(formData.phone)) {
            errors.phone = t('order.newLine.errors.phoneFormat');
        }

        if (!formData.zone.trim()) {
            errors.zone = t('order.newLine.errors.requiredField');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        // Clear validation error for this field
        if (validationErrors[id as keyof ValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [id]: undefined }));
        }
    };

    const handleZoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, zone: value }));

        // Clear validation error for zone field
        if (validationErrors.zone) {
            setValidationErrors(prev => ({ ...prev, zone: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setTriggerValidation(true);
        setTimeout(() => setTriggerValidation(false), 500);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await postQrPromotionForm(formData, language);
            setIsSubmitted(true);

            // Trigger confetti celebration
            triggerConfetti();
        } catch (error) {
            console.error('Form submission error:', error);
            alert(t('qrpromotion.form.submitError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to get field classes with validation styling
    const getFieldClasses = (fieldName: string, baseClasses: string = '') => {
        const hasError = validationErrors[fieldName as keyof ValidationErrors];
        const vibrate = triggerValidation && hasError ? 'animate-vibrate' : '';
        const borderColor = hasError ? 'border-red-500' : '';
        return `${baseClasses} ${borderColor} ${vibrate}`.trim();
    };

    // Check if referrer exists
    const isInvalidReferrer = !referrer;

    // If invalid referrer, show error message
    if (isInvalidReferrer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple-darker flex items-center justify-center p-4 font-jazeera">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        {/* <img
                            src={coolnetLogo}
                            alt="Jet Fiber Logo"
                            className="h-10 mx-auto mb-4"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        /> */}
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t('qrpromotion.invalidQR')}
                        </h1>
                        <p className="text-white/80">
                            {t('qrpromotion.invalidQRDescription')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // If form was submitted successfully, show final success
    if (isSubmitted) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4 font-jazeera relative bg-coolnet-purple"
            >
                <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full text-center">
                    <div className="mb-6">
                        {/* <img
                            src={coolnetLogo}
                            alt="Jet Fiber Logo"
                            className="h-16 mx-auto mb-4"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        /> */}

                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            {t('qrpromotion.success.requestReceived')}
                        </h1>

                        <p className="text-white/80 mb-4">
                            {t('qrpromotion.success.teamContact')}
                        </p>

                        <div className="bg-white/5 rounded-lg p-4">
                            <p className="text-white/90 text-sm mb-2">
                                {t('qrpromotion.success.contactInfo')}
                            </p>
                            <a href="tel:*3164" className="flex items-center justify-center gap-2 text-white hover:text-orange-300 transition-colors">
                                <span className="font-bold text-white" dir="ltr">&#8727;3164</span>
                                <Phone className="h-4 w-4" />

                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main page with form
    return (
        <>
            {/* Show celebration modal on first visit */}
            {showCelebration && (
                <CelebrationModal
                    t={t}
                    isRTL={isRTL}
                    onClose={() => setShowCelebration(false)}
                />
            )}

            {/* Main form page */}
            <div
                className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 font-jazeera relative bg-coolnet-purple"
            >
                <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">

                    {/* Logo - Outside the form container */}
                    <div className="text-center mb-6 sm:mb-8 font-jazeera">
                        {/* <img
                            src={coolnetLogo}
                            alt="Jet Fiber Logo"
                            className="h-12 sm:h-20 lg:h-24 mx-auto mb-4 sm:mb-6 drop-shadow-2xl"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        /> */}
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 lg:p-8 w-full">

                        {/* Free Month Message - Above Form */}
                        <div className="relative bg-gradient-to-r from-coolnet-orange/40 via-coolnet-orange-light/45 to-coolnet-orange-dark/40 backdrop-blur-xl text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 shadow-2xl border border-white/40 overflow-hidden text-center">
                            {/* Glass shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-70"></div>
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

                            {/* Content */}
                            <div className="relative z-10 font-jazeera">
                                <p className="text-lg sm:text-base md:text-lg lg:text-xl font-medium leading-tight drop-shadow-lg mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <span className="text-2xl">🎁</span>&nbsp;&nbsp;&nbsp;&nbsp;{t('qrpromotion.banner.getFreeMonth')}&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-2xl">🎁</span>
                                </p>
                                {/* <p className="text-sm sm:text-base opacity-95 drop-shadow-md">
                                    من جت فايبر!
                                </p> */}
                            </div>

                            {/* Additional glow effect */}
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-coolnet-orange-light/20 to-coolnet-orange-dark/20 blur-sm"></div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label className='text-white text-sm sm:text-base' htmlFor="firstName">
                                            {t('qrpromotion.form.firstName')}
                                            <RequiredAsterisk />
                                        </Label>
                                        <Input
                                            id="firstName"
                                            placeholder={t('qrpromotion.form.firstNamePlaceholder')}
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                            className={getFieldClasses('firstName', 'text-right text-sm sm:text-base')}
                                        />
                                        {validationErrors.firstName && (
                                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                                                {validationErrors.firstName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label className='text-white text-sm sm:text-base' htmlFor="lastName">
                                            {t('qrpromotion.form.lastName')}
                                            <RequiredAsterisk />
                                        </Label>
                                        <Input
                                            id="lastName"
                                            placeholder={t('qrpromotion.form.lastNamePlaceholder')}
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                            className={getFieldClasses('lastName', 'text-right text-sm sm:text-base')}
                                        />
                                        {validationErrors.lastName && (
                                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                                                {validationErrors.lastName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label className='text-white text-sm sm:text-base' htmlFor="phone">
                                            {t('qrpromotion.form.phone')}
                                            <RequiredAsterisk />
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder={t('qrpromotion.form.phonePlaceholder')}
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || /^[+]?[0-9\s\-()+]*$/.test(value)) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            required
                                            className={getFieldClasses('phone', 'text-right text-sm sm:text-base')}
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                                                {validationErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Zone */}
                                    <div className="space-y-2">
                                        <Label className="text-white text-sm sm:text-base" htmlFor="zone">
                                            {t('qrpromotion.form.zone')}
                                            <RequiredAsterisk />
                                        </Label>
                                        <Select
                                            value={formData.zone}
                                            onValueChange={handleZoneChange}
                                            disabled={zonesLoading}
                                        >
                                            <SelectTrigger
                                                id="zone"
                                                className={getFieldClasses('zone', `w-full bg-white/90 text-black text-right text-sm sm:text-base flex-row-reverse`)}
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        zonesLoading ? t('qrpromotion.form.zonesLoading') :
                                                            zonesError ? t('qrpromotion.form.zonesError') :
                                                                t('qrpromotion.form.zonePlaceholder')
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.nameAr}>
                                                        {getZoneNameByLanguage(zone, 'ar')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {validationErrors.zone && (
                                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                                                {validationErrors.zone}
                                            </p>
                                        )}
                                        {zonesError && !zonesLoading && (
                                            <p className="text-red-400 text-xs sm:text-sm mt-1">
                                                {zonesError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 sm:pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-coolnet-orange to-coolnet-orange-light hover:from-coolnet-orange-light hover:to-coolnet-orange-dark text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    {isSubmitting ? t('qrpromotion.form.submitting') : t('qrpromotion.form.submit')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Qrcodepromotion;