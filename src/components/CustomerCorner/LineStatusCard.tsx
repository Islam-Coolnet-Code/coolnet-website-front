import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useFont } from '@/hooks/use-font';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, Power, Loader2, Zap, CalendarClock, CalendarPlus } from 'lucide-react';
import type { UserDetails } from '@/types/authTypes';
import { formatDateNumeric } from '@/utils/customerZone';

interface LineStatusCardProps {
  details: UserDetails;
  onExtendClick: () => void;
  extending: boolean;
}

const LineStatusCard: React.FC<LineStatusCardProps> = ({ details, onExtendClick, extending }) => {
  const { t } = useLanguage();
  const { font } = useFont();

  const online = details.status === 'online';
  // Trust ONLY the upstream `expired` flag. The extend button is hidden unless the
  // account is explicitly expired (the paid_till date can precede the real
  // expiration, so it can't be used as the expiry signal).
  const expired = details.expired === true;
  const StatusIcon = online ? Wifi : WifiOff;

  return (
    <Card className="shadow-sm border md:col-span-2 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg text-gray-900 flex items-center gap-2 ${font}`}>
          <Wifi className="w-5 h-5 text-coolnet-purple" />
          {t('customerCorner.dashboard.lineStatus')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Online / offline badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border
            ${online ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <StatusIcon className={`w-4 h-4 ${online ? 'text-green-600' : 'text-gray-500'}`} />
            <span className={`font-semibold ${online ? 'text-green-600' : 'text-gray-500'} ${font}`}>
              {online ? t('customerCorner.dashboard.online') : t('customerCorner.dashboard.offline')}
            </span>
          </div>

          {expired && (
            <Button
              onClick={onExtendClick}
              disabled={extending}
              className={`bg-coolnet-orange hover:bg-coolnet-orange-dark text-white ${font}`}
            >
              {extending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Power className="w-4 h-4 me-2" />
                  {t('customerCorner.dashboard.extend')}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Detail grid */}
        <div className="mt-6 pt-5 border-t border-gray-100 grid sm:grid-cols-3 gap-5">
          <Detail
            icon={<Zap className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.serviceType')}
            value={details.serviceType || '—'}
            font={font}
          />
          <Detail
            icon={<CalendarClock className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.paidTill')}
            value={formatDateNumeric(details.paidTill)}
            valueClass={expired ? 'text-red-600' : 'text-gray-900'}
            font={font}
          />
          <Detail
            icon={<CalendarPlus className="w-5 h-5 text-coolnet-purple" />}
            label={t('customerCorner.dashboard.totalExtendDays')}
            value={String(details.totalExtendDays ?? 0)}
            ltr
            font={font}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface DetailProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  ltr?: boolean;
  font: string;
}

const Detail: React.FC<DetailProps> = ({ icon, label, value, valueClass = 'text-gray-900', ltr, font }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-coolnet-purple/10 rounded-lg flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className={`text-gray-500 text-sm ${font}`}>{label}</p>
      <p className={`font-semibold truncate ${valueClass} ${font}`} dir={ltr ? 'ltr' : undefined}>{value}</p>
    </div>
  </div>
);

export default LineStatusCard;
