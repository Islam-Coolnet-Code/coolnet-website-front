import React, { useState, useEffect, useCallback } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, ShieldCheck, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import {
    getOTPResendStatus,
    recordOTPResendAttempt,
    getOTPTimeoutRemaining,
    type OTPResendStatus
} from '@/utils/cookieUtils';

interface OtpProps {
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    phone: string;
}

export const Otp: React.FC<OtpProps> = ({ onVerify, onResend, phone }) => {
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [resendStatus, setResendStatus] = useState<OTPResendStatus>({ canResend: true, remainingAttempts: 3 });
    const [timeoutRemaining, setTimeoutRemaining] = useState<string>("");

    // Initialize resend status
    useEffect(() => {
        const status = getOTPResendStatus(phone);
        setResendStatus(status);
    }, [phone]);

    // Update timeout remaining countdown
    useEffect(() => {
        if (!resendStatus.canResend && resendStatus.timeoutExpiry) {
            const updateTimer = () => {
                const remaining = getOTPTimeoutRemaining(resendStatus.timeoutExpiry);
                setTimeoutRemaining(remaining);

                if (!remaining) {
                    // Timeout expired, refresh status
                    const newStatus = getOTPResendStatus(phone);
                    setResendStatus(newStatus);
                }
            };

            updateTimer(); // Initial call
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [resendStatus, phone]);

    // Regular resend timer (30 seconds between resends)
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Auto-focus first slot when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            const firstSlot = document.querySelector('[data-input-otp-slot="0"]') as HTMLElement;
            if (firstSlot) {
                firstSlot.focus();
            }
        }, 200);
        return () => clearTimeout(timer);
    }, []);

    const handleVerify = useCallback(async (otp: string) => {
        setLoading(true);
        setError("");

        try {
            // Call the parent verification function
            await onVerify(otp);
            // If successful, the parent will handle navigation
        } catch (error) {
            // If verification fails, clear the input and show error
            const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
            setError(errorMessage);

            // Immediately clear input and focus first slot for better UX
            setValue("");

            // Focus the first input slot after clearing
            setTimeout(() => {
                const firstSlot = document.querySelector('[data-input-otp-slot="0"]') as HTMLElement;
                if (firstSlot) {
                    firstSlot.focus();
                }
            }, 100);
        } finally {
            setLoading(false);
        }
    }, [onVerify]);

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (value.length === 6) {
            handleVerify(value);
        }
    }, [value, handleVerify]);

    const handleResend = async () => {
        // Check if we can resend
        if (!resendStatus.canResend) {
            return;
        }

        if (!canResend) {
            return;
        }

        setResendLoading(true);
        setError("");

        try {
            // Record the attempt first
            recordOTPResendAttempt(phone);

            // Update local state
            const newStatus = getOTPResendStatus(phone);
            setResendStatus(newStatus);

            // Call the parent resend function
            await onResend();

            // Reset timer and input
            setCanResend(false);
            setResendTimer(30);
            setValue("");

            // Focus the first input slot after resending
            setTimeout(() => {
                const firstSlot = document.querySelector('[data-input-otp-slot="0"]') as HTMLElement;
                if (firstSlot) {
                    firstSlot.focus();
                }
            }, 100);

        } catch (error) {
            console.error('Resend error:', error);
            setError(error instanceof Error ? error.message : 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="relative">
                {/* Glassmorphic card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 
                                bg-gradient-to-br from-white/10 to-white/5">


                    {/* Header */}
                    <div className="relative text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl 
                                        flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                            {t('otp.title')}
                        </h2>
                        <div className="text-white/80 text-base mb-2">
                            {t('otp.description')} {phone}
                        </div>
                    </div>

                    {/* OTP Input */}
                    <div className="flex justify-center mb-6" dir="ltr">
                        <InputOTP
                            maxLength={6}
                            value={value}
                            onChange={(value) => {
                                setValue(value);
                                setError("");
                            }}
                            disabled={loading}
                            className="gap-1 sm:gap-2"
                            dir="ltr" // Force LTR for number input
                            autoFocus
                            autoComplete="one-time-code"
                        >
                            <InputOTPGroup className="gap-1 sm:gap-2 items-center">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <span key={index} className="flex items-center gap-1">
                                        <InputOTPSlot
                                            index={index}
                                            className="w-10 h-10 sm:w-14 sm:h-14 text-lg sm:text-xl font-bold bg-white/15 backdrop-blur-sm 
                                            border-2 border-white/30 text-white placeholder:text-white/40 
                                            focus:border-white focus:ring-2 focus:ring-white/50 rounded-xl
                                            transition-all duration-200 hover:bg-white/20 text-center"
                                            style={{ direction: 'ltr', textAlign: 'center' }}
                                        />
                                        {index === 2 && (
                                            <InputOTPSeparator className="text-white/40 font-bold self-center">
                                                -
                                            </InputOTPSeparator>
                                        )}
                                    </span>
                                ))}
                            </InputOTPGroup>


                        </InputOTP>
                    </div>

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 text-white/80">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">{t('otp.verifying') || 'Verifying...'}</span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !loading && (
                        <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
                            <p className="text-red-100 text-sm text-center font-medium">{error}</p>
                        </div>
                    )}

                    {/* Resend Loading indicator */}
                    {resendLoading && (
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 text-white/80">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">{t('otp.resending') || 'Resending...'}</span>
                            </div>
                        </div>
                    )}

                    {/* Resend OTP Section */}
                    <div className="mt-8 text-center space-y-3">
                        <p className="text-white/70 text-sm">
                            {t('otp.didntReceive') || "Didn't receive the code?"}
                        </p>



                        {/* Resend button or timer */}
                        {resendStatus.canResend ? (
                            canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={resendLoading}
                                    className="inline-flex items-center gap-2 text-white font-semibold text-sm 
                                             hover:text-white/80 transition-colors duration-200 group disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${resendLoading ? 'animate-spin' : 'group-hover:rotate-180'
                                        }`} />
                                    {t('otp.resend') || 'Resend OTP'}
                                </button>
                            ) : (
                                <p className="text-white/50 text-sm">
                                    {t('otp.resendIn') || 'Resend in'}
                                    <span className={`font-mono font-bold ${isRTL ? 'mr-1' : 'ml-1'}`}>
                                        {resendTimer}s
                                    </span>
                                </p>
                            )
                        ) : (
                            /* Max attempts reached */
                            <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
                                <div className="flex items-center justify-center gap-2 text-red-200 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        {t('otp.resendLimitReached') || 'You have reached the maximum resend attempts (3). Please try again later.'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};