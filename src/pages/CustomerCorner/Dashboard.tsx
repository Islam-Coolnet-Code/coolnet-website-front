import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { User, Phone, Hash, Loader2, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, shouldShowUsage, maskMobile } from '@/utils/customerZone';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { session } = useAuth();
  const { font } = useFont();
  const { toast } = useToast();
  const navigate = useNavigate();

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
        title: t('customerCorner.toast.extendedTitle'),
        description: t('customerCorner.toast.extendedBody').replace(
          '{date}',
          formatDate(result.expiration, language)
        ),
      });
      await detailsQuery.refetch();
      setShowExtendDialog(false);
    } catch (err) {
      const code = err instanceof CustomerApiError ? err.code : '';
      if (code === 'NOT_EXPIRED') {
        toast({
          title: t('customerCorner.toast.stillActiveTitle'),
          description: t('customerCorner.toast.stillActiveBody'),
        });
        await detailsQuery.refetch();
        setShowExtendDialog(false);
      } else if (code === 'EXTEND_LIMIT_REACHED') {
        toast({
          title: t('customerCorner.toast.extendLimitTitle'),
          description: t('customerCorner.toast.extendLimitBody'),
        });
        setShowExtendDialog(false);
      } else {
        toast({
          title: t('customerCorner.toast.extendFailedTitle'),
          description: t('customerCorner.toast.extendFailedBody'),
          variant: 'destructive',
        });
      }
    } finally {
      setExtending(false);
    }
  };

  const details = detailsQuery.data;
  const usage = sessionsQuery.data;
  const showUsage = !!usage && shouldShowUsage(usage.lastWeek.downloadGb);

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark rounded-2xl p-6 mb-8 text-white">
          <div className="absolute -top-8 -end-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-white/80 text-sm ${font}`}>{t('customerCorner.dashboard.welcome')}</p>
              <h1 className={`text-2xl font-bold truncate ${font}`}>
                {details?.fullName || session?.username || session?.userno}
              </h1>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {detailsQuery.isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 h-40 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="md:col-span-2 h-28 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="md:col-span-2 h-44 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        )}

        {/* Error */}
        {detailsQuery.isError && !detailsQuery.isLoading && (
          <Card className="border-red-200">
            <CardContent className="py-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className={`text-gray-700 mb-4 ${font}`}>{t('customerCorner.dashboard.loadError')}</p>
              <Button onClick={() => detailsQuery.refetch()} className={`bg-coolnet-purple hover:bg-coolnet-purple-dark ${font}`}>
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
                  <InfoItem icon={<User className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.fullName')} value={details.fullName || '—'} font={font} />
                  <InfoItem icon={<Hash className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.subscriberNo')} value={details.userNo} ltr font={font} />
                  <InfoItem icon={<Phone className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.mobile')} value={maskMobile(details.mobile)} ltr font={font} />
                </div>
              </CardContent>
            </Card>

            {/* Refer a neighbor CTA */}
            <button
              type="button"
              onClick={() => navigate('/neighbors-campaign')}
              className="md:col-span-2 text-start group rounded-2xl overflow-hidden border-0 shadow-sm bg-gradient-to-r from-coolnet-purple to-coolnet-purple-dark text-white transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-lg ${font}`}>{t('customerCorner.dashboard.referNeighbor')}</p>
                    <p className={`text-white/80 text-sm truncate ${font}`}>{t('customerCorner.dashboard.referNeighborDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-coolnet-orange rounded-xl px-4 py-2">
                  <span className={`font-semibold text-sm hidden sm:inline ${font}`}>{t('customerCorner.dashboard.referNeighborCta')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>

            {/* Usage — hidden when last week's download is below the threshold */}
            {sessionsQuery.isLoading && (
              <Card className="shadow-sm md:col-span-2">
                <CardContent className="py-10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-coolnet-purple" />
                </CardContent>
              </Card>
            )}
            {showUsage && <UsageCard usage={usage} />}
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
  font: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, ltr, font }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className={`text-gray-500 text-sm ${font}`}>{label}</p>
      <p className={`text-gray-900 font-medium truncate ${font}`} dir={ltr ? 'ltr' : undefined}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
