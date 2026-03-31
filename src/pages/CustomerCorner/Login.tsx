import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import { Otp } from '@/components/activate-service/Otp';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { sendLoginOTP, verifyLoginOTP } from '@/services/auth/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, Shield, ArrowLeft, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserData } from '@/types/authTypes';

type LoginStep = 'phone' | 'otp';

const Login: React.FC = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const phonePattern = /^0[5][0-9]{8}$/;
    return phonePattern.test(phone.replace(/[-\s]/g, ''));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phoneNumber.replace(/[-\s]/g, '');

    if (!validatePhoneNumber(cleanPhone)) {
      setError(t('order.newLine.errors.invalidPhone'));
      return;
    }

    setLoading(true);

    try {
      const response = await sendLoginOTP(cleanPhone, language);

      if (response.success) {
        setStep('otp');
        toast({
          title: t('otp.success'),
          description: t('order.newLine.success.otpSent'),
        });
      } else {
        setError(response.message || t('customerCorner.login.error'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('customerCorner.login.error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    const cleanPhone = phoneNumber.replace(/[-\s]/g, '');

    const response = await verifyLoginOTP(cleanPhone, otp);

    if (response.success && response.data?.user) {
      const userData: UserData = response.data.user;
      login(cleanPhone, userData);

      toast({
        title: t('otp.success'),
        description: t('otp.successDescription'),
      });

      navigate('/customer-corner/dashboard');
    } else {
      throw new Error(response.message || t('otp.invalid'));
    }
  };

  const handleOTPResend = async () => {
    const cleanPhone = phoneNumber.replace(/[-\s]/g, '');
    await sendLoginOTP(cleanPhone, language);
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {step === 'phone' ? (
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-coolnet-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-coolnet-purple" />
                </div>
                <CardTitle className={`text-2xl text-gray-900 ${font}`}>
                  {t('customerCorner.login.title')}
                </CardTitle>
                <CardDescription className={`text-gray-600 ${font}`}>
                  {t('customerCorner.login.subtitle')}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium text-gray-700 ${font}`}>
                      {t('order.newLine.phone')}
                    </label>
                    <div className="relative">
                      <Phone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setError('');
                        }}
                        placeholder={t('customerCorner.login.phonePlaceholder')}
                        className={`h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple
                                  ${isRTL ? 'pr-12 text-right' : 'pl-12'}
                                  ${error ? 'border-red-500' : ''}`}
                        dir="ltr"
                        disabled={loading}
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium
                              transition-all duration-200 ${font}`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('customerCorner.login.verifying')}
                      </span>
                    ) : (
                      t('customerCorner.login.continue')
                    )}
                  </Button>
                </form>

                {/* Security Notice */}
                <div className={`mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className={`text-xs text-gray-500 ${font}`}>
                    {t('customerCorner.login.securityNotice')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Back Button */}
              <button
                onClick={handleBackToPhone}
                className={`absolute -top-12 ${isRTL ? 'right-0' : 'left-0'} flex items-center gap-2 text-gray-600 hover:text-coolnet-purple transition-colors ${font}`}
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                {isRTL ? 'رجوع' : 'Back'}
              </button>

              {/* OTP Card Wrapper */}
              <div className="bg-gradient-to-br from-coolnet-purple via-coolnet-purple-dark to-coolnet-purple-darker rounded-2xl p-6">
                <Otp
                  onVerify={handleOTPVerify}
                  onResend={handleOTPResend}
                  phone={phoneNumber}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
