import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFont } from '@/hooks/use-font';
import { getUserDetails, getUserSessions, extendExpiration, CustomerApiError } from '@/services/auth/api';
import CustomerCornerHeader from '@/components/CustomerCorner/CustomerCornerHeader';
import LineStatusCard from '@/components/CustomerCorner/LineStatusCard';
import UsageCard from '@/components/CustomerCorner/UsageCard';
import ExtendDialog from '@/components/CustomerCorner/ExtendDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { session } = useAuth();
  const { font } = useFont();
  const { toast } = useToast();
  const isRTL = language === 'ar';

  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extending, setExtending] = useState(false);

  const detailsQuery = useQuery({
    queryKey: ['customer', 'details', session?.userno],
    queryFn: getUserDetails,
    enabled: !!session,
  });

  const sessionsQuery = useQuery({
    queryKey: ['customer', 'sessions', session?.userno],
    queryFn: getUserSessions,
    enabled: !!session,
  });

  const handleExtend = async () => {
    setExtending(true);
    try {
      const result = await extendExpiration();
      toast({
        title: t('customerCorner.dashboard.extendSuccess'),
        description: result.expiration,
      });
      await detailsQuery.refetch();
      setShowExtendDialog(false);
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'NOT_EXPIRED') {
        toast({ title: t('customerCorner.dashboard.notExpired') });
        await detailsQuery.refetch();
        setShowExtendDialog(false);
      } else {
        toast({
          title: t('customerCorner.dashboard.extendError'),
          description: err instanceof Error ? err.message : undefined,
          variant: 'destructive',
        });
      }
    } finally {
      setExtending(false);
    }
  };

  const details = detailsQuery.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark rounded-2xl p-6 mb-8 text-white">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <p className={`text-white/80 text-sm ${font}`}>{t('customerCorner.dashboard.welcome')}</p>
              <h1 className={`text-2xl font-bold ${font}`}>
                {details?.fullName || session?.username || session?.userno}
              </h1>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Loading */}
        {detailsQuery.isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-coolnet-purple" />
          </div>
        )}

        {/* Error */}
        {detailsQuery.isError && !detailsQuery.isLoading && (
          <Card className="border-red-200">
            <CardContent className="py-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className={`text-gray-700 mb-4 ${font}`}>{t('customerCorner.dashboard.loadError')}</p>
              <Button onClick={() => detailsQuery.refetch()} className={`bg-coolnet-purple ${font}`}>
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {details && (
          <div className="grid md:grid-cols-2 gap-6">
            <LineStatusCard
              details={details}
              onExtendClick={() => setShowExtendDialog(true)}
              extending={extending}
            />

            {/* Personal info */}
            <Card className="shadow-sm md:col-span-2">
              <CardContent className="py-6">
                <div className="grid sm:grid-cols-3 gap-5">
                  <InfoItem icon={<User className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.fullName')} value={details.fullName || '—'} isRTL={isRTL} font={font} />
                  <InfoItem icon={<Hash className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.subscriberNo')} value={details.userNo} ltr isRTL={isRTL} font={font} />
                  <InfoItem icon={<Phone className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.mobile')} value={details.mobile || '—'} ltr isRTL={isRTL} font={font} />
                </div>
              </CardContent>
            </Card>

            {/* Usage */}
            {sessionsQuery.data && <UsageCard usage={sessionsQuery.data} />}
            {sessionsQuery.isLoading && (
              <Card className="shadow-sm md:col-span-2">
                <CardContent className="py-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-coolnet-purple" />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <ExtendDialog
        open={showExtendDialog}
        onOpenChange={setShowExtendDialog}
        onConfirm={handleExtend}
        loading={extending}
      />
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
  isRTL: boolean;
  font: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, ltr, isRTL, font }) => (
  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className={isRTL ? 'text-right' : ''}>
      <p className={`text-gray-500 text-sm ${font}`}>{label}</p>
      <p className={`text-gray-900 font-medium ${font}`} dir={ltr ? 'ltr' : undefined}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
