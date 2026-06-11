import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { changePassword, CustomerApiError } from '@/services/auth/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, KeyRound, AlertTriangle, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import englishLogo from '@/assets/logos/english.png';
import arabicLogo from '@/assets/logos/arabic.png';

const ChangePassword: React.FC = () => {
  const { t, language } = useLanguage();
  const { session, setSession } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();

  const isRTL = language === 'ar' || language === 'he';
  const forced = !!session?.forcePasswordChange;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live validation cues
  const lengthOk = newPassword.length >= 6;
  const confirmTouched = confirm.length > 0;
  const matchOk = confirmTouched && newPassword === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError(t('customerCorner.changePassword.tooShort'));
      return;
    }
    if (session && newPassword === session.userno) {
      setError(t('customerCorner.changePassword.sameAsUserno'));
      return;
    }
    if (newPassword !== confirm) {
      setError(t('customerCorner.changePassword.mismatch'));
      return;
    }
    if (!forced && !oldPassword) {
      setError(t('customerCorner.changePassword.oldRequired'));
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(newPassword, forced ? undefined : oldPassword);

      if (session) {
        setSession({
          ...session,
          token: result.token,
          tokenExpiresAt: result.tokenExpiresAt,
          forcePasswordChange: false,
        });
      }

      toast({
        title: t('customerCorner.toast.passwordChangedTitle'),
        description: t('customerCorner.toast.passwordChangedBody'),
      });
      navigate('/customer-corner/dashboard', { replace: true });
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS') {
        setError(t('customerCorner.changePassword.wrongOld'));
      } else {
        setError(t('customerCorner.changePassword.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coolnet-purple/5 via-gray-50 to-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Branded header: logo + title together on the brand purple */}
            <div className="bg-gradient-to-br from-coolnet-purple to-coolnet-purple-dark px-6 pt-7 pb-8 text-center">
              <img
                src={isRTL ? arabicLogo : englishLogo}
                alt="Coolnet"
                className="h-11 sm:h-12 mx-auto object-contain"
              />
              <div className="mt-5 inline-flex items-center justify-center gap-2">
                <KeyRound className="w-5 h-5 text-coolnet-orange" />
                <h1 className={`text-xl sm:text-2xl font-bold text-white ${font}`}>
                  {t('customerCorner.changePassword.title')}
                </h1>
              </div>
              <p className={`text-white/70 text-sm mt-2 ${font}`}>
                {t('customerCorner.changePassword.rules')}
              </p>
            </div>

            <CardContent className="pt-6 pb-8">
              {forced && (
                <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className={`text-sm text-amber-800 text-start ${font}`}>
                    {t('customerCorner.changePassword.forcedNotice')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!forced && (
                  <PasswordField
                    label={t('customerCorner.changePassword.oldPassword')}
                    value={oldPassword}
                    onChange={(v) => { setOldPassword(v); setError(''); }}
                    autoComplete="current-password"
                    disabled={loading}
                    font={font}
                    showLabel={t('customerCorner.login.showPassword')}
                    hideLabel={t('customerCorner.login.hidePassword')}
                  />
                )}

                <PasswordField
                  label={t('customerCorner.changePassword.newPassword')}
                  value={newPassword}
                  onChange={(v) => { setNewPassword(v); setError(''); }}
                  autoComplete="new-password"
                  disabled={loading}
                  font={font}
                  showLabel={t('customerCorner.login.showPassword')}
                  hideLabel={t('customerCorner.login.hidePassword')}
                  valid={newPassword.length > 0 ? lengthOk : undefined}
                />

                <PasswordField
                  label={t('customerCorner.changePassword.confirm')}
                  value={confirm}
                  onChange={(v) => { setConfirm(v); setError(''); }}
                  autoComplete="new-password"
                  disabled={loading}
                  font={font}
                  showLabel={t('customerCorner.login.showPassword')}
                  hideLabel={t('customerCorner.login.hidePassword')}
                  valid={confirmTouched ? matchOk : undefined}
                />

                {/* Live match hint */}
                {confirmTouched && (
                  <p className={`flex items-center gap-1.5 text-sm ${matchOk ? 'text-green-600' : 'text-red-600'} ${font}`}>
                    {matchOk ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {matchOk
                      ? t('customerCorner.changePassword.match')
                      : t('customerCorner.changePassword.mismatch')}
                  </p>
                )}

                {error && (
                  <p className={`text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 ${font}`}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !newPassword || !confirm}
                  className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium ${font}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('customerCorner.changePassword.saving')}
                    </span>
                  ) : (
                    t('customerCorner.changePassword.submit')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled: boolean;
  font: string;
  showLabel: string;
  hideLabel: string;
  /** undefined = no indicator, true = green check, false = red border */
  valid?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label, value, onChange, autoComplete, disabled, font, showLabel, hideLabel, valid,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium text-gray-700 ${font}`}>{label}</label>
      <div className="relative">
        <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 ps-11 pe-11 border-gray-300 focus-visible:ring-coolnet-purple ${valid === false ? 'border-red-400' : ''} ${valid === true ? 'border-green-400' : ''}`}
          dir="ltr"
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
