import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { changePassword, CustomerApiError } from '@/services/auth/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, KeyRound, AlertTriangle, Lock, Eye, EyeOff, Check, ShieldCheck, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChangePassword: React.FC = () => {
  const { t } = useLanguage();
  const { session, setSession } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();

  const forced = !!session?.forcePasswordChange;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Live requirement checks
  const lengthOk = newPassword.length >= 6;
  const notUsernoOk = newPassword.length > 0 && newPassword !== session?.userno;
  const matchOk = confirm.length > 0 && newPassword === confirm;
  const allOk = lengthOk && notUsernoOk && matchOk && (forced || oldPassword.length > 0);

  const strength = getStrength(newPassword);

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-coolnet-purple-tint-10 via-gray-50 to-coolnet-orange-tint-10">
      {/* Decorative brand glow */}
      <div className="pointer-events-none absolute -top-24 -start-24 w-80 h-80 rounded-full bg-coolnet-purple-tint-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -end-24 w-96 h-96 rounded-full bg-coolnet-orange-tint-20 blur-3xl" />

      <CustomerCornerHeader showLogout />

      <main className="relative container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-2xl shadow-coolnet-purple-tint-20 border-0 overflow-hidden animate-fade-in">
            <div className="h-2 bg-gradient-to-r from-coolnet-purple via-coolnet-purple-light to-coolnet-orange" />

            <CardHeader className="relative text-center px-6 sm:px-10 pt-10 pb-10 bg-gradient-to-br from-coolnet-purple to-coolnet-purple-darker overflow-hidden">
              <div className="pointer-events-none absolute -top-16 -end-10 w-40 h-40 rounded-full bg-coolnet-orange-tint-25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -start-12 w-40 h-40 rounded-full bg-coolnet-purple-light-tint-30 blur-2xl" />

              <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-coolnet-orange to-coolnet-orange-dark shadow-lg shadow-coolnet-orange-tint-40 ring-4 ring-white/15">
                <KeyRound className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`relative text-3xl leading-tight text-white ${font}`}>
                {t('customerCorner.changePassword.title')}
              </CardTitle>
              <CardDescription className={`relative text-base leading-relaxed text-white/80 ${font}`}>
                {forced
                  ? t('customerCorner.changePassword.subtitleForced')
                  : t('customerCorner.changePassword.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pt-8 pb-10 bg-white">
              {forced && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <p className={`text-base leading-relaxed text-amber-800 text-start ${font}`}>
                    {t('customerCorner.changePassword.forcedNotice')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-2">
                  <PasswordField
                    label={t('customerCorner.changePassword.newPassword')}
                    value={newPassword}
                    onChange={(v) => { setNewPassword(v); setError(''); }}
                    autoComplete="new-password"
                    disabled={loading}
                    font={font}
                    showLabel={t('customerCorner.login.showPassword')}
                    hideLabel={t('customerCorner.login.hidePassword')}
                  />

                  {/* Strength meter */}
                  {newPassword.length > 0 && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors ${
                              i < strength.score ? strength.barClass : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${strength.textClass} ${font}`}>
                        {t(`customerCorner.changePassword.${strength.key}`)}
                      </span>
                    </div>
                  )}
                </div>

                <PasswordField
                  label={t('customerCorner.changePassword.confirm')}
                  value={confirm}
                  onChange={(v) => { setConfirm(v); setError(''); }}
                  autoComplete="new-password"
                  disabled={loading}
                  font={font}
                  showLabel={t('customerCorner.login.showPassword')}
                  hideLabel={t('customerCorner.login.hidePassword')}
                  invalid={confirm.length > 0 && !matchOk}
                />

                {/* Requirements checklist */}
                <div className="rounded-xl bg-coolnet-purple-tint-5 border border-coolnet-purple-tint-15 px-5 py-4">
                  <p className={`text-sm font-semibold uppercase tracking-wide text-coolnet-purple mb-3 text-start ${font}`}>
                    {t('customerCorner.changePassword.requirements')}
                  </p>
                  <ul className="space-y-2.5">
                    <Requirement met={lengthOk} font={font} label={t('customerCorner.changePassword.reqLength')} />
                    <Requirement met={notUsernoOk} font={font} label={t('customerCorner.changePassword.reqNotUserno')} />
                    <Requirement met={matchOk} font={font} label={t('customerCorner.changePassword.reqMatch')} />
                  </ul>
                </div>

                {error && (
                  <p className={`text-red-600 text-base bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-start ${font}`}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !allOk}
                  className={`w-full h-14 text-lg bg-gradient-to-r from-coolnet-purple via-coolnet-purple-light to-coolnet-orange hover:from-coolnet-purple-dark hover:via-coolnet-purple hover:to-coolnet-orange-dark text-white font-semibold shadow-lg shadow-coolnet-purple-tint-30 hover:shadow-xl hover:shadow-coolnet-orange-tint-30 transition-all disabled:opacity-50 disabled:shadow-none ${font}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('customerCorner.changePassword.saving')}
                    </span>
                  ) : (
                    t('customerCorner.changePassword.submit')
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-coolnet-purple-tint-15 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-coolnet-purple-tint-10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-coolnet-purple" />
                </span>
                <p className={`text-sm text-gray-600 text-start ${font}`}>
                  {t('customerCorner.login.securityNotice')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

/** Password strength: 1 = weak, 2 = fair, 3 = strong. */
function getStrength(value: string) {
  let points = 0;
  if (value.length >= 6) points++;
  if (value.length >= 10) points++;
  if (/[a-zA-Z]/.test(value) && /\d/.test(value)) points++;
  if (/[^a-zA-Z0-9]/.test(value)) points++;

  if (points <= 1) {
    return { score: 1, key: 'strengthWeak', barClass: 'bg-red-500', textClass: 'text-red-600' };
  }
  if (points <= 2) {
    return { score: 2, key: 'strengthFair', barClass: 'bg-amber-500', textClass: 'text-amber-600' };
  }
  return { score: 3, key: 'strengthStrong', barClass: 'bg-green-500', textClass: 'text-green-600' };
}

const Requirement: React.FC<{ met: boolean; label: string; font: string }> = ({ met, label, font }) => (
  <li className={`flex items-center gap-2.5 text-base leading-relaxed text-start ${met ? 'text-green-700' : 'text-gray-500'} ${font}`}>
    {met ? (
      <Check className="w-5 h-5 shrink-0 text-green-600" />
    ) : (
      <Circle className="w-5 h-5 shrink-0 text-gray-300" />
    )}
    {label}
  </li>
);

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  disabled: boolean;
  font: string;
  showLabel: string;
  hideLabel: string;
  invalid?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label, value, onChange, autoComplete, disabled, font, showLabel, hideLabel, invalid,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <label className={`block text-base font-semibold text-coolnet-purple text-start ${font}`}>{label}</label>
      <div className="relative group">
        <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-6 h-6 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-14 ps-14 pe-14 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors ${invalid ? 'border-red-400 bg-red-50/50' : ''}`}
          dir="ltr"
          disabled={disabled}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute top-1/2 -translate-y-1/2 end-4 text-coolnet-purple-tint-50 hover:text-coolnet-orange transition-colors"
          tabIndex={-1}
          aria-label={show ? hideLabel : showLabel}
        >
          {show ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
