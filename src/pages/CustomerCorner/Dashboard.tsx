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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, Hash, Loader2, AlertCircle, Users, ArrowRight, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, shouldShowUsage, maskMobile } from '@/utils/customerZone';
import yaboosLogo from '@/assets/yaboos.png';

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
  const online = details?.status === 'online';

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerCornerHeader showLogout />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-coolnet-purple via-coolnet-purple to-coolnet-purple-dark rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 text-white shadow-lg">
          <div className="absolute -top-20 -end-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -start-10 w-72 h-72 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-white/20">
              <User className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <div className="min-w-0">
              <p className={`text-white/70 text-sm ${font}`}>{t('customerCorner.dashboard.welcome')}</p>
              <h1 className={`text-2xl lg:text-3xl font-bold truncate ${font}`}>
                {details?.fullName || session?.username || session?.userno}
              </h1>
              {details && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ${font}`}>
                    <Hash className="w-3.5 h-3.5" /> <span dir="ltr">{details.userNo}</span>
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${online ? 'bg-emerald-400/25 text-emerald-50' : 'bg-white/15 text-white/80'} ${font}`}>
                    <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-300 animate-pulse' : 'bg-white/50'}`} />
                    {online ? t('customerCorner.dashboard.online') : t('customerCorner.dashboard.offline')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {detailsQuery.isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-52 rounded-2xl bg-gray-100 animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          </div>
        )}

        {/* Error */}
        {detailsQuery.isError && !detailsQuery.isLoading && (
          <Card className="border-red-200 max-w-xl mx-auto">
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
          <div className="space-y-6">
            {/* Yaboos authorization — prominent full-width banner */}
            <button
              type="button"
              onClick={() => navigate('/customer-corner/yabus-authorization')}
              className="w-full text-start group rounded-2xl overflow-hidden border border-coolnet-purple/15 shadow-sm bg-white transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-coolnet-purple/10 shadow-sm flex items-center justify-center shrink-0 p-1.5">
                    <img src={yaboosLogo} alt="Yabous Finance" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-lg lg:text-xl text-gray-900 ${font}`}>{t('customerCorner.yabus.cardTitle')}</p>
                    <p className={`text-gray-500 text-sm ${font}`}>{t('customerCorner.yabus.cardDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 shrink-0 bg-coolnet-purple text-white rounded-xl px-5 py-2.5 group-hover:bg-coolnet-purple-dark transition-colors">
                  <span className={`font-semibold text-sm ${font}`}>{t('customerCorner.yabus.cardCta')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
              {/* Eligibility notice */}
              <div className="px-5 pb-5 lg:px-6">
                <div className="flex items-start gap-2 rounded-xl bg-coolnet-purple/5 border border-coolnet-purple/10 p-3">
                  <Info className="w-4 h-4 text-coolnet-purple shrink-0 mt-0.5" />
                  <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${font}`}>
                    {t('customerCorner.yabus.notice')}
                  </p>
                </div>
              </div>
            </button>

            {/* Two-column workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6">
                <LineStatusCard
                  details={details}
                  onExtendClick={() => setShowExtendDialog(true)}
                  extending={extending}
                />

                {sessionsQuery.isLoading && (
                  <Card className="shadow-sm">
                    <CardContent className="py-10 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-coolnet-purple" />
                    </CardContent>
                  </Card>
                )}
                {showUsage && <UsageCard usage={usage} />}
              </div>

              {/* Side column */}
              <div className="space-y-6">
                {/* Account details */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${font}`}>
                      <User className="w-5 h-5 text-coolnet-purple" />
                      {t('customerCorner.dashboard.accountInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <InfoItem icon={<User className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.fullName')} value={details.fullName || '—'} font={font} />
                    <InfoItem icon={<Hash className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.subscriberNo')} value={details.userNo} ltr font={font} />
                    <InfoItem icon={<Phone className="w-5 h-5 text-coolnet-purple" />} label={t('customerCorner.dashboard.mobile')} value={maskMobile(details.mobile)} ltr font={font} />
                  </CardContent>
                </Card>

                {/* Refer a neighbor CTA */}
                <button
                  type="button"
                  onClick={() => navigate('/neighbors-campaign')}
                  className="w-full text-start group rounded-2xl overflow-hidden border-0 shadow-sm bg-gradient-to-br from-coolnet-purple to-coolnet-purple-dark text-white transition-shadow hover:shadow-lg p-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className={`font-bold text-lg ${font}`}>{t('customerCorner.dashboard.referNeighbor')}</p>
                  <p className={`text-white/80 text-sm mt-1 ${font}`}>{t('customerCorner.dashboard.referNeighborDesc')}</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-coolnet-orange rounded-xl px-4 py-2">
                    <span className={`font-semibold text-sm ${font}`}>{t('customerCorner.dashboard.referNeighborCta')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              </div>
            </div>
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
