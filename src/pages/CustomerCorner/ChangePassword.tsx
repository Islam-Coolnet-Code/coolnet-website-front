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
import { Loader2, KeyRound, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ChangePassword: React.FC = () => {
  const { t, language } = useLanguage();
  const { session, setSession } = useAuth();
  const navigate = useNavigate();
  const { font } = useFont();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const forced = !!session?.forcePasswordChange;

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // On the forced first-login change, old_password is not required.
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
        title: t('customerCorner.changePassword.success'),
        description: t('customerCorner.changePassword.successDesc'),
      });
      navigate('/customer-corner/dashboard', { replace: true });
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'UNAUTHORIZED' || code === 'INVALID_CREDENTIALS') {
        setError(t('customerCorner.changePassword.wrongOld'));
      } else {
        setError(err instanceof Error ? err.message : t('customerCorner.changePassword.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-coolnet-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-coolnet-purple" />
              </div>
              <CardTitle className={`text-2xl text-gray-900 ${font}`}>
                {t('customerCorner.changePassword.title')}
              </CardTitle>
              <CardDescription className={`text-gray-600 ${font}`}>
                {t('customerCorner.changePassword.rules')}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {forced && (
                <div className={`mb-5 flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className={`text-sm text-amber-800 ${font}`}>
                    {t('customerCorner.changePassword.forcedNotice')}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!forced && (
                  <div className="space-y-2">
                    <label className={`text-sm font-medium text-gray-700 ${font}`}>
                      {t('customerCorner.changePassword.oldPassword')}
                    </label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => { setOldPassword(e.target.value); setError(''); }}
                      className="h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple"
                      dir="ltr"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.changePassword.newPassword')}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    className="h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple"
                    dir="ltr"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium text-gray-700 ${font}`}>
                    {t('customerCorner.changePassword.confirm')}
                  </label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    className="h-12 border-gray-300 focus:border-coolnet-purple focus:ring-coolnet-purple"
                    dir="ltr"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

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

export default ChangePassword;
