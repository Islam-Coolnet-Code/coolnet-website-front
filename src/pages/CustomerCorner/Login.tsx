import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import { loginUser, CustomerApiError } from '@/services/auth/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Lock, ShieldCheck, Eye, EyeOff, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userno.trim() || !password) {
      setError(t('customerCorner.login.required'));
      return;
    }

    setLoading(true);
    try {
      const session = await loginUser(userno.trim(), password);
      login(session);

      if (session.forcePasswordChange) {
        navigate('/customer-corner/change-password', { replace: true });
        return;
      }

      toast({
        title: t('customerCorner.toast.signedInTitle'),
        description: t('customerCorner.toast.signedInBody'),
      });
      navigate('/customer-corner/dashboard', { replace: true });
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'NOT_FOUND') {
        setError(t('customerCorner.login.userNotFound'));
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

            <CardHeader className="relative text-center px-6 sm:px-10 pt-10 pb-10 bg-gradient-to-br from-coolnet-purple to-coolnet-purple-darker overflow-hidden">
              <div className="pointer-events-none absolute -top-16 -end-10 w-40 h-40 rounded-full bg-coolnet-orange-tint-25 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-20 -start-12 w-40 h-40 rounded-full bg-coolnet-purple-light-tint-30 blur-2xl" />

              <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-coolnet-orange to-coolnet-orange-dark shadow-lg shadow-coolnet-orange-tint-40 ring-4 ring-white/15">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`relative text-3xl leading-tight text-white ${font}`}>
                {t('customerCorner.login.title')}
              </CardTitle>
              <CardDescription className={`relative text-base leading-relaxed text-white/80 ${font}`}>
                {t('customerCorner.login.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 sm:px-10 pt-8 pb-10 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Subscriber number */}
                <div className="space-y-2">
                  <label className={`block text-base font-semibold text-coolnet-purple ${font}`}>
                    {t('customerCorner.login.userno')}
                  </label>
                  <div className="relative group">
                    <User className="absolute top-1/2 -translate-y-1/2 start-4 w-6 h-6 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={userno}
                      onChange={(e) => { setUserno(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.usernoPlaceholder')}
                      className={`h-14 ps-14 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors ${error ? 'border-red-400 bg-red-50/50' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className={`block text-base font-semibold text-coolnet-purple ${font}`}>
                    {t('customerCorner.login.password')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-6 h-6 text-coolnet-purple-tint-50 group-focus-within:text-coolnet-orange transition-colors pointer-events-none" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.passwordPlaceholder')}
                      className={`h-14 ps-14 pe-14 text-base bg-coolnet-purple-tint-5 border-coolnet-purple-tint-25 focus-visible:ring-coolnet-orange focus-visible:border-coolnet-orange transition-colors ${error ? 'border-red-400 bg-red-50/50' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 -translate-y-1/2 end-4 text-coolnet-purple-tint-50 hover:text-coolnet-orange transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? t('customerCorner.login.hidePassword') : t('customerCorner.login.showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* First-time password hint */}
                <div className="relative flex items-start gap-3 rounded-xl border border-coolnet-orange-tint-30 bg-gradient-to-br from-coolnet-orange-tint-15 to-coolnet-purple-tint-10 px-4 py-4 overflow-hidden">
                  <span className="absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b from-coolnet-orange to-coolnet-purple" />
                  <Info className="w-5 h-5 text-coolnet-orange-dark shrink-0 mt-0.5 ms-1.5" />
                  <p className={`text-sm leading-loose text-coolnet-purple-darker ${font}`}>
                    {t('customerCorner.login.firstTimeNoteBefore')}{' '}
                    <span className="font-bold text-white bg-gradient-to-r from-coolnet-orange to-coolnet-orange-dark rounded-md px-1.5 py-0.5 shadow-sm shadow-coolnet-orange-tint-40 whitespace-nowrap">
                      {t('customerCorner.login.firstTimeNoteHighlight')}
                    </span>
                    {t('customerCorner.login.firstTimeNoteAfter')}
                  </p>
                </div>

                {error && (
                  <p className={`text-red-600 text-base bg-red-50 border border-red-100 rounded-lg px-4 py-3 ${font}`}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !userno.trim() || !password}
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

                <p className={`text-sm leading-relaxed text-center text-coolnet-purple-tint-80 font-medium ${font}`}>
                  {t('customerCorner.login.firstLoginResetNote')}
                </p>
              </form>

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
        </div>
      </main>
    </div>
  );
};

export default Login;
