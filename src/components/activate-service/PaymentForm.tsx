import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { FormData, FormErrors } from '@/types/activateServiceTypes';
import { generateDayOptions } from '@/utils/activateServiceUtils';
import { RequiredAsterisk } from '../RequiredAsterisk';
import { PaymentResultPopup } from '@/components/ui/payment-result-popup';
interface PaymentFormProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: keyof FormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  formatCardNumber: (value: string) => string;
  hasScrolledToBottom?: boolean;
  setHasScrolledToBottom?: (value: boolean) => void;
  isLoading?: boolean;
  showPaymentResult?: boolean;
  paymentSuccess?: boolean;
  paymentMessage?: string;
  onClosePaymentResult?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  errors,
  onInputChange,
  onSubmit,
  onReset,
  formatCardNumber,
  hasScrolledToBottom = false,
  setHasScrolledToBottom = () => { },
  isLoading = false,
  showPaymentResult = false,
  paymentSuccess = false,
  paymentMessage,
  onClosePaymentResult = () => { }
}) => {
  const { t, language } = useLanguage();
  const { font } = useFont();
  const isRTL = language === 'ar';
  const termsScrollRef = useRef<HTMLDivElement>(null);
  const [canAcceptTerms, setCanAcceptTerms] = useState(hasScrolledToBottom);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Handle terms scroll
  const handleTermsScroll = () => {
    const element = termsScrollRef.current;
    if (!element) return;

    const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5;

    if (isScrolledToBottom && !canAcceptTerms) {
      setCanAcceptTerms(true);
      setHasScrolledToBottom(true);
      setShowScrollHint(false);
    }
  };

  // Show scroll hint when user tries to accept terms without scrolling
  const handleTermsCheckboxClick = (checked: boolean) => {
    if (!canAcceptTerms && checked) {
      setShowScrollHint(true);
      // Scroll the terms container to draw attention
      termsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onInputChange('acceptTerms', checked);
    setShowScrollHint(false);
  };

  // Handle container click (separate from checkbox logic to avoid conflicts)
  const handleContainerClick = () => {
    if (canAcceptTerms) {
      onInputChange('acceptTerms', !formData.acceptTerms);
      setShowScrollHint(false);
    } else {
      setShowScrollHint(true);
      termsScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCanAcceptTerms(hasScrolledToBottom);
  }, [hasScrolledToBottom]);

  // Memoize date calculations to prevent infinite re-renders
  const { currentYear, currentMonth, monthOptions } = useMemo(() => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1; // JS months are 0-based
    const selectedYear = formData.expiryYear ? parseInt(formData.expiryYear, 10) : year;
    const startMonth = selectedYear === year ? month : 1;
    const options = Array.from({ length: 12 - (startMonth - 1) }, (_, i) => startMonth + i);

    return {
      currentYear: year,
      currentMonth: month,
      monthOptions: options
    };
  }, [formData.expiryYear]);

  const inputClasses = (hasError: boolean) =>
    `mt-2 ${font} ${hasError ? 'border-red-500' : 'border-white/30'} bg-white/10 backdrop-blur-md text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/20`;

  // Function to filter out Arabic characters and allow only English and Hebrew
  const filterCardholderName = (value: string) => {
    // Allow English letters (a-z, A-Z), Hebrew letters, spaces, and common punctuation
    return value.replace(/[^\u0041-\u005A\u0061-\u007A\u05D0-\u05EA\u0020\u002D\u0027\u002E]/g, '');
  };

  return (
    <>
      <PaymentResultPopup
        isOpen={showPaymentResult}
        isSuccess={paymentSuccess}
        message={paymentMessage}
        onClose={onClosePaymentResult}
      />

      <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/10 sticky top-4">
        <CardHeader>
          <CardTitle className={`${font} text-white`}>
            {t('activateService.serviceInfo.paymentInfo')}
          </CardTitle>
          <CardDescription className={`${font} text-white/80`}>
            {t('activateService.form.activatingService')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email - Optional field */}
            <div>
              <Label htmlFor="email" className={`${font} text-white flex items-center gap-2`}>
                {t('activateService.form.email')}
                <RequiredAsterisk />
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('activateService.form.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                className={inputClasses(!!errors.email)}
                dir="ltr"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Card Number - Required */}
            <div>
              <Label htmlFor="cardNumber" className={`${font} text-white flex items-center gap-1`}>
                {t('activateService.form.cardNumber')}
                <RequiredAsterisk />
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder={t('activateService.form.cardNumberPlaceholder')}
                value={formData.cardNumber}
                onChange={(e) => onInputChange('cardNumber', formatCardNumber(e.target.value))}
                className={inputClasses(!!errors.cardNumber)}
                maxLength={19}
                dir="ltr"
              />
              {errors.cardNumber && <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            {/* CVV and Expiry - Required */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cvv" className={`${font} text-white flex items-center gap-1`}>
                  {t('activateService.form.cvv')}
                  <RequiredAsterisk />
                </Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder={t('activateService.form.cvvPlaceholder')}
                  value={formData.cvv}
                  onChange={(e) => onInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={inputClasses(!!errors.cvv)}
                  maxLength={3}
                  dir="ltr"
                />
                {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
              </div>

              <div>
                <Label className={`${font} text-white flex items-center gap-1`}>
                  {t('activateService.form.month')}
                  <RequiredAsterisk />
                </Label>
                <Select value={formData.expiryMonth} onValueChange={(value) => onInputChange('expiryMonth', value)} defaultValue="1">
                  <SelectTrigger className={inputClasses(!!errors.expiry)}>
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                    {monthOptions.map((m) => (
                      <SelectItem key={m} value={m.toString()} className="text-white hover:bg-white/10">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${font} text-white flex items-center gap-1`}>
                  {t('activateService.form.year')}
                  <RequiredAsterisk />
                </Label>
                <Select value={formData.expiryYear} onValueChange={(value) => onInputChange('expiryYear', value)} defaultValue={new Date().getFullYear().toString()}>
                  <SelectTrigger className={inputClasses(!!errors.expiry)}>
                    <SelectValue placeholder="2025" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString()} className="text-white hover:bg-white/10">
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.expiry && <p className="text-red-400 text-sm mt-1">{errors.expiry}</p>}
              </div>
            </div>

            {/* Cardholder Name - Required */}
            <div>
              <Label htmlFor="cardholderName" className={`${font} text-white flex items-center gap-1`}>
                {t('activateService.form.cardholderName')}
                <RequiredAsterisk />
              </Label>
              <Input
                id="cardholderName"
                type="text"
                placeholder={t('activateService.form.cardholderNamePlaceholder')}
                value={formData.cardholderName}
                onChange={(e) => onInputChange('cardholderName', filterCardholderName(e.target.value))}
                className={inputClasses(!!errors.cardholderName)}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {errors.cardholderName && <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>}
            </div>

            {/* ID Number - Required */}
            <div>
              <Label htmlFor="idNumber" className={`${font} text-white flex items-center gap-1`}>
                {t('activateService.form.idNumber')}
                <RequiredAsterisk />
              </Label>
              <Input
                id="idNumber"
                type="text"
                placeholder={t('activateService.form.idNumberPlaceholder')}
                value={formData.idNumber}
                onChange={(e) => onInputChange('idNumber', e.target.value)}
                className={inputClasses(!!errors.idNumber)}
                dir="ltr"
              />
              {errors.idNumber && <p className="text-red-400 text-sm mt-1">{errors.idNumber}</p>}
            </div>

            {/* Subscription Day - Required */}
            <div>
              <Label className={`${font} text-white flex items-center gap-1`}>
                {t('activateService.form.subscriptionDay')}
                <RequiredAsterisk />
              </Label>
              <Select value={formData.subscriptionDay} onValueChange={(value) => onInputChange('subscriptionDay', value)} defaultValue="5">
                <SelectTrigger className={inputClasses(!!errors.subscriptionDay)} >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                  {generateDayOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subscriptionDay && <p className="text-red-400 text-sm mt-1">{errors.subscriptionDay}</p>}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              {/* Scroll hint alert */}
              {showScrollHint && (
                <Alert className="bg-orange-500/20 border-orange-500/50 backdrop-blur-md">
                  <AlertDescription className={`${font} text-orange-200`}>
                    {t('activateService.form.scrollToAcceptTerms')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Detailed Terms Box with scroll detection */}
              <div
                ref={termsScrollRef}
                onScroll={handleTermsScroll}
                className={`bg-white/10 backdrop-blur-md border ${canAcceptTerms ? 'border-white/20' : 'border-orange-400/50'} p-4 rounded-lg space-y-3 max-h-48 overflow-y-auto relative`}
              >
                <h4 className={`font-semibold text-white ${font} top-0 bg-white/10 backdrop-blur-md p-2 -mx-2 -mt-2 mb-2 border-b border-white/20`}>
                  {t('activateService.form.terms')}:
                </h4>
                <div className="space-y-2 text-sm text-white/90 pb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <div key={num} className={`flex items-start space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="text-coolnet-orange font-medium">{num}.</span>
                      <p className={`${font} ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t(`activateService.form.termsDetails.term${num}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Agreement Checkbox - Large Clickable Area */}
              <div
                onClick={handleContainerClick}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''
                  } ${errors.acceptTerms
                    ? 'border-red-500 bg-red-500/10'
                    : canAcceptTerms
                      ? formData.acceptTerms
                        ? 'border-coolnet-orange bg-coolnet-orange/10 shadow-lg shadow-coolnet-orange/20'
                        : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50'
                      : 'border-gray-500/30 bg-gray-500/10'
                  } ${canAcceptTerms ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                  } backdrop-blur-md`}
              >
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  disabled={!canAcceptTerms}
                  onCheckedChange={handleTermsCheckboxClick}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-5 h-5 ${errors.acceptTerms
                    ? 'border-red-500'
                    : canAcceptTerms
                      ? 'border-white/30'
                      : 'border-gray-500/30'
                    } ${canAcceptTerms ? 'bg-white/10' : 'bg-gray-500/10'} backdrop-blur-md data-[state=checked]:bg-coolnet-orange data-[state=checked]:border-coolnet-orange`}
                />
                <Label
                  htmlFor="terms"
                  onClick={(e) => e.stopPropagation()}
                  className={`${font} ${errors.acceptTerms
                    ? 'text-red-400'
                    : canAcceptTerms
                      ? 'text-white'
                      : 'text-gray-400'
                    } flex items-center gap-1 flex-1 ${!canAcceptTerms ? 'cursor-not-allowed' : 'cursor-pointer'} select-none`}
                >
                  {t('activateService.form.acceptTerms')}
                  <RequiredAsterisk />
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-red-400 text-sm mt-1">{errors.acceptTerms}</p>}

              {/* Tranzilla Logo */}
              
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">

              <Button
                type="submit"
                disabled={isLoading}
                className={`flex-1 bg-coolnet-purple hover:bg-coolnet-purple/80 text-white backdrop-blur-md ${font} ${isLoading ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('activateService.form.processing')}
                  </>
                ) : (
                  t('activateService.form.continueButton')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
