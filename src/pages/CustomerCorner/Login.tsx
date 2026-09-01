import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import InstallAppSection from '@/components/InstallAppSection';
import { loginUser, requestPasswordSms, CustomerApiError } from '@/services/auth/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, User, Lock, ShieldCheck, Eye, EyeOff, Info, MessageSquare, CheckCircle2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/** Subscriber numbers are shown and typed as exactly 5 digits ("01111"). */
const USERNO_DIGITS = 5;

/**
 * The password field is deliberately unconstrained - no length cap, no
 * digits-only filter. Issued passwords are 4 digits (5 before that change, and
 * those are still live), but a subscriber can replace theirs on the
 * change-password page with anything of 6+ characters including letters.
 * Narrowing this field to digits would silently swallow their keystrokes and
 * lock them out of their own account. The server is the authority on whether a
 * password is right; all this form checks is that one was typed.
 */

/**
 * Fold Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) numerals to ASCII.
 *
 * An Arabic keyboard types ٣٤٧٦٨, which is not \d — without this the field
 * would silently swallow every keystroke and look broken to exactly the
 * audience this page is for.
 */
const toAsciiDigits = (value: string) =>
  value.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
       .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/**
 * Normalize to ASCII digits, drop everything else, and cap the length.
 *
 * Applied on change rather than only validated on submit, so the field can
 * never hold something the form would refuse: a pasted "059-912-3456", a
 * stray space off a phone keyboard, or a sixth digit all get dropped as they
 * arrive instead of failing later.
 */
const onlyDigits = (value: string, max: number) =>
  toAsciiDigits(value).replace(/\D/g, '').slice(0, max);

