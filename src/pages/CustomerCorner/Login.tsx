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
import { Loader2, User, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-coolnet-purple/5 via-gray-50 to-gray-50">
      <CustomerCornerHeader />

      <main className="container mx-auto px-4 py-10 sm:py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-coolnet-purple to-coolnet-orange" />
            <CardHeader className="text-center pb-2 pt-8">
              <div className="w-16 h-16 bg-coolnet-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-coolnet-purple" />
              </div>
              <CardTitle className={`text-2xl text-gray-900 ${font}`}>
                {t('customerCorner.login.title')}
              </CardTitle>
              <CardDescription className={`text-gray-600 ${font}`}>
                {t('customerCorner.login.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subscriber number */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.login.userno')}
                  </label>
                  <div className="relative">
                    <User className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={userno}
                      onChange={(e) => { setUserno(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.usernoPlaceholder')}
                      className={`h-12 ps-11 border-gray-300 focus-visible:ring-coolnet-purple ${error ? 'border-red-400' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.login.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.passwordPlaceholder')}
                      className={`h-12 ps-11 pe-11 border-gray-300 focus-visible:ring-coolnet-purple ${error ? 'border-red-400' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                      aria-label={showPassword ? t('customerCorner.login.hidePassword') : t('customerCorner.login.showPassword')}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className={`text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 ${font}`}>
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || !userno.trim() || !password}
                  className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium ${font}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('customerCorner.login.signingIn')}
                    </span>
                  ) : (
                    t('customerCorner.login.signIn')
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                <p className={`text-xs text-gray-500 ${font}`}>
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
