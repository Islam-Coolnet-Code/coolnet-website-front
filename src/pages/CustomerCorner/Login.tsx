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
import { Loader2, User, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();
  const isRTL = language === 'ar';

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
      } else {
        toast({
          title: t('customerCorner.login.welcome'),
          description: session.username,
        });
        navigate('/customer-corner/dashboard', { replace: true });
      }
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'NOT_FOUND') {
        setError(t('customerCorner.login.userNotFound'));
      } else if (code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS') {
        setError(t('customerCorner.login.invalidCredentials'));
      } else {
        setError(err instanceof Error ? err.message : t('customerCorner.login.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
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
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subscriber number */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.login.userno')}
                  </label>
                  <div className="relative">
                    <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={userno}
                      onChange={(e) => { setUserno(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.usernoPlaceholder')}
                      className={`h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple
                                ${isRTL ? 'pr-12 text-right' : 'pl-12'} ${error ? 'border-red-500' : ''}`}
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
                    <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder={t('customerCorner.login.passwordPlaceholder')}
                      className={`h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple
                                ${isRTL ? 'pr-12 pl-12 text-right' : 'pl-12 pr-12'} ${error ? 'border-red-500' : ''}`}
                      dir="ltr"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading || !userno.trim() || !password}
                  className={`w-full h-12 bg-coolnet-purple hover:bg-coolnet-purple-dark text-white font-medium transition-all duration-200 ${font}`}
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

              {/* Security notice */}
              <div className={`mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
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