const Login: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();

  const [userno, setUserno] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // "Send my password by SMS" — the only way to get a first password or to
  // recover a forgotten one. Asks for the subscriber number AND the mobile on
  // the subscription, in its own dialog: two fields the subscriber must get
  // right together, kept out of the way of the everyday sign-in form.
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsUserno, setSmsUserno] = useState('');
  const [smsMobile, setSmsMobile] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsSentTo, setSmsSentTo] = useState('');
  const [smsError, setSmsError] = useState('');

  const clearFeedback = () => {
    setError('');
    setSmsSentTo('');
  };

  const openPasswordRequest = () => {
    clearFeedback();
    setSmsError('');
    // Carry over whatever they already typed above so it is not asked twice.
    setSmsUserno(userno);
    setSmsMobile('');
    setSmsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!userno || !password) {
      setError(t('customerCorner.login.required'));
      return;
    }
    // The subscriber field already refuses non-digits and a sixth digit, so the
    // only way to land here is a short entry. The password is not checked for
    // length - see the note on USERNO_DIGITS above.
    if (userno.length !== USERNO_DIGITS) {
      setError(t('customerCorner.login.usernoLength'));
      return;
    }

    setLoading(true);
    try {
      const session = await loginUser(userno, password);
      login(session);

      toast({
        title: t('customerCorner.toast.signedInTitle'),
        description: t('customerCorner.toast.signedInBody'),
      });
      navigate('/customer-corner/dashboard', { replace: true });
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'NOT_FOUND') {
        setError(t('customerCorner.login.userNotFound'));
      } else if (code === 'PASSWORD_NOT_SET') {
        // No password has ever been issued — point at the SMS button rather
        // than at "wrong password", which would send them hunting for one.
        setError(t('customerCorner.login.passwordNotSet'));
      } else if (code === 'ACCOUNT_BLOCKED') {
        setError(t('customerCorner.login.userDisabled'));
      } else if (code === 'ACCOUNT_LOCKED') {
        const minutes =
          err instanceof CustomerApiError ? Number(err.details?.minutes_remaining) : NaN;
        setError(
          Number.isFinite(minutes) && minutes > 0
            ? t('customerCorner.login.accountLocked').replace('{minutes}', String(minutes))
            : t('customerCorner.login.accountLockedGeneric')
        );
      } else if (code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS') {
        setError(t('customerCorner.login.invalidCredentials'));
      } else if (
        code === 'INVALID_API_KEY' ||
        code === 'UPSTREAM_UNAVAILABLE' ||
        code === 'UPSTREAM_ERROR'
      ) {
        setError(t('customerCorner.login.serviceUnavailable'));
      } else {
        setError(t('customerCorner.login.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');

    if (!smsUserno || !smsMobile.trim()) {
      setSmsError(t('customerCorner.login.sendPasswordNeedsBoth'));
      return;
    }
    if (smsUserno.length !== USERNO_DIGITS) {
      setSmsError(t('customerCorner.login.usernoLength'));
      return;
    }

    setSmsLoading(true);
    try {
      const result = await requestPasswordSms(smsUserno, smsMobile.trim());

      setSmsOpen(false);
      setSmsSentTo(result.mobileMasked);
      // Put the subscriber number they just verified into the sign-in form and
      // clear the password box: the old password no longer works, and the one
      // arriving by SMS goes there.
      setUserno(smsUserno);
      setPassword('');
      setError('');
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      // An unknown subscriber number and a mobile that does not match it get
      // the SAME answer. They are both "your details do not line up", and
      // telling the two apart would confirm to a stranger which subscriber
      // numbers exist.
      if (code === 'NOT_FOUND' || code === 'MOBILE_MISMATCH') {
        setSmsError(t('customerCorner.login.sendPasswordMismatch'));
      } else if (code === 'RESET_COOLDOWN' || code === 'RATE_LIMIT_EXCEEDED') {
        setSmsError(t('customerCorner.login.sendPasswordCooldown'));
      } else if (code === 'NO_MOBILE') {
        setSmsError(t('customerCorner.login.sendPasswordNoMobile'));
      } else if (code === 'ACCOUNT_BLOCKED') {
        setSmsError(t('customerCorner.login.userDisabled'));
      } else if (
        code === 'SMS_FAILED' ||
        code === 'INVALID_API_KEY' ||
        code === 'UPSTREAM_UNAVAILABLE' ||
        code === 'UPSTREAM_ERROR'
      ) {
        setSmsError(t('customerCorner.login.serviceUnavailable'));
      } else {
        setSmsError(t('customerCorner.login.error'));
      }
    } finally {
      setSmsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-coolnet-purple-tint-10 via-gray-50 to-coolnet-orange-tint-10">
      {/* Decorative brand glow */}
      <div className="pointer-events-none absolute -top-24 -start-24 w-80 h-80 rounded-full bg-coolnet-purple-tint-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -end-24 w-96 h-96 rounded-full bg-coolnet-orange-tint-20 blur-3xl" />

      <CustomerCornerHeader />

      <main className="relative container mx-auto px-4 py-12 sm:py-20">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-2xl shadow-coolnet-purple-tint-20 border-0 overflow-hidden animate-fade-in">
            <div className="h-2 bg-gradient-to-r from-coolnet-purple via-coolnet-purple-light to-coolnet-orange" />

            <CardHeader className="relative text-center px-5 sm:px-10 pt-8 pb-8 sm:pt-10 sm:pb-10 bg-gradient-to-br from-coolnet-purple to-coolnet-purple-darker overflow-hidden">
              <div className="pointer-events-none absolute -top-16 -end-10 w-40 h-40 rounded-full bg-coolnet-orange-tint-25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -start-12 w-40 h-40 rounded-full bg-coolnet-purple-light-tint-30 blur-2xl" />

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 bg-gradient-to-br from-coolnet-orange to-coolnet-orange-dark shadow-lg shadow-coolnet-orange-tint-40 ring-4 ring-white/15">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <CardTitle className={`relative text-2xl sm:text-3xl leading-tight text-white break-words ${font}`}>
                {t('customerCorner.login.title')}
              </CardTitle>
              <CardDescription className={`relative text-sm sm:text-base leading-relaxed text-white/80 ${font}`}>
                {t('customerCorner.login.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 sm:px-10 pt-6 sm:pt-8 pb-8 sm:pb-10 bg-white">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Subscriber number */}
                <div className="space-y-2">
                  <label className={`block text-sm sm:text-base font-semibold text-coolnet-purple break-words ${font}`}>
                    {t('customerCorner.login.userno')}
                  </label>
                  <div className="relative group">
                    <User className="absolute top-1/2 -translate-y-1/2 start-3 sm:start-4 w-5 h-5 sm:w-6 sm:h-6 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={USERNO_DIGITS}
                      value={userno}
                      onChange={(e) => { setUserno(onlyDigits(e.target.value, USERNO_DIGITS)); clearFeedback(); }}
                      placeholder={t('customerCorner.login.usernoPlaceholder')}
                      className={`h-12 sm:h-14 ps-11 sm:ps-14 text-base tracking-[0.3em] bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors ${error ? 'border-red-400 bg-red-50/50' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className={`block text-sm sm:text-base font-semibold text-coolnet-purple break-words ${font}`}>
                    {t('customerCorner.login.password')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-3 sm:start-4 w-5 h-5 sm:w-6 sm:h-6 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); setSmsError(''); }}
                      placeholder={t('customerCorner.login.passwordPlaceholder')}
                      className={`h-12 sm:h-14 ps-11 pe-11 sm:ps-14 sm:pe-14 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors ${error ? 'border-red-400 bg-red-50/50' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 -translate-y-1/2 end-3 sm:end-4 text-coolnet-purple-tint-50 hover:text-coolnet-orange transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? t('customerCorner.login.hidePassword') : t('customerCorner.login.showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Eye className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className={`text-red-600 text-base bg-red-50 border border-red-100 rounded-lg px-4 py-3 ${font}`}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || userno.length !== USERNO_DIGITS || !password}
                  className={`w-full h-14 text-lg bg-gradient-to-r from-coolnet-purple via-coolnet-purple-light to-coolnet-orange hover:from-coolnet-purple-dark hover:via-coolnet-purple hover:to-coolnet-orange-dark text-white font-semibold shadow-lg shadow-coolnet-purple-tint-30 hover:shadow-xl hover:shadow-coolnet-orange-tint-30 transition-all disabled:opacity-50 disabled:shadow-none ${font}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {t('customerCorner.login.signingIn')}
                    </span>
                  ) : (
                    t('customerCorner.login.signIn')
                  )}
                </Button>
              </form>

              {/* First time here, or forgot the password: have a new one texted
                  to the mobile registered on the subscription. */}
              <div className="mt-7 pt-6 border-t border-coolnet-purple-tint-15 space-y-4">
                <div className="relative flex items-start gap-3 rounded-xl border border-coolnet-orange-tint-30 bg-gradient-to-br from-coolnet-orange-tint-15 to-coolnet-purple-tint-10 px-4 py-4 overflow-hidden">
                  <span className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-coolnet-orange to-coolnet-purple" />
                  <Info className="w-5 h-5 text-coolnet-orange-dark shrink-0 mt-0.5 ms-1.5" />
                  <p className={`text-sm leading-loose text-coolnet-purple-darker text-start ${font}`}>
                    {t('customerCorner.login.sendPasswordNote')}
                  </p>
                </div>

                {smsSentTo && (
                  <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <p className={`text-sm leading-relaxed text-green-800 text-start ${font}`}>
                      {t('customerCorner.login.sendPasswordSent').replace('{mobile}', smsSentTo)}
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={openPasswordRequest}
                  disabled={loading}
                  className={`w-full h-12 sm:h-14 px-3 text-base whitespace-normal leading-tight border-2 border-coolnet-purple-tint-30 text-coolnet-purple hover:bg-coolnet-purple-tint-5 hover:border-coolnet-orange hover:text-coolnet-orange-dark font-semibold transition-all disabled:opacity-50 ${font}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5 shrink-0" />
                    {t('customerCorner.login.sendPassword')}
                  </span>
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-coolnet-purple-tint-15 flex items-center gap-3 rounded-lg">
                <span className="w-10 h-10 rounded-lg bg-coolnet-purple-tint-10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-coolnet-purple" />
                </span>
                <p className={`text-sm text-gray-600 ${font}`}>
                  {t('customerCorner.login.securityNotice')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscribers who sign in here are the ones who come back weekly —
              offer them the home-screen shortcut right under the form. */}
          <InstallAppSection variant="card" />
        </div>
      </main>

      {/* Ask for the subscriber number AND the mobile on the subscription.
          Both must line up before anything is sent — the number typed here is
          only ever compared with the one on file, never used as a destination. */}
      <Dialog
        open={smsOpen}
        onOpenChange={(open) => {
          // A request in flight has already reached the SMS gateway; let it
          // finish rather than leaving the customer unsure whether it went.
          if (smsLoading) return;
          setSmsOpen(open);
          if (!open) setSmsError('');
        }}
      >
        {/* bg-white explicitly: DialogContent's own `bg-background` resolves to
            hsl(var(--background)), and that token is malformed in index.css
            ("38% 38% 288"), so the browser drops the declaration and the panel
            renders see-through over the login form. Painting it here fixes this
            dialog without touching a token a dozen other components read.
            The close button is positioned `right-4` physically, which lands on
            top of the title once the page is RTL - move it to the far side. */}
        <DialogContent
          className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl
                     rtl:[&>button]:right-auto rtl:[&>button]:left-4"
        >
          <DialogHeader>
            <DialogTitle className={`text-xl text-coolnet-purple text-start ${font}`}>
              {t('customerCorner.login.sendPasswordTitle')}
            </DialogTitle>
            <DialogDescription className={`text-sm leading-relaxed text-start ${font}`}>
              {t('customerCorner.login.sendPasswordDialogNote')}
            </DialogDescription>
          </DialogHeader>

          {/* What to type, then where to find the subscriber number — the
              second line is the one that unblocks a customer who does not know
              it, so it is kept visible rather than tucked under the field. */}
          <div className="rounded-xl border border-coolnet-purple-tint-15 bg-coolnet-purple-tint-5 px-4 py-3 space-y-2">
            <p className={`text-sm leading-relaxed text-start text-coolnet-purple-darker ${font}`}>
              {t('customerCorner.login.sendPasswordDialogStep')}
            </p>
            <p className={`text-xs leading-relaxed text-start text-coolnet-purple-tint-80 ${font}`}>
              {t('customerCorner.login.sendPasswordDialogHint')}
            </p>
          </div>

          <form onSubmit={handleRequestPassword} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className={`block text-sm font-semibold text-coolnet-purple text-start ${font}`}>
                {t('customerCorner.login.userno')}
              </label>
              <div className="relative group">
                <User className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={USERNO_DIGITS}
                  value={smsUserno}
                  onChange={(e) => { setSmsUserno(onlyDigits(e.target.value, USERNO_DIGITS)); setSmsError(''); }}
                  placeholder={t('customerCorner.login.usernoPlaceholder')}
                  className="h-12 ps-11 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors"
                  dir="ltr"
                  disabled={smsLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`block text-sm font-semibold text-coolnet-purple text-start ${font}`}>
                {t('customerCorner.login.sendPasswordMobile')}
              </label>
              <div className="relative group">
                <Smartphone className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                <Input
                  type="tel"
                  inputMode="tel"
                  value={smsMobile}
                  onChange={(e) => { setSmsMobile(e.target.value); setSmsError(''); }}
                  placeholder={t('customerCorner.login.sendPasswordMobilePlaceholder')}
                  className="h-12 ps-11 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors"
                  dir="ltr"
                  disabled={smsLoading}
                  autoComplete="tel"
                />
              </div>
              <p className={`text-xs leading-relaxed text-coolnet-purple-tint-80 text-start ${font}`}>
                {t('customerCorner.login.sendPasswordMobileHint')}
              </p>
            </div>

            {/* whitespace-pre-line: these messages are two lines — a reason
                and what to do about it — and the break carries meaning. */}
            {smsError && (
              <p className={`text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-start whitespace-pre-line ${font}`}>
                {smsError}
              </p>
            )}

            <Button
              type="submit"
              disabled={smsLoading || smsUserno.length !== USERNO_DIGITS || !smsMobile.trim()}
              className={`w-full h-12 px-3 text-base whitespace-normal leading-tight bg-gradient-to-r from-coolnet-purple via-coolnet-purple-light to-coolnet-orange hover:from-coolnet-purple-dark hover:via-coolnet-purple hover:to-coolnet-orange-dark text-white font-semibold shadow-lg shadow-coolnet-purple-tint-30 transition-all disabled:opacity-50 disabled:shadow-none ${font}`}
            >
              {smsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                  {t('customerCorner.login.sendPasswordSending')}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  {t('customerCorner.login.sendPassword')}
                </span>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
